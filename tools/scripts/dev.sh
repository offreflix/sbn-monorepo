#!/bin/bash

# Directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
COMPOSE_FILE="$SCRIPT_DIR/../docker-compose.yml"

# Service Definitions
# Format: Name|Path(relative to root)|Type
SERVICES=(
    "sbn-auth|sbn-auth|Backend"
    "sbn-finance|sbn-finance|Backend"
    "sbn-orchestrator|sbn-orchestrator|Backend"
    "sbn-mfe-repo|sbn-mfe-repo|Frontend"
)

echo "Select services to start:"
echo "1) All Everything (Backend + Frontend)"
echo "2) All Backend Services"
echo "3) Frontend Only (sbn-mfe-repo)"
echo "4) Custom Selection"
echo "q) Quit"

read -p "Enter choice: " CHOICE

TO_RUN_INDICES=()

case $CHOICE in
    1)
        # All
        TO_RUN_INDICES=(0 1 2 3)
        ;;
    2)
        # Backends
        TO_RUN_INDICES=(0 1 2)
        ;;
    3)
        # Frontend
        TO_RUN_INDICES=(3)
        ;;
    4)
        # Custom - Simple text loop
        echo "Select one or more (space separated indices):"
        for i in "${!SERVICES[@]}"; do
             IFS='|' read -r name path type <<< "${SERVICES[$i]}"
             echo "$i) $name ($type)"
        done
        read -p "Indices: " -a TO_RUN_INDICES
        ;;
    q|Q)
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Check Dependencies
NEEDS_DB=false
for i in "${TO_RUN_INDICES[@]}"; do
    IFS='|' read -r name path type <<< "${SERVICES[$i]}"
    if [ "$type" == "Backend" ]; then
        NEEDS_DB=true
        break
    fi
done

if [ "$NEEDS_DB" = true ]; then
    echo "Checking Database Dependencies..."
    RUNNING_COUNT=$(docker-compose -f "$COMPOSE_FILE" ps -q postgres redis | wc -l)
    if [ "$RUNNING_COUNT" -lt 2 ]; then
        echo "Starting Postgres and Redis..."
        docker-compose -f "$COMPOSE_FILE" up -d postgres redis
    else
        echo "Databases are ready."
    fi
fi

# Launch
echo "Launching Services..."

# Helper for Windows (Git Bash)
launch_windows() {
    WT_CMD=""
    FIRST=true
    
    for i in "${TO_RUN_INDICES[@]}"; do
        IFS='|' read -r name path type <<< "${SERVICES[$i]}"
        FULL_PATH="$(cygpath -w "$PROJECT_ROOT/$path")"
        
        CMD="yarn start:dev"
        if [ "$name" == "sbn-mfe-repo" ]; then
            CMD="pnpm dev"
        fi
        
        if command -v wt.exe >/dev/null 2>&1; then
             # Construct WT command
             if [ "$FIRST" = false ]; then WT_CMD+=" ; "; fi
             WT_CMD+="new-tab -d \"$FULL_PATH\" cmd /k \"title $name & $CMD\""
             FIRST=false
        else
             start "$name" cmd /k "cd /d $FULL_PATH & $CMD"
        fi
    done
    
    if [ -n "$WT_CMD" ]; then
        wt.exe -w 0 $WT_CMD &
    fi
}

# Helper for Linux/Mac
launch_nix() {
    for i in "${TO_RUN_INDICES[@]}"; do
        IFS='|' read -r name path type <<< "${SERVICES[$i]}"
        FULL_PATH="$PROJECT_ROOT/$path"
         CMD="yarn start:dev"
        if [ "$name" == "sbn-mfe-repo" ]; then
            CMD="pnpm dev"
        fi

        if [[ "$OSTYPE" == "darwin"* ]]; then
             osascript -e "tell application \"Terminal\" to do script \"cd '$FULL_PATH' && $CMD\""
        else
             # Linux assumption
             if command -v x-terminal-emulator >/dev/null 2>&1; then
                  x-terminal-emulator -e "bash -c 'cd \"$FULL_PATH\"; $CMD; exec bash'" &
             elif command -v gnome-terminal >/dev/null 2>&1; then
                  gnome-terminal --working-directory="$FULL_PATH" --title="$name" -- bash -c "$CMD; exec bash"
             else
                  echo "Could not find terminal emulator for $name"
             fi
        fi
    done
}

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    launch_windows
else
    launch_nix
fi

echo "Done!"

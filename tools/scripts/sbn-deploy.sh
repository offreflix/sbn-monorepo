#!/bin/bash

# Wrapper to call the PowerShell script for Windows users using Git Bash
# Or strict bash implementation if preferred. Let's do a simple bash implementation for compatibility.

COMPOSE_FILE="../docker-compose.yml"

echo "Starting SBN Deployment (Bash)..."

# Parse arguments
ONLY=""
for i in "$@"
do
case $i in
    --only=*)
    ONLY="${i#*=}"
    shift
    ;;
esac
done

if [ -n "$ONLY" ]; then
    SERVICES=$(echo $ONLY | tr "," " ")
    echo "Deploying specific services: $SERVICES"
    docker-compose -f $COMPOSE_FILE up -d --build $SERVICES
else
    echo "Deploying ALL services..."
    docker-compose -f $COMPOSE_FILE --profile all up -d --build
fi

echo "Done."

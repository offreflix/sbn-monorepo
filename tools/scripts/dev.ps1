$ErrorActionPreference = "Stop"

# Paths
$ScriptDir = $PSScriptRoot
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
$ComposeFile = Join-Path $ScriptDir "..\docker-compose.yml"

# Services Config
$Services = @(
    @{ Name = "sbn-auth";         Path = Join-Path $ProjectRoot "sbn-auth";       Cmd = "yarn start:dev";     Type = "Backend" }
    @{ Name = "sbn-finance";      Path = Join-Path $ProjectRoot "sbn-finance";    Cmd = "yarn start:dev";     Type = "Backend" }
    @{ Name = "sbn-orchestrator"; Path = Join-Path $ProjectRoot "sbn-orchestrator"; Cmd = "yarn start:dev";   Type = "Backend" }
    @{ Name = "sbn-mfe-repo";     Path = Join-Path $ProjectRoot "sbn-mfe-repo";   Cmd = "pnpm dev";           Type = "Frontend" }
)

# Menu
Write-Host "Select services to start:" -ForegroundColor Cyan
Write-Host "1. All Everything (Backend + Frontend)"
Write-Host "2. All Backend Services"
Write-Host "3. Frontend Only (sbn-mfe-repo)"
Write-Host "4. Custom Selection..."
Write-Host "Q. Quit"

$Selection = Read-Host "Enter choice"

$ToRun = @()

switch ($Selection) {
    "1" { $ToRun = $Services }
    "2" { $ToRun = $Services | Where-Object { $_.Type -eq "Backend" } }
    "3" { $ToRun = $Services | Where-Object { $_.Name -eq "sbn-mfe-repo" } }
    "4" {
        # Custom Selection via Out-GridView if available, else text loop
        if (Get-Command Out-GridView -ErrorAction SilentlyContinue) {
            $ToRun = $Services | Out-GridView -Title "Select Services to Run" -PassThru
        } else {
            Write-Host "Out-GridView not available. Run specific services:"
            # Fallback simple logic or just run all
            $ToRun = $Services 
        }
    }
    "Q" { exit }
    "q" { exit }
    Default { Write-Host "Invalid selection. Exiting."; exit }
}

if ($ToRun.Count -eq 0) { Write-Host "No services selected."; exit }

# Check Dependencies (Postgres/Redis) if any backend is selected
$BackendSelected = $ToRun | Where-Object { $_.Type -eq "Backend" }
if ($BackendSelected) {
    Write-Host "Checking Database Dependencies..." -ForegroundColor Cyan
    $running = docker-compose -f $ComposeFile ps -q postgres redis
    if (-not $running -or $running.Count -lt 2) {
        Write-Host "Starting Postgres and Redis..." -ForegroundColor Yellow
        docker-compose -f $ComposeFile up -d postgres redis
    } else {
        Write-Host "Databases are ready." -ForegroundColor Green
    }
}

# Launch
Write-Host "Launching Services..." -ForegroundColor Cyan

if (Get-Command wt.exe -ErrorAction SilentlyContinue) {
    $WTArgs = "-w 0 "
    $First = $true
    foreach ($svc in $ToRun) {
        if (-not $First) { $WTArgs += "; " }
        # Escape paths
        $p = $svc.Path
        $c = $svc.Cmd
        $n = $svc.Name
        # wt arguments: new-tab -d "PATH" cmd /k "title NAME & COMMAND"
        $WTArgs += "new-tab -d `"$p`" cmd /k `"title $n & $c`""
        $First = $false
    }
    Start-Process wt.exe -ArgumentList $WTArgs
} else {
    foreach ($svc in $ToRun) {
        $p = $svc.Path
        $c = $svc.Cmd
        $n = $svc.Name
        Start-Process cmd.exe -ArgumentList "/k title $n & cd /d `"$p`" & $c"
    }
}

Write-Host "Services started!" -ForegroundColor Green

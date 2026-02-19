param (
    [string]$only = ""
)

$composeFile = Join-Path $PSScriptRoot "..\docker-compose.yml"

Write-Host "Starting SBN Deployment..." -ForegroundColor Green

if ($only) {
    $services = $only -split ","
    Write-Host "Deploying specific services: $services" -ForegroundColor Yellow
    
    # Always include dependencies if possible, or user must specify them.
    # For now, we just pass the services to docker-compose up.
    # Note: If user says 'sbn-orchestrator', they might need 'sbn-auth' running.
    # Docker Compose handles 'depends_on' automatically mostly.
    
    docker-compose -f $composeFile up -d --build $services
}
else {
    Write-Host "Deploying ALL services..." -ForegroundColor Yellow
    docker-compose -f $composeFile --profile all up -d --build
}

Write-Host "Deployment command finished." -ForegroundColor Green
Write-Host "Check status with: docker-compose -f $composeFile ps" -ForegroundColor Cyan

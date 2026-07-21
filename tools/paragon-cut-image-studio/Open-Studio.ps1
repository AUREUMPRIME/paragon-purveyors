$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$StudioRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ControllerPath = Join-Path $StudioRoot "controller.mjs"

if (-not (Test-Path -LiteralPath $ControllerPath -PathType Leaf)) {
    throw "Studio controller is missing: $ControllerPath"
}

$NodeCommand = Get-Command node.exe -ErrorAction Stop

& $NodeCommand.Source $ControllerPath

if ($LASTEXITCODE -ne 0) {
    throw "Paragon Cut Image Studio exited with code $LASTEXITCODE."
}

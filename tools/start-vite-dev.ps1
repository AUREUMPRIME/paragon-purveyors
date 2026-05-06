param(
    [string]$ProjectPath = "."
)

Set-Location -LiteralPath $ProjectPath
npm run dev

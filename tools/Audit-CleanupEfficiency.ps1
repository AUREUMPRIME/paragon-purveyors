param(
  [switch]$AllowDirty,
  [switch]$WriteReport,
  [Int64]$LargeImageBytes = 524288,
  [Int64]$LargeFileBytes = 1048576
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
Set-Location -LiteralPath $ProjectRoot

$ReportPath = Join-Path $ProjectRoot "docs\cleanup-efficiency-report.md"

function Format-Bytes {
  param([Int64]$Bytes)

  if ($Bytes -ge 1GB) { return ("{0:N2} GB" -f ($Bytes / 1GB)) }
  if ($Bytes -ge 1MB) { return ("{0:N2} MB" -f ($Bytes / 1MB)) }
  if ($Bytes -ge 1KB) { return ("{0:N2} KB" -f ($Bytes / 1KB)) }

  return ("{0} B" -f $Bytes)
}

function Get-RelativePath {
  param(
    [string]$BasePath,
    [string]$FullPath
  )

  $Base = (Resolve-Path -LiteralPath $BasePath).Path.TrimEnd("\")
  $Full = (Resolve-Path -LiteralPath $FullPath).Path

  if ($Full.Length -le $Base.Length) {
    return $Full.Replace("\", "/")
  }

  return $Full.Substring($Base.Length).TrimStart("\").Replace("\", "/")
}

function Get-FilesSafe {
  param(
    [string]$BasePath,
    [string[]]$ExcludeDirs = @()
  )

  if (-not (Test-Path -LiteralPath $BasePath)) {
    return @()
  }

  $Base = (Resolve-Path -LiteralPath $BasePath).Path.TrimEnd("\")

  return @(
    Get-ChildItem -LiteralPath $BasePath -File -Recurse -Force -ErrorAction SilentlyContinue |
      Where-Object {
        $Relative = $_.FullName.Substring($Base.Length).TrimStart("\")
        $Segments = @($Relative -split "[\\/]")
        $Keep = $true

        foreach ($Dir in $ExcludeDirs) {
          if ($Segments -contains $Dir) {
            $Keep = $false
            break
          }
        }

        $Keep
      }
  )
}

function Get-DirectorySize {
  param(
    [string]$Path,
    [string[]]$ExcludeDirs = @()
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return [pscustomobject]@{
      Path = $Path
      Files = 0
      Bytes = 0
      Size = "0 B"
    }
  }

  $Files = @(Get-FilesSafe -BasePath $Path -ExcludeDirs $ExcludeDirs)
  $Bytes = [Int64](($Files | Measure-Object -Property Length -Sum).Sum)

  return [pscustomobject]@{
    Path = $Path
    Files = $Files.Count
    Bytes = $Bytes
    Size = Format-Bytes $Bytes
  }
}

function Get-ImageInfo {
  param([System.IO.FileInfo]$File)

  $Extension = $File.Extension.ToLowerInvariant()

  $Info = [ordered]@{
    Width = ""
    Height = ""
    Notes = ""
  }

  if ($Extension -eq ".svg") {
    try {
      $Text = Get-Content -LiteralPath $File.FullName -Raw -ErrorAction Stop

      if ($Text -match 'viewBox\s*=\s*"([^"]+)"') {
        $Info.Notes = "svg viewBox=$($Matches[1])"
      } else {
        $Info.Notes = "svg"
      }
    } catch {
      $Info.Notes = "svg unreadable"
    }

    return [pscustomobject]$Info
  }

  if ($Extension -eq ".webp") {
    $Info.Notes = "webp dimensions skipped"
    return [pscustomobject]$Info
  }

  if ($Extension -in @(".png", ".jpg", ".jpeg", ".gif")) {
    try {
      Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue
      $Image = [System.Drawing.Image]::FromFile($File.FullName)

      try {
        $Info.Width = $Image.Width
        $Info.Height = $Image.Height
        $Info.Notes = "bitmap"
      } finally {
        $Image.Dispose()
      }
    } catch {
      $Info.Notes = "bitmap dimensions unavailable"
    }

    return [pscustomobject]$Info
  }

  return [pscustomobject]$Info
}

function Add-ReportLine {
  param([string]$Line)

  $script:ReportLines.Add($Line) | Out-Null
}

function Add-Table {
  param(
    [string]$Title,
    [object[]]$Rows,
    [string[]]$Columns
  )

  Add-ReportLine ""
  Add-ReportLine "## $Title"
  Add-ReportLine ""

  if (-not $Rows -or $Rows.Count -eq 0) {
    Add-ReportLine "_None found._"
    return
  }

  Add-ReportLine ("| " + ($Columns -join " | ") + " |")
  Add-ReportLine ("| " + (($Columns | ForEach-Object { "---" }) -join " | ") + " |")

  foreach ($Row in $Rows) {
    $Values = foreach ($Column in $Columns) {
      $Value = $Row.$Column

      if ($null -eq $Value) {
        ""
      } else {
        ([string]$Value).Replace("|", "\|").Replace("`r", " ").Replace("`n", " ")
      }
    }

    Add-ReportLine ("| " + ($Values -join " | ") + " |")
  }
}

Write-Host ""
Write-Host "CLEANUP / EFFICIENCY AUDIT TOOL"
Write-Host "Project root: $ProjectRoot"
Write-Host "Mode: DRY-RUN ONLY"
Write-Host ""

$Status = @(git status --short)

if ($Status.Count -gt 0 -and -not $AllowDirty) {
  Write-Host "[BLOCKED] Working tree is dirty:"
  $Status | ForEach-Object { Write-Host $_ }
  throw "Run from a clean tree or pass -AllowDirty for audit-only diagnostics."
}

if ($Status.Count -eq 0) {
  Write-Host "[OK] Working tree is clean."
} else {
  Write-Host "[WARNING] Running with dirty tree because -AllowDirty was provided."
}

Write-Host ""
Write-Host "=== Build check ==="
pnpm build

$PublicRoot = Join-Path $ProjectRoot "public"
$DistRoot = Join-Path $ProjectRoot "dist"

$ProjectAll = Get-DirectorySize -Path $ProjectRoot
$ProjectSource = Get-DirectorySize -Path $ProjectRoot -ExcludeDirs @(".git", "node_modules", "dist")
$PublicSize = Get-DirectorySize -Path $PublicRoot
$SrcSize = Get-DirectorySize -Path (Join-Path $ProjectRoot "src")
$DistSize = Get-DirectorySize -Path $DistRoot
$GitSize = Get-DirectorySize -Path (Join-Path $ProjectRoot ".git")
$NodeSize = Get-DirectorySize -Path (Join-Path $ProjectRoot "node_modules")

$ProjectFiles = @(Get-FilesSafe -BasePath $ProjectRoot -ExcludeDirs @(".git", "node_modules"))
$PublicFiles = @(Get-FilesSafe -BasePath $PublicRoot)

$SourceFiles = @()

if (Test-Path -LiteralPath "src") {
  $SourceFiles += Get-ChildItem -LiteralPath "src" -File -Recurse -Force |
    Where-Object { $_.Extension.ToLowerInvariant() -in @(".js", ".css", ".html", ".json", ".ts", ".tsx", ".jsx") }
}

if (Test-Path -LiteralPath "index.html") {
  $SourceFiles += Get-Item -LiteralPath "index.html"
}

if (Test-Path -LiteralPath "package.json") {
  $SourceFiles += Get-Item -LiteralPath "package.json"
}

$SourceTextParts = New-Object System.Collections.Generic.List[string]

foreach ($File in $SourceFiles) {
  try {
    $SourceTextParts.Add((Get-Content -LiteralPath $File.FullName -Raw -ErrorAction Stop))
  } catch {
    Write-Host "[WARN] Could not read source file: $($File.FullName)"
  }
}

$SourceText = [string]::Join("`n", $SourceTextParts)

$AssetRecords = @()

foreach ($File in $PublicFiles) {
  $Rel = Get-RelativePath -BasePath $PublicRoot -FullPath $File.FullName
  $FileName = $File.Name
  $Ext = $File.Extension.ToLowerInvariant()

  $ExactReferenced =
    $SourceText.Contains($Rel) -or
    $SourceText.Contains("/$Rel") -or
    $SourceText.Contains("./$Rel")

  $NameReferenced = $false

  if (-not $ExactReferenced -and $FileName.Length -gt 8) {
    $NameReferenced = $SourceText.Contains($FileName)
  }

  $ImageInfo = Get-ImageInfo -File $File

  $AssetRecords += [pscustomobject]@{
    Path = $Rel
    FileName = $FileName
    Extension = $Ext
    Size = Format-Bytes $File.Length
    Bytes = $File.Length
    Width = $ImageInfo.Width
    Height = $ImageInfo.Height
    Notes = $ImageInfo.Notes
    ExactReferenced = $ExactReferenced
    NameReferenced = $NameReferenced
    LikelyReferenced = ($ExactReferenced -or $NameReferenced)
  }
}

$ImageExtensions = @(".png", ".jpg", ".jpeg", ".webp")
$ConvertCandidates = @(
  $AssetRecords |
    Where-Object {
      $_.LikelyReferenced -and
      ($_.Extension -in @(".png", ".jpg", ".jpeg")) -and
      $_.Bytes -ge $LargeImageBytes
    } |
    Sort-Object Bytes -Descending |
    ForEach-Object {
      $EstimatedWebpBytes = [Int64]($_.Bytes * 0.35)
      [pscustomobject]@{
        Size = $_.Size
        EstimatedWebp = Format-Bytes $EstimatedWebpBytes
        EstimatedSavings = Format-Bytes ([Int64]($_.Bytes - $EstimatedWebpBytes))
        Extension = $_.Extension
        Width = $_.Width
        Height = $_.Height
        Path = $_.Path
      }
    }
)

$UnreferencedCandidates = @(
  $AssetRecords |
    Where-Object { -not $_.LikelyReferenced -and $_.Bytes -ge 256KB } |
    Sort-Object Bytes -Descending |
    ForEach-Object {
      [pscustomobject]@{
        Size = $_.Size
        Extension = $_.Extension
        Path = $_.Path
        ProposedAction = "Review before archive"
      }
    }
)

$LargeProjectFiles = @(
  $ProjectFiles |
    Where-Object { $_.Length -ge $LargeFileBytes } |
    Sort-Object Length -Descending |
    Select-Object -First 80 |
    ForEach-Object {
      [pscustomobject]@{
        Size = Format-Bytes $_.Length
        Extension = $_.Extension.ToLowerInvariant()
        Path = Get-RelativePath -BasePath $ProjectRoot -FullPath $_.FullName
      }
    }
)

$HashRecords = @()

foreach ($File in $PublicFiles) {
  try {
    $HashRecords += [pscustomobject]@{
      Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $File.FullName).Hash
      Size = $File.Length
      Path = Get-RelativePath -BasePath $PublicRoot -FullPath $File.FullName
    }
  } catch {
    Write-Host "[WARN] Could not hash: $($File.FullName)"
  }
}

$DuplicateRecords = @()

$HashRecords |
  Group-Object Hash |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    $Group = $_

    foreach ($Item in ($Group.Group | Sort-Object Path)) {
      $DuplicateRecords += [pscustomobject]@{
        GroupHash = $Group.Name.Substring(0, 12)
        Count = $Group.Count
        SizeEach = Format-Bytes ([Int64]$Item.Size)
        Path = $Item.Path
      }
    }
  }

$PdfRecords = @(
  $AssetRecords |
    Where-Object { $_.Extension -eq ".pdf" } |
    Sort-Object Bytes -Descending |
    ForEach-Object {
      [pscustomobject]@{
        Size = $_.Size
        Referenced = $_.LikelyReferenced
        Path = $_.Path
      }
    }
)

$TypeSummary = @(
  $PublicFiles |
    Group-Object { $_.Extension.ToLowerInvariant() } |
    ForEach-Object {
      $Bytes = [Int64](($_.Group | Measure-Object -Property Length -Sum).Sum)

      [pscustomobject]@{
        Extension = if ($_.Name) { $_.Name } else { "[none]" }
        Files = $_.Count
        Size = Format-Bytes $Bytes
        Bytes = $Bytes
      }
    } |
    Sort-Object Bytes -Descending
)

$SizeSummary = @(
  [pscustomobject]@{ Area = "Project total including .git/node_modules/dist"; Files = $ProjectAll.Files; Size = $ProjectAll.Size },
  [pscustomobject]@{ Area = "Project source excluding .git/node_modules/dist"; Files = $ProjectSource.Files; Size = $ProjectSource.Size },
  [pscustomobject]@{ Area = "public"; Files = $PublicSize.Files; Size = $PublicSize.Size },
  [pscustomobject]@{ Area = "src"; Files = $SrcSize.Files; Size = $SrcSize.Size },
  [pscustomobject]@{ Area = "dist"; Files = $DistSize.Files; Size = $DistSize.Size },
  [pscustomobject]@{ Area = ".git"; Files = $GitSize.Files; Size = $GitSize.Size },
  [pscustomobject]@{ Area = "node_modules"; Files = $NodeSize.Files; Size = $NodeSize.Size }
)

$EstimatedSavingsBytes = [Int64]0

foreach ($Candidate in $ConvertCandidates) {
  $OriginalBytes = ($AssetRecords | Where-Object { $_.Path -eq $Candidate.Path } | Select-Object -First 1).Bytes
  $EstimatedSavingsBytes += [Int64]($OriginalBytes * 0.65)
}

Write-Host ""
Write-Host "=== Size summary ==="
$SizeSummary | Format-Table -AutoSize

Write-Host ""
Write-Host "=== Public asset type summary ==="
$TypeSummary | Select-Object Extension, Files, Size | Format-Table -AutoSize

Write-Host ""
Write-Host "=== WebP conversion candidates, dry-run only ==="
if ($ConvertCandidates.Count -eq 0) {
  Write-Host "[OK] No active PNG/JPG candidates above threshold."
} else {
  $ConvertCandidates | Select-Object -First 60 | Format-Table -AutoSize
}

Write-Host ""
Write-Host "=== Unreferenced archive candidates, review only ==="
if ($UnreferencedCandidates.Count -eq 0) {
  Write-Host "[OK] No large unreferenced candidates above threshold."
} else {
  $UnreferencedCandidates | Format-Table -AutoSize
}

Write-Host ""
Write-Host "=== Duplicate public files by hash ==="
if ($DuplicateRecords.Count -eq 0) {
  Write-Host "[OK] No duplicate public files by SHA256."
} else {
  $DuplicateRecords | Format-Table -AutoSize
}

Write-Host ""
Write-Host "=== PDF inventory ==="
if ($PdfRecords.Count -eq 0) {
  Write-Host "[INFO] No PDFs found in public."
} else {
  $PdfRecords | Format-Table -AutoSize
}

Write-Host ""
Write-Host "=== Estimated possible image savings ==="
Write-Host ("Approximate savings if all listed active PNG/JPG candidates are converted successfully: {0}" -f (Format-Bytes $EstimatedSavingsBytes))
Write-Host "Estimate is intentionally rough. Visual approval is required before replacing any asset."

if ($WriteReport) {
  $script:ReportLines = New-Object System.Collections.Generic.List[string]

  Add-ReportLine "# Paragon Purveyors — Cleanup Efficiency Report"
  Add-ReportLine ""
  Add-ReportLine ("Generated: {0}" -f (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
  Add-ReportLine ""
  Add-ReportLine "Mode: **DRY-RUN ONLY**"
  Add-ReportLine ""
  Add-ReportLine "No files were converted, deleted, archived, or optimized by this tool."
  Add-ReportLine ""
  Add-ReportLine "## Summary"
  Add-ReportLine ""
  Add-ReportLine ("- Project root: {0}" -f $ProjectRoot)
  Add-ReportLine ("- Source files scanned: {0}" -f $SourceFiles.Count)
  Add-ReportLine ("- Public files scanned: {0}" -f $PublicFiles.Count)
  Add-ReportLine ("- WebP conversion candidates: {0}" -f $ConvertCandidates.Count)
  Add-ReportLine ("- Large unreferenced archive candidates: {0}" -f $UnreferencedCandidates.Count)
  Add-ReportLine ("- Duplicate public file entries: {0}" -f $DuplicateRecords.Count)
  Add-ReportLine ("- Estimated possible image savings: {0}" -f (Format-Bytes $EstimatedSavingsBytes))
  Add-ReportLine ""
  Add-ReportLine "## Interpretation"
  Add-ReportLine ""
  Add-ReportLine "- Runtime performance candidates are active referenced assets, especially large PNG/JPG files."
  Add-ReportLine "- Local project weight candidates include `dist`, `.git`, `node_modules`, backups, and generated files."
  Add-ReportLine "- Do not edit `dist` directly. Optimize `public` and source references, then rebuild."
  Add-ReportLine "- All conversion/archive/delete decisions require review before apply."

  Add-Table -Title "Size Summary" -Rows $SizeSummary -Columns @("Area", "Files", "Size")
  Add-Table -Title "Public Asset Type Summary" -Rows ($TypeSummary | Select-Object Extension, Files, Size) -Columns @("Extension", "Files", "Size")
  Add-Table -Title "WebP Conversion Candidates" -Rows ($ConvertCandidates | Select-Object -First 80) -Columns @("Size", "EstimatedWebp", "EstimatedSavings", "Extension", "Width", "Height", "Path")
  Add-Table -Title "Unreferenced Archive Candidates" -Rows $UnreferencedCandidates -Columns @("Size", "Extension", "Path", "ProposedAction")
  Add-Table -Title "Duplicate Public Files" -Rows $DuplicateRecords -Columns @("GroupHash", "Count", "SizeEach", "Path")
  Add-Table -Title "PDF Inventory" -Rows $PdfRecords -Columns @("Size", "Referenced", "Path")
  Add-Table -Title "Largest Project Files" -Rows $LargeProjectFiles -Columns @("Size", "Extension", "Path")

  Add-ReportLine ""
  Add-ReportLine "## Proposed Next Action"
  Add-ReportLine ""
  Add-ReportLine "Start with one controlled optimization pass against the largest active PNG group, not with deletion."
  Add-ReportLine ""
  Add-ReportLine "Recommended first target:"
  Add-ReportLine ""
  Add-ReportLine "1. Convert selected `public/assets/cuts/*.png` files to WebP copies."
  Add-ReportLine "2. Do not remove PNG originals yet."
  Add-ReportLine "3. Update references only after WebP files exist."
  Add-ReportLine "4. Build and preview."
  Add-ReportLine "5. Archive replaced PNG originals only after visual approval."

  New-Item -ItemType Directory -Path (Split-Path -Parent $ReportPath) -Force | Out-Null

  $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines($ReportPath, $script:ReportLines, $Utf8NoBom)

  Write-Host ""
  Write-Host "[REPORT] Wrote: $ReportPath"
}

Write-Host ""
Write-Host "AUDIT TOOL COMPLETE"
Write-Host "[DRY-RUN] No conversion, deletion, archive, or optimization was performed."

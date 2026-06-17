Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "src/assets/images/hospital_logo_1779218652866.png"
if (-not (Test-Path $sourcePath)) {
    Write-Host "Source logo not found at $sourcePath!" -ForegroundColor Red
    Exit
}

$targets = @(
    # Legacy Square Launcher Icons
    @{ Path = "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"; Width = 48; Height = 48 },
    @{ Path = "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"; Width = 72; Height = 72 },
    @{ Path = "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"; Width = 96; Height = 96 },
    @{ Path = "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"; Width = 144; Height = 144 },
    @{ Path = "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"; Width = 192; Height = 192 },

    # Round Launcher Icons
    @{ Path = "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"; Width = 48; Height = 48 },
    @{ Path = "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"; Width = 72; Height = 72 },
    @{ Path = "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"; Width = 96; Height = 96 },
    @{ Path = "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"; Width = 144; Height = 144 },
    @{ Path = "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"; Width = 192; Height = 192 },

    # Adaptive Foreground Icons
    @{ Path = "android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png"; Width = 108; Height = 108 },
    @{ Path = "android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png"; Width = 162; Height = 162 },
    @{ Path = "android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png"; Width = 216; Height = 216 },
    @{ Path = "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png"; Width = 324; Height = 324 },
    @{ Path = "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"; Width = 432; Height = 432 }
)

Write-Host "Loading source logo image..." -ForegroundColor Cyan
$img = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($target in $targets) {
    $fullTargetPath = Join-Path $PSScriptRoot $target.Path
    $parentDir = Split-Path $fullTargetPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    Write-Host "Generating: $($target.Path)" -ForegroundColor Green
    $bmp = New-Object System.Drawing.Bitmap $target.Width, $target.Height
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Configure high quality interpolations
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graph.Clear([System.Drawing.Color]::Transparent)
    $graph.DrawImage($img, 0, 0, $target.Width, $target.Height)
    
    $bmp.Save($fullTargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
}

$img.Dispose()
Write-Host "Successfully generated all Android launcher icons!" -ForegroundColor Cyan

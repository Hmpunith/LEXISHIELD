Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   LexiShield Scripted Demo Video Generator" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Copy pre-downloaded ffmpeg if available
$globalFfmpeg = "C:\Users\Hmpun\.gemini\antigravity\scratch\astraguard\video-generator\ffmpeg.exe"
if (Test-Path $globalFfmpeg) {
    if (-not (Test-Path ".\ffmpeg.exe")) {
        Write-Host "Copying cached ffmpeg.exe..." -ForegroundColor Yellow
        Copy-Item $globalFfmpeg ".\ffmpeg.exe"
    }
}

Write-Host "`n[Step 1] Generating neural voice narration..." -ForegroundColor Green
python generate_voice.py

Write-Host "`n[Step 2] Recording automated screen walkthrough..." -ForegroundColor Green
node record.js

Write-Host "`n[Step 3] Stitching video and audio with FFmpeg..." -ForegroundColor Green
$ffmpegCmd = ".\ffmpeg.exe -y -f concat -safe 0 -i assets/concat.txt "
$inputs = ""

for ($i = 1; $i -le 6; $i++) {
    $ffmpegCmd += "-i assets/scene$i.mp3 "
    $inputs += "[$i:a]"
}

$filter = "$inputs concat=n=6:v=0:a=1[outa]"
$ffmpegCmd += "-filter_complex `"$filter`" -map 0:v -map `"[outa]`" -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k lexishield_demo.mp4"

Write-Host "Compiling final video..."
Invoke-Expression $ffmpegCmd

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " 🎉 SUCCESS! Demo video saved as lexishield_demo.mp4" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

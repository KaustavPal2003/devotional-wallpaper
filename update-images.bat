@echo off
rem Writes images.js with every picture ONLY in the "wallpapers" folder.
rem Run it again whenever you add, remove or rename pictures.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$e='.jpg','.jpeg','.jfif','.png','.webp','.gif','.bmp','.avif'; $r=(Get-Location).Path.TrimEnd('\')+'\'; $n=@(Get-ChildItem -Path 'wallpapers' -File -Recurse | Where-Object { $e -contains $_.Extension.ToLower() } | Sort-Object FullName | ForEach-Object { $_.FullName.Substring($r.Length).Replace('\','/') }); $j=ConvertTo-Json -InputObject $n -Compress; Set-Content -Path images.js -Value ('window.WALLPAPER_IMAGES = ' + $j + ';') -Encoding UTF8; Write-Host ('Scanned: ' + $r + 'wallpapers'); Write-Host ('Found ' + $n.Count + ' picture(s). images.js updated.')"
echo.
echo Now reload the wallpaper in Lively to see the change.
pause

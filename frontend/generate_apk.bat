@echo off
chcp 65001 > nul
set PATH=C:\Program Files\nodejs;%PATH%
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot
if "%ANDROID_HOME%"=="" set ANDROID_HOME=C:\Users\ADMIN\AppData\Local\Android\Sdk

cd /d %~dp0

echo.
echo  ███████████████████████████████████████████████████████████
echo  ░         AVIMANYU ASTRO AI — APK BUILDER v2.0            ░
echo  ░    Name   : Avimanyu Singh Chauhan                       ░
echo  ░    DOB    : 30 September 2001 | 3:45 PM                  ░
echo  ░    Place  : Birgunj, Nepal (UTC +5:45)                   ░
echo  ███████████████████████████████████████████████████████████
echo.

echo [1/3] Building Web Assets (Vite)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Web build failed. Check npm errors above.
    pause
    exit /b %ERRORLEVEL%
)
echo       Done!

echo.
echo [2/3] Syncing Assets with Capacitor Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Capacitor sync failed. Ensure Android SDK is installed.
    pause
    exit /b %ERRORLEVEL%
)
echo       Done!

echo.
echo [3/3] Compiling Signed Release APK via Gradle...
cd android
call gradlew assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: APK build failed. Check Gradle errors above.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo  ✅ SUCCESS! APK GENERATED:
echo  ─────────────────────────────────────────────────────────
echo  📱 Location: frontend\android\app\build\outputs\apk\release\app-release.apk
echo  📦 App ID  : com.avimanyu.astro.ai
echo  🌟 App Name: Avimanyu Astro AI
echo  ─────────────────────────────────────────────────────────
echo  Install on your phone:
echo    adb install android\app\build\outputs\apk\release\app-release.apk
echo  ─────────────────────────────────────────────────────────
echo.
pause

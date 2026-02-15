@echo off
echo ========================================
echo Firebase Hosting Deployment
echo Proje: atasozleri-oyunu-59b84
echo ========================================
echo.

echo Adim 1: Firebase'e giris yapiliyor...
echo Tarayici acilacak, Google hesabinizla giris yapin
echo.
call firebase login
if errorlevel 1 (
    echo.
    echo HATA: Firebase login basarisiz!
    echo Lutfen tekrar deneyin.
    pause
    exit /b 1
)

echo.
echo Adim 2: Deployment baslatiliyor...
echo.
call firebase deploy --only hosting --project atasozleri-oyunu-59b84
if errorlevel 1 (
    echo.
    echo HATA: Deployment basarisiz!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment BASARILI!
echo ========================================
echo.
echo URL: https://atasozleri-oyunu-59b84.web.app
echo.
echo Bu URL'yi not edin, TWA projesi icin gerekli!
echo.
pause

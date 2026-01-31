@echo off
echo TDK Atasozu Cekme Araci
echo ========================
echo.
echo Gerekli kutuphaneler yukleniyor...
pip install requests beautifulsoup4
echo.
echo Atasozleri cekiliyor...
python tdk_scraper.py
echo.
echo Tamamlandi!
pause

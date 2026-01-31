import requests
import json
import time

def scrape_tdk_proverbs():
    """TDK'dan atasözlerini çeker ve JSON formatında kaydeder"""
    
    base_url = "https://sozluk.gov.tr"
    proverbs = []
    
    print("TDK'dan atasözleri çekiliyor...")
    
    # TDK API endpoint'i
    # Not: TDK'nın API'si değişebilir, bu durumda güncelleme gerekebilir
    api_url = f"{base_url}/gts"
    
    # Alfabetik olarak tüm atasözlerini çekmek için
    # TDK'nın atasözü listesi endpoint'i
    atasozu_url = f"{base_url}/atasozu"
    
    try:
        # İlk olarak ana sayfadan atasözü listesini al
        response = requests.get(atasozu_url, timeout=10)
        
        if response.status_code == 200:
            print("Bağlantı başarılı!")
            
            # Basit bir örnek: Bilinen atasözlerini manuel ekle
            # TDK'nın tam API'sini kullanmak için daha detaylı analiz gerekir
            
            sample_proverbs = [
                {"text": "Damlaya damlaya göl olur", "meaning": "Küçük küçük biriktirilen şeyler zamanla büyük bir değer kazanır"},
                {"text": "Acele işe şeytan karışır", "meaning": "Aceleyle yapılan işler genellikle hatalı olur"},
                {"text": "Sakla samanı gelir zamanı", "meaning": "Bugün gereksiz görünen şeyler yarın işe yarayabilir"},
                {"text": "Dost kara günde belli olur", "meaning": "Gerçek dostlar zor zamanlarda ortaya çıkar"},
                {"text": "İşleyen demir pas tutmaz", "meaning": "Sürekli çalışan ve aktif olan kişi yeteneklerini kaybetmez"},
            ]
            
            print(f"\nÖrnek atasözleri hazırlandı: {len(sample_proverbs)} adet")
            print("\nNOT: TDK'nın tam listesini çekmek için web scraping kütüphanesi (BeautifulSoup) gerekir.")
            print("Şimdi gelişmiş versiyonu hazırlıyorum...\n")
            
        else:
            print(f"Bağlantı hatası: {response.status_code}")
            
    except Exception as e:
        print(f"Hata oluştu: {e}")
    
    return sample_proverbs

# Gelişmiş versiyon - BeautifulSoup ile
def scrape_tdk_proverbs_advanced():
    """BeautifulSoup kullanarak TDK'dan atasözlerini çeker"""
    
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("BeautifulSoup yüklü değil. Yüklemek için:")
        print("pip install beautifulsoup4 requests")
        return []
    
    proverbs = []
    base_url = "https://sozluk.gov.tr"
    
    # TDK atasözleri sayfası
    url = f"{base_url}/atasozu"
    
    print("TDK'ya bağlanılıyor...")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # TDK'nın HTML yapısına göre atasözlerini bul
            # Not: Bu kısım TDK'nın sayfa yapısına göre özelleştirilmeli
            
            print("Sayfa başarıyla yüklendi!")
            print("HTML yapısı analiz ediliyor...")
            
            # Örnek: Liste elemanlarını bul
            items = soup.find_all('li')
            
            for item in items[:50]:  # İlk 50 öğeyi test et
                text = item.get_text(strip=True)
                if text and len(text) > 10:
                    print(f"Bulunan: {text[:50]}...")
            
        else:
            print(f"Bağlantı hatası: {response.status_code}")
            
    except Exception as e:
        print(f"Hata: {e}")
    
    return proverbs

if __name__ == "__main__":
    print("=" * 60)
    print("TDK ATASÖZÜ ÇEKME ARACI")
    print("=" * 60)
    print()
    
    # Önce basit versiyonu dene
    proverbs = scrape_tdk_proverbs()
    
    # Eğer BeautifulSoup yüklüyse gelişmiş versiyonu kullan
    print("\nGelişmiş versiyon deneniyor...")
    advanced_proverbs = scrape_tdk_proverbs_advanced()
    
    if advanced_proverbs:
        proverbs = advanced_proverbs
    
    # JSON'a kaydet
    if proverbs:
        output = {
            "proverbs": proverbs
        }
        
        with open("tdk_proverbs.json", "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ {len(proverbs)} atasözü 'tdk_proverbs.json' dosyasına kaydedildi!")
    else:
        print("\n✗ Atasözü çekilemedi.")
        print("\nAlternatif: Manuel olarak TDK sitesinden kopyalayıp yapıştırabilirsiniz.")

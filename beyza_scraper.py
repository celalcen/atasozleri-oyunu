import requests
from bs4 import BeautifulSoup
import json
import time

# Beyza Hocam sitesi
URL = "https://www.beyzahocam.com/ders-araclari/atasozleri-ve-deyimler-sozlugu/"

print("Beyza Hocam sitesinden atasözleri çekiliyor...")
print("=" * 60)

try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(URL, headers=headers, timeout=15)
    
    if response.status_code == 200:
        print("✓ Siteye bağlanıldı!")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        atasozleri = []
        
        # Farklı HTML yapılarını dene
        print("\nHTML yapısı analiz ediliyor...")
        
        # Tüm paragrafları ve liste öğelerini kontrol et
        all_elements = soup.find_all(['p', 'li', 'div', 'tr'])
        
        for element in all_elements:
            text = element.get_text(strip=True)
            
            # Atasözü formatını bul: "Atasözü: Anlam" veya "Atasözü - Anlam"
            if ':' in text and len(text) > 20 and len(text) < 300:
                parts = text.split(':', 1)
                atasozu = parts[0].strip()
                anlam = parts[1].strip() if len(parts) > 1 else ""
                
                # Geçerli atasözü kontrolü
                if len(atasozu) > 10 and len(atasozu) < 100 and anlam:
                    atasozleri.append({
                        "text": atasozu,
                        "meaning": anlam
                    })
                    print(f"✓ {atasozu[:50]}...")
            
            elif '-' in text and len(text) > 20 and len(text) < 300:
                parts = text.split('-', 1)
                atasozu = parts[0].strip()
                anlam = parts[1].strip() if len(parts) > 1 else ""
                
                if len(atasozu) > 10 and len(atasozu) < 100 and anlam:
                    atasozleri.append({
                        "text": atasozu,
                        "meaning": anlam
                    })
                    print(f"✓ {atasozu[:50]}...")
        
        print("\n" + "=" * 60)
        print(f"Toplam {len(atasozleri)} atasözü bulundu!")
        
        if atasozleri:
            # Tekrarları temizle
            unique_proverbs = []
            seen = set()
            
            for item in atasozleri:
                if item['text'] not in seen:
                    seen.add(item['text'])
                    unique_proverbs.append(item)
            
            # ID ve ek bilgiler ekle
            for i, proverb in enumerate(unique_proverbs, 1):
                proverb['id'] = i
                proverb['difficulty'] = 1
                proverb['category'] = "genel"
                proverb['example'] = ""
                proverb['wrongAnswers'] = []
            
            output = {
                "proverbs": unique_proverbs
            }
            
            with open("atasozleri_full.json", "w", encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            
            print(f"\n✓ {len(unique_proverbs)} benzersiz atasözü 'atasozleri_full.json' dosyasına kaydedildi!")
            
            # CSV olarak da kaydet
            import csv
            with open("atasozleri.csv", "w", encoding='utf-8', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(["ID", "Atasözü", "Anlam"])
                for proverb in unique_proverbs:
                    writer.writerow([proverb['id'], proverb['text'], proverb['meaning']])
            
            print(f"✓ CSV dosyası da oluşturuldu: 'atasozleri.csv'")
            
            # İlk 10 örneği göster
            print("\n--- İlk 10 Atasözü ---")
            for proverb in unique_proverbs[:10]:
                print(f"{proverb['id']}. {proverb['text']}")
                print(f"   → {proverb['meaning']}\n")
        else:
            print("\n✗ Atasözü bulunamadı!")
            print("HTML içeriğinin bir kısmı:")
            print(soup.get_text()[:500])
    
    else:
        print(f"✗ Bağlantı hatası: {response.status_code}")

except Exception as e:
    print(f"✗ Hata oluştu: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("İşlem tamamlandı!")

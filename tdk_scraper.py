import requests
from bs4 import BeautifulSoup
import json
import time

# TDK Atasözleri listesi için URL
BASE_URL = "https://sozluk.gov.tr/atasozu"

# Türkçe alfabedeki harfler
harfler = "abcçdefgğhıijklmnoöprsştuüvyz"

atasozleri = []

print("TDK'dan atasözleri çekiliyor...")
print("=" * 60)

for harf in harfler:
    url = f"{BASE_URL}?ara={harf}"
    
    try:
        print(f"\n'{harf.upper()}' harfi için sorgulanıyor...")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # TDK'nın gerçek HTML yapısını bulmak için farklı seçiciler deneyelim
            # Olası yapılar:
            entries = (
                soup.select('.atasozu-entry') or 
                soup.select('li') or 
                soup.select('.entry') or
                soup.select('div[class*="atasozu"]')
            )
            
            if entries:
                for entry in entries:
                    # Atasözü ve anlamını bulmaya çalış
                    atasozu_elem = (
                        entry.select_one('.atasozu-title') or
                        entry.select_one('strong') or
                        entry.select_one('b')
                    )
                    
                    anlam_elem = (
                        entry.select_one('.atasozu-meaning') or
                        entry.select_one('.anlam') or
                        entry.select_one('span')
                    )
                    
                    # Eğer bulamazsa tüm metni al ve ayır
                    if not atasozu_elem:
                        text = entry.get_text(strip=True)
                        if ':' in text:
                            parts = text.split(':', 1)
                            atasozu = parts[0].strip()
                            anlam = parts[1].strip() if len(parts) > 1 else ""
                        else:
                            continue
                    else:
                        atasozu = atasozu_elem.get_text(strip=True)
                        anlam = anlam_elem.get_text(strip=True) if anlam_elem else ""
                    
                    if atasozu and len(atasozu) > 5:
                        atasozleri.append({
                            "text": atasozu,
                            "meaning": anlam
                        })
                        print(f"  ✓ {atasozu[:50]}...")
            else:
                print(f"  ✗ '{harf}' için sonuç bulunamadı")
        
        else:
            print(f"  ✗ Hata: {response.status_code}")
        
        # Sunucuya yük bindirmemek için kısa bekleme
        time.sleep(0.5)
        
    except Exception as e:
        print(f"  ✗ Hata: {e}")
        continue

print("\n" + "=" * 60)
print(f"Toplam {len(atasozleri)} atasözü çekildi!")

# JSON olarak kaydet
if atasozleri:
    # Tekrarları temizle
    unique_proverbs = []
    seen = set()
    
    for item in atasozleri:
        if item['text'] not in seen:
            seen.add(item['text'])
            unique_proverbs.append(item)
    
    # ID ve zorluk seviyesi ekle
    for i, proverb in enumerate(unique_proverbs, 1):
        proverb['id'] = i
        proverb['difficulty'] = 1  # Varsayılan zorluk
        proverb['category'] = "genel"
        proverb['example'] = ""
        proverb['wrongAnswers'] = []
    
    output = {
        "proverbs": unique_proverbs
    }
    
    with open("tdk_atasozleri.json", "w", encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✓ {len(unique_proverbs)} benzersiz atasözü 'tdk_atasozleri.json' dosyasına kaydedildi!")
    
    # CSV olarak da kaydet
    import csv
    with open("atasozleri.csv", "w", encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Atasözü", "Anlam"])
        for proverb in unique_proverbs:
            writer.writerow([proverb['id'], proverb['text'], proverb['meaning']])
    
    print(f"✓ CSV dosyası da oluşturuldu: 'atasozleri.csv'")
else:
    print("✗ Hiç atasözü çekilemedi!")
    print("\nTDK'nın HTML yapısı değişmiş olabilir.")
    print("Lütfen atasözlerini manuel olarak kopyalayıp yapıştırın.")

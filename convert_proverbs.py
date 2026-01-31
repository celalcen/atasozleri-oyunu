import json
import re

# Atasözleri.txt dosyasını oku
with open('atasözleri.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Atasözlerini ayıkla
proverbs = []
pattern = r'(\d+)-(.+?)\s*:\s*\n(.+?)(?=\n\d+-|\nBÖLÜM|$)'

matches = re.findall(pattern, content, re.DOTALL)

print(f"Toplam {len(matches)} atasözü bulundu!")

for match in matches:
    number = match[0]
    text = match[1].strip()
    meaning = match[2].strip().replace('\n', ' ')
    
    # Çok uzun anlamları kısalt
    if len(meaning) > 300:
        meaning = meaning[:297] + "..."
    
    proverb = {
        "id": int(number),
        "text": text,
        "meaning": meaning,
        "difficulty": 1 if int(number) <= 200 else (2 if int(number) <= 400 else 3),
        "category": "genel",
        "example": "",
        "wrongAnswers": []
    }
    
    proverbs.append(proverb)
    
    if int(number) <= 10:
        print(f"{number}. {text}")
        print(f"   → {meaning[:80]}...\n")

# Yanlış cevaplar ekle (her atasözü için rastgele 3 tane)
import random

for i, proverb in enumerate(proverbs):
    # Rastgele 3 farklı atasözü seç
    other_proverbs = [p for p in proverbs if p['id'] != proverb['id']]
    wrong_answers = random.sample(other_proverbs, min(3, len(other_proverbs)))
    proverb['wrongAnswers'] = [p['text'] for p in wrong_answers]

# JSON olarak kaydet
output = {
    "proverbs": proverbs
}

with open('Assets/Data/proverbs.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✓ {len(proverbs)} atasözü 'Assets/Data/proverbs.json' dosyasına kaydedildi!")
print(f"✓ Her atasözüne 3 yanlış cevap eklendi!")
print(f"✓ Zorluk seviyeleri: 1-200 (Kolay), 201-400 (Orta), 401-500 (Zor)")

import json
import csv

# JSON dosyasını oku
with open('proverbs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# CSV dosyasına yaz
with open('atasozleri_deyimler.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f, delimiter=';')
    
    # Başlık satırı
    writer.writerow(['ID', 'Atasözü/Deyim', 'Anlamı', 'Zorluk', 'Kategori', 'Örnek', 'Yanlış Cevap 1', 'Yanlış Cevap 2', 'Yanlış Cevap 3'])
    
    # Verileri yaz
    for proverb in data['proverbs']:
        wrong_answers = proverb.get('wrongAnswers', ['', '', ''])
        # Eksik yanlış cevapları boş string ile doldur
        while len(wrong_answers) < 3:
            wrong_answers.append('')
        
        writer.writerow([
            proverb.get('id', ''),
            proverb.get('text', ''),
            proverb.get('meaning', ''),
            proverb.get('difficulty', ''),
            proverb.get('category', ''),
            proverb.get('example', ''),
            wrong_answers[0],
            wrong_answers[1],
            wrong_answers[2]
        ])

print(f"CSV dosyası oluşturuldu: atasozleri_deyimler.csv")
print(f"Toplam {len(data['proverbs'])} adet atasözü/deyim dışa aktarıldı.")

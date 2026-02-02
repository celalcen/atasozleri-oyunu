import openpyxl
import json

# Excel dosyasını oku
wb = openpyxl.load_workbook('atasozleri_deyimler_duzenlenebilir.xlsx')
ws = wb.active

# Verileri topla
proverbs = []
row_num = 0

for row in ws.iter_rows(min_row=2, values_only=True):  # Başlık satırını atla
    row_num += 1
    
    # Boş satırları atla
    if not row[0] and not row[1]:
        continue
    
    # Yanlış cevapları topla
    wrong_answers = []
    for i in range(6, 9):  # Sütun 7, 8, 9 (index 6, 7, 8)
        if i < len(row) and row[i]:
            answer = str(row[i]).strip()
            if answer:
                wrong_answers.append(answer)
    
    # Eğer yanlış cevap yoksa boş liste
    if len(wrong_answers) == 0:
        wrong_answers = ["", "", ""]
    
    proverb = {
        "id": int(row[0]) if row[0] else row_num,
        "text": str(row[1]).strip() if row[1] else "",
        "meaning": str(row[2]).strip() if row[2] else "",
        "difficulty": int(row[3]) if row[3] and str(row[3]).isdigit() else 1,
        "category": str(row[4]).strip() if row[4] else "genel",
        "example": str(row[5]).strip() if len(row) > 5 and row[5] else "",
        "wrongAnswers": wrong_answers
    }
    
    proverbs.append(proverb)

# JSON formatında kaydet
output = {
    "proverbs": proverbs
}

with open('proverbs_new.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ JSON dosyası oluşturuldu: proverbs_new.json")
print(f"📊 Toplam {len(proverbs)} adet atasözü/deyim aktarıldı.")

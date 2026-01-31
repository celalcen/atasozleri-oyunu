# TDK Atasözlerini Çekme Talimatları

## Adım 1: Gerekli Kütüphaneleri Yükleyin

Komut satırını açın ve şunu çalıştırın:

```bash
pip install beautifulsoup4 requests
```

## Adım 2: Script'i Çalıştırın

```bash
python scrape_proverbs.py
```

## Adım 3: Sonucu Kontrol Edin

Script çalıştıktan sonra `tdk_proverbs.json` dosyası oluşacak.

---

## Alternatif: Manuel Yöntem (Daha Kolay!)

Eğer Python ile uğraşmak istemiyorsanız:

1. https://sozluk.gov.tr/atasozu adresine gidin
2. Sayfadaki atasözlerini kopyalayın
3. Buraya yapıştırın, ben JSON'a çeviririm

**Format:**
```
Atasözü 1 : Anlamı
Atasözü 2 : Anlamı
...
```

veya

```
Atasözü 1
Anlamı

Atasözü 2
Anlamı
...
```

Her iki format da çalışır!

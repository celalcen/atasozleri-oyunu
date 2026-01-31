# 💰 Google AdSense Kurulum Rehberi

## 1. AdSense Hesabı Oluşturma

1. https://www.google.com/adsense/ adresine gidin
2. Google hesabınızla giriş yapın
3. Site URL'nizi girin: `https://celalcen.github.io`
4. Başvurunuzu tamamlayın
5. **Onay süresi:** 1-2 hafta

## 2. Onay Aldıktan Sonra

AdSense'den 2 kod alacaksınız:

### A) Head Kodu (Ana Script)
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

**Nereye:** `index.html` dosyasında `<head>` bölümünde yorum satırını silin ve kodunuzu yapıştırın.

### B) Reklam Birimi Kodu
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Nereye:** `index.html` dosyasında 3 reklam alanı hazırladık:
1. **Ana Menü Üst** - İlk görülen reklam
2. **Ana Menü Alt** - İstatistiklerin altında
3. **Sonuç Ekranı** - Oyun bitince

## 3. Reklam Yerleştirme

`index.html` dosyasında şu satırları bulun:

```html
<!-- AdSense Reklam Kodu Buraya -->
<!-- <ins class="adsbygoogle" ... -->
```

Yorum satırlarını (`<!--` ve `-->`) silin ve AdSense kodunuzu yapıştırın.

## 4. GitHub'a Yükleme

```bash
git add .
git commit -m "AdSense reklamları eklendi"
git push
```

## 5. Önemli Notlar

⚠️ **AdSense Politikaları:**
- Kendi reklamlarınıza tıklamayın
- Kullanıcıları tıklamaya zorlamayın
- Çok fazla reklam koymayın (3-4 ideal)
- İçerik kalitesini koruyun

✅ **Kazanç:**
- Tıklama başına: $0.20 - $2
- 1000 gösterim: $1 - $5
- Türkiye trafiği: Ortalama $0.50/1000 gösterim

## 6. Alternatif Reklam Ağları

Eğer AdSense onaylanmazsa:
- **PropellerAds** - Kolay onay
- **Media.net** - Yahoo/Bing reklamları
- **Ezoic** - AI tabanlı optimizasyon

## 7. Test

Reklamları ekledikten sonra:
1. Sayfayı yenileyin
2. Reklam alanlarında reklamlar görünmeli
3. İlk 24 saat boş olabilir (normal)

---

**Başarılar!** 💰

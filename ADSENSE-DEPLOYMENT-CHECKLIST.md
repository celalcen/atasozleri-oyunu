# AdSense Deployment Checklist

Bu checklist, AdSense entegrasyonunu GitHub Pages'e deploy etmeden önce kontrol edilmesi gereken adımları içerir.

## ✅ Deployment Öncesi Kontroller

### 1. AdSense Hesap Kurulumu
- [x] AdSense hesabı onaylandı
- [x] Site AdSense'e eklendi (celalcen.github.io)
- [x] Publisher ID doğru: `ca-pub-0442066246481433`
- [x] 3 reklam birimi oluşturuldu:
  - Ana Menü: `4599798244` ✅
  - Oyun Bitişi: `4201312590` ✅
  - Skor Tablosu: `4599798244` ⚠️ (GEÇİCİ - yeni slot ID ekleyin)

### 2. Kod Yapılandırması
- [x] `adsense-config.js` - Slot ID'ler eklendi
- [x] `adsense-manager.js` - Reklam yönetimi hazır
- [x] `index.html` - 3 reklam container eklendi
- [x] `style.css` - Reklam stilleri eklendi
- [x] `App.js` - AdSense başlatma kodu eklendi
- [x] `UIController.js` - Modal reklam yükleme eklendi

### 3. Test Modu Kontrolü
- [x] `testMode: false` olarak ayarlandı (production için)
- [ ] Localhost'ta gerçek reklamlarla test edildi
- [ ] Mobil görünüm test edildi
- [ ] Oyun bitişi modalı test edildi
- [ ] Skor tablosu test edildi

### 4. AdSense Politika Uyumluluğu
- [x] Maksimum 3 reklam/sayfa (✅ Uygun)
- [x] Manuel "Reklam" etiketi yok (✅ AdSense otomatik ekler)
- [x] Oyun sırasında reklam yok (✅ Sadece menü, modal, skor tablosu)
- [x] Yanıltıcı buton/link yok (✅ Temiz tasarım)

### 5. Performans Kontrolü
- [x] DNS prefetch eklendi
- [x] Lazy loading aktif
- [x] Asenkron script yükleme
- [x] Timeout mekanizması (3 saniye)
- [x] Hata yönetimi (başarısız reklamlar gizlenir)

### 6. Mobil Uyumluluk
- [x] Responsive tasarım
- [x] Touch-friendly boyutlar (44px minimum)
- [x] Landscape mod optimizasyonu
- [x] PWA/TWA uyumluluğu

## 🚀 Deployment Adımları

### 1. GitHub'a Push
```bash
cd D:\atasozleri
git add deploy/
git commit -m "feat: AdSense entegrasyonu eklendi"
git push origin main
```

### 2. GitHub Pages Kontrolü
- [ ] https://celalcen.github.io/atasozleri-oyunu/ adresini ziyaret et
- [ ] Ana menüde reklam görünüyor mu?
- [ ] Oyun bitişi modalında reklam görünüyor mu?
- [ ] Skor tablosunda reklam görünüyor mu?
- [ ] Tarayıcı konsolunda hata var mı?

### 3. AdSense Doğrulama
- [ ] AdSense dashboard'a giriş yap
- [ ] "Siteler" bölümünde site durumunu kontrol et
- [ ] İlk reklam gösterimlerini bekle (24-48 saat sürebilir)
- [ ] Reklam performansını izle

### 4. Mobil Test
- [ ] Gerçek mobil cihazda test et
- [ ] Chrome DevTools mobil emülatörde test et
- [ ] Farklı ekran boyutlarında test et
- [ ] Landscape ve portrait modları test et

## ⚠️ Önemli Notlar

1. **İlk Reklam Gösterimleri**: AdSense'in sitenizi onaylaması ve reklamları göstermeye başlaması 24-48 saat sürebilir.

2. **Skor Tablosu Slot ID**: Şu anda geçici olarak ana menü slot ID'si kullanılıyor. Yeni bir reklam birimi oluşturup `adsense-config.js` dosyasındaki `leaderboard.slot` değerini güncelleyin.

3. **Test Modu**: Production'da mutlaka `testMode: false` olmalı. Test modunda gerçek gelir elde edemezsiniz.

4. **AdSense Politikaları**: AdSense politikalarına uymak çok önemli. Politika ihlali hesabınızın askıya alınmasına neden olabilir.

5. **Reklam Yenileme**: Aynı sayfada reklam yenileme (refresh) yapmayın. AdSense politikalarına aykırıdır.

## 📊 İzleme ve Optimizasyon

### İlk Hafta
- [ ] Günlük AdSense dashboard kontrolü
- [ ] Reklam gösterim sayıları
- [ ] Tıklama oranları (CTR)
- [ ] Gelir takibi

### İlk Ay
- [ ] Hangi reklam konumu daha iyi performans gösteriyor?
- [ ] Mobil vs Desktop performans karşılaştırması
- [ ] Kullanıcı geri bildirimleri (reklamlar rahatsız ediyor mu?)

### Optimizasyon Fikirleri
- Düşük performanslı reklam konumlarını kaldır
- Reklam boyutlarını test et
- Farklı reklam formatlarını dene
- A/B testleri yap

## 🆘 Sorun Giderme

### Reklamlar Görünmüyor
1. Tarayıcı konsolunu kontrol et (F12)
2. AdSense script yüklendi mi? (`window.adsbygoogle` var mı?)
3. Slot ID'ler doğru mu?
4. Test modu kapalı mı?
5. AdSense hesabı onaylı mı?

### Boş Alan Kalıyor
1. CSS'de `.ad-container:empty { display: none; }` var mı?
2. Hata yönetimi çalışıyor mu?
3. Tarayıcı konsolunda hata var mı?

### Performans Sorunları
1. Lazy loading aktif mi?
2. DNS prefetch eklendi mi?
3. Script asenkron yükleniyor mu?
4. Timeout mekanizması çalışıyor mu?

## 📞 Destek

- AdSense Yardım: https://support.google.com/adsense
- AdSense Politikaları: https://support.google.com/adsense/answer/48182
- AdSense Forum: https://support.google.com/adsense/community

---

**Son Güncelleme**: 15 Şubat 2026
**Durum**: Production'a hazır ✅

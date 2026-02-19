# Google Play Console Hazırlık Listesi

## 📋 Genel Bilgiler

**Uygulama Adı:** Atasözleri ve Deyimler Öğrenme Oyunu
**Kısa Ad:** Atasözü Oyunu
**Package Name:** com.atasozleri.oyunu (veya tercih ettiğiniz benzersiz isim)
**Kategori:** Eğitim
**Production URL:** https://celalcen.github.io/atasozleri-oyunu/

---

## ✅ Hazır Olan Materyaller

### İkonlar - TAMAMLANDI! 🎉
**Android İkonları (android-icons/):**
- ✅ ic_launcher_playstore.png (512x512) - 159.5 KB - Mutlu Panda
- ✅ ic_launcher_xxxhdpi.png (192x192) - 28.03 KB
- ✅ ic_launcher_xxhdpi.png (144x144) - 17.24 KB
- ✅ ic_launcher_xhdpi.png (96x96) - 8.90 KB
- ✅ ic_launcher_hdpi.png (72x72) - 5.63 KB
- ✅ ic_launcher_mdpi.png (48x48) - 3.01 KB

**PWA İkonları (deploy/):**
- ✅ icon-512.png (512x512) - 159.5 KB
- ✅ icon-384.png (384x384) - 20.77 KB
- ✅ icon-192.png (192x192) - 28.03 KB
- ✅ icon-152.png (152x152) - 5.58 KB
- ✅ icon-144.png (144x144) - 17.24 KB
- ✅ icon-128.png (128x128) - 4.57 KB
- ✅ icon-96.png (96x96) - 8.90 KB
- ✅ icon-72.png (72x72) - 5.63 KB

**Tasarım:** Mutlu Panda, Şeffaf Arka Plan

### PWA Yapısı
- ✅ manifest.json
- ✅ service-worker.js
- ✅ PWA ikonları (TAMAMLANDI)

---

## 🔴 Eksik/Yapılması Gerekenler

### 1. Android Studio ve TWA Projesi
- [ ] Android Studio kurulumu
- [ ] TWA projesi oluşturma
- [ ] AndroidManifest.xml yapılandırması
- [ ] build.gradle yapılandırması

### 2. Keystore ve İmzalama
- [ ] Release keystore oluşturma
- [ ] SHA-256 fingerprint çıkarma
- [ ] Keystore bilgilerini güvenli saklama

### 3. Digital Asset Links
- [ ] assetlinks.json dosyası oluşturma
- [ ] Web sitesine /.well-known/assetlinks.json yükleme
- [ ] Asset links doğrulaması

### 4. Store Listing Materyalleri

#### Ekran Görüntüleri (EN ÖNEMLİ!)
- [ ] Minimum 2, maksimum 8 ekran görüntüsü
- [ ] Boyut: 1080x1920 (dikey) veya 1920x1080 (yatay)
- [ ] Format: PNG veya JPG
- [ ] Maksimum dosya boyutu: 8MB

**Önerilen Ekran Görüntüleri:**
1. Ana menü ekranı
2. Eksik kelimeler oyun modu
3. Çoktan seçmeli oyun modu
4. Eşleştirme oyun modu
5. Skor tablosu
6. Oyun bitişi ekranı

#### Feature Graphic
- [ ] Boyut: 1024x500 piksel
- [ ] Format: PNG veya JPG
- [ ] Uygulama adı ve görsel içermeli

#### Uygulama İkonu
- ✅ 512x512 piksel (HAZIR: ic_launcher_playstore.png)

#### Metinler
- [ ] **Kısa Açıklama** (max 80 karakter):
  ```
  Türk atasözlerini ve deyimlerini eğlenceli oyunlarla öğrenin!
  ```

- [ ] **Uzun Açıklama** (max 4000 karakter):
  ```
  Atasözleri ve Deyimler Öğrenme Oyunu ile Türkçe'nin zenginliğini keşfedin!
  
  🎮 3 Farklı Oyun Modu:
  • Eksik Kelimeler: Deyimlerdeki eksik kelimeleri bulun
  • Çoktan Seçmeli: Atasözlerini anlamlarıyla eşleştirin
  • Eşleştirme: Deyimleri doğru anlamlarıyla birleştirin
  
  ⭐ Özellikler:
  • 1000+ atasözü ve deyim
  • Gerçek zamanlı skor tablosu
  • Seri sistemi ile bonus puanlar
  • Artan zorluk seviyeleri
  • Offline oynanabilir
  • Tamamen ücretsiz
  
  🏆 Rekabet ve Öğrenme:
  • Arkadaşlarınızla yarışın
  • Skor tablolarında zirveye tırmanın
  • Her gün yeni atasözleri öğrenin
  
  📱 Kullanıcı Dostu:
  • Basit ve şık arayüz
  • Hızlı yükleme
  • Düşük veri kullanımı
  
  Türkçe dil becerilerinizi geliştirmek için hemen indirin!
  ```

#### Gizlilik Politikası
- [ ] Gizlilik politikası sayfası oluşturma
- [ ] URL: https://celalcen.github.io/atasozleri-oyunu/privacy-policy.html
- [ ] Google Play Console'a URL ekleme

### 5. Google Play Console Gereksinimleri
- [ ] Google Play Developer hesabı (25$ tek seferlik ücret)
- [ ] İçerik derecelendirmesi anketi
- [ ] Hedef kitle seçimi
- [ ] Veri güvenliği formu
- [ ] Uygulama kategorisi: Eğitim

### 6. AAB/APK Dosyası
- [ ] Signed AAB dosyası oluşturma
- [ ] Google Play Console'a yükleme

---

## 📝 Önerilen Adım Sırası

### Aşama 1: Görsel Materyaller (ŞİMDİ YAPILABİLİR)
1. Uygulamadan ekran görüntüleri al
2. Feature graphic tasarla (1024x500)
3. Gizlilik politikası sayfası oluştur

### Aşama 2: Android Studio Kurulumu
1. Android Studio indir ve kur
2. Gerekli SDK'ları yükle

### Aşama 3: TWA Projesi
1. Yeni Android projesi oluştur
2. TWA bağımlılıklarını ekle
3. AndroidManifest.xml yapılandır
4. build.gradle yapılandır

### Aşama 4: Keystore ve İmzalama
1. Release keystore oluştur
2. SHA-256 fingerprint çıkar
3. assetlinks.json oluştur
4. Web sitesine yükle

### Aşama 5: Build ve Test
1. Signed AAB oluştur
2. Yerel olarak test et

### Aşama 6: Google Play Console
1. Developer hesabı oluştur (25$)
2. Yeni uygulama oluştur
3. Store listing bilgilerini gir
4. AAB yükle
5. Internal test yayınla
6. Production'a yayınla

---

## 🚀 Hızlı Başlangıç

Hangi adımdan başlamak istersiniz?

1. **Ekran görüntüleri almak** (en kolay, hemen yapılabilir)
2. **Android Studio kurmak** (teknik, zaman alır)
3. **Gizlilik politikası oluşturmak** (orta zorluk)
4. **Feature graphic tasarlamak** (tasarım gerektirir)

---

## 📞 Yardım ve Kaynaklar

- [Google Play Console](https://play.google.com/console)
- [TWA Dokümantasyonu](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Android Studio İndirme](https://developer.android.com/studio)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)

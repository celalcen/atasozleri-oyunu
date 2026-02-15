# Uygulama Planı: AdSense Entegrasyonu

## Genel Bakış

Bu plan, Atasözleri Deyimler Öğrenme Oyunu'na Google AdSense reklam entegrasyonunu adım adım uygular. Her görev, önceki görevler üzerine inşa edilir ve kod hiçbir aşamada askıda kalmaz.

## Görevler

- [x] 1. AdSense yapılandırma modülünü oluştur
  - `adsense-config.js` dosyasını oluştur
  - Yayıncı kimliği, reklam birimleri ve performans ayarlarını tanımla
  - Reklam konumları için slot ID placeholder'ları ekle
  - _Gereksinimler: 1.1, 10.1, 10.2_

- [ ]* 1.1 Yapılandırma için birim testleri yaz
  - Yayıncı kimliği doğrulaması
  - Slot ID'lerin benzersizliği kontrolü
  - _Gereksinimler: 1.1, 8.2_

- [x] 2. AdSense yönetim modülünü uygula
  - [x] 2.1 AdSenseManager class'ını oluştur
    - `adsense-manager.js` dosyasını oluştur
    - Constructor ve temel yapıyı kur
    - loadedAds, failedAds ve observer state'lerini tanımla
    - _Gereksinimler: 1.2, 1.3_
  
  - [x] 2.2 Script yükleme fonksiyonunu uygula
    - `loadAdSenseScript()` metodunu yaz
    - Asenkron script yükleme ve hata yakalama
    - Timeout mekanizması ekle
    - _Gereksinimler: 1.2, 1.3, 5.1_
  
  - [ ]* 2.3 Script yükleme için özellik testi yaz
    - **Özellik 1: Script Asenkron Yükleme**
    - **Doğrular: Gereksinim 1.2, 5.1**
  
  - [ ]* 2.4 Hata yakalama için özellik testi yaz
    - **Özellik 2: Hata Yakalama ve Loglama**
    - **Doğrular: Gereksinim 1.3, 8.4**
  
  - [x] 2.5 Lazy loading mekanizmasını uygula
    - `setupLazyLoading()` metodunu yaz
    - Intersection Observer kur
    - Fallback davranışı ekle (eski tarayıcılar için)
    - _Gereksinimler: 5.4_
  
  - [ ]* 2.6 Lazy loading için özellik testi yaz
    - **Özellik 7: Lazy Loading Davranışı**
    - **Doğrular: Gereksinim 5.4**
  
  - [x] 2.7 Reklam yükleme fonksiyonunu uygula
    - `loadAd()` metodunu yaz
    - AdSense ins elementi oluşturma
    - Responsive ve sabit boyut desteği
    - Test modu kontrolü
    - _Gereksinimler: 2.2, 2.3, 3.3, 4.3, 4.4, 10.4_
  
  - [ ]* 2.8 Reklam yükleme için özellik testleri yaz
    - **Özellik 3: Responsive Reklam Formatı**
    - **Özellik 4: Reklam Boyutu Limitleri**
    - **Özellik 16: Test Modu Attribute**
    - **Doğrular: Gereksinim 2.2, 2.3, 4.2, 4.3, 4.4, 10.4**
  
  - [x] 2.9 Hata yönetimi fonksiyonlarını uygula
    - `handleAdError()` metodunu yaz
    - Container gizleme mantığı
    - failedAds tracking
    - _Gereksinimler: 2.5, 8.4_
  
  - [ ]* 2.10 Hata yönetimi için özellik testi yaz
    - **Özellik 5: Hata Durumunda Layout Düzeltme**
    - **Doğrular: Gereksinim 2.5**
  
  - [x] 2.11 Yardımcı fonksiyonları uygula
    - `getAdConfig()`, `getAdSize()`, `observeAd()` metodlarını yaz
    - Ekran boyutuna göre reklam boyutu seçimi
    - _Gereksinimler: 6.1, 6.2_
  
  - [ ]* 2.12 Mobil uyumluluk için özellik testi yaz
    - **Özellik 9: Mobil Uyumluluk**
    - **Doğrular: Gereksinim 6.1, 6.2, 6.3**
  
  - [x] 2.13 Global başlatma fonksiyonunu uygula
    - `initializeAdSense()` fonksiyonunu yaz
    - Feature flag kontrolü
    - Global instance yönetimi
    - _Gereksinimler: 10.3_
  
  - [ ]* 2.14 Feature flag için özellik testi yaz
    - **Özellik 15: Feature Flag Kontrolü**
    - **Doğrular: Gereksinim 10.3**

- [ ] 3. Checkpoint - AdSense modülleri tamamlandı
  - Tüm testlerin geçtiğinden emin ol
  - Kullanıcıya sorular varsa sor

- [x] 4. HTML entegrasyonunu yap
  - [x] 4.1 Ana menü reklam container'ını ekle
    - `index.html` içinde mainMenu ekranına `ad-main-menu` container'ı ekle
    - Footer linklerinin üstüne yerleştir
    - _Gereksinimler: 2.1_
  
  - [x] 4.2 Oyun bitişi modal reklam container'ını ekle
    - `gameOverModal` içine `ad-game-over` container'ı ekle
    - İstatistikler ile butonlar arasına yerleştir
    - _Gereksinimler: 3.1, 3.2_
  
  - [x] 4.3 Skor tablosu reklam container'ını ekle
    - `leaderboardScreen` içine `ad-leaderboard` container'ı ekle
    - Skor listesinin altına yerleştir
    - _Gereksinimler: 4.1_
  
  - [ ]* 4.4 HTML yapısı için birim testleri yaz
    - Ana menü reklam konumu kontrolü
    - Oyun bitişi modal reklam sırası kontrolü
    - Skor tablosu reklam konumu kontrolü
    - Oyun ekranında reklam olmadığını kontrol et
    - _Gereksinimler: 2.1, 3.1, 3.2, 4.1, 9.1_

- [x] 5. CSS stillerini ekle
  - [x] 5.1 Reklam container stillerini yaz
    - `style.css` dosyasına `.ad-container` ve `.ad-container-modal` stillerini ekle
    - Responsive tasarım için media query'ler
    - Yükleme animasyonu
    - _Gereksinimler: 2.4, 6.2, 6.3_
  
  - [x] 5.2 Mobil uyumluluk stillerini ekle
    - 600px altı ekranlar için stil ayarlamaları
    - Touch-friendly boyutlar (minimum 44px)
    - Landscape mod optimizasyonu
    - _Gereksinimler: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 5.3 CSS stilleri için birim testleri yaz
    - Container boyut limitleri
    - Mobil responsive davranış
    - Empty container gizleme
    - _Gereksinimler: 2.5, 6.2_

- [x] 6. Oyun entegrasyonunu yap
  - [x] 6.1 Sayfa yükleme entegrasyonu
    - `game.js` içinde `window.onload` fonksiyonuna AdSense başlatma ekle
    - Ana menü reklamını lazy load ile gözlemle
    - _Gereksinimler: 1.2, 5.4_
  
  - [x] 6.2 Oyun bitişi modal entegrasyonu
    - `showGameOverModal()` fonksiyonunu güncelle
    - Modal gösterildikten sonra reklam yükle (500ms delay)
    - _Gereksinimler: 3.1, 3.4_
  
  - [ ]* 6.3 Modal reklam yükleme için özellik testi yaz
    - **Özellik 6: Reklam Yükleme Timeout**
    - **Doğrular: Gereksinim 3.5**
  
  - [x] 6.4 Skor tablosu entegrasyonu
    - `showLeaderboard()` fonksiyonunu güncelle
    - Skor tablosu reklamını lazy load ile gözlemle
    - _Gereksinimler: 4.1, 5.4_
  
  - [ ]* 6.5 UI engellememe için özellik testi yaz
    - **Özellik 8: UI Engellememe**
    - **Doğrular: Gereksinim 5.3, 9.2**
  
  - [ ]* 6.6 Entegrasyon testleri yaz
    - Oyun akışı ile reklam etkileşimleri
    - Reklam yüklenirken oyun kontrollerinin çalışması
    - _Gereksinimler: 5.3, 9.2_

- [ ] 7. Checkpoint - Temel entegrasyon tamamlandı
  - Tüm testlerin geçtiğinden emin ol
  - Tarayıcıda manuel test yap
  - Kullanıcıya sorular varsa sor

- [x] 8. AdSense politika uyumluluğunu sağla
  - [x] 8.1 Maksimum reklam sayısı kontrolü uygula
    - Her sayfada maksimum 3 reklam container olduğunu doğrula
    - _Gereksinimler: 7.1_
  
  - [ ]* 8.2 Maksimum reklam sayısı için özellik testi yaz
    - **Özellik 11: Maksimum Reklam Sayısı**
    - **Doğrular: Gereksinim 7.1**
  
  - [x] 8.3 Manuel etiket kontrolü yap
    - Reklam container'larında manuel "Reklam" etiketi olmadığını doğrula
    - _Gereksinimler: 7.3_
  
  - [ ]* 8.4 Manuel etiket için özellik testi yaz
    - **Özellik 12: Manuel Etiket Yasağı**
    - **Doğrular: Gereksinim 7.3**
  
  - [x] 8.5 Popup/overlay kısıtlaması kontrolü
    - Oyun bitişi modalı hariç popup/overlay içinde reklam olmadığını doğrula
    - _Gereksinimler: 7.6_
  
  - [ ]* 8.6 Popup/overlay için özellik testi yaz
    - **Özellik 13: Popup/Overlay Kısıtlaması**
    - **Doğrular: Gereksinim 7.6**

- [x] 9. Performans optimizasyonlarını uygula
  - [x] 9.1 DNS prefetch ekle
    - `index.html` head'ine AdSense için preconnect link ekle
    - _Gereksinimler: 5.2_
  
  - [x] 9.2 Timeout mekanizmasını test et
    - Reklam yükleme timeout'unun çalıştığını doğrula
    - _Gereksinimler: 3.5_
  
  - [x] 9.3 Retry mekanizmasını uygula
    - Hata durumunda maksimum 2 kez yeniden deneme
    - _Gereksinimler: 1.3_
  
  - [ ]* 9.4 Performans testleri yaz
    - Sayfa render bloklama kontrolü
    - Lazy loading performansı
    - _Gereksinimler: 5.2, 5.4_

- [ ] 10. PWA/TWA uyumluluğunu test et
  - [ ] 10.1 PWA modunda test
    - Service worker ile uyumluluğu kontrol et
    - Offline durumda davranışı test et
    - _Gereksinimler: 6.5_
  
  - [ ]* 10.2 PWA/TWA için özellik testi yaz
    - **Özellik 10: PWA/TWA Uyumluluğu**
    - **Doğrular: Gereksinim 6.5**
  
  - [ ]* 10.3 PWA entegrasyon testleri yaz
    - Service worker ile reklam yükleme
    - Manifest uyumluluğu
    - _Gereksinimler: 6.5_

- [x] 11. Benzersiz slot ID kontrolü
  - [x] 11.1 Slot ID'leri yapılandırmaya ekle
    - AdSense'den alınan gerçek slot ID'leri `adsense-config.js`'e ekle
    - Her reklam birimi için farklı slot ID kullan
    - _Gereksinimler: 8.2, 8.3_
  
  - [ ]* 11.2 Slot ID benzersizliği için özellik testi yaz
    - **Özellik 14: Benzersiz Slot ID'leri**
    - **Doğrular: Gereksinim 8.2, 8.3**

- [ ] 12. Checkpoint - Tüm özellikler tamamlandı
  - Tüm testlerin geçtiğinden emin ol
  - Tüm reklam konumlarını manuel test et
  - Mobil ve desktop görünümlerini kontrol et
  - Kullanıcıya sorular varsa sor

- [x] 13. Dokümantasyon ve deployment hazırlığı
  - [x] 13.1 README güncelle
    - AdSense entegrasyonu hakkında bilgi ekle
    - Yapılandırma talimatları yaz
    - _Gereksinimler: 10.1, 10.2_
  
  - [x] 13.2 Deployment checklist oluştur
    - AdSense hesap kurulum adımları
    - Test ve production ayarları
    - Doğrulama adımları
    - _Gereksinimler: 10.4, 10.5_
  
  - [x] 13.3 Test modunu yapılandır
    - Development ortamı için test modu aktif
    - Production için test modu kapalı
    - _Gereksinimler: 10.4, 10.5_

- [ ] 14. Final test ve deployment
  - [ ] 14.1 Tüm birim testlerini çalıştır
    - Jest test suite'ini çalıştır
    - %80+ kod kapsamı hedefine ulaş
    - _Tüm Gereksinimler_
  
  - [ ] 14.2 Tüm özellik testlerini çalıştır
    - fast-check testlerini çalıştır (100 iterasyon)
    - Tüm özelliklerin geçtiğini doğrula
    - _Tüm Gereksinimler_
  
  - [ ] 14.3 Manuel tarayıcı testi
    - Chrome, Firefox, Safari'de test et
    - Mobil cihazlarda test et
    - PWA modunda test et
    - _Gereksinimler: 6.1, 6.5_
  
  - [ ] 14.4 Production deployment
    - Test modunu kapat
    - Gerçek slot ID'leri kullan
    - GitHub Pages'e deploy et
    - AdSense doğrulaması yap
    - _Gereksinimler: 10.4, 10.5_

- [ ] 15. Final checkpoint - Deployment tamamlandı
  - İlk reklam gösterimlerini kontrol et
  - AdSense dashboard'da verileri izle
  - Kullanıcı geri bildirimlerini topla

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır ve daha hızlı MVP için atlanabilir
- Her görev, önceki görevlerin tamamlanmasını gerektirir
- Checkpoint'lerde testlerin geçmesi ve kullanıcı onayı beklenir
- Özellik testleri, tasarım belgesindeki özelliklere referans verir
- Birim testler, spesifik örnekler ve edge case'ler için kullanılır
- Test modu, development sırasında AdSense test reklamlarını gösterir
- Production'da mutlaka gerçek slot ID'ler kullanılmalıdır

# Gereksinimler Belgesi

## Giriş

Bu belge, Atasözleri Deyimler Öğrenme Oyunu web uygulamasına Google AdSense reklam entegrasyonunun gereksinimlerini tanımlar. Entegrasyon, oyun deneyimini bozmadan gelir elde etmeyi amaçlar ve gelecekte mobil uygulamaya (TWA/Android) dönüştürülmeye uygun olacak şekilde tasarlanmıştır.

## Sözlük

- **Sistem**: Atasözleri Deyimler Öğrenme Oyunu web uygulaması
- **Reklam_Yöneticisi**: Google AdSense reklam gösterim ve yönetim sistemi
- **Oyun_Oturumu**: Kullanıcının bir oyun modunu başlatıp bitirdiği süre
- **Oyun_Modu**: Eksik Kelimeler, Çoktan Seçmeli veya Eşleştirme oyun türlerinden biri
- **Reklam_Birimi**: Google AdSense tarafından sağlanan tek bir reklam alanı
- **Reklam_Konumu**: Reklamın gösterileceği sayfa veya ekran konumu
- **Reklam_Formatı**: Reklamın boyutu ve türü (banner, responsive, vb.)
- **Ana_Menü**: Oyun modlarının seçildiği başlangıç ekranı
- **Oyun_Bitişi_Modal**: Oyun sonunda skorların gösterildiği popup pencere
- **Skor_Tablosu**: Liderlik sıralamasının gösterildiği ekran

## Gereksinimler

### Gereksinim 1: AdSense Hesap Entegrasyonu

**Kullanıcı Hikayesi:** Geliştirici olarak, AdSense hesabımı uygulamaya entegre etmek istiyorum, böylece reklamlar gösterebilirim.

#### Kabul Kriterleri

1. THE Sistem SHALL AdSense yayıncı kimliğini (ca-pub-0442066246481433) yapılandırma dosyasında saklamalıdır
2. WHEN sayfa yüklendiğinde, THE Sistem SHALL AdSense script'ini asenkron olarak yüklemelidir
3. THE Sistem SHALL AdSense script yükleme hatalarını yakalayıp loglamalıdır
4. THE Sistem SHALL AdSense politikalarına uygun şekilde reklam gösterimini yönetmelidir

### Gereksinim 2: Ana Menü Reklam Yerleşimi

**Kullanıcı Hikayesi:** Oyuncu olarak, ana menüde oyun deneyimimi bozmayan reklamlar görmek istiyorum.

#### Kabul Kriterleri

1. WHEN kullanıcı ana menüyü görüntülediğinde, THE Sistem SHALL footer linklerinin üstünde bir reklam birimi göstermelidir
2. THE Reklam_Birimi SHALL responsive format kullanmalıdır (ekran boyutuna göre uyarlanmalı)
3. THE Reklam_Birimi SHALL maksimum 320x100 piksel boyutunda olmalıdır (mobil uyumluluk için)
4. THE Sistem SHALL reklam yüklenene kadar placeholder alanı göstermelidir
5. IF reklam yüklenemezse, THEN THE Sistem SHALL boş alan bırakmamalı ve layout'u düzeltmelidir

### Gereksinim 3: Oyun Arası Reklam Gösterimi

**Kullanıcı Hikayesi:** Oyuncu olarak, oyun oturumları arasında reklamlar görmek istiyorum, böylece oyun sırasında dikkatim dağılmasın.

#### Kabul Kriterleri

1. WHEN oyun bitişi modalı gösterildiğinde, THE Sistem SHALL modal içinde bir reklam birimi göstermelidir
2. THE Reklam_Birimi SHALL istatistik kutularının altında ve butonların üstünde konumlanmalıdır
3. THE Reklam_Birimi SHALL maksimum 300x250 piksel boyutunda olmalıdır
4. WHEN kullanıcı "Tekrar Oyna" butonuna tıkladığında, THE Sistem SHALL yeni oyun başlamadan önce reklamın görüntülendiğinden emin olmalıdır
5. THE Sistem SHALL reklam yükleme süresini 3 saniye ile sınırlamalıdır

### Gereksinim 4: Skor Tablosu Reklam Yerleşimi

**Kullanıcı Hikayesi:** Oyuncu olarak, skor tablosunu incelerken reklamlar görmek istiyorum.

#### Kabul Kriterleri

1. WHEN kullanıcı skor tablosunu açtığında, THE Sistem SHALL skor listesinin altında bir reklam birimi göstermelidir
2. THE Reklam_Birimi SHALL responsive format kullanmalıdır
3. THE Reklam_Birimi SHALL maksimum 728x90 piksel boyutunda olmalıdır (desktop için)
4. THE Reklam_Birimi SHALL maksimum 320x50 piksel boyutunda olmalıdır (mobil için)
5. THE Sistem SHALL sekme değişikliklerinde (Tüm Zamanlar, Bugün, Bu Hafta) reklam yenilenmesini yönetmelidir

### Gereksinim 5: Reklam Yükleme Performansı

**Kullanıcı Hikayesi:** Oyuncu olarak, reklamların sayfa yükleme hızını olumsuz etkilememesini istiyorum.

#### Kabul Kriterleri

1. THE Sistem SHALL AdSense script'ini asenkron olarak yüklemelidir
2. THE Sistem SHALL reklam yüklemesinin sayfa render'ını bloklamasını engellemelidir
3. WHEN reklam yüklenirken, THE Sistem SHALL kullanıcı etkileşimlerini engellememelidir
4. THE Sistem SHALL lazy loading kullanarak sadece görünür reklam birimlerini yüklemelidir
5. THE Sistem SHALL reklam yükleme hatalarında kullanıcı deneyimini bozmamalıdır

### Gereksinim 6: Mobil Uyumluluk

**Kullanıcı Hikayesi:** Mobil oyuncu olarak, reklamların mobil cihazımda düzgün görünmesini istiyorum.

#### Kabul Kriterleri

1. WHEN ekran genişliği 600 piksel altında olduğunda, THE Sistem SHALL mobil-optimize reklam formatları kullanmalıdır
2. THE Reklam_Birimi SHALL ekran genişliğinin %90'ını geçmemelidir
3. THE Sistem SHALL reklam birimlerinin touch-friendly olmasını sağlamalıdır (minimum 44px dokunma alanı)
4. THE Sistem SHALL yatay mod (landscape) için reklam yerleşimini optimize etmelidir
5. THE Sistem SHALL PWA ve TWA ortamlarında reklam gösterimini desteklemelidir

### Gereksinim 7: AdSense Politika Uyumluluğu

**Kullanıcı Hikayesi:** Geliştirici olarak, AdSense politikalarına uygun bir entegrasyon yapmak istiyorum, böylece hesabım askıya alınmasın.

#### Kabul Kriterleri

1. THE Sistem SHALL sayfa başına maksimum 3 reklam birimi göstermelidir
2. THE Sistem SHALL reklamları içerik ile karıştırılmayacak şekilde yerleştirmelidir
3. THE Sistem SHALL reklam birimlerinin üzerinde "Reklam" veya "Sponsorlu" etiketi göstermemelidir (AdSense otomatik ekler)
4. THE Sistem SHALL kullanıcıları reklama tıklamaya teşvik eden metinler içermemelidir
5. THE Sistem SHALL reklam birimlerinin yakınında yanıltıcı butonlar veya linkler bulundurmamalıdır
6. THE Sistem SHALL reklam birimlerini popup veya overlay içinde göstermemelidir (oyun bitişi modalı hariç)

### Gereksinim 8: Reklam Görünürlük Takibi

**Kullanıcı Hikayesi:** Geliştirici olarak, reklamların ne kadar görüntülendiğini takip etmek istiyorum.

#### Kabul Kriterleri

1. THE Sistem SHALL AdSense otomatik raporlama sistemini kullanmalıdır
2. THE Sistem SHALL reklam birimlerine benzersiz slot ID'leri atamalıdır
3. THE Sistem SHALL her reklam konumu için ayrı performans takibi yapabilmelidir
4. WHEN reklam yükleme hatası oluştuğunda, THE Sistem SHALL hatayı console'a loglamalıdır
5. THE Sistem SHALL reklam gösterim sayısını localStorage'da saklamalıdır (isteğe bağlı analitik için)

### Gereksinim 9: Kullanıcı Deneyimi Koruması

**Kullanıcı Hikayesi:** Oyuncu olarak, reklamların oyun akışını bozmamasını istiyorum.

#### Kabul Kriterleri

1. THE Sistem SHALL oyun sırasında (soru cevaplama anında) reklam göstermemelidir
2. THE Sistem SHALL reklam yükleme sırasında oyun kontrollerini bloklamam alıdır
3. WHEN reklam gösterildiğinde, THE Sistem SHALL kullanıcının kolayca geçebilmesini sağlamalıdır
4. THE Sistem SHALL reklam animasyonlarının oyun animasyonlarını bozmamasını sağlamalıdır
5. THE Sistem SHALL ses efektlerinin reklam sesleri ile çakışmamasını sağlamalıdır

### Gereksinim 10: Yapılandırma ve Bakım

**Kullanıcı Hikayesi:** Geliştirici olarak, reklam ayarlarını kolayca değiştirebilmek istiyorum.

#### Kabul Kriterleri

1. THE Sistem SHALL AdSense yayıncı kimliğini merkezi bir yapılandırma dosyasında saklamalıdır
2. THE Sistem SHALL reklam birim ID'lerini kod içinde sabit olarak tanımlamalıdır
3. THE Sistem SHALL reklam gösterimini açıp kapatmak için bir feature flag desteklemelidir
4. THE Sistem SHALL test modu için AdSense test reklamlarını kullanabilmelidir
5. THE Sistem SHALL production ve development ortamları için farklı reklam ayarları desteklemelidir

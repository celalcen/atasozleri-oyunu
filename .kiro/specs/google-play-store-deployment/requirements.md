# Requirements Document

## Introduction

Bu doküman, mevcut bir web uygulamasının Google Play Store'a TWA (Trusted Web Activity) teknolojisi kullanılarak deployment sürecini tanımlar. Tüm işlemler Windows bilgisayarda gerçekleştirilecektir.

## Glossary

- **TWA (Trusted_Web_Activity)**: Android uygulaması içinde web içeriğini tam ekran gösteren teknoloji
- **Android_Studio**: Android uygulama geliştirme için resmi IDE
- **Google_Play_Console**: Android uygulamalarını yayınlamak için Google'ın platformu
- **APK**: Android Package Kit, Android uygulama dosya formatı
- **AAB**: Android App Bundle, Google Play için optimize edilmiş uygulama formatı
- **Digital_Asset_Links**: Web sitesi ile Android uygulaması arasındaki güven ilişkisini doğrulayan dosya
- **Keystore**: Android uygulamasını imzalamak için kullanılan dijital sertifika dosyası
- **Deployment**: Uygulamanın canlı ortama yayınlanması süreci
- **Web_App**: Localhost'ta çalışan mevcut web uygulaması
- **Production_URL**: Web uygulamasının canlı ortamdaki URL'si

## Requirements

### Requirement 1: Android Studio Kurulumu

**User Story:** Windows kullanıcısı olarak, Android uygulama geliştirmek için Android Studio'yu bilgisayarıma kurmak istiyorum, böylece TWA projesi oluşturabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı Android Studio kurulum dosyasını indirdiğinde, THE System SHALL en güncel kararlı sürümü sağlamalıdır
2. WHEN kurulum başlatıldığında, THE Android_Studio SHALL gerekli SDK bileşenlerini otomatik olarak indirmelidir
3. WHEN kurulum tamamlandığında, THE Android_Studio SHALL başarıyla açılmalı ve proje oluşturma ekranını göstermelidir
4. THE Android_Studio SHALL minimum 8GB RAM ve 8GB disk alanı gereksinimini karşılamalıdır

### Requirement 2: Web Uygulamasının Production'a Deploy Edilmesi

**User Story:** Geliştirici olarak, localhost'ta çalışan web uygulamam için bir production URL'si oluşturmak istiyorum, böylece TWA bu URL'yi kullanabilsin.

#### Acceptance Criteria

1. WHEN web uygulaması bir hosting servisine deploy edildiğinde, THE Web_App SHALL HTTPS protokolü ile erişilebilir olmalıdır
2. WHEN deployment tamamlandığında, THE System SHALL geçerli bir production URL sağlamalıdır
3. THE Production_URL SHALL PWA gereksinimlerini karşılamalıdır (manifest.json, service worker)
4. WHEN kullanıcı production URL'yi ziyaret ettiğinde, THE Web_App SHALL localhost'taki ile aynı şekilde çalışmalıdır

### Requirement 3: TWA Projesi Oluşturma

**User Story:** Geliştirici olarak, Android Studio'da TWA projesi oluşturmak istiyorum, böylece web uygulamam Android uygulaması olarak paketlenebilsin.

#### Acceptance Criteria

1. WHEN Android Studio'da yeni proje oluşturulduğunda, THE System SHALL TWA şablonunu veya boş Activity seçeneğini sunmalıdır
2. WHEN proje oluşturulduğunda, THE Android_Studio SHALL gerekli TWA bağımlılıklarını build.gradle dosyasına eklemelidir
3. THE Trusted_Web_Activity SHALL production URL'yi AndroidManifest.xml dosyasında tanımlamalıdır
4. WHEN proje build edildiğinde, THE System SHALL hatasız derleme yapmalıdır

### Requirement 4: Digital Asset Links Yapılandırması

**User Story:** Geliştirici olarak, web sitem ile Android uygulamam arasında güven ilişkisi kurmak istiyorum, böylece TWA tam ekran çalışabilsin.

#### Acceptance Criteria

1. WHEN keystore oluşturulduğunda, THE System SHALL SHA-256 fingerprint'i üretmelidir
2. THE Digital_Asset_Links SHALL assetlinks.json dosyası olarak web sitesinin /.well-known/ dizinine yerleştirilmelidir
3. WHEN assetlinks.json dosyası erişildiğinde, THE Web_App SHALL doğru package name ve SHA-256 fingerprint içermelidir
4. WHEN Android uygulaması başlatıldığında, THE System SHALL assetlinks.json dosyasını doğrulamalıdır

### Requirement 5: Uygulama İmzalama ve APK/AAB Oluşturma

**User Story:** Geliştirici olarak, uygulamam için release APK/AAB oluşturmak istiyorum, böylece Google Play Store'a yükleyebilirim.

#### Acceptance Criteria

1. WHEN keystore oluşturulduğunda, THE System SHALL güvenli bir şifre ile korumalıdır
2. THE Keystore SHALL .jks veya .keystore formatında saklanmalıdır
3. WHEN release build oluşturulduğunda, THE Android_Studio SHALL uygulamayı keystore ile imzalamalıdır
4. THE System SHALL hem APK hem de AAB formatında çıktı üretebilmelidir
5. WHEN build tamamlandığında, THE System SHALL imzalı dosyayı app/release/ dizinine kaydetmelidir

### Requirement 6: Google Play Console Hesabı ve Uygulama Oluşturma

**User Story:** Geliştirici olarak, Google Play Console'da uygulama oluşturmak istiyorum, böylece uygulamam Store'da yayınlanabilsin.

#### Acceptance Criteria

1. WHEN kullanıcı Google Play Console'a eriştiğinde, THE System SHALL geçerli bir Google hesabı gerektirmelidir
2. IF kullanıcının developer hesabı yoksa, THEN THE System SHALL 25$ kayıt ücreti talep etmelidir
3. WHEN yeni uygulama oluşturulduğunda, THE Google_Play_Console SHALL benzersiz bir package name gerektirmelidir
4. THE Google_Play_Console SHALL uygulama adı, açıklama, kategori ve ekran görüntüleri talep etmelidir

### Requirement 7: Store Listing ve Metadata Hazırlama

**User Story:** Geliştirici olarak, uygulama için Store listing bilgilerini hazırlamak istiyorum, böylece kullanıcılar uygulamam hakkında bilgi sahibi olabilsin.

#### Acceptance Criteria

1. THE System SHALL minimum 2 ekran görüntüsü (1080x1920 veya 1920x1080) gerektirmelidir
2. THE System SHALL 512x512 boyutunda uygulama ikonu gerektirmelidir
3. THE System SHALL 1024x500 boyutunda feature graphic gerektirmelidir
4. WHEN açıklama girildiğinde, THE System SHALL kısa açıklama (80 karakter) ve uzun açıklama (4000 karakter) alanları sunmalıdır
5. THE System SHALL gizlilik politikası URL'si gerektirmelidir

### Requirement 8: AAB Yükleme ve Test Süreci

**User Story:** Geliştirici olarak, AAB dosyasını Google Play Console'a yüklemek istiyorum, böylece uygulamam test edilebilsin ve yayınlanabilsin.

#### Acceptance Criteria

1. WHEN AAB dosyası yüklendiğinde, THE Google_Play_Console SHALL dosyayı otomatik olarak doğrulamalıdır
2. IF doğrulama başarısız olursa, THEN THE System SHALL hata mesajlarını açıkça göstermelidir
3. THE System SHALL internal test, closed test ve open test seçenekleri sunmalıdır
4. WHEN internal test oluşturulduğunda, THE System SHALL test kullanıcılarının email adresleriyle eklenmesine izin vermelidir
5. WHEN test yayınlandığında, THE System SHALL test linkini sağlamalıdır

### Requirement 9: Production'a Yayınlama

**User Story:** Geliştirici olarak, test edilen uygulamam production'a yayınlamak istiyorum, böylece tüm kullanıcılar erişebilsin.

#### Acceptance Criteria

1. WHEN production release oluşturulduğinde, THE System SHALL tüm Store listing bilgilerinin tamamlandığını doğrulamalıdır
2. THE System SHALL içerik derecelendirmesi anketinin tamamlanmasını gerektirmelidir
3. THE System SHALL hedef kitle ve içerik bildirimlerinin tamamlanmasını gerektirmelidir
4. WHEN yayınlama başlatıldığında, THE Google_Play_Console SHALL inceleme sürecini başlatmalıdır
5. THE System SHALL inceleme sürecinin durumunu göstermelidir
6. WHEN inceleme tamamlandığında, THE System SHALL uygulamayı Store'da yayınlamalıdır

### Requirement 10: Güncelleme ve Versiyon Yönetimi

**User Story:** Geliştirici olarak, uygulamam için güncellemeler yayınlamak istiyorum, böylece yeni özellikler ve düzeltmeler kullanıcılara ulaşabilsin.

#### Acceptance Criteria

1. WHEN yeni versiyon oluşturulduğunda, THE System SHALL versionCode değerini artırmalıdır
2. THE System SHALL versionName'i semantic versioning formatında tutmalıdır
3. WHEN güncelleme yüklendiğinde, THE System SHALL release notes gerektirmelidir
4. THE System SHALL staged rollout seçeneği sunmalıdır (örn: %10, %50, %100)
5. WHEN güncelleme yayınlandığında, THE Google_Play_Console SHALL kullanıcılara otomatik güncelleme sunmalıdır

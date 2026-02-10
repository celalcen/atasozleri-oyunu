# Firebase Authentication Kurulum Rehberi

## 🔥 Firebase Console Ayarları

### 1. Firebase Console'a Git
- https://console.firebase.google.com adresine git
- Projen: `atasozleri-oyunu-59b84`

### 2. Authentication'ı Aktif Et

#### Google Sign-In
1. Sol menüden **Authentication** > **Sign-in method** seç
2. **Google** sağlayıcısını bul ve tıkla
3. **Enable** (Etkinleştir) butonunu aç
4. **Project support email** seç (kendi email'in)
5. **Save** (Kaydet) butonuna tıkla

#### Apple Sign-In (Opsiyonel - iOS için)
1. Sol menüden **Authentication** > **Sign-in method** seç
2. **Apple** sağlayıcısını bul ve tıkla
3. **Enable** (Etkinleştir) butonunu aç
4. Apple Developer hesabından gerekli bilgileri gir:
   - Service ID
   - Team ID
   - Key ID
   - Private Key
5. **Save** (Kaydet) butonuna tıkla

**Not:** Apple Sign-In için Apple Developer hesabı gerekir ($99/yıl). Şimdilik sadece Google ile devam edebilirsin.

### 3. Authorized Domains (Yetkili Domain'ler)
1. **Authentication** > **Settings** > **Authorized domains** seç
2. Localhost zaten ekli olmalı
3. Canlıya aldığında domain'ini buraya ekle

## ✅ Test Etme

1. Projeyi localhost'ta aç: http://localhost:8000
2. Ana menüde **"🔐 Giriş Yap"** butonuna tıkla
3. **"Google ile Giriş Yap"** butonuna tıkla
4. Google hesabını seç
5. Giriş başarılı olursa profil bilgilerin görünecek

## 🎮 Özellikler

### Giriş Yapmış Kullanıcılar
- ✅ Her oyun başlatmada isim girmek zorunda değil
- ✅ Skorlar kullanıcı ID'si ile kaydedilir
- ✅ Profil fotoğrafı görünür
- ✅ Çıkış yapma seçeneği

### Misafir Kullanıcılar
- ✅ İsim girerek oynayabilir
- ✅ Skorlar kaydedilir ama kullanıcı ID'si olmaz
- ✅ İstediği zaman giriş yapabilir

## 🔒 Güvenlik

Firebase Authentication otomatik olarak:
- Token yönetimi
- Oturum yönetimi
- Güvenli kimlik doğrulama
sağlar.

## 📱 Canlıya Alma

Projeyi canlıya aldığında:
1. Firebase Console'da domain'ini **Authorized domains**'e ekle
2. Google Search Console'da site doğrulaması yap
3. Apple Sign-In için Apple Developer hesabı gerekir

## 🆘 Sorun Giderme

### "Firebase Authentication yüklenmedi" hatası
- Tarayıcı konsolunu kontrol et (F12)
- Firebase config doğru mu kontrol et
- İnternet bağlantısını kontrol et

### Google Sign-In çalışmıyor
- Firebase Console'da Google provider aktif mi?
- Authorized domains listesinde localhost var mı?
- Popup blocker kapalı mı?

### Apple Sign-In çalışmıyor
- Apple Developer hesabı var mı?
- Service ID, Team ID doğru mu?
- Sadece HTTPS'de çalışır (localhost hariç)

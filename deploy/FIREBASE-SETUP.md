# Firebase Authentication Kurulumu

## 1. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. "Add project" (Proje ekle) butonuna tıkla
3. Proje adını gir (örn: "atasozleri-oyunu")
4. Google Analytics'i istersen aktif et
5. Projeyi oluştur

## 2. Web Uygulaması Ekle

1. Firebase Console'da projenize tıklayın
2. "Web" ikonuna (</>)  tıklayın
3. Uygulama adını girin
4. "Firebase Hosting" seçeneğini işaretleyin
5. "Register app" butonuna tıklayın
6. Firebase yapılandırma kodunu kopyalayın

## 3. Firebase Config'i Güncelle

`firebase-config.js` dosyasını açın ve `firebaseConfig` nesnesini kendi değerlerinizle değiştirin:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "atasozleri-oyunu.firebaseapp.com",
    projectId: "atasozleri-oyunu",
    storageBucket: "atasozleri-oyunu.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## 4. Authentication'ı Aktif Et

1. Firebase Console'da "Authentication" sekmesine git
2. "Get started" butonuna tıkla
3. "Sign-in method" sekmesine git
4. **Google** provider'ı aktif et:
   - Google'a tıkla
   - "Enable" toggle'ını aç
   - Proje destek e-postasını seç
   - "Save" butonuna tıkla
5. **Anonymous** provider'ı aktif et:
   - Anonymous'a tıkla
   - "Enable" toggle'ını aç
   - "Save" butonuna tıkla

## 5. Firestore Database Oluştur

1. Firebase Console'da "Firestore Database" sekmesine git
2. "Create database" butonuna tıkla
3. "Start in production mode" seç
4. Lokasyon seç (örn: europe-west1)
5. "Enable" butonuna tıkla

## 6. Firestore Kurallarını Ayarla

"Rules" sekmesine git ve şu kuralları ekle:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Skorlar koleksiyonu
    match /scores/{scoreId} {
      // Herkes okuyabilir
      allow read: if true;
      
      // Sadece giriş yapmış kullanıcılar yazabilir
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Kullanıcı sadece kendi skorunu güncelleyebilir/silebilir
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

"Publish" butonuna tıklayın.

## 7. Test Et

1. Uygulamayı çalıştır: `python -m http.server 8000`
2. Tarayıcıda `http://localhost:8000` aç
3. "Giriş Yap" butonuna tıkla
4. Google ile giriş yap veya Misafir olarak devam et
5. Oyun oyna ve skorun kaydedildiğini kontrol et

## Özellikler

✅ **Google ile Giriş**: Kullanıcılar Google hesaplarıyla giriş yapabilir
✅ **Misafir Girişi**: Kullanıcılar kayıt olmadan anonim olarak oynayabilir
✅ **Skor Kaydetme**: Skorlar Firebase Firestore'da saklanır
✅ **Skor Tablosu**: Tüm zamanlar, bugün, bu hafta filtreleri
✅ **Otomatik Giriş**: Kullanıcı bir kez giriş yaptıktan sonra otomatik giriş yapar

## Sorun Giderme

**Hata: "Firebase: Error (auth/unauthorized-domain)"**
- Firebase Console → Authentication → Settings → Authorized domains
- `localhost` ve domain'inizi ekleyin

**Hata: "Missing or insufficient permissions"**
- Firestore kurallarını kontrol edin
- Kullanıcının giriş yaptığından emin olun

**Skorlar görünmüyor**
- Firestore'da "scores" koleksiyonunun oluştuğunu kontrol edin
- Console'da hata mesajlarını kontrol edin

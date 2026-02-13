# Firebase Manuel Deployment Rehberi

Firebase CLI ile sorun yaşıyorsanız, Firebase Console'dan manuel deployment yapabilirsiniz.

## Yöntem 1: CMD'den Deployment (ÖNERİLEN)

### Adım 1: CMD Açın (PowerShell DEĞİL!)
1. Windows tuşuna basın
2. "cmd" yazın
3. Enter'a basın

### Adım 2: Proje Klasörüne Gidin
```cmd
cd D:\atasozleri
```

### Adım 3: Firebase Login
```cmd
firebase login
```

Tarayıcı açılacak:
- Google hesabınızla giriş yapın
- Firebase projenizin olduğu hesabı seçin
- "Allow" tıklayın
- CMD'ye dönün

### Adım 4: Firebase Proje ID'sini Öğrenin

Firebase Console'a gidin:
1. https://console.firebase.google.com/
2. Projenizi seçin
3. Proje ayarlarına gidin (⚙️ simgesi)
4. "Project ID" kopyalayın (örn: atasozleri-oyunu-12345)

### Adım 5: .firebaserc Dosyasını Düzenleyin

`.firebaserc` dosyasını açın ve `your-project-id` yerine gerçek proje ID'nizi yazın:

```json
{
  "projects": {
    "default": "atasozleri-oyunu-12345"
  }
}
```

### Adım 6: Deploy Edin

CMD'de:
```cmd
firebase deploy --only hosting
```

Deploy tamamlanınca URL verilecek:
```
✔  Deploy complete!

Hosting URL: https://atasozleri-oyunu-12345.web.app
```

---

## Yöntem 2: Firebase Console'dan Manuel Upload

Eğer CMD'de de sorun yaşarsanız:

### Adım 1: Dosyaları Hazırlayın

Şu dosyaları bir klasöre kopyalayın:

**Kopyalanacak Dosyalar:**
- ✅ index.html
- ✅ style.css
- ✅ game.js
- ✅ sounds.js
- ✅ firebase-config.js
- ✅ manifest.json
- ✅ service-worker.js
- ✅ atasozleri.json
- ✅ deyimler.json
- ✅ proverbs.json
- ✅ assets/ (tüm klasör)
- ✅ hakkimizda.html
- ✅ nasil-oynanir.html
- ✅ gizlilik-politikasi.html
- ✅ atasozleri-nedir.html

**Kopyalanmayacak Dosyalar:**
- ❌ .git/
- ❌ .kiro/
- ❌ scripts/
- ❌ docs/
- ❌ Assets/ (büyük A ile)
- ❌ deploy/
- ❌ web/
- ❌ *.py
- ❌ *.zip, *.rar
- ❌ *.xlsx, *.csv

### Adım 2: Firebase Console

1. https://console.firebase.google.com/
2. Projenizi seçin
3. Sol menüden "Hosting" seçin
4. "Get started" veya "Add another site" tıklayın

### Adım 3: Firebase CLI ile Deploy

Firebase Console'da CLI komutları gösterilecek:

```bash
firebase init
firebase deploy
```

Bu komutları CMD'de çalıştırın.

---

## Sorun Giderme

### "firebase: command not found" (CMD'de)

**Çözüm:**
1. CMD'yi kapatın
2. Yeni bir CMD açın
3. Tekrar deneyin

Hala çalışmıyorsa:
```cmd
npm install -g firebase-tools
```

### "Error: Failed to get Firebase project"

**Çözüm:**
1. Firebase Console'da proje ID'nizi kontrol edin
2. `.firebaserc` dosyasında doğru ID'yi yazdığınızdan emin olun

### "Permission denied"

**Çözüm:**
1. CMD'yi "Run as administrator" ile açın
2. Tekrar deneyin

---

## Deployment Sonrası

Deploy başarılı olduktan sonra:

1. ✅ URL'yi not edin (örn: https://atasozleri-oyunu-12345.web.app)
2. ✅ Tarayıcıda açıp test edin
3. ✅ HTTPS olduğunu doğrulayın
4. ✅ Tüm sayfaların çalıştığını kontrol edin

URL'yi aldıktan sonra TWA projesi oluşturmaya geçeceğiz!

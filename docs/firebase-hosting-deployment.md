# Firebase Hosting Deployment Rehberi

## Adım 1: Firebase CLI Kurulumu

Firebase CLI'yi global olarak kurun:

```bash
npm install -g firebase-tools
```

## Adım 2: Firebase'e Giriş Yapın

```bash
firebase login
```

Bu komut tarayıcınızı açacak ve Google hesabınızla giriş yapmanızı isteyecek.

## Adım 3: Firebase Projesini Başlatın

Proje klasöründe (D:\atasozleri):

```bash
firebase init hosting
```

### Sorulacak Sorular ve Cevaplar:

1. **"Are you ready to proceed?"**
   → `Y` (Yes)

2. **"Please select an option:"**
   → `Use an existing project` (Zaten Firebase projeniz var)

3. **"Select a default Firebase project:"**
   → Mevcut projenizi seçin (ok tuşları ile)

4. **"What do you want to use as your public directory?"**
   → `.` (nokta - mevcut klasör)
   
   VEYA eğer dosyalarınız başka bir klasördeyse:
   → `deploy` veya `web` (klasör adınıza göre)

5. **"Configure as a single-page app (rewrite all urls to /index.html)?"**
   → `Y` (Yes - PWA için gerekli)

6. **"Set up automatic builds and deploys with GitHub?"**
   → `N` (No - manuel deploy yapacağız)

7. **"File index.html already exists. Overwrite?"**
   → `N` (No - mevcut dosyanızı koruyun)

## Adım 4: firebase.json Yapılandırması

`firebase.json` dosyası oluşturulacak. İçeriğini şu şekilde düzenleyin:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/*.py",
      "**/*.md",
      "scripts/**",
      "docs/**",
      ".kiro/**",
      "*.zip",
      "*.rar",
      "*.xlsx",
      "*.csv",
      "*.txt",
      "*.bat"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

## Adım 5: Deploy Edin

```bash
firebase deploy --only hosting
```

### Deploy Süreci:
1. Dosyalar yüklenecek (~5-10 dakika)
2. Deploy tamamlandığında URL gösterilecek
3. URL formatı: `https://your-project-id.web.app`

## Adım 6: Deployment Doğrulama

Deploy tamamlandıktan sonra:

1. Verilen URL'yi tarayıcıda açın
2. Uygulamanın çalıştığını kontrol edin
3. HTTPS olduğunu doğrulayın (adres çubuğunda kilit simgesi)

### Doğrulama Scripti:

```bash
python scripts/verify_deployment.py https://your-project-id.web.app
```

## Sorun Giderme

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Permission denied"
```bash
# Windows'ta yönetici olarak çalıştırın
# PowerShell'i "Run as Administrator" ile açın
```

### "Project not found"
- Firebase Console'da projenizin var olduğundan emin olun
- `firebase projects:list` ile projeleri listeleyin

### "Deploy failed"
- İnternet bağlantınızı kontrol edin
- `firebase.json` dosyasının geçerli olduğundan emin olun
- Tekrar deneyin: `firebase deploy --only hosting`

## Güncelleme (Update)

Uygulamanızı güncellemek için:

1. Değişiklikleri yapın
2. Tekrar deploy edin:
   ```bash
   firebase deploy --only hosting
   ```

## Özel Domain (Opsiyonel)

Kendi domain'inizi kullanmak için:

1. Firebase Console → Hosting
2. "Add custom domain"
3. Domain'inizi girin (örn: atasozleri-oyunu.com)
4. DNS kayıtlarını ekleyin
5. Doğrulama bekleyin (24-48 saat)

## Sonraki Adım

Deploy başarılı olduktan sonra:

1. ✅ Production URL'nizi not edin
2. 📱 TWA projesi oluşturun
3. 🔗 Digital Asset Links yapılandırın

Production URL'nizi aldıktan sonra bana bildirin!

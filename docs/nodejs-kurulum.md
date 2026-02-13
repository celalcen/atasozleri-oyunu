# Node.js Kurulum Rehberi

## Adım 1: Node.js İndirme

### İndirme Linki
🔗 **https://nodejs.org/**

### Hangi Versiyonu İndirmeli?
- **LTS (Long Term Support)** versiyonunu seçin ⭐ ÖNERİLEN
- Yeşil "LTS" butonu (örn: v20.x.x LTS)
- Windows 64-bit installer (.msi)

### Dosya Bilgileri
- Dosya adı: `node-v20.x.x-x64.msi` (versiyon değişebilir)
- Boyut: ~30 MB

---

## Adım 2: Kurulum

### 1. Kurulum Dosyasını Çalıştır
- İndirilen `.msi` dosyasına çift tıkla
- "User Account Control" uyarısında **"Yes"** seç

### 2. Welcome Screen
- **"Next"** tıkla

### 3. License Agreement
- ✅ "I accept the terms in the License Agreement" işaretle
- **"Next"** tıkla

### 4. Destination Folder
- Varsayılan bırak: `C:\Program Files\nodejs\`
- **"Next"** tıkla

### 5. Custom Setup
Tüm bileşenler seçili olmalı:
- ✅ Node.js runtime
- ✅ npm package manager
- ✅ Online documentation shortcuts
- ✅ Add to PATH

**"Next"** tıkla

### 6. Tools for Native Modules (Opsiyonel)
- Bu ekran gelebilir: "Automatically install the necessary tools"
- ❌ İşaretlemeyin (gerekli değil)
- **"Next"** tıkla

### 7. Ready to Install
- **"Install"** tıkla
- Kurulum başlayacak (2-3 dakika)

### 8. Completed
- **"Finish"** tıkla

---

## Adım 3: Kurulum Doğrulaması

### Yeni PowerShell/CMD Penceresi Açın
**ÖNEMLİ:** Eski terminal penceresini kapatın, yeni bir tane açın!

### Node.js Versiyonunu Kontrol Et
```bash
node --version
```

Çıktı: `v20.x.x` gibi bir versiyon numarası görmeli

### npm Versiyonunu Kontrol Et
```bash
npm --version
```

Çıktı: `10.x.x` gibi bir versiyon numarası görmeli

---

## Adım 4: Firebase CLI Kurulumu

Node.js kurulumu tamamlandıktan sonra:

```bash
npm install -g firebase-tools
```

Bu komut:
- Firebase CLI'yi global olarak kuracak
- 2-3 dakika sürecek
- İnternet bağlantısı gerekli

### Firebase CLI Doğrulama
```bash
firebase --version
```

Çıktı: `13.x.x` gibi bir versiyon numarası görmeli

---

## Sorun Giderme

### "node is not recognized"
**Çözüm:**
1. Terminal penceresini kapatın
2. Yeni bir PowerShell/CMD açın
3. Tekrar deneyin

Hala çalışmıyorsa:
1. Bilgisayarı yeniden başlatın
2. Tekrar deneyin

### "npm install" çok yavaş
**Çözüm:**
- İnternet bağlantınızı kontrol edin
- Antivirüs yazılımını geçici olarak devre dışı bırakın
- Tekrar deneyin

### "Permission denied" hatası
**Çözüm:**
- PowerShell'i "Run as Administrator" ile açın
- Komutu tekrar çalıştırın

---

## Kurulum Sonrası

Node.js ve Firebase CLI kurulumu tamamlandıktan sonra:

```bash
# Kurulumu doğrula
python scripts/verify_nodejs.py

# Firebase'e giriş yap
firebase login

# Deployment'a başla
firebase init hosting
```

---

## Hızlı Kontrol Scripti

Kurulumun başarılı olduğunu doğrulamak için:

```bash
python scripts/verify_nodejs.py
```

Bu script Node.js, npm ve Firebase CLI'nin kurulu olup olmadığını kontrol edecek.

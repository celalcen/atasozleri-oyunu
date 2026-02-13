# TWA (Trusted Web Activity) Projesi Oluşturma Rehberi

## Adım 1: Android Studio'yu Açın

1. Android Studio'yu başlatın
2. Ana ekranda **"New Project"** tıklayın

## Adım 2: Proje Şablonu Seçin

1. **"Phone and Tablet"** sekmesinde
2. **"Empty Views Activity"** seçin (en basit şablon)
3. **"Next"** tıklayın

## Adım 3: Proje Ayarları

Şu bilgileri girin:

- **Name:** `Atasozleri Oyunu`
- **Package name:** `com.atasozleri.oyunu`
- **Save location:** `D:\atasozleri-twa` (veya istediğiniz konum)
- **Language:** `Kotlin` (veya Java)
- **Minimum SDK:** `API 21: Android 5.0 (Lollipop)`
- **Build configuration language:** `Kotlin DSL (build.gradle.kts)`

**"Finish"** tıklayın

## Adım 4: Gradle Sync Bekleyin

- İlk açılışta Gradle bağımlılıkları indirilecek
- 5-10 dakika sürebilir
- Alt kısımda "Gradle Build" progress bar'ı göreceksiniz
- "BUILD SUCCESSFUL" mesajını bekleyin

## Adım 5: TWA Bağımlılığını Ekleyin

### app/build.gradle.kts Dosyasını Açın

Sol panelde:
```
app/
  └─ build.gradle.kts
```

Dosyayı açın ve `dependencies` bölümüne şunu ekleyin:

```kotlin
dependencies {
    // Mevcut bağımlılıklar...
    
    // TWA bağımlılığı
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
```

**Dosyayı kaydedin** (Ctrl+S)

### Gradle Sync Yapın

- Üst kısımda "Sync Now" linki çıkacak
- Tıklayın ve sync'in bitmesini bekleyin

## Adım 6: AndroidManifest.xml Düzenleyin

### Dosyayı Açın

```
app/
  └─ src/
      └─ main/
          └─ AndroidManifest.xml
```

### Mevcut Activity'yi Silin

`<activity>` etiketini tamamen silin (MainActivity ile ilgili kısım)

### TWA Activity Ekleyin

`<application>` etiketi içine şunu ekleyin:

```xml
<activity
    android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
    android:label="@string/app_name"
    android:exported="true">
    
    <!-- App icon -->
    <meta-data
        android:name="android.support.customtabs.trusted.DEFAULT_URL"
        android:value="https://atasozleri-oyunu-59b84.web.app" />
    
    <!-- Splash screen (optional) -->
    <meta-data
        android:name="android.support.customtabs.trusted.SPLASH_SCREEN_DRAWABLE"
        android:resource="@drawable/ic_launcher_foreground" />
    
    <!-- Status bar color -->
    <meta-data
        android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
        android:resource="@color/purple_500" />
    
    <!-- Navigation bar color -->
    <meta-data
        android:name="android.support.customtabs.trusted.NAVIGATION_BAR_COLOR"
        android:resource="@color/purple_500" />
    
    <!-- Main launcher -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
    <!-- Deep linking -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="atasozleri-oyunu-59b84.web.app" />
    </intent-filter>
</activity>
```

**Dosyayı kaydedin**

## Adım 7: MainActivity.kt Dosyasını Silin (Opsiyonel)

TWA kullandığımız için MainActivity'ye ihtiyacımız yok:

```
app/
  └─ src/
      └─ main/
          └─ java/
              └─ com/atasozleri/oyunu/
                  └─ MainActivity.kt  (SİL)
```

Sağ tık → Delete

## Adım 8: Build Yapın

1. Üst menüden **Build** → **Make Project**
2. Veya **Ctrl+F9**
3. Alt kısımda "BUILD SUCCESSFUL" mesajını bekleyin

## Adım 9: Test Edin (Opsiyonel)

### Emulator Oluşturun

1. Üst toolbar'da **Device Manager** tıklayın
2. **Create Device** tıklayın
3. **Pixel 5** seçin → **Next**
4. **API 33** (Android 13) seçin → **Next**
5. **Finish**

### Uygulamayı Çalıştırın

1. Üst toolbar'da **Run** (yeşil play butonu)
2. Emulator başlayacak (ilk açılış 5-10 dakika sürebilir)
3. Uygulama açılacak ve web sitenizi gösterecek

## Sorun Giderme

### "Unresolved reference: androidbrowserhelper"

**Çözüm:**
- Gradle sync yapın (File → Sync Project with Gradle Files)
- İnternet bağlantınızı kontrol edin

### "Activity not found"

**Çözüm:**
- AndroidManifest.xml'de activity adının doğru olduğundan emin olun
- Build → Clean Project → Rebuild Project

### "Default Activity not found"

**Çözüm:**
- AndroidManifest.xml'de `<intent-filter>` ile `MAIN` ve `LAUNCHER` olduğundan emin olun

## Sonraki Adım

Proje oluşturulduktan sonra:
1. ✅ Keystore oluşturma
2. ✅ Digital Asset Links yapılandırma
3. ✅ Release APK/AAB oluşturma

Proje oluşturma tamamlandığında bana haber verin!

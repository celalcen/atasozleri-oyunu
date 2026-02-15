# Tasarım Belgesi: AdSense Entegrasyonu

## Genel Bakış

Bu tasarım, Atasözleri Deyimler Öğrenme Oyunu'na Google AdSense reklam entegrasyonunu tanımlar. Entegrasyon, kullanıcı deneyimini korurken gelir elde etmeyi amaçlar ve gelecekte mobil uygulamaya (TWA/Android) dönüşüme hazır bir yapı sunar.

### Tasarım Prensipleri

1. **Kullanıcı Deneyimi Öncelikli**: Reklamlar oyun akışını bozmamalı
2. **Performans Odaklı**: Asenkron yükleme ve lazy loading kullanımı
3. **Mobil-First**: PWA ve TWA uyumluluğu
4. **Politika Uyumlu**: AdSense kurallarına tam uyum
5. **Bakım Kolaylığı**: Merkezi yapılandırma ve modüler kod

## Mimari

### Sistem Bileşenleri

```
┌─────────────────────────────────────────────────────────┐
│                    Web Uygulaması                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Ana Menü    │  │ Oyun Ekranı  │  │ Skor Tablosu │  │
│  │              │  │              │  │              │  │
│  │  [Reklam 1]  │  │              │  │  [Reklam 3]  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│         ┌──────────────────────────────┐                 │
│         │   Oyun Bitişi Modal          │                 │
│         │                              │                 │
│         │   [Reklam 2]                 │                 │
│         └──────────────────────────────┘                 │
│                                                           │
├─────────────────────────────────────────────────────────┤
│              AdSense Yönetim Modülü                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ - Reklam yükleme                                 │   │
│  │ - Hata yönetimi                                  │   │
│  │ - Performans optimizasyonu                       │   │
│  │ - Responsive davranış                            │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│              Google AdSense API                          │
└─────────────────────────────────────────────────────────┘
```

### Reklam Konumları

1. **Ana Menü Reklamı** (ad-main-menu)
   - Konum: Footer linklerinin üstünde
   - Format: Responsive banner
   - Boyut: 320x100 (mobil), 728x90 (desktop)
   - Öncelik: Düşük (lazy load)

2. **Oyun Bitişi Reklamı** (ad-game-over)
   - Konum: Modal içinde, istatistikler ile butonlar arası
   - Format: Medium rectangle
   - Boyut: 300x250
   - Öncelik: Yüksek (hemen yükle)

3. **Skor Tablosu Reklamı** (ad-leaderboard)
   - Konum: Skor listesinin altında
   - Format: Responsive banner
   - Boyut: 320x50 (mobil), 728x90 (desktop)
   - Öncelik: Orta (görünür olunca yükle)

## Bileşenler ve Arayüzler

### 1. AdSense Yapılandırma Modülü

**Dosya**: `adsense-config.js`

```javascript
// AdSense yapılandırma sabitleri
const ADSENSE_CONFIG = {
    publisherId: 'ca-pub-0442066246481433',
    enabled: true,
    testMode: false, // Development için true yapılabilir
    
    adUnits: {
        mainMenu: {
            id: 'ad-main-menu',
            slot: 'SLOT_ID_1', // AdSense'den alınacak
            format: 'horizontal',
            responsive: true,
            sizes: {
                mobile: [[320, 100], [320, 50]],
                desktop: [[728, 90], [468, 60]]
            }
        },
        gameOver: {
            id: 'ad-game-over',
            slot: 'SLOT_ID_2',
            format: 'rectangle',
            responsive: false,
            sizes: {
                mobile: [[300, 250]],
                desktop: [[300, 250]]
            }
        },
        leaderboard: {
            id: 'ad-leaderboard',
            slot: 'SLOT_ID_3',
            format: 'horizontal',
            responsive: true,
            sizes: {
                mobile: [[320, 50]],
                desktop: [[728, 90], [970, 90]]
            }
        }
    },
    
    // Performans ayarları
    performance: {
        lazyLoadMargin: '200px', // Viewport'a 200px yaklaşınca yükle
        maxLoadTime: 3000, // Maksimum 3 saniye bekleme
        retryAttempts: 2 // Hata durumunda 2 kez dene
    }
};
```

### 2. AdSense Yönetim Modülü

**Dosya**: `adsense-manager.js`

```javascript
class AdSenseManager {
    constructor(config) {
        this.config = config;
        this.loadedAds = new Set();
        this.failedAds = new Set();
        this.observer = null;
    }
    
    /**
     * AdSense script'ini yükle
     * @returns {Promise<boolean>} Yükleme başarılı mı
     */
    async loadAdSenseScript() {
        // Script zaten yüklü mü kontrol et
        if (window.adsbygoogle) {
            return true;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => resolve(true);
            script.onerror = () => {
                console.error('AdSense script yüklenemedi');
                reject(false);
            };
            
            document.head.appendChild(script);
            
            // Timeout ekle
            setTimeout(() => reject(false), this.config.performance.maxLoadTime);
        });
    }
    
    /**
     * Lazy loading için Intersection Observer kur
     */
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Eski tarayıcılar için fallback
            this.loadAllAds();
            return;
        }
        
        const options = {
            rootMargin: this.config.performance.lazyLoadMargin,
            threshold: 0.01
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adId = entry.target.id;
                    this.loadAd(adId);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }
    
    /**
     * Belirli bir reklamı yükle
     * @param {string} adId - Reklam container ID'si
     */
    async loadAd(adId) {
        if (this.loadedAds.has(adId) || this.failedAds.has(adId)) {
            return;
        }
        
        const container = document.getElementById(adId);
        if (!container) {
            console.warn(`Reklam container bulunamadı: ${adId}`);
            return;
        }
        
        try {
            // AdSense ins elementi oluştur
            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            
            // Reklam yapılandırmasını al
            const adConfig = this.getAdConfig(adId);
            if (!adConfig) {
                throw new Error(`Reklam yapılandırması bulunamadı: ${adId}`);
            }
            
            // AdSense parametrelerini ayarla
            ins.setAttribute('data-ad-client', this.config.publisherId);
            ins.setAttribute('data-ad-slot', adConfig.slot);
            
            if (adConfig.responsive) {
                ins.setAttribute('data-ad-format', 'auto');
                ins.setAttribute('data-full-width-responsive', 'true');
            } else {
                const size = this.getAdSize(adConfig);
                ins.style.width = `${size[0]}px`;
                ins.style.height = `${size[1]}px`;
            }
            
            // Test modu kontrolü
            if (this.config.testMode) {
                ins.setAttribute('data-adtest', 'on');
            }
            
            // Container'a ekle
            container.appendChild(ins);
            
            // AdSense'i başlat
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            
            this.loadedAds.add(adId);
            console.log(`Reklam yüklendi: ${adId}`);
            
        } catch (error) {
            console.error(`Reklam yükleme hatası (${adId}):`, error);
            this.failedAds.add(adId);
            this.handleAdError(adId);
        }
    }
    
    /**
     * Reklam yapılandırmasını al
     * @param {string} adId - Reklam ID'si
     * @returns {Object|null} Reklam yapılandırması
     */
    getAdConfig(adId) {
        for (const [key, config] of Object.entries(this.config.adUnits)) {
            if (config.id === adId) {
                return config;
            }
        }
        return null;
    }
    
    /**
     * Ekran boyutuna göre reklam boyutunu belirle
     * @param {Object} adConfig - Reklam yapılandırması
     * @returns {Array} [width, height]
     */
    getAdSize(adConfig) {
        const isMobile = window.innerWidth < 600;
        const sizes = isMobile ? adConfig.sizes.mobile : adConfig.sizes.desktop;
        return sizes[0]; // İlk boyutu kullan
    }
    
    /**
     * Reklam yükleme hatasını yönet
     * @param {string} adId - Reklam ID'si
     */
    handleAdError(adId) {
        const container = document.getElementById(adId);
        if (container) {
            // Container'ı gizle (boş alan bırakma)
            container.style.display = 'none';
        }
    }
    
    /**
     * Tüm reklamları yükle (fallback)
     */
    loadAllAds() {
        Object.values(this.config.adUnits).forEach(adUnit => {
            this.loadAd(adUnit.id);
        });
    }
    
    /**
     * Belirli bir reklamı yenile
     * @param {string} adId - Reklam ID'si
     */
    refreshAd(adId) {
        const container = document.getElementById(adId);
        if (container) {
            // Mevcut reklamı temizle
            container.innerHTML = '';
            this.loadedAds.delete(adId);
            this.failedAds.delete(adId);
            
            // Yeniden yükle
            this.loadAd(adId);
        }
    }
    
    /**
     * Reklamı gözlemle (lazy loading için)
     * @param {string} adId - Reklam ID'si
     */
    observeAd(adId) {
        if (!this.observer) {
            this.setupLazyLoading();
        }
        
        const container = document.getElementById(adId);
        if (container && this.observer) {
            this.observer.observe(container);
        }
    }
    
    /**
     * Manager'ı temizle
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.loadedAds.clear();
        this.failedAds.clear();
    }
}

// Global instance
let adManager = null;

/**
 * AdSense Manager'ı başlat
 */
async function initializeAdSense() {
    if (!ADSENSE_CONFIG.enabled) {
        console.log('AdSense devre dışı');
        return;
    }
    
    try {
        adManager = new AdSenseManager(ADSENSE_CONFIG);
        await adManager.loadAdSenseScript();
        console.log('AdSense başlatıldı');
    } catch (error) {
        console.error('AdSense başlatma hatası:', error);
    }
}

// Export
window.adManager = adManager;
window.initializeAdSense = initializeAdSense;
```

### 3. HTML Entegrasyonu

**Ana Menü Reklamı** (`index.html` içinde):

```html
<!-- Ana Menü Ekranı -->
<div id="mainMenu" class="screen active">
    <!-- Mevcut içerik -->
    <div class="welcome-section">...</div>
    <div class="menu-buttons">...</div>
    <div class="stats">...</div>
    
    <!-- Reklam Container -->
    <div id="ad-main-menu" class="ad-container"></div>
    
    <!-- Footer Links -->
    <div class="footer-links">...</div>
</div>
```

**Oyun Bitişi Modal Reklamı**:

```html
<!-- Oyun Bitişi Modal -->
<div id="gameOverModal" class="modal">
    <div class="modal-content game-over-content">
        <div id="confetti"></div>
        <div class="maskot">...</div>
        <h2 id="resultTitle">🎉 Tebrikler!</h2>
        <p class="modal-subtitle" id="resultMessage">...</p>
        
        <div class="result-stats-grid">...</div>
        
        <!-- Reklam Container -->
        <div id="ad-game-over" class="ad-container-modal"></div>
        
        <div class="modal-buttons">...</div>
    </div>
</div>
```

**Skor Tablosu Reklamı**:

```html
<!-- Skor Tablosu Ekranı -->
<div id="leaderboardScreen" class="screen">
    <h2>🏆 Skor Tablosu</h2>
    
    <div class="leaderboard-content">
        <div class="leaderboard-tabs">...</div>
        <div id="leaderboardList" class="leaderboard-list"></div>
    </div>
    
    <!-- Reklam Container -->
    <div id="ad-leaderboard" class="ad-container"></div>
    
    <button class="btn btn-primary" onclick="backToMenu()">Ana Menüye Dön</button>
</div>
```

### 4. CSS Stilleri

**Dosya**: `style.css` (eklenecek)

```css
/* Reklam Container Stilleri */
.ad-container {
    min-height: 100px;
    max-width: 728px;
    margin: 20px auto;
    background: #f8f9fa;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.ad-container:empty {
    display: none; /* Reklam yüklenmediyse gizle */
}

.ad-container-modal {
    min-height: 250px;
    max-width: 300px;
    margin: 15px auto;
    background: #f8f9fa;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    overflow: hidden;
}

.ad-container-modal:empty {
    display: none;
}

/* Mobil Uyumluluk */
@media (max-width: 600px) {
    .ad-container {
        max-width: 100%;
        min-height: 50px;
    }
    
    .ad-container-modal {
        max-width: 100%;
        min-height: 200px;
    }
}

/* Reklam yükleme animasyonu */
.ad-container.loading::before {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* AdSense ins elementi stilleri */
.ad-container ins.adsbygoogle,
.ad-container-modal ins.adsbygoogle {
    display: block !important;
    width: 100%;
    height: auto;
}
```

### 5. Oyun Entegrasyonu

**Dosya**: `game.js` (güncellenecek)

```javascript
// Sayfa yüklendiğinde AdSense'i başlat
window.onload = async function () {
    await loadAllData();
    updateStats();
    checkUserAuth();
    
    // AdSense'i başlat
    await initializeAdSense();
    
    // Ana menü reklamını lazy load ile gözlemle
    if (window.adManager) {
        adManager.observeAd('ad-main-menu');
    }
};

// Oyun bitişi modalını göster (güncelleme)
function showGameOverModal(isWin) {
    const modal = document.getElementById('gameOverModal');
    // ... mevcut kod ...
    
    // Modal'ı göster
    modal.classList.add('show');
    
    // Oyun bitişi reklamını yükle
    if (window.adManager) {
        setTimeout(() => {
            adManager.loadAd('ad-game-over');
        }, 500); // Modal animasyonu bittikten sonra
    }
}

// Skor tablosunu göster (güncelleme)
window.showLeaderboard = async function() {
    showScreen('leaderboardScreen');
    await showLeaderboardTab('all');
    
    // Skor tablosu reklamını lazy load ile gözlemle
    if (window.adManager) {
        adManager.observeAd('ad-leaderboard');
    }
}

// Sekme değişikliğinde reklam yenileme (isteğe bağlı)
window.showLeaderboardTab = async function(tab) {
    // ... mevcut kod ...
    
    // Reklam yenileme (opsiyonel - AdSense politikalarına dikkat)
    // if (window.adManager) {
    //     adManager.refreshAd('ad-leaderboard');
    // }
}
```

## Veri Modelleri

### AdSense Yapılandırma Modeli

```typescript
interface AdSenseConfig {
    publisherId: string;           // AdSense yayıncı kimliği
    enabled: boolean;              // Reklam sistemi aktif mi
    testMode: boolean;             // Test modu (development için)
    
    adUnits: {
        [key: string]: AdUnit;     // Reklam birimleri
    };
    
    performance: {
        lazyLoadMargin: string;    // Lazy load mesafesi
        maxLoadTime: number;       // Maksimum yükleme süresi (ms)
        retryAttempts: number;     // Hata durumunda deneme sayısı
    };
}

interface AdUnit {
    id: string;                    // HTML container ID
    slot: string;                  // AdSense slot ID
    format: 'horizontal' | 'rectangle' | 'vertical';
    responsive: boolean;           // Responsive reklam mı
    sizes: {
        mobile: number[][];        // Mobil boyutlar [[w,h], ...]
        desktop: number[][];       // Desktop boyutlar [[w,h], ...]
    };
}
```

### Reklam Durumu Modeli

```typescript
interface AdState {
    loadedAds: Set<string>;        // Yüklenmiş reklamlar
    failedAds: Set<string>;        // Başarısız reklamlar
    observer: IntersectionObserver | null;  // Lazy load observer
}
```

## Doğruluk Özellikleri

*Bir özellik (property), sistemin tüm geçerli çalıştırmalarında doğru olması gereken bir karakteristik veya davranıştır - esasen, sistemin ne yapması gerektiği hakkında resmi bir ifadedir. Özellikler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasında köprü görevi görür.*


### Özellik Yansıması (Property Reflection)

Prework analizini gözden geçirerek gereksiz özellikleri belirledim:

**Birleştirilebilir Özellikler:**
- 1.2 ve 5.1: Her ikisi de script'in asenkron yüklenmesini test ediyor → Tek özelliğe birleştir
- 2.2 ve 4.2: Her ikisi de responsive format kullanımını test ediyor → Tek özelliğe birleştir
- 8.2 ve 8.3: Her ikisi de benzersiz ID kullanımını test ediyor → Tek özelliğe birleştir
- 1.1 ve 10.1: Her ikisi de yapılandırma dosyasında yayıncı kimliği kontrolü → Tek örneğe birleştir

**Kapsayan Özellikler:**
- 2.3, 4.3, 4.4: Tüm bu boyut kontrolleri, genel bir "reklam boyutu limitleri" özelliğinde birleştirilebilir
- 6.1, 6.2, 6.3, 6.4: Tüm mobil uyumluluk kontrolleri tek bir kapsamlı özellikte birleştirilebilir

**Sonuç:** 
- Başlangıç: 50+ potansiyel test
- Birleştirme sonrası: ~20 benzersiz, değer katan özellik

### Doğruluk Özellikleri (Devam)

#### Özellik 1: Script Asenkron Yükleme
*Herhangi bir* sayfa yüklemesinde, AdSense script elementi async attribute'üne sahip olmalı ve document.head'e eklenmelidir
**Doğrular: Gereksinim 1.2, 5.1**

#### Özellik 2: Hata Yakalama ve Loglama
*Herhangi bir* reklam yükleme hatası durumunda, sistem hatayı console'a loglamalı ve ilgili reklam ID'sini failedAds setine eklemelidir
**Doğrular: Gereksinim 1.3, 8.4**

#### Özellik 3: Responsive Reklam Formatı
*Herhangi bir* responsive olarak işaretlenmiş reklam birimi için, ins elementi 'data-ad-format="auto"' ve 'data-full-width-responsive="true"' attribute'lerine sahip olmalıdır
**Doğrular: Gereksinim 2.2, 4.2**

#### Özellik 4: Reklam Boyutu Limitleri
*Herhangi bir* reklam birimi için, seçilen boyut yapılandırmada tanımlanan maksimum boyutları aşmamalıdır (mobil: 320x100, desktop: 728x90, modal: 300x250)
**Doğrular: Gereksinim 2.3, 4.3, 4.4, 3.3**

#### Özellik 5: Hata Durumunda Layout Düzeltme
*Herhangi bir* reklam yükleme hatası durumunda, ilgili container elementi display:none stiline sahip olmalı ve boş alan bırakmamalıdır
**Doğrular: Gereksinim 2.5**

#### Özellik 6: Reklam Yükleme Timeout
*Herhangi bir* reklam yükleme işlemi için, maksimum bekleme süresi yapılandırmada tanımlanan maxLoadTime değerini (3000ms) aşmamalıdır
**Doğrular: Gereksinim 3.5**

#### Özellik 7: Lazy Loading Davranışı
*Herhangi bir* lazy load olarak işaretlenmiş reklam için, reklam viewport'a yapılandırmada tanımlanan mesafeye (200px) yaklaşana kadar yüklenmemelidir
**Doğrular: Gereksinim 5.4**

#### Özellik 8: UI Engellememe
*Herhangi bir* reklam yükleme işlemi sırasında, oyun kontrol butonları (option-btn, btn-primary) disabled attribute'üne sahip olmamalıdır
**Doğrular: Gereksinim 5.3, 9.2**

#### Özellik 9: Mobil Uyumluluk
*Herhangi bir* 600 piksel altı ekran genişliğinde, sistem mobil reklam boyutlarını seçmeli ve reklam genişliği ekran genişliğinin %90'ını geçmemelidir
**Doğrular: Gereksinim 6.1, 6.2, 6.3**

#### Özellik 10: PWA/TWA Uyumluluğu
*Herhangi bir* PWA veya TWA ortamında, AdSense script'i yüklenmeli ve reklamlar normal web ortamındaki gibi gösterilmelidir
**Doğrular: Gereksinim 6.5**

#### Özellik 11: Maksimum Reklam Sayısı
*Herhangi bir* sayfada, aynı anda görünür reklam container sayısı 3'ü geçmemelidir (AdSense politikası)
**Doğrular: Gereksinim 7.1**

#### Özellik 12: Manuel Etiket Yasağı
*Herhangi bir* reklam container'ında, "Reklam", "Sponsorlu", "Advertisement" gibi manuel etiketler bulunmamalıdır (AdSense otomatik ekler)
**Doğrular: Gereksinim 7.3**

#### Özellik 13: Popup/Overlay Kısıtlaması
*Herhangi bir* reklam container'ı (gameOverModal hariç), parent elementleri arasında 'modal' veya 'popup' class'ına sahip element bulunmamalıdır
**Doğrular: Gereksinim 7.6**

#### Özellik 14: Benzersiz Slot ID'leri
*Herhangi bir* iki farklı reklam birimi için, slot ID'leri birbirinden farklı olmalıdır (tekrar eden slot ID olmamalı)
**Doğrular: Gereksinim 8.2, 8.3**

#### Özellik 15: Feature Flag Kontrolü
*Herhangi bir* durumda, ADSENSE_CONFIG.enabled false ise, hiçbir reklam yükleme işlemi başlatılmamalıdır
**Doğrular: Gereksinim 10.3**

#### Özellik 16: Test Modu Attribute
*Herhangi bir* test modunda (testMode: true) yüklenen reklam için, ins elementi 'data-adtest="on"' attribute'üne sahip olmalıdır
**Doğrular: Gereksinim 10.4**

## Hata Yönetimi

### Hata Senaryoları ve Çözümleri

| Hata Senaryosu | Tespit Yöntemi | Çözüm Stratejisi |
|----------------|----------------|-------------------|
| AdSense script yüklenemedi | Script onerror event | Console'a log, reklamları devre dışı bırak |
| Reklam birimi yüklenemedi | adsbygoogle push hatası | Container'ı gizle, failedAds'e ekle |
| Timeout aşıldı | setTimeout kontrolü | Yüklemeyi iptal et, container'ı gizle |
| Geçersiz slot ID | AdSense API hatası | Console'a log, varsayılan reklam gösterme |
| Network hatası | Fetch/script error | Retry mekanizması (max 2 deneme) |
| Intersection Observer desteklenmiyor | Feature detection | Fallback: Tüm reklamları direkt yükle |

### Hata Loglama Formatı

```javascript
// Standart hata log formatı
console.error('[AdSense Error]', {
    type: 'LOAD_FAILED' | 'TIMEOUT' | 'INVALID_CONFIG' | 'NETWORK_ERROR',
    adId: string,
    timestamp: Date,
    details: any
});
```

### Kullanıcı Bildirimleri

- **Sessiz Hatalar**: Reklam yükleme hataları kullanıcıya gösterilmez (UX bozulmasın)
- **Kritik Hatalar**: Sadece development modda console'da gösterilir
- **Fallback Davranış**: Reklam yüklenemezse container gizlenir, layout bozulmaz

## Test Stratejisi

### İkili Test Yaklaşımı

Bu proje hem **birim testleri** hem de **özellik-tabanlı testleri** kullanacaktır:

**Birim Testleri:**
- Spesifik örnekler ve edge case'ler için
- DOM yapısı kontrolleri (reklam konumları)
- Yapılandırma doğrulamaları
- Hata yönetimi senaryoları
- Entegrasyon noktaları (game.js ile etkileşim)

**Özellik-Tabanlı Testler:**
- Evrensel özellikler için (tüm girdiler üzerinde)
- Reklam yükleme davranışları
- Responsive davranış testleri
- Timeout ve retry mekanizmaları
- Lazy loading davranışı

### Test Kütüphanesi Seçimi

**JavaScript için önerilen kütüphane**: **fast-check**
- Reason: JavaScript ekosisteminde en olgun PBT kütüphanesi
- TypeScript desteği mevcut
- Async/await desteği
- Custom generator'lar yazma kolaylığı

**Alternatif**: **jsverify** (daha basit projeler için)

### Test Yapılandırması

```javascript
// Test yapılandırması
const TEST_CONFIG = {
    iterations: 100,  // Her özellik testi için minimum 100 iterasyon
    timeout: 5000,    // Test timeout: 5 saniye
    seed: undefined,  // Rastgele seed (tekrarlanabilirlik için sabitlenebilir)
};
```

### Örnek Özellik Testi

```javascript
// Feature: adsense-integration, Property 4: Reklam Boyutu Limitleri
import fc from 'fast-check';

describe('AdSense Integration - Property Tests', () => {
    test('Property 4: Reklam boyutu limitleri', () => {
        fc.assert(
            fc.property(
                fc.record({
                    adId: fc.constantFrom('ad-main-menu', 'ad-game-over', 'ad-leaderboard'),
                    screenWidth: fc.integer({ min: 320, max: 1920 }),
                }),
                ({ adId, screenWidth }) => {
                    // Ekran boyutunu simüle et
                    window.innerWidth = screenWidth;
                    
                    // Reklam yapılandırmasını al
                    const adConfig = adManager.getAdConfig(adId);
                    const size = adManager.getAdSize(adConfig);
                    
                    // Maksimum boyut limitleri
                    const limits = {
                        'ad-main-menu': { mobile: [320, 100], desktop: [728, 90] },
                        'ad-game-over': { mobile: [300, 250], desktop: [300, 250] },
                        'ad-leaderboard': { mobile: [320, 50], desktop: [728, 90] }
                    };
                    
                    const isMobile = screenWidth < 600;
                    const maxSize = isMobile ? limits[adId].mobile : limits[adId].desktop;
                    
                    // Özellik: Seçilen boyut maksimum limiti aşmamalı
                    expect(size[0]).toBeLessThanOrEqual(maxSize[0]);
                    expect(size[1]).toBeLessThanOrEqual(maxSize[1]);
                }
            ),
            { numRuns: 100 }
        );
    });
});
```

### Birim Test Örnekleri

```javascript
// Spesifik örnekler ve edge case'ler için birim testler
describe('AdSense Integration - Unit Tests', () => {
    test('Ana menüde reklam container doğru konumda', () => {
        // Gereksinim 2.1
        const mainMenu = document.getElementById('mainMenu');
        const adContainer = document.getElementById('ad-main-menu');
        const footerLinks = mainMenu.querySelector('.footer-links');
        
        // Reklam container footer'dan önce gelmeli
        expect(adContainer.compareDocumentPosition(footerLinks))
            .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
    
    test('Oyun bitişi modalında reklam doğru sırada', () => {
        // Gereksinim 3.2
        const modal = document.getElementById('gameOverModal');
        const adContainer = document.getElementById('ad-game-over');
        const statsGrid = modal.querySelector('.result-stats-grid');
        const buttons = modal.querySelector('.modal-buttons');
        
        // Reklam istatistiklerden sonra, butonlardan önce
        expect(adContainer.compareDocumentPosition(statsGrid))
            .toBe(Node.DOCUMENT_POSITION_PRECEDING);
        expect(adContainer.compareDocumentPosition(buttons))
            .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
    
    test('Oyun ekranında reklam container yok', () => {
        // Gereksinim 9.1
        const gameScreen = document.getElementById('gameScreen');
        const adContainers = gameScreen.querySelectorAll('[id^="ad-"]');
        
        expect(adContainers.length).toBe(0);
    });
    
    test('Yapılandırmada doğru yayıncı kimliği', () => {
        // Gereksinim 1.1, 10.1
        expect(ADSENSE_CONFIG.publisherId).toBe('ca-pub-0442066246481433');
    });
    
    test('Reklam birim ID\'leri sabittir', () => {
        // Gereksinim 10.2
        expect(ADSENSE_CONFIG.adUnits.mainMenu.slot).toBeDefined();
        expect(ADSENSE_CONFIG.adUnits.gameOver.slot).toBeDefined();
        expect(ADSENSE_CONFIG.adUnits.leaderboard.slot).toBeDefined();
    });
});
```

### Test Kapsamı Hedefleri

- **Kod Kapsamı**: Minimum %80
- **Özellik Kapsamı**: Tüm testable özellikler için PBT testleri
- **Edge Case Kapsamı**: Birim testlerle kritik edge case'ler
- **Entegrasyon Kapsamı**: Oyun akışı ile reklam etkileşimleri

### Test Ortamları

1. **Birim Test Ortamı**: Jest + JSDOM
2. **Entegrasyon Test Ortamı**: Playwright/Cypress (gerçek tarayıcı)
3. **Özellik Test Ortamı**: Jest + fast-check
4. **Manuel Test**: Gerçek AdSense hesabı ile production-like ortam

### Test Etiketleme

Her özellik testi, tasarım belgesindeki özelliğe referans vermelidir:

```javascript
/**
 * Feature: adsense-integration
 * Property 1: Script Asenkron Yükleme
 * 
 * Herhangi bir sayfa yüklemesinde, AdSense script elementi 
 * async attribute'üne sahip olmalı ve document.head'e eklenmelidir
 * 
 * Validates: Requirements 1.2, 5.1
 */
test('Property 1: Script asenkron yükleme', () => { ... });
```

## Uygulama Notları

### Deployment Checklist

1. **AdSense Hesap Kurulumu**
   - [ ] AdSense hesabı onaylandı
   - [ ] Site AdSense'e eklendi (celalcen.github.io)
   - [ ] 3 reklam birimi oluşturuldu (slot ID'ler alındı)
   - [ ] Ödeme bilgileri girildi

2. **Kod Entegrasyonu**
   - [ ] adsense-config.js oluşturuldu ve slot ID'ler eklendi
   - [ ] adsense-manager.js oluşturuldu
   - [ ] index.html'e reklam container'ları eklendi
   - [ ] style.css'e reklam stilleri eklendi
   - [ ] game.js'e entegrasyon kodları eklendi

3. **Test**
   - [ ] Development ortamında test modu ile test edildi
   - [ ] Tüm reklam konumları görsel olarak kontrol edildi
   - [ ] Mobil responsive test edildi
   - [ ] PWA modunda test edildi
   - [ ] Birim testleri yazıldı ve geçti
   - [ ] Özellik testleri yazıldı ve geçti

4. **Production Deployment**
   - [ ] Test modu kapatıldı (testMode: false)
   - [ ] Gerçek slot ID'ler kullanıldı
   - [ ] GitHub Pages'e deploy edildi
   - [ ] AdSense'de site doğrulaması yapıldı
   - [ ] İlk reklam gösterimleri kontrol edildi

### Performans Optimizasyonu İpuçları

1. **Script Yükleme**: AdSense script'ini `<head>` içinde async olarak yükleyin
2. **Lazy Loading**: Ana menü reklamı için lazy loading kullanın
3. **Preconnect**: DNS prefetch ekleyin: `<link rel="preconnect" href="https://pagead2.googlesyndication.com">`
4. **Placeholder**: Reklam yüklenene kadar uygun boyutta placeholder gösterin
5. **Error Handling**: Reklam yüklenemezse container'ı hemen gizleyin

### AdSense Politika Uyarıları

⚠️ **Önemli Kurallar:**
- Sayfa başına maksimum 3 reklam
- Reklamlara tıklamayı teşvik eden metinler yasak
- Reklamların yanında yanıltıcı butonlar yasak
- Reklam içeriğini değiştirme yasak
- Otomatik tıklama yasak
- Geçersiz trafik yasak

### Mobil Uygulama (TWA) Notları

TWA'ya dönüştürüldüğünde:
- AdSense reklamları çalışmaya devam edecek
- AdMob'a geçiş düşünülebilir (daha iyi mobil performans)
- App-ads.txt dosyası eklenebilir
- Play Store politikalarına uyum sağlanmalı

### Gelecek İyileştirmeler

1. **A/B Testing**: Farklı reklam konumlarını test et
2. **Analytics**: Reklam performansını detaylı takip et
3. **AdMob Entegrasyonu**: Mobil uygulama için AdMob'a geçiş
4. **Reklam Yenileme**: Uzun oturumlarda reklam yenileme stratejisi
5. **Kullanıcı Tercihleri**: Reklam gösterim sıklığı ayarları (premium özellik)

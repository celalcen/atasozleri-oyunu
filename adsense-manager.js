/**
 * AdSense Yönetim Modülü
 * 
 * Bu modül Google AdSense reklamlarının yüklenmesi, gösterilmesi ve yönetilmesinden sorumludur.
 * Lazy loading, hata yönetimi, responsive davranış gibi özellikleri içerir.
 */

class AdSenseManager {
    /**
     * AdSenseManager constructor
     * @param {Object} config - AdSense yapılandırma objesi (ADSENSE_CONFIG)
     */
    constructor(config) {
        this.config = config;
        this.loadedAds = new Set(); // Başarıyla yüklenmiş reklamlar
        this.failedAds = new Set(); // Yükleme başarısız olan reklamlar
        this.observer = null; // Intersection Observer instance
    }
    
    /**
     * AdSense script'ini asenkron olarak yükle
     * @returns {Promise<boolean>} Yükleme başarılı mı
     */
    async loadAdSenseScript() {
        // Script zaten yüklü mü kontrol et
        if (window.adsbygoogle) {
            console.log('AdSense script zaten yüklü');
            return true;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                console.log('AdSense script başarıyla yüklendi');
                resolve(true);
            };
            
            script.onerror = () => {
                console.error('AdSense script yüklenemedi');
                reject(false);
            };
            
            document.head.appendChild(script);
            
            // Timeout mekanizması
            setTimeout(() => {
                if (!window.adsbygoogle) {
                    console.error('AdSense script yükleme timeout');
                    reject(false);
                }
            }, this.config.performance.maxLoadTime);
        });
    }

    /**
     * Lazy loading için Intersection Observer kur
     * Reklamlar viewport'a yaklaştığında otomatik yüklenir
     */
    setupLazyLoading() {
        // Intersection Observer desteklenmiyor mu?
        if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer desteklenmiyor, tüm reklamlar direkt yüklenecek');
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
        
        console.log('Lazy loading kuruldu');
    }
    
    /**
     * Belirli bir reklamı yükle
     * @param {string} adId - Reklam container ID'si (örn: 'ad-main-menu')
     */
    async loadAd(adId) {
        // Reklam zaten yüklendi mi veya başarısız mı?
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
            
            // Responsive veya sabit boyut?
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
                console.log(`Test modu aktif: ${adId}`);
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
     * @returns {Object|null} Reklam yapılandırması veya null
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
     * Ekran boyutuna göre uygun reklam boyutunu belirle
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
            console.log(`Reklam container gizlendi: ${adId}`);
        }
    }
    
    /**
     * Tüm reklamları yükle (fallback - eski tarayıcılar için)
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
            console.log(`Reklam yenilendi: ${adId}`);
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
            console.log(`Reklam gözlemleniyor: ${adId}`);
        }
    }
    
    /**
     * Manager'ı temizle ve kaynakları serbest bırak
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.loadedAds.clear();
        this.failedAds.clear();
        console.log('AdSenseManager temizlendi');
    }
}

// Global instance
let adManager = null;

/**
 * AdSense Manager'ı başlat
 * Bu fonksiyon sayfa yüklendiğinde çağrılmalıdır
 */
async function initializeAdSense() {
    // AdSense devre dışı mı?
    if (!ADSENSE_CONFIG.enabled) {
        console.log('AdSense devre dışı (ADSENSE_CONFIG.enabled = false)');
        return;
    }
    
    try {
        adManager = new AdSenseManager(ADSENSE_CONFIG);
        await adManager.loadAdSenseScript();
        console.log('AdSense başarıyla başlatıldı');
    } catch (error) {
        console.error('AdSense başlatma hatası:', error);
    }
}

// Global scope'a export et
if (typeof window !== 'undefined') {
    window.adManager = adManager;
    window.initializeAdSense = initializeAdSense;
}

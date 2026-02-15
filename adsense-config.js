/**
 * AdSense Yapılandırma Modülü
 * 
 * Bu dosya Google AdSense reklam entegrasyonu için tüm yapılandırma ayarlarını içerir.
 * Reklam birimlerinin konumları, boyutları ve performans ayarları burada tanımlanır.
 */

const ADSENSE_CONFIG = {
    // AdSense yayıncı kimliği
    publisherId: 'ca-pub-0442066246481433',
    
    // Reklam sistemi aktif mi? (false yaparak tüm reklamları devre dışı bırakabilirsiniz)
    enabled: true,
    
    // Test modu (development için true yapın, production'da false olmalı)
    // Test modunda AdSense test reklamları gösterilir
    testMode: false,
    
    // Reklam birimleri yapılandırması
    adUnits: {
        // Ana menü reklamı
        mainMenu: {
            id: 'ad-main-menu',
            slot: '4599798244', // Ana menü responsive reklam
            format: 'horizontal',
            responsive: true,
            sizes: {
                mobile: [[320, 100], [320, 50]],
                desktop: [[728, 90], [468, 60]]
            }
        },
        
        // Oyun bitişi modal reklamı
        gameOver: {
            id: 'ad-game-over',
            slot: '4201312590', // 300x250 modal reklam
            format: 'rectangle',
            responsive: false,
            sizes: {
                mobile: [[300, 250]],
                desktop: [[300, 250]]
            }
        },
        
        // Skor tablosu reklamı
        leaderboard: {
            id: 'ad-leaderboard',
            slot: '4599798244', // GEÇİCİ: Ana menü slot ID kullanılıyor - Yeni reklam birimi oluşturup buraya ekleyin
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
        // Lazy loading için viewport mesafesi (reklamlar bu mesafeye yaklaşınca yüklenecek)
        lazyLoadMargin: '200px',
        
        // Maksimum reklam yükleme süresi (milisaniye)
        maxLoadTime: 3000,
        
        // Hata durumunda maksimum yeniden deneme sayısı
        retryAttempts: 2
    }
};

// Global scope'a export et
if (typeof window !== 'undefined') {
    window.ADSENSE_CONFIG = ADSENSE_CONFIG;
}

"""
PWA gereksinimlerini kontrol eden script
- manifest.json varlığı ve içeriği
- service worker varlığı
"""

import json
import sys
from pathlib import Path


def check_manifest():
    """manifest.json dosyasını kontrol et"""
    print("📱 Manifest.json Kontrolü:")
    
    manifest_path = Path("manifest.json")
    
    if not manifest_path.exists():
        print("   ❌ manifest.json bulunamadı")
        return False
    
    print(f"   ✅ manifest.json bulundu")
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        # Gerekli alanları kontrol et
        required_fields = ['name', 'short_name', 'start_url', 'display', 'icons']
        missing_fields = []
        
        for field in required_fields:
            if field in manifest:
                print(f"   ✅ {field}: {manifest.get(field, '')[:50]}...")
            else:
                print(f"   ❌ {field}: Eksik")
                missing_fields.append(field)
        
        # İkonları kontrol et
        if 'icons' in manifest and len(manifest['icons']) > 0:
            print(f"   ✅ İkonlar: {len(manifest['icons'])} adet")
            
            # 512x512 ikon kontrolü
            has_512 = any(icon.get('sizes') == '512x512' for icon in manifest['icons'])
            if has_512:
                print(f"   ✅ 512x512 ikon mevcut (Google Play için gerekli)")
            else:
                print(f"   ⚠️  512x512 ikon bulunamadı (Google Play için önerilir)")
        else:
            print(f"   ❌ İkon bulunamadı")
            missing_fields.append('icons')
        
        if missing_fields:
            print(f"\n   ⚠️  Eksik alanlar: {', '.join(missing_fields)}")
            return False
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"   ❌ manifest.json geçersiz JSON: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        return False


def check_service_worker():
    """service-worker.js dosyasını kontrol et"""
    print("\n⚙️ Service Worker Kontrolü:")
    
    sw_path = Path("service-worker.js")
    
    if not sw_path.exists():
        print("   ❌ service-worker.js bulunamadı")
        return False
    
    print(f"   ✅ service-worker.js bulundu")
    
    try:
        with open(sw_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Temel service worker özelliklerini kontrol et
        checks = {
            'install event': 'addEventListener(\'install\'',
            'fetch event': 'addEventListener(\'fetch\'',
            'cache': 'caches.open'
        }
        
        for name, pattern in checks.items():
            if pattern in content:
                print(f"   ✅ {name} bulundu")
            else:
                print(f"   ⚠️  {name} bulunamadı")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        return False


def check_index_html():
    """index.html'de PWA kayıtlarını kontrol et"""
    print("\n📄 index.html Kontrolü:")
    
    index_path = Path("index.html")
    
    if not index_path.exists():
        print("   ❌ index.html bulunamadı")
        return False
    
    print(f"   ✅ index.html bulundu")
    
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # PWA meta taglerini kontrol et
        checks = {
            'manifest link': '<link rel="manifest"',
            'theme-color': '<meta name="theme-color"',
            'viewport': '<meta name="viewport"',
            'service worker registration': 'serviceWorker.register'
        }
        
        for name, pattern in checks.items():
            if pattern in content:
                print(f"   ✅ {name} bulundu")
            else:
                print(f"   ⚠️  {name} bulunamadı")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        return False


def check_icons():
    """İkon dosyalarının varlığını kontrol et"""
    print("\n🎨 İkon Dosyaları Kontrolü:")
    
    assets_path = Path("assets") if Path("assets").exists() else Path("Assets")
    
    if not assets_path.exists():
        print("   ❌ assets klasörü bulunamadı")
        return False
    
    print(f"   ✅ assets klasörü bulundu: {assets_path}")
    
    # manifest.json'dan ikon listesini al
    try:
        with open("manifest.json", 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        icons = manifest.get('icons', [])
        missing_icons = []
        
        for icon in icons:
            icon_path = Path(icon['src'].lstrip('/'))
            if icon_path.exists():
                print(f"   ✅ {icon['sizes']}: {icon_path}")
            else:
                print(f"   ❌ {icon['sizes']}: {icon_path} bulunamadı")
                missing_icons.append(str(icon_path))
        
        if missing_icons:
            print(f"\n   ⚠️  Eksik ikonlar: {len(missing_icons)} adet")
            return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        return False


def main():
    print("=" * 60)
    print("🔍 PWA Gereksinimleri Kontrolü")
    print("=" * 60)
    print()
    
    manifest_ok = check_manifest()
    sw_ok = check_service_worker()
    html_ok = check_index_html()
    icons_ok = check_icons()
    
    print("\n" + "=" * 60)
    print("📊 SONUÇ:")
    print("=" * 60)
    
    if manifest_ok and sw_ok and html_ok and icons_ok:
        print("✅ PWA gereksinimleri karşılanıyor!")
        print()
        print("🎯 Sonraki Adım:")
        print("   Web uygulamasını production'a deploy et")
        print()
        print("💡 Önerilen Hosting:")
        print("   Firebase Hosting (zaten Firebase kullanıyorsunuz)")
        print()
        print("📝 Deployment Komutu:")
        print("   npm install -g firebase-tools")
        print("   firebase login")
        print("   firebase init hosting")
        print("   firebase deploy --only hosting")
        return 0
    else:
        print("⚠️  Bazı PWA gereksinimleri eksik")
        print()
        print("💡 Ancak mevcut yapı TWA için yeterli!")
        print("   Deployment'a devam edebilirsiniz.")
        return 0


if __name__ == "__main__":
    sys.exit(main())

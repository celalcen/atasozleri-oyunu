#!/usr/bin/env python3
"""
PWA Icon Generator
Mascot.png dosyasından farklı boyutlarda ikonlar oluşturur
"""

try:
    from PIL import Image
    import os
except ImportError:
    print("❌ Pillow kütüphanesi yüklü değil!")
    print("Yüklemek için: pip install Pillow")
    exit(1)

# İkon boyutları
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Kaynak dosya
SOURCE = "assets/mascot.png"
OUTPUT_DIR = "assets"

def generate_icons():
    """Tüm boyutlarda ikonlar oluştur"""
    
    if not os.path.exists(SOURCE):
        print(f"❌ Kaynak dosya bulunamadı: {SOURCE}")
        return False
    
    print(f"📂 Kaynak dosya: {SOURCE}")
    
    try:
        # Kaynak resmi aç
        img = Image.open(SOURCE)
        print(f"✅ Resim yüklendi: {img.size}")
        
        # RGBA moduna çevir (transparency için)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Her boyut için ikon oluştur
        for size in SIZES:
            output_path = os.path.join(OUTPUT_DIR, f"icon-{size}.png")
            
            # Resize et (high quality)
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Kaydet
            resized.save(output_path, 'PNG', optimize=True)
            print(f"✅ Oluşturuldu: icon-{size}.png ({size}x{size})")
        
        print(f"\n🎉 Başarılı! {len(SIZES)} ikon oluşturuldu.")
        print(f"📁 Konum: {os.path.abspath(OUTPUT_DIR)}")
        return True
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False

if __name__ == "__main__":
    print("🎨 PWA İkon Oluşturucu")
    print("=" * 50)
    generate_icons()

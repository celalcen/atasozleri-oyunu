"""
Panda SVG'sini PNG'ye çevirip Android ikonu oluştur
"""

from PIL import Image, ImageDraw
import os

def create_panda_icon(size, output_path):
    """Panda ikonunu oluştur"""
    # Beyaz arka plan
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Basit panda çizimi (SVG'den ilham alarak)
    # Siyah kulaklar
    draw.ellipse([size*0.2, size*0.15, size*0.35, size*0.3], fill='black')
    draw.ellipse([size*0.65, size*0.15, size*0.8, size*0.3], fill='black')
    
    # Beyaz kafa
    draw.ellipse([size*0.25, size*0.3, size*0.75, size*0.8], fill='white', outline='#555555', width=2)
    
    # Siyah göz yamaları
    draw.ellipse([size*0.35, size*0.42, size*0.48, size*0.58], fill='black')
    draw.ellipse([size*0.52, size*0.42, size*0.65, size*0.58], fill='black')
    
    # Beyaz gözler
    draw.ellipse([size*0.38, size*0.45, size*0.45, size*0.52], fill='white')
    draw.ellipse([size*0.55, size*0.45, size*0.62, size*0.52], fill='white')
    
    # Burun
    draw.ellipse([size*0.47, size*0.58, size*0.53, size*0.62], fill='black')
    
    # Pembe yanaklar
    draw.ellipse([size*0.28, size*0.62, size*0.35, size*0.69], fill='#ffb6c1')
    draw.ellipse([size*0.65, size*0.62, size*0.72, size*0.69], fill='#ffb6c1')
    
    # Yeşil kitap (altta)
    draw.rectangle([size*0.3, size*0.75, size*0.7, size*0.9], fill='#4CAF50', outline='white', width=2)
    
    img.save(output_path, 'PNG')
    print(f"✅ İkon oluşturuldu: {output_path} ({size}x{size})")


def main():
    """Android için gerekli tüm ikon boyutlarını oluştur"""
    print("🐼 Panda İkonu Oluşturuluyor...")
    print()
    
    # Çıktı klasörü
    output_dir = "android-icons"
    os.makedirs(output_dir, exist_ok=True)
    
    # Android için gerekli boyutlar
    sizes = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192,
        'playstore': 512  # Google Play Store için
    }
    
    for name, size in sizes.items():
        output_path = os.path.join(output_dir, f"ic_launcher_{name}.png")
        create_panda_icon(size, output_path)
    
    print()
    print("=" * 60)
    print("✅ Tüm ikonlar oluşturuldu!")
    print("=" * 60)
    print()
    print("📁 İkonlar: android-icons/ klasöründe")
    print()
    print("🎯 Sonraki Adım:")
    print("   Android Studio'da Image Asset tool ile bu ikonları kullanın")
    print("   VEYA manuel olarak res/mipmap klasörlerine kopyalayın")


if __name__ == "__main__":
    main()

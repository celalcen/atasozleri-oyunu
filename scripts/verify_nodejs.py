"""
Node.js ve Firebase CLI kurulumunu doğrulayan script
"""

import subprocess
import sys


def check_command(command, name):
    """Bir komutun yüklü olup olmadığını kontrol et"""
    try:
        result = subprocess.run([command, '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"   ✅ {name}: {version}")
            return True
        else:
            print(f"   ❌ {name}: Çalışmıyor")
            return False
    except FileNotFoundError:
        print(f"   ❌ {name}: Bulunamadı")
        return False
    except Exception as e:
        print(f"   ❌ {name}: Hata - {e}")
        return False


def main():
    print("=" * 60)
    print("🔍 Node.js ve Firebase CLI Kurulum Kontrolü")
    print("=" * 60)
    print()
    
    print("📦 Kurulum Kontrolü:")
    node_ok = check_command('node', 'Node.js')
    npm_ok = check_command('npm', 'npm')
    firebase_ok = check_command('firebase', 'Firebase CLI')
    
    print("\n" + "=" * 60)
    print("📊 SONUÇ:")
    print("=" * 60)
    
    if node_ok and npm_ok and firebase_ok:
        print("✅ Tüm bileşenler başarıyla kuruldu!")
        print()
        print("🎯 Sonraki Adım:")
        print("   Firebase'e giriş yapın ve deployment başlatın")
        print()
        print("📝 Komutlar:")
        print("   firebase login")
        print("   firebase init hosting")
        print("   firebase deploy --only hosting")
        return 0
    elif node_ok and npm_ok and not firebase_ok:
        print("⚠️  Node.js kurulu ama Firebase CLI eksik")
        print()
        print("💡 Çözüm:")
        print("   npm install -g firebase-tools")
        return 1
    elif not node_ok:
        print("❌ Node.js kurulu değil!")
        print()
        print("💡 Çözüm:")
        print("   1. https://nodejs.org/ adresinden Node.js LTS indirin")
        print("   2. Kurulumu tamamlayın")
        print("   3. Terminal penceresini kapatıp yeni bir tane açın")
        print("   4. Bu scripti tekrar çalıştırın")
        return 1
    else:
        print("⚠️  Bazı bileşenler eksik")
        return 1


if __name__ == "__main__":
    sys.exit(main())

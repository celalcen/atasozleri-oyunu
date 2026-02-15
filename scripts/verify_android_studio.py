"""
Android Studio kurulumunu doğrulayan script
"""

import os
import sys
from pathlib import Path
import subprocess


def find_android_studio():
    """Android Studio kurulum dizinini bul"""
    possible_paths = [
        Path("C:/Program Files/Android/Android Studio"),
        Path("C:/Program Files (x86)/Android/Android Studio"),
        Path.home() / "AppData/Local/Android/Android Studio"
    ]
    
    print("🔍 Android Studio Aranıyor...")
    for path in possible_paths:
        if path.exists():
            print(f"   ✅ Bulundu: {path}")
            return path
    
    print("   ❌ Android Studio bulunamadı")
    return None


def find_android_sdk():
    """Android SDK dizinini bul"""
    possible_paths = [
        Path.home() / "AppData/Local/Android/Sdk",
        Path("C:/Android/Sdk"),
        Path.home() / "Android/Sdk"
    ]
    
    print("\n🔍 Android SDK Aranıyor...")
    for path in possible_paths:
        if path.exists():
            print(f"   ✅ Bulundu: {path}")
            return path
    
    print("   ❌ Android SDK bulunamadı")
    return None


def check_sdk_components(sdk_path):
    """SDK bileşenlerini kontrol et"""
    print("\n📦 SDK Bileşenleri Kontrolü:")
    
    components = {
        "Platform-Tools": sdk_path / "platform-tools",
        "Build-Tools": sdk_path / "build-tools",
        "Platforms": sdk_path / "platforms"
    }
    
    all_ok = True
    for name, path in components.items():
        if path.exists():
            print(f"   ✅ {name}: {path}")
        else:
            print(f"   ❌ {name}: Bulunamadı")
            all_ok = False
    
    return all_ok


def check_adb():
    """ADB (Android Debug Bridge) kontrolü"""
    print("\n🔧 ADB Kontrolü:")
    try:
        result = subprocess.run(['adb', 'version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"   ✅ {version_line}")
            return True
        else:
            print(f"   ❌ ADB çalışmıyor")
            return False
    except FileNotFoundError:
        print(f"   ⚠️  ADB bulunamadı (PATH'e eklenmemiş olabilir)")
        return False
    except Exception as e:
        print(f"   ⚠️  ADB kontrolü yapılamadı: {e}")
        return False


def main():
    print("=" * 60)
    print("✅ Android Studio Kurulum Doğrulaması")
    print("=" * 60)
    print()
    
    studio_path = find_android_studio()
    sdk_path = find_android_sdk()
    
    if not studio_path:
        print("\n❌ Android Studio bulunamadı!")
        print("\n💡 Çözüm:")
        print("   - Android Studio'nun kurulu olduğundan emin olun")
        print("   - Varsayılan kurulum dizinini kullandınız mı?")
        return 1
    
    if not sdk_path:
        print("\n⚠️  Android SDK bulunamadı!")
        print("\n💡 Çözüm:")
        print("   - Android Studio'yu açın")
        print("   - İlk açılış kurulumunu tamamlayın")
        print("   - SDK bileşenlerinin indirilmesini bekleyin")
        return 1
    
    components_ok = check_sdk_components(sdk_path)
    adb_ok = check_adb()
    
    print("\n" + "=" * 60)
    print("📊 SONUÇ:")
    print("=" * 60)
    
    if studio_path and sdk_path and components_ok:
        print("✅ Android Studio başarıyla kuruldu ve hazır!")
        print()
        print("📍 Kurulum Bilgileri:")
        print(f"   Android Studio: {studio_path}")
        print(f"   Android SDK: {sdk_path}")
        print()
        print("🎯 Sonraki Adım:")
        print("   TWA (Trusted Web Activity) projesi oluşturma")
        print("   Komut: python scripts/create_twa_project.py")
        return 0
    else:
        print("⚠️  Kurulum tamamlanmamış veya eksik bileşenler var")
        print()
        print("💡 Öneriler:")
        if not components_ok:
            print("   - Android Studio'yu açın")
            print("   - SDK Manager'dan eksik bileşenleri indirin")
        if not adb_ok:
            print("   - Platform-tools PATH'e eklenebilir (opsiyonel)")
        return 1


if __name__ == "__main__":
    sys.exit(main())

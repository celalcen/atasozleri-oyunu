"""
Sistem gereksinimlerini kontrol eden script
Android Studio için minimum gereksinimler:
- RAM: 8GB
- Disk Alanı: 8GB
"""

import psutil
import shutil
import sys
from pathlib import Path


def check_ram():
    """RAM kontrolü - minimum 8GB gerekli"""
    total_ram_gb = psutil.virtual_memory().total / (1024 ** 3)
    required_ram_gb = 8
    
    print(f"💾 RAM Kontrolü:")
    print(f"   Mevcut RAM: {total_ram_gb:.2f} GB")
    print(f"   Gerekli RAM: {required_ram_gb} GB")
    
    if total_ram_gb >= required_ram_gb:
        print(f"   ✅ RAM yeterli\n")
        return True
    else:
        print(f"   ❌ RAM yetersiz (En az {required_ram_gb} GB gerekli)\n")
        return False


def check_disk_space():
    """Disk alanı kontrolü - minimum 8GB gerekli"""
    disk_usage = shutil.disk_usage(Path.cwd())
    free_space_gb = disk_usage.free / (1024 ** 3)
    required_space_gb = 8
    
    print(f"💿 Disk Alanı Kontrolü:")
    print(f"   Boş Alan: {free_space_gb:.2f} GB")
    print(f"   Gerekli Alan: {required_space_gb} GB")
    
    if free_space_gb >= required_space_gb:
        print(f"   ✅ Disk alanı yeterli\n")
        return True
    else:
        print(f"   ❌ Disk alanı yetersiz (En az {required_space_gb} GB gerekli)\n")
        return False


def check_java_version():
    """Java versiyonu kontrolü (opsiyonel - Android Studio kendi JDK'sını içerir)"""
    import subprocess
    
    print(f"☕ Java Kontrolü:")
    try:
        result = subprocess.run(['java', '-version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        
        # Java version output stderr'de olur
        version_output = result.stderr if result.stderr else result.stdout
        
        if version_output:
            version_line = version_output.split('\n')[0]
            print(f"   {version_line}")
            print(f"   ✅ Java yüklü (Android Studio kendi JDK'sını da içerir)\n")
            return True
    except FileNotFoundError:
        print(f"   ⚠️  Java bulunamadı (Android Studio kendi JDK'sını içerir, sorun değil)\n")
        return True  # Java olmasa da Android Studio çalışır
    except Exception as e:
        print(f"   ⚠️  Java kontrolü yapılamadı: {e}\n")
        return True


def main():
    print("=" * 60)
    print("🔍 Android Studio Sistem Gereksinimleri Kontrolü")
    print("=" * 60)
    print()
    
    ram_ok = check_ram()
    disk_ok = check_disk_space()
    java_ok = check_java_version()
    
    print("=" * 60)
    print("📊 SONUÇ:")
    print("=" * 60)
    
    if ram_ok and disk_ok:
        print("✅ Sisteminiz Android Studio için uygun!")
        print()
        print("📥 Sonraki Adım: Android Studio İndirme")
        print("   Link: https://developer.android.com/studio")
        print()
        print("💡 Kurulum Notları:")
        print("   - Android Studio kurulumu yaklaşık 3-4 GB indirecek")
        print("   - Kurulum sırasında Android SDK otomatik indirilecek")
        print("   - İlk açılışta ek bileşenler indirilebilir")
        print("   - Toplam kurulum süresi: 30-60 dakika (internet hızına bağlı)")
        return 0
    else:
        print("❌ Sistem gereksinimleri karşılanmıyor!")
        print()
        print("🔧 Öneriler:")
        if not ram_ok:
            print("   - Daha fazla RAM ekleyin veya daha güçlü bir bilgisayar kullanın")
        if not disk_ok:
            print("   - Disk alanı açın (gereksiz dosyaları silin)")
            print("   - Farklı bir disk kullanın")
        return 1


if __name__ == "__main__":
    sys.exit(main())

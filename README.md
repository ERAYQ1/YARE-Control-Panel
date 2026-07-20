# YARE Control Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Control Panel**, sunucularınızı modern, hızlı ve güvenli bir şekilde yönetmenizi sağlayan açık kaynaklı sunucu yönetim platformudur. Vercel/Supabase seviyesinde tasarım estetiği, bağımsız (embedded SPA) Go mimarisi ve yüksek performansı ile yeni kurulan herhangi bir Linux sunucusuna veya yerel ortama saniyeler içinde yüklenebilir.

---

## ⚡ Hızlı Başlangıç (Tek Komutla Kolay Kurulum)

Aşağıdaki yöntemlerden size en uygun olanını seçerek YARE Control Panel'i **tek komutla** anında çalıştırabilirsiniz:

### 🐳 1️⃣ Docker Compose (En Kolay & Önerilen Yöntem)

Ne Node.js, ne Go, ne de bağımlılık kurulumu gerektirir. Sisteminizde Docker varsa **tek komutla** başlatın:

```bash
docker compose up -d
```

> **Erişim**: `http://localhost:8080` (Durdurmak için: `docker compose down`)

---

### 🐧 2️⃣ Linux Sunucu Otomatik Kurulumu (Root veya Kullanıcı Modu)

Herhangi bir **Ubuntu, Debian, Fedora, Arch veya AlmaLinux** sunucusunda tek komutla kurulum yapın. Root yetkisi yoksa kullanıcı ev dizinine (`~/.yare`) otomatik kurulur, sistemde Go yoksa otomatik indirilir:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

> **Ne yapar?** Pre-compiled release binary'sini veya yerel otomatik derlemeyi kullanarak servisi hazırlar. Root modunda `systemd` servisi (`yare.service`) ve firewall portunu (`8080`) otomatik konfigüre eder.

---

### 🚀 3️⃣ Sıfır Bağımlılık - Taşınabilir Executable (.exe / Binary)

1. [GitHub Releases](https://github.com/ERAYQ1/YARE-Control-Panel/releases) sayfasından `yare-panel-windows-amd64.exe` veya `yare-panel-linux-amd64` indirin.
2. İndirdiğiniz dosyaya çift tıklayın (veya `./yare-panel-windows-amd64.exe` çalıştırın).
3. Paneline **`http://localhost:8080`** adresinden anında erişin!

---

### 🛠️ 4️⃣ Yerel Geliştirici Ortamı (Kaynak Koddan)

Geliştirici ortamında kaynak koddan çalıştırmak veya katkıda bulunmak için:

#### 🪟 Windows:
Proje dizininde `start.bat` veya `build-win.bat` çalıştırın:
```cmd
.\start.bat
```

#### 🐧 Linux / 🍎 macOS:
```bash
make setup
make dev
```

---

## 🔑 Varsayılan Giriş Bilgileri

Kurulum tamamlandıktan sonra taraıcıdan paneline erişin:

- **Panel Adresi**: `http://localhost:8080` *(Veya `http://<sunucu-ip>:8080`)*
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

---

## 🛠️ Geliştirici Komutları Referansı

| Komut | Açıklama |
| :--- | :--- |
| `npm run setup` | Tüm monorepo bağımlılıklarını kurar (`root` ve `apps/frontend`) |
| `npm run dev` | Frontend ve Backend servislerini eşzamanlı çalıştırır |
| `npm run build` | Frontend'i derler, statik dosyaları Go backend'e gömer ve Linux binary üretir |
| `npm run build:win` | Windows için tek tıkla bağımsız `yare-panel.exe` derler |
| `.\build-win.bat` | *(Windows)* Çift tıklama ile bağımsız `yare-panel.exe` üretir |
| `npm run docker:up` | Docker Compose ile konteyneri arka planda başlatır |
| `npm run docker:down` | Docker Compose konteynerini durdurur |
| `make dev` | *(Alternatif)* Makefile ile geliştirici modunu başlatır |
| `make build` | *(Alternatif)* Makefile ile prodüksiyon derlemesi yapar |

---

## ⚙️ Ortam Değişkenleri (Environment Variables)

| Değişken | Varsayılan Değer | Açıklama |
| :--- | :--- | :--- |
| `PORT` | `8080` | Sunucunun dinleyeceği port |
| `ENV` | `development` / `production` | Çalışma ortamı modu |
| `DB_PATH` | `/opt/yare/yare.db` | SQLite veritabanı dosya yolu |
| `JWT_SECRET` | *(Otomatik Oluşturulur)* | JWT Kimlik doğrulama gizli anahtarı |

---

## 🔧 Linux Servis Yönetimi & Loglar

Linux sunucunuzda çalışan YARE servisini yönetmek için:

```bash
# Servis Durumunu Kontrol Et
systemctl status yare.service

# Servisi Yeniden Başlat
systemctl restart yare.service

# Canlı Logları İzle
journalctl -u yare.service -f
```

---

## ✨ Öne Çıkan Özellikler

- 🚀 **Tek Parça Bağımsız Binary (Embedded SPA)**: React SPA uygulaması Go executable dosyasının içine gömülüdür (`embed.FS`). Sunucuda Node.js gerektirmez!
- ⚡ **Düşük Kaynak Tüketimi**: SQLite veritabanı ile boşta 30MB'ın altında RAM kullanımı.
- 🎨 **Obsidian Black Estetiği**: Vercel/Supabase seviyesinde karanlık tema, net kenarlıklar ve tipografi.
- 📦 **1-Tık Docker Uygulama Kataloğu**: PostgreSQL, Redis, Ollama AI, n8n, Nextcloud vb. tek tıkla kurma ve yönetme.
- 🤖 **AI Copilot & Otomatik Komutlar**: Doğal dil ile sunucu analizi ve otomatik sorun giderme.
- 🌍 **Çoklu Dil Desteği**: Türkçe 🇹🇷, English 🇬🇧, Deutsch 🇩🇪 dinamik dil geçişi.
- ⌨️ **Komut Paleti (`⌘K` / `Ctrl+K`)**: Her yere anında erişim.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

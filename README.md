# YARE Control Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Control Panel**, sunucularınızı modern, hızlı ve güvenli bir şekilde yönetmenizi sağlayan açık kaynaklı sunucu yönetim platformudur. Vercel/Supabase seviyesinde tasarım estetiği, bağımsız (embedded SPA) Go mimarisi ve yüksek performansı ile yeni kurulan herhangi bir Linux sunucusuna veya yerel ortama saniyeler içinde yüklenebilir.

---

## ⚡ Hızlı Başlangıç (3 Kolay Kurulum Yöntemi)

Aşağıdaki 3 yöntemden size en uygun olanını seçerek YARE Control Panel'i anında çalıştırabilirsiniz:

### 1️⃣ Linux Sunucu Otomatik Kurulumu (Önerilen Canlı Ortam)

Herhangi bir **Ubuntu, Debian, Fedora, Arch veya AlmaLinux** sunucusunda tek komutla kurulum yapın:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

> **Ne yapar?** Gerekli bağımlılıkları yükler, güvenlik için 64-karakterlik JWT anahtarı oluşturur, firewall portunu (`8080`) açar ve otomatik başlayan bir `systemd` servisi (`yare.service`) oluşturur.

---

### 2️⃣ Docker Compose ile Konteyner Kurulumu

Sisteminizde Docker yüklü ise tek komutla konteyner içinde başlatın:

```bash
docker compose up -d
```

Durdurmak için:
```bash
docker compose down
```

---

### 3️⃣ Yerel Geliştirme Ortamı (Windows, macOS, Linux)

Geliştirici ortamında Frontend ve Backend'i **tek komutla** çalıştırmak için:

#### 🪟 Windows (En Kolay Yöntem):
Proje dizininde `start.bat` dosyasına **çift tıklayın** veya terminalden çalıştırın:
```cmd
.\start.bat
```

#### 🐧 Linux / 🍎 macOS / 🪟 Terminal:
```bash
# 1. Tüm bağımlılıkları tek seferde kurun
npm run setup

# 2. Frontend ve Backend'i eşzamanlı olarak tek komutla başlatın
npm run dev
```

> 💡 `npm run dev` komutu frontend (`http://localhost:5173`) ve backend (`http://localhost:8080`) servislerini aynı terminal penceresinde renkli loglar ile çalıştırır.

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

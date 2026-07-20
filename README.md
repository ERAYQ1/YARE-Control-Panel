# YARE Control Panel 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8.svg)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/ERAYQ1/YARE-Control-Panel/actions)
[![i18n](https://img.shields.io/badge/i18n-TR%20%7C%20EN%20%7C%20DE-emerald.svg)](https://github.com/ERAYQ1/YARE-Control-Panel)

**YARE Control Panel**, Linux sunucularınızı ve yerel sistemlerinizi modern, ultra hızlı ve yüksek güvenlik standartlarında yönetmenizi sağlayan açık kaynaklı sunucu yönetim platformudur. Vercel ve Supabase estetiğinde tasarlanan Obsidian Black arayüzü, bağımsız Go backend mimarisi içine gömülü React SPA (`embed.FS`) ile sunucunuza saniyeler içinde kurulur ve Node.js bağımlılığı olmadan tek bir binary olarak çalışır.

---

## ⚡ Hızlı Başlangıç (Kurulum Yöntemleri)

İhtiyacınıza uygun olan kurulum yöntemini seçerek YARE Control Panel'i anında çalıştırabilirsiniz:

### 🐳 1️⃣ Docker Compose (En Kolay & Önerilen Yöntem)

Ne Node.js, ne Go, ne de harici bağımlılık kurulumu gerektirir. Sisteminizde Docker yüklü ise **tek komutla** başlatın:

```bash
# Projeyi indirin veya klonlayın
git clone https://github.com/ERAYQ1/YARE-Control-Panel.git
cd YARE-Control-Panel

# Docker Compose ile arka planda çalıştırın
docker compose up -d
```

- 🌐 **Panel Adresi**: `http://localhost:8080` (Veya `http://<sunucu-ip>:8080`)
- 🛑 **Durdurmak için**: `docker compose down`

---

### 🐧 2️⃣ Linux Sunucu Otomatik Kurulumu (Tek Komutla Curl Script)

Herhangi bir **Ubuntu 22+, Debian 12+, Fedora, Arch veya AlmaLinux** sunucuda tek komutla kurulum yapın. Root yetkisiyle kurulduğunda `systemd` servisi (`yare.service`) ve firewall portu (`8080`) otomatik yapılandırılır. Non-root çalıştırılırsa ev dizinine (`~/.yare`) kurulur. Sunucuda Go yoksa otomatik indirilir ve build alınır:

```bash
curl -fsSL https://raw.githubusercontent.com/ERAYQ1/YARE-Control-Panel/main/install/install.sh | bash
```

> **Kurulum Scripti Ne Yapar?**
> 1. Sistem mimarisini (`amd64` / `arm64`) ve OS dağıtımını tespit eder.
> 2. GitHub Releases üzerinden hazır derlenmiş binary'yi indirir; eğer bulunamazsa Go 1.22.5'i indirip kaynak koddan otomatik derleme (fallback build) yapar.
> 3. Root modunda `/etc/systemd/system/yare.service` oluşturur, servisi başlatır ve UFW / FirewallD portunu açar.

---

### 🚀 3️⃣ Sıfır Bağımlılık - Taşınabilir Executable (.exe / Binary)

Sunucunuzda veya bilgisayarınızda hiçbir geliştirme aracı olmadan çalıştırmak için:

1. [GitHub Releases](https://github.com/ERAYQ1/YARE-Control-Panel/releases) sayfasından işletim sisteminize uygun dosyayı indirin:
   - **Windows**: `yare-panel-windows-amd64.exe`
   - **Linux**: `yare-panel-linux-amd64`
   - **macOS**: `yare-panel-darwin-amd64` / `yare-panel-darwin-arm64`
2. Dosyayı çalıştırılabilir yapıp başlatın:
   ```bash
   # Linux / macOS
   chmod +x yare-panel-linux-amd64
   ./yare-panel-linux-amd64
   ```
   ```cmd
   :: Windows (CMD)
   .\yare-panel-windows-amd64.exe
   ```
3. Paneline **`http://localhost:8080`** adresinden anında erişin!

---

### 🛠️ 4️⃣ Yerel Geliştirici Ortamı (Kaynak Koddan)

Katkıda bulunmak veya kaynak kod üzerinden canlı geliştirme (`hot-reload`) yapmak için:

#### 🪟 Windows:
```cmd
:: Bağımlılıkları yükler ve dev sunucularını başlatır
.\start.bat

:: Veya tek tıkla bağımsız .exe üretmek için:
.\build-win.bat
```

#### 🐧 Linux / 🍎 macOS:
```bash
# 1. Monorepo bağımlılıklarını kurun
make setup

# 2. Frontend (Vite) & Backend (Go) servislerini eşzamanlı başlatın
make dev

# 3. Üretim binary'sini derleyin
make build
```

- 🎨 **Frontend Dev URL**: `http://localhost:5173`
- ⚡ **Backend API URL**: `http://localhost:8080`

---

## 🔑 Varsayılan Giriş Bilgileri & Güvenlik

Kurulum tamamlandıktan sonra taraıcıdan paneline erişin:

- **Panel Adresi**: `http://localhost:8080`
- **Kullanıcı Adı**: `admin`
- **Varsayılan Şifre**: `admin123`

> 🛡️ **Güvenlik Uyarısı**: İlk kurulumda `admin:admin123` varsayılan şifresi kullanıldığında sistem otomatik güvenlik uyarısı verir. Giriş yaptıktan sonra **Settings -> Account** bölümünden şifrenizi değiştirmeniz zorunludur.

---

## ⚙️ Ortam Değişkenleri (Environment Variables)

YARE Control Panel aşağıdaki ortam değişkenleri ile özelleştirilebilir:

| Değişken | Varsayılan | Açıklama |
| :--- | :--- | :--- |
| `PORT` | `8080` | Panel sunucusunun dinleyeceği HTTP portu |
| `ENV` | `production` | Çalışma modu (`development` veya `production`) |
| `DB_PATH` | `/opt/yare/yare.db` | SQLite veritabanı dosyasının kaydedileceği yol |
| `JWT_SECRET` | *(Otomatik Üretilir)* | JWT oturum anahtarı (32+ karakter gizli metin) |

---

## 🔧 Linux Servis Yönetimi & Loglar

Systemd ile çalışan Linux sunucularda paneli yönetmek için komutlar:

```bash
# Servis Durumunu Kontrol Et
systemctl status yare.service

# Servisi Yeniden Başlat / Durdur
systemctl restart yare.service
systemctl stop yare.service

# Canlı Sistem Loglarını İzle
journalctl -u yare.service -f --no-pager
```

---

## 🛠️ Geliştirici Komutları Referansı

| Komut | Açıklama |
| :--- | :--- |
| `npm run setup` | Monorepo ve frontend bağımlılıklarını kurar |
| `npm run dev` | Frontend (5173) ve Backend (8080) dev sunucularını eşzamanlı çalıştırır |
| `npm run build` | React SPA'yı derler, backend'e gömer ve Linux binary üretir |
| `npm run build:win` | Windows için bağımsız `yare-panel.exe` üretime hazırlar |
| `npm run docker:up` | Docker Compose ile konteyneri başlatır |
| `npm run docker:down` | Docker Compose konteynerini kapatır |
| `make build` | Makefile ile üretim derlemesi yapar |
| `make clean` | Tüm derleme çıktılarını ve geçici dosyaları temizler |

---

## 📡 API & WebSockets Referansı

| Endpoint | Method | Açıklama |
| :--- | :--- | :--- |
| `/health` | `GET` | Sunucu sağlık ve durum denetimi |
| `/api/v1/auth/login` | `POST` | Giriş işlemi (Rate limited: max 5 req/min) |
| `/api/v1/auth/refresh` | `POST` | Refresh token ile yeni JWT token alma |
| `/api/v1/auth/me` | `GET` | Oturum açan kullanıcı detayları |
| `/api/v1/ws/metrics` | `WS` | Gerçek zamanlı CPU/RAM/Disk/Ağ telemetri akışı |
| `/api/v1/ws/terminal` | `WS` | Web tabanlı etkileşimli terminal WebSocket bağlantısı |

---

## ✨ Öne Çıkan Özellikler

- 🚀 **Tek Parça Bağımsız Binary (`embed.FS`)**: React SPA uygulaması Go executable dosyasının içine gömülüdür. Sunucuda Node.js gerektirmez!
- ⚡ **Düşük Kaynak Tüketimi**: SQLite veritabanı ile boşta 30MB'ın altında ultra düşük RAM kullanımı.
- 🎨 **Obsidian Black Estetiği**: Modern karanlık tema, yüksek kontrast, net kenarlıklar ve akıcı animasyonlar.
- 📦 **1-Tık Docker Uygulama Kataloğu**: PostgreSQL, Redis, Ollama AI, n8n, Nextcloud vb. tek tıkla kurma ve yönetme.
- 🤖 **AI Copilot & Otomatik Komutlar**: Doğal dil ile sunucu analizi ve otomatik sorun giderme.
- 🌍 **Çoklu Dil Desteği**: Türkçe 🇹🇷, English 🇬🇧, Deutsch 🇩🇪 dinamik dil geçişi.
- ⌨️ **Komut Paleti (`⌘K` / `Ctrl+K`)**: Her sayfadan tüm aksiyonlara ve arayüzlere anında erişim.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

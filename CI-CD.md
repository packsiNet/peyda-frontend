# CI/CD — Payda Frontend

## مرور کلی

پایپ‌لاین GitHub Actions — push به `main` یا `master` → build → deploy روی سرور از طریق SSH + rsync + nginx.

```
push به main/master
       │
       ▼
  Checkout کد
       │
       ▼
  Setup Node 20
       │
       ▼
  npm ci
       │
       ▼
  vite build
       │
       ▼
  آماده‌سازی SSH
       │
       ▼
  نصب rsync/nginx روی سرور
       │
       ▼
  آپلود dist/ به سرور
       │
       ▼
  پیکربندی nginx + reload
       │
       ▼
  Healthcheck
```

فایل workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

---

## Secrets و Variables

باید در تنظیمات GitHub repo ست شوند (`Settings → Secrets and variables → Actions`).

| نام | نوع | توضیح | مثال |
|-----|-----|--------|------|
| `SERVER_SSH_KEY` | Secret | کلید خصوصی SSH (PEM یا OpenSSH، بدون passphrase) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_SSH_KEY_PASSPHRASE` | Secret | اگر کلید SSH passphrase دارد | اختیاری |
| `SERVER_HOST` | Variable یا Secret | IP یا دامنه سرور | `192.168.1.1` |
| `SERVER_USER` | Variable یا Secret | یوزر SSH | `deploy` |
| `SERVER_PORT` | Variable یا Secret | پورت SSH (پیش‌فرض: `22`) | `22` |
| `APP_URL` | Variable یا Secret | آدرس کامل سایت | `https://packsi.net` |
| `VITE_API_BASE_URL` | Variable | آدرس API برای build | `https://api.packsi.net` |

> Variables می‌توانند در `Settings → Variables → Actions` ست شوند (نه در Secrets).  
> workflow اول Variable را چک می‌کند، سپس Secret را.

---

## پیش‌نیازهای سرور

### SSH
- یوزر deploy باید **passwordless sudo** داشته باشد:
  ```bash
  echo "deploy ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/deploy
  ```

### SSL
گواهی Let's Encrypt باید از قبل روی سرور وجود داشته باشد:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d packsi.net -d www.packsi.net
```

گواهی‌ها باید در این مسیر باشند:
```
/etc/letsencrypt/live/<DOMAIN>/fullchain.pem
/etc/letsencrypt/live/<DOMAIN>/privkey.pem
```

> اگر SSL وجود نداشته باشد، مرحله nginx پیکربندی fail می‌شود.

---

## مراحل Deploy

### 1 — Build
```bash
npm ci
npm run build   # خروجی: dist/
```

متغیر `VITE_API_BASE_URL` در این مرحله inject می‌شود.

### 2 — آماده‌سازی SSH
- کلید SSH از Secret خوانده می‌شود
- اعتبارسنجی: public key نباشد، encrypt نباشد (یا passphrase داشته باشد)
- `ssh-keyscan` برای fingerprint سرور

### 3 — نصب پکیج‌ها روی سرور
روی سرور نصب می‌شود:
- `rsync`
- `nginx`
- `curl`

### 4 — آپلود dist
```bash
rsync -az --delete dist/ user@host:/tmp/<DOMAIN>-dist/
```

### 5 — پیکربندی nginx و publish
- فایل‌های dist کپی به `/var/www/<DOMAIN>/html/`
- nginx config نوشته می‌شود:
  - HTTP → HTTPS redirect
  - SSL با گواهی Let's Encrypt
  - SPA routing (`try_files` → `index.html`)
  - Cache: `index.html` = `no-store`، assets = `1y immutable`
- `nginx -t` → `systemctl reload nginx`

### 6 — Healthcheck
- `curl -skI https://<DOMAIN>/` — بررسی header
- بررسی وجود JS asset اصلی از `index.html`
- بررسی `Content-Type: application/javascript` برای asset
- بررسی لاگ nginx

---

## Concurrency

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: true
```

اگر دو push همزمان باشد، deploy قبلی cancel می‌شود. آخرین push برنده است.

---

## Caching

| فایل | Cache |
|------|-------|
| `index.html` | `no-store` — همیشه تازه |
| `/assets/*` | `public, immutable, max-age=1y` |

Vite به هر asset هش محتوا اضافه می‌کند (`/assets/index-Abc123.js`) — بنابراین immutable cache امن است.

---

## ساخت SSH Key برای Deploy

```bash
# تولید کلید بدون passphrase
ssh-keygen -t ed25519 -C "github-deploy" -f deploy_key -N ""

# کلید عمومی را به سرور اضافه کن
ssh-copy-id -i deploy_key.pub user@your-server

# محتوای کلید خصوصی را در GitHub Secret بگذار
cat deploy_key
```

---

## عیب‌یابی

| خطا | علت | راه‌حل |
|-----|-----|---------|
| `Missing required variables` | یکی از `SERVER_HOST`، `SERVER_USER`، `SERVER_SSH_KEY` خالی است | Secret/Variable را ست کن |
| `SERVER_SSH_KEY looks like PUBLIC key` | کلید عمومی اشتباهاً paste شده | کلید خصوصی (`deploy_key` نه `deploy_key.pub`) بگذار |
| `SSL certificate files not found` | certbot اجرا نشده | `certbot certonly` روی سرور |
| `passwordless sudo` fail | یوزر sudo ندارد | `/etc/sudoers.d/deploy` تنظیم کن |
| `Asset is not served as JavaScript` | nginx MIME type اشتباه | `include /etc/nginx/mime.types;` در config |
| `index.html not found` | rsync fail | لاگ مرحله آپلود را چک کن |

---

## توسعه محلی

```bash
npm install
npm run dev        # dev server روی http://localhost:5173
npm run build      # build production
npm run preview    # پیش‌نمایش build
```

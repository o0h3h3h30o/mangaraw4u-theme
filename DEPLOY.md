# Hướng dẫn cài đặt trên Server

## 1. Cài đặt môi trường

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git -y

# Cài Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Cài pnpm
npm install -g pnpm

# Cài PM2 để quản lý process
npm install -g pm2
```

## 2. Clone & setup Theme (Next.js)

```bash
cd /var/www/manga

git clone git@github.com:o0h3h3h30o/mangaraw4u-theme.git theme
cd theme

pnpm install
```

Tạo file `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_TIMEZONE=Asia/Ho_Chi_Minh
NEXT_PUBLIC_SITE_URL=https://mangaraw4u.com
NEXT_PUBLIC_NODE_API_URL=http://localhost:3000
NEXT_PUBLIC_COVER_CDN_URL=https://cdn.mangaraw4u.com
NEXT_PUBLIC_CHAPTER_CDN_URL=https://s1.manga18.club
```

Build & chạy:

```bash
pnpm build
pm2 start npm --name "manga-theme" -- start -- -p 3001
pm2 save
```

## 3. Clone & setup API (Node.js Express)

```bash
cd /var/www/manga

git clone git@github.com:o0h3h3h30o/mangaAPI.git api
cd api

npm install
```

Tạo file `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_pass
DB_NAME=your_db_name
JWT_SECRET=your_secret_key
COVER_CDN_URL=https://cdn.mangaraw4u.com
COVER_SAVE_DIR=/var/www/cdn.mangaraw4u.com/cover
```

Chạy:

```bash
pm2 start server.js --name "manga-api"
pm2 save
```

## 4. PM2 tự khởi động khi reboot

```bash
pm2 startup
# Chạy lệnh mà PM2 in ra (sudo env PATH=...)
pm2 save
```

## 5. Cập nhật code

```bash
# Theme
cd /var/www/manga/theme
git pull
pnpm install      # nếu có package mới
pnpm build
pm2 restart manga-theme

# API
cd /var/www/manga/api
git pull
npm install       # nếu có package mới
pm2 restart manga-api
```

## 6. Lệnh PM2 hay dùng

| Lệnh | Mô tả |
|-------|-------|
| `pm2 list` | Xem tất cả process |
| `pm2 logs` | Xem logs realtime |
| `pm2 logs manga-theme` | Logs 1 app |
| `pm2 restart all` | Restart tất cả |
| `pm2 stop manga-api` | Dừng 1 app |
| `pm2 monit` | Monitor CPU/RAM |

## 7. Cấu hình Nginx (reverse proxy)

```nginx
# /etc/nginx/sites-available/mangaraw4u.com
server {
    listen 80;
    server_name mangaraw4u.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# CDN cho cover images
server {
    listen 80;
    server_name cdn.mangaraw4u.com;

    root /var/www/cdn.mangaraw4u.com;

    location /cover/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mangaraw4u.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Download cover images

```bash
cd /var/www/manga/api
node scripts/download-covers.js

# Hoặc chạy nền
nohup node scripts/download-covers.js >> download.log 2>&1 &
```

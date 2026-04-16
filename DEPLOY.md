# Деплой NeuroLanding

## Архитектура
- **Клиент** (JS-бандл) → отправляет POST на `/send.php`
- **Сервер** (`send.php`) → читает токен из своего файла и шлёт в Telegram API
- **Токен бота НЕ попадает в клиентский JS**

## Шаг 1: Билд

```bash
npm run build
```

Получите папку `dist/` с готовым сайтом.

## Шаг 2: Загрузка на сервер

На любой PHP-хостинг (даже за 100₽/мес) залейте:

```
/var/www/yoursite/
├── dist/          ← содержимое папки dist (index.html, assets/)
├── send.php       ← из корня проекта (ОБЯЗАТЕЛЬНО!)
└── .htaccess      ← если нужен (см. ниже)
```

## Шаг 3: Настройка send.php

Откройте `send.php` на сервере и впишите свои значения:

```php
$BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА';
$CHAT_ID   = '-ВАШ_CHAT_ID';
```

> ⚠️ **Никогда не коммитьте `send.php` с токеном в публичный Git!**

## Шаг 4: Настройка Nginx (если VPS)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/yoursite;
    index index.html;

    # Статика из dist/
    location / {
        try_files $uri $uri/ /index.html;
    }

    # PHP для send.php
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Локальная разработка

Для `npm run dev` формы будут стучаться на `./send.php` — поднимите локальный PHP-сервер:

```bash
php -S localhost:3000 -t dist
```

Или временно закомментируйте отправку и оставьте `console.log`.

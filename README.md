# Aipplify - AI Job Board

Современный сайт с вакансиями на Next.js с минималистичным дизайном и сине-фиолетовым градиентом.

## Технологии

- **Next.js 14+** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Zustand** (state management)
- **TanStack Query** (API)
- **Lucide Icons**

## Установка

### Локальный запуск (dev)

1. Установите зависимости:
```bash
npm install
```

2. Поднимите Postgres (самый простой способ):
- В корне репозитория:

```bash
docker-compose up -d
```

3. Настройте переменные окружения:
- Скопируйте `env.example` в `.env` и отредактируйте `DATABASE_URL` под вашу БД.

4. Примените схему Prisma и сгенерируйте клиент:

```bash
npm run db:push
npm run db:generate
```

5. Запустите dev сервер:
```bash
npm run dev
```

6. Откройте `http://localhost:3000` в браузере

## Структура проекта

```
app/
  layout.tsx          # Главный layout с Header
  page.tsx            # Главная страница
  jobs/
    page.tsx          # Страница со списком вакансий
  job/
    [slug]/
      page.tsx        # Страница отдельной вакансии
  company/
    [slug]/
      page.tsx        # Страница компании

components/
  Header.tsx          # Шапка сайта
  FiltersSidebar.tsx  # Боковая панель фильтров
  JobList.tsx         # Список вакансий
  JobCard.tsx         # Карточка вакансии
  RightPanel.tsx      # Правая панель с upsell
  SearchBar.tsx       # Поисковая строка
  Tag.tsx             # Компонент тега

data/
  jobs.json           # Mock данные вакансий
  companies.json      # Mock данные компаний

lib/
  mockJobs.ts         # Функции для работы с вакансиями
  mockCompanies.ts    # Функции для работы с компаниями
  utils.ts            # Утилиты (cn функция)
```

## Особенности

- ✅ Минималистичный дизайн в стиле Hirify
- ✅ Сине-фиолетовый градиент (#4F46E5 → #7C3AED)
- ✅ Адаптивная верстка
- ✅ Фильтры вакансий
- ✅ Поиск
- ✅ SEO оптимизация (metadata)
- ✅ Mock данные для MVP

## Следующие шаги

После готовности фронтенда можно подключить:
- Парсинг реальных вакансий
- Backend API
- Аутентификацию пользователей
- AI matching функционал

---

## Деплой на VPS (Docker + Nginx + SSL)

### 1) DNS
- A запись: `@` → IP VPS
- A запись: `www` → IP VPS

### 2) На сервере: Docker + проект
```bash
sudo apt update
sudo apt install -y git
git clone <YOUR_GITHUB_REPO_URL> aipplify
cd aipplify
```

### 3) Переменные окружения
Создайте файл `Front/.env` на сервере (НЕ коммитить):
- `DATABASE_URL=postgresql://...`
- (опционально) `WANTAPPLY_*` — только если будете запускать парсер

### 4) Postgres
В корне репозитория уже есть `docker-compose.yml` для Postgres:
```bash
docker-compose up -d
```

### 5) Сборка и запуск Next.js
Минимальный вариант (без контейнеризации приложения):
```bash
cd Front
npm ci
npm run db:push
npm run db:generate
npm run build
npm run start
```

Запускать лучше через process manager (например, `pm2`) или через systemd.

**Systemd (рекомендуется на VPS):** после `npm run build` один раз:
```bash
sudo cp deploy/aipplify-next.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now aipplify-next.service
```
Сервис слушает **`0.0.0.0:3000`** (удобно для Nginx в Docker). Лог: `/var/log/aipplify-next.log`. После деплоя: `cd Front && npm run build && sudo systemctl restart aipplify-next`.

### 5a) Автообновление вакансий (каждые 3 часа)

Сайт читает только БД; новые вакансии появляются после синхронизации парсеров.

- Команда: в каталоге `Front` — `npm run jobs:sync` (DegenCryptoJobs + CryptoJobsList RSS + job-eco при `JOB_ECO_API_KEY` в `.env`).
- Расписание: **systemd timer** или **cron** — пошагово в [`deploy/README-jobs-sync.md`](deploy/README-jobs-sync.md).

### 6) Nginx reverse proxy
Пример конфига (подставьте домен):
```nginx
server {
  server_name example.com www.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

### 7) SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

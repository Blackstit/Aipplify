# Парсеры вакансий

Этот модуль содержит парсеры для различных источников вакансий.

## 1. Парсер WantApply.com

Парсит вакансии из API wantapply.com и сохраняет их в базу данных.

## Установка зависимостей

Убедитесь, что установлены все зависимости:

```bash
npm install
```

## Настройка токена авторизации и куков

API wantapply.com защищено Cloudflare и требует авторизацию + куки. Получите их:

1. Откройте сайт wantapply.com в браузере и авторизуйтесь
2. Откройте DevTools (F12) → вкладка Network
3. Перейдите на страницу с вакансиями
4. Найдите запрос к `/api/jobs` в списке запросов
5. Откройте его → вкладка Headers → Request Headers

**Скопируйте:**
- `authorization`: значение БЕЗ слова "Bearer" (только токен)
- `cookie`: ВСЕ куки целиком (вся строка)

Добавьте в `.env.local`:

```bash
WANTAPPLY_API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
WANTAPPLY_COOKIES="_ga=GA1.1.xxx; AMP_MKTG_be9e98c67f=xxx; g_state=xxx; auth-token-data=xxx; cf_clearance=xxx; AMP_be9e98c67f=xxx; _ga_8X6ZCGER1W=xxx"
WANTAPPLY_VISITOR_ID="79692e486a84458f711639d1bb818a06"  # опционально, из заголовка x-visitor-id
```

**Важно:** Куки (особенно `cf_clearance`) могут истекать. Если получаете 403, обновите куки из браузера.

Или передайте напрямую при запуске:

```bash
npm run parse:jobs -- --token="токен" --cookies="все-куки-здесь"
```

## Использование

### 1. Через API endpoint

Отправьте POST запрос на `/api/admin/parse-wantapply`:

```bash
curl -X POST http://localhost:3000/api/admin/parse-wantapply \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "maxPages": 5}'
```

**Параметры:**
- `page` (number, опционально) - начальная страница (по умолчанию: 1)
- `maxPages` (number, опционально) - максимальное количество страниц для парсинга. Если **не указать**, парсер пройдёт **все доступные страницы** пока `hasNextPage = false`.

**Ответ:**
```json
{
  "success": true,
  "message": "Parsing completed",
  "results": {
    "jobsSaved": 10,
    "jobsUpdated": 5,
    "companiesSaved": 3,
    "errors": [],
    "totalErrors": 0
  }
}
```

### 2. Через скрипт командной строки

```bash
# Спарсить МАКСИМУМ вакансий (все страницы domain=tech)
npm run parse:jobs

# Парсить несколько страниц
npm run parse:jobs -- --page=1 --maxPages=5

# Или напрямую через tsx
npx tsx scripts/parse-jobs.ts --page=1 --maxPages=5
```

### 3. Запуск раз в час через cron (macOS / Linux)

Открой cron-редактор:

```bash
crontab -e
```

Добавь строку (путь к `npm` может отличаться, проверь `which npm`):

```cron
0 * * * * cd /Users/blackstit/Aipplify/Front && /usr/local/bin/npm run parse:jobs -- --page=1 >> cron-parse.log 2>&1
```

- Скрипт будет запускаться каждый час (`0 * * * *`).
- Парсер пройдёт все страницы с `page=1`, т.е. будет добирать новые вакансии.

## Структура данных

Парсер преобразует данные из API wantapply.com в формат нашей базы данных:

- **Компании**: автоматически создаются или обновляются с информацией о логотипе и верификации
- **Вакансии**: сохраняются с полной информацией включая:
  - Название, описание, требования
  - Зарплата (текст и числовые значения)
  - Локация, тип работы (remote/hybrid/office)
  - Уровень опыта (intern/junior/mid/senior/lead)
  - Теги, статус (featured/verified)
  - Даты публикации и истечения

## Безопасность

⚠️ **Важно**: Endpoint `/api/admin/parse-wantapply` в данный момент не защищен. Добавьте аутентификацию перед использованием в продакшене!

Пример защиты:

```typescript
// В app/api/admin/parse-wantapply/route.ts
import { getCurrentUser, isAdmin } from "@/lib/session"

export async function POST(request: Request) {
  const user = getCurrentUser()
  if (!user || !isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... остальной код
}
```

## Ограничения API

API wantapply.com может иметь ограничения по частоте запросов. Парсер автоматически добавляет задержку в 1 секунду между запросами страниц.

Если вы получаете ошибки 429 (Too Many Requests), увеличьте задержку в файле `lib/parsers/wantapply.ts`:

```typescript
// В функции parseAndSaveJobs
await new Promise(resolve => setTimeout(resolve, 2000)) // Увеличьте до 2 секунд
```

## Обновление существующих вакансий

Парсер автоматически определяет существующие вакансии по:
- Slug вакансии
- sourceUrl (содержит ID из wantapply.com)

Если вакансия уже существует, она будет обновлена новой информацией.

## Мониторинг

Все ошибки логируются в консоль и возвращаются в ответе API. Проверяйте массив `errors` для диагностики проблем.

---

## 2. Парсер DegenCryptoJobs.com

Простой парсер для `degencryptojobs.com`, который не требует авторизации и работает через обычные GET-запросы.

### Использование

#### Через скрипт командной строки

```bash
# Спарсить все доступные страницы
npm run parse:degen

# Парсить несколько страниц
npm run parse:degen -- --page=1 --maxPages=10

# Или напрямую через tsx
npx tsx scripts/parse-degen-jobs.ts --page=1 --maxPages=5
```

#### Через API endpoint

Отправьте POST запрос на `/api/admin/parse-degen`:

```bash
curl -X POST http://localhost:3000/api/admin/parse-degen \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "maxPages": 10}'
```

**Параметры:**
- `page` (number, опционально) - начальная страница (по умолчанию: 1)
- `maxPages` (number, опционально) - максимальное количество страниц для парсинга. Если **не указать**, парсер пройдёт **все доступные страницы**.

**Ответ:**
```json
{
  "success": true,
  "message": "Parsing completed",
  "results": {
    "jobsSaved": 50,
    "jobsUpdated": 10,
    "companiesSaved": 15,
    "errors": [],
    "totalErrors": 0
  }
}
```

### Автоматический запуск раз в 3 часа через cron

Открой cron-редактор:

```bash
crontab -e
```

Добавь строку (замени путь к `npm` на свой, проверь `which npm`):

```cron
0 */3 * * * cd /Users/blackstit/Aipplify/Front && /usr/local/bin/npm run parse:degen >> /Users/blackstit/Aipplify/Front/cron-degen-parse.log 2>&1
```

Это будет запускать парсер каждые 3 часа, сохраняя логи в `cron-degen-parse.log`.

### Особенности

- ✅ Не требует авторизации или куков
- ✅ Простые GET-запросы без Puppeteer
- ✅ Автоматически создаёт компании из названий
- ✅ Парсит зарплаты из строк (например, "$150k – $220k")
- ✅ Определяет уровень опыта из тегов
- ✅ Определяет тип работы (Remote/Hybrid/Office) из локаций

### Безопасность

⚠️ **Важно**: Endpoint `/api/admin/parse-degen` в данный момент не защищен. Добавьте аутентификацию/авторизацию перед использованием в продакшене!

---

## 3. Парсер CryptoJobsList.com (RSS)

Парсер для RSS-фида с сайта `cryptojobslist.com`. Использует стандартный RSS-фид без авторизации.

### Использование

#### Через скрипт командной строки

```bash
# Спарсить все вакансии из RSS-фида
npm run parse:cryptojobslist

# Или напрямую через tsx
npx tsx scripts/parse-cryptojobslist.ts
```

#### Через API endpoint

Отправьте POST запрос на `/api/admin/parse-cryptojobslist`:

```bash
curl -X POST http://localhost:3000/api/admin/parse-cryptojobslist \
  -H "Content-Type: application/json"
```

**Ответ:**
```json
{
  "success": true,
  "message": "Parsing completed",
  "results": {
    "jobsSaved": 50,
    "jobsUpdated": 10,
    "companiesSaved": 15,
    "errors": [],
    "totalErrors": 0
  }
}
```

### Автоматический запуск раз в 3 часа через cron

Открой cron-редактор:

```bash
crontab -e
```

Добавь строку (замени путь к `npm` на свой, проверь `which npm`):

```cron
0 */3 * * * cd /Users/blackstit/Aipplify/Front && /usr/local/bin/npm run parse:cryptojobslist >> /Users/blackstit/Aipplify/Front/cron-cryptojobslist-parse.log 2>&1
```

Это будет запускать парсер каждые 3 часа, сохраняя логи в `cron-cryptojobslist-parse.log`.

### Особенности

- ✅ Не требует авторизации (публичный RSS-фид)
- ✅ Парсит RSS XML формат
- ✅ Извлекает теги из HTML описания
- ✅ Автоматически создаёт компании из `dc:creator`
- ✅ Парсит зарплаты из описания (если указаны)
- ✅ Определяет уровень опыта из тегов и описания
- ✅ Определяет тип работы (Remote/Hybrid/Office) из локации

### Безопасность

⚠️ **Важно**: Endpoint `/api/admin/parse-cryptojobslist` в данный момент не защищен. Добавьте аутентификацию/авторизацию перед использованием в продакшене!

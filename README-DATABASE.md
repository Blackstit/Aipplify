# 🐘 Как запустить Postgres для Aipplify

## Вариант 1: Docker (Рекомендуется - самый простой)

### Шаг 1: Установи Docker Desktop
Если у тебя еще нет Docker:
- Скачай: https://www.docker.com/products/docker-desktop/
- Установи и запусти Docker Desktop

### Шаг 2: Запусти Postgres одной командой
В корне проекта (`/Users/blackstit/Aipplify`) выполни:

```bash
docker-compose up -d
```

Это запустит Postgres в фоне. Проверить что он работает:
```bash
docker-compose ps
```

### Шаг 3: Создай таблицы в базе
Перейди в папку Front и выполни:

```bash
cd Front
npm run db:push
```

Готово! База данных работает и таблицы созданы.

---

## Полезные команды

**Остановить Postgres:**
```bash
docker-compose down
```

**Остановить и удалить все данные:**
```bash
docker-compose down -v
```

**Посмотреть логи:**
```bash
docker-compose logs postgres
```

**Открыть Prisma Studio (визуальный редактор БД):**
```bash
cd Front
npm run db:studio
```

---

## Вариант 2: Postgres.app (для Mac)

1. Скачай: https://postgresapp.com/
2. Установи и запусти приложение
3. Нажми "Initialize" чтобы создать сервер
4. Создай базу данных `aipplify` через интерфейс
5. Выполни `npm run db:push` в папке Front

---

## Проверка подключения

После запуска Postgres, проверь что всё работает:

```bash
cd Front
npm run db:push
```

Если видишь сообщение типа "✨ Your database is now in sync with your schema" - всё отлично!

---

## На сайте 0 вакансий или API: `Authentication failed` для `postgres`

Приложение подключается к Postgres **по сети** (`localhost:5432`) с паролем из `Front/.env` (`DATABASE_URL`).  
Пароль суперпользователя `postgres` **хранится внутри тома** контейнера: переменная `POSTGRES_PASSWORD` в `docker-compose.yml` учитывается **только при первом создании** тома. Если пароли разошлись, Prisma падает с ошибкой авторизации, а список вакансий пустой.

**Синхронизировать пароль с `.env` (пример для пароля `postgres`):**

```bash
docker exec aipplify-postgres psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

Проверка с хоста:

```bash
docker run --rm --network host -e PGPASSWORD=postgres postgres:16-alpine \
  psql -h 127.0.0.1 -U postgres -d aipplify -c 'SELECT COUNT(*) FROM "Job";'
```

Перезапуск Next (если используешь systemd):

```bash
sudo systemctl restart aipplify-next
```

**Как не ловить снова:** не меняй `POSTGRES_PASSWORD` в compose без смены пароля в БД и в `DATABASE_URL`; после смены пароля везде делай `ALTER USER` под тот же пароль.

# 🚀 Быстрый старт: Запуск Postgres

## ✅ Вариант 1: Postgres.app (Самый простой для Mac)

1. **Скачай и установи:**
   - https://postgresapp.com/downloads.html
   - Просто перетащи в Applications

2. **Запусти Postgres.app** из Applications

3. **Нажми "Initialize"** - создастся сервер на порту 5432

4. **Создай базу данных:**
   - Открой Postgres.app
   - Двойной клик на сервере
   - В терминале выполни: `createdb aipplify`

5. **Готово!** Теперь выполни:
   ```bash
   cd Front
   npm run db:push
   ```

---

## ✅ Вариант 2: Docker (Если хочешь)

1. **Установи Docker Desktop:**
   - https://www.docker.com/products/docker-desktop/

2. **Запусти Docker Desktop**

3. **В терминале выполни:**
   ```bash
   cd /Users/blackstit/Aipplify
   docker-compose up -d
   ```

4. **Создай таблицы:**
   ```bash
   cd Front
   npm run db:push
   ```

---

## ✅ Вариант 3: Homebrew (Если уже есть)

```bash
# Установи Postgres
brew install postgresql@16

# Запусти сервис
brew services start postgresql@16

# Создай базу данных
createdb aipplify

# Создай таблицы
cd Front
npm run db:push
```

---

## 🎯 После любого варианта - проверь:

```bash
cd Front
npm run db:push
```

Если видишь: **"✨ Your database is now in sync"** - всё работает!

---

## 📊 Открыть визуальный редактор БД:

```bash
cd Front
npm run db:studio
```

Откроется браузер с интерфейсом для просмотра таблиц.

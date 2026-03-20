# Автообновление вакансий (каждые 3 часа)

Сайт только читает PostgreSQL. Обновление — это запуск `npm run jobs:sync` (DegenCryptoJobs + RSS CryptoJobsList + при наличии ключа — **job-eco**).

## Настройка (один раз)

1. Убедитесь, что `Front/.env` содержит рабочий `DATABASE_URL`.
2. Для вакансий **job-eco** добавьте в `Front/.env`:
   - `JOB_ECO_API_URL` (по умолчанию в коде: `https://job-eco.aipplify.com`)
   - `JOB_ECO_API_KEY` — ключ для заголовка `X-API-Key`
   - при необходимости: `JOBS_SYNC_SKIP_JOB_ECO=1` чтобы отключить этот источник в `jobs:sync`
3. При необходимости задайте объём одного прогона:
   - `JOBS_SYNC_DEGEN_MAX_PAGES` (по умолчанию `15`) — страниц API Degen за один запуск (~200 вакансий на страницу).
   - `JOBS_SYNC_SKIP_CRYPTO=1` — отключить RSS CryptoJobsList.

Можно добавить строки в `Front/.env` или в секцию `Environment=` в unit-файле.

## Вариант A: systemd (рекомендуется на VPS)

Пути ниже для `/root/Aipplify` — при другом каталоге отредактируйте `aipplify-jobs-sync.service`.

```bash
sudo touch /var/log/aipplify-jobs-sync.log
sudo chmod 644 /var/log/aipplify-jobs-sync.log

sudo cp /root/Aipplify/deploy/aipplify-jobs-sync.service /etc/systemd/system/
sudo cp /root/Aipplify/deploy/aipplify-jobs-sync.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now aipplify-jobs-sync.timer

# Проверка
sudo systemctl list-timers | grep aipplify
sudo systemctl start aipplify-jobs-sync.service   # разовый прогон
sudo tail -f /var/log/aipplify-jobs-sync.log
```

## Вариант B: cron

```cron
0 */3 * * * cd /root/Aipplify/Front && /usr/bin/npm run jobs:sync >> /var/log/aipplify-jobs-sync.log 2>&1
```

Если `npm` не в стандартном PATH у cron, укажите полный путь (`which npm`) или обёртку `bash -lc '...'`.

## Ручной запуск

```bash
cd /root/Aipplify/Front
npm run jobs:sync
```

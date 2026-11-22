# Деплой svitlo-cherga v2 на Azure VM

## Стан VM (read-only аудит 2026-11-22)

**Nuxt**
- `/var/www/localhub`, власник — root.
- systemd-юніт `nuxt-localhub`: працює від `www-data`, `EnvironmentFile=.env`, `ExecStart=node .output/server/index.mjs`.
- Node v22.23.5, npm 10.9.9.
- nginx (Hestia) проксює `json63.pp.ua` на `127.0.0.1:3102`.
- На проді задеплоєно `aa700aa` (= локальний `main`).
- Є незакомічена правка `app/components/bus/map/index.client.vue` (та сама, що й локально).

**Бекенд**
- `/var/www/localhub_back`, працює в Docker: контейнер `localhub_api` (Node 21.7.3), порт `0.0.0.0:4040`.
- Postgres — контейнер `PG_DB` (PostGIS 16), порт `0.0.0.0:5433`.
- `api.json63.pp.ua` проксюється на `127.0.0.1:4040`.
- Задеплоєно `b86941a`.
- Незакомічені правки в `server.js` і `docker-compose.yaml` перенесено в гілку `feat/outages` комітом `1d04935`. Зміни `package*.json` на сервері — побічний наслідок `npm install`.

**Чого немає:** Redis, pm2, cron.

**Кеш:** обрано Nitro `fs` (`.data/svitlo`) + node-cache у бекенді.

**Розклад збору:** `node-cron` усередині контейнера бекенду.

## Нові змінні

| Файл | Змінна | Значення |
|---|---|---|
| `/var/www/localhub_back/.env` | `OUTAGES_COLLECTOR_ENABLED` | `true` |
| `/var/www/localhub/.env` | `NUXT_OUTAGES_API_BASE` | `http://127.0.0.1:4040` |

## Кроки (порядок: бекенд → Nuxt)

### 0. Код на GitHub
Вивантажити гілки `feat/outages` і `feat/svitlo-cherga-v2` на GitHub (бажано змерджити в `main`).

### 1. Бекенд
```bash
cd /var/www/localhub_back
G="sudo git -c safe.directory=/var/www/localhub_back"
$G rev-parse HEAD | tee ~/localhub_back.prev
sudo docker exec PG_DB sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > ~/localhub_db_$(date +%F_%H%M).sql
$G stash push -m pre-svitlo-v2
$G fetch origin && $G checkout <branch-or-main> && $G pull --ff-only
echo 'OUTAGES_COLLECTOR_ENABLED=true' | sudo tee -a .env
# -V renews the anonymous /app/node_modules volume, otherwise the new deps are missing
sudo docker compose up -d --build -V api
```
**Перевірка бекенду**
- `sudo docker logs localhub_api --tail 80` — у логах мають бути міграції, `[outages] collector scheduled`, через ~10 с `startup: {...}`, а через ~30 с імпорт адрес.
- `curl -s 127.0.0.1:4040/outages/health`
- `curl -s '127.0.0.1:4040/outages/khmelnytska-oblast/schedule?date=today' | head -c 400`

### 2. Nuxt
```bash
cd /var/www/localhub
G="sudo git -c safe.directory=/var/www/localhub"
$G rev-parse HEAD | tee ~/localhub.prev
sudo cp -a .output /var/www/localhub.output.prev
$G stash push -m pre-svitlo-v2
$G fetch origin && $G checkout <branch-or-main> && $G pull --ff-only
$G stash pop            # keeps the OSM tiles change that is live now
echo 'NUXT_OUTAGES_API_BASE=http://127.0.0.1:4040' | sudo tee -a .env
sudo mkdir -p .data/svitlo && sudo chown -R www-data:www-data .data
sudo npm ci
sudo NODE_OPTIONS=--max-old-space-size=4096 npx nuxi build
sudo systemctl restart nuxt-localhub
```

**Перевірка Nuxt**
- `systemctl status nuxt-localhub --no-pager`
- `sudo journalctl -u nuxt-localhub -n 100 --no-pager`
- `curl -sI https://json63.pp.ua/svitlo-cherga` — очікуємо 200.
- `curl -s https://json63.pp.ua/svitlo-cherga/khmelnytska-oblast/3-1 | grep -o 'Зараз за графіком[^<]*'`
- `curl -sI 'https://json63.pp.ua/svitlo-cherga?region=hmelnitska-oblast&queue=3.1'` — очікуємо 301.
- `curl -s https://json63.pp.ua/api/svitlo/khmelnytska-oblast/schedule | head -c 300` — `"stale":false`, `"provider":"hoe"`.
- Smoke-тест у браузері: мобільний і десктопний вигляд.

nginx не змінюємо: кеш-заголовки віддає Nitro, gzip уже ввімкнено.

## Відкат

**Nuxt**
```bash
cd /var/www/localhub
$G checkout $(cat ~/localhub.prev) && $G stash pop
sudo rm -rf .output && sudo mv /var/www/localhub.output.prev .output
sudo systemctl restart nuxt-localhub
```
Рядок `NUXT_OUTAGES_API_BASE` можна лишити: старий код його ігнорує.

**Бекенд**
```bash
cd /var/www/localhub_back
$G checkout $(cat ~/localhub_back.prev) && $G stash pop
sudo docker compose up -d --build -V api
```
- Нові таблиці не заважають старому коду.
- Видалити їх за потреби: `sudo docker exec localhub_api sh -c 'cd sql && npx knex migrate:down'` (двічі).
- Повне відновлення БД — з дампу `~/localhub_db_*.sql`.

## Поза цим деплоєм (варто окремо)
- Порти `4040` (API) і `5433` (Postgres) слухають `0.0.0.0`. Якщо NSG в Azure їх не закриває, база доступна з інтернету. Краще прив'язати їх до `127.0.0.1`.
- Під час збірки `.output` перезаписується, поки працює старий процес: можливе коротке вікно 500 на ледачих чанках. Щоб уникнути, збирати в окрему копію й перемикати.

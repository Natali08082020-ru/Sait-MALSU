# MalSu — нейропесни

**Репозиторий:** [github.com/Natali08082020-ru/Sait-MALSU](https://github.com/Natali08082020-ru/Sait-MALSU)  
**Сайт (GitHub Pages):** [natali08082020-ru.github.io/Sait-MALSU](https://natali08082020-ru.github.io/Sait-MALSU/)

Официальный лендинг музыкального проекта **MalSu** (Малахова Наталья и Супрунчук Игорь): альбомы, примеры песен на заказ, контакты.

Сайт статический: HTML, CSS и JavaScript без сборки и зависимостей.

## Альбомы

| Альбом   | Статус      | Ссылка |
|----------|-------------|--------|
| **Мысли**   | В релизе    | [band.link/cSpGv](https://band.link/cSpGv) |
| **Чувства** | В релизе с 26.05.2026 | [band.link/ZTV8E](https://band.link/ZTV8E) |

## Возможности сайта

- Промо двух альбомов со ссылками на стриминги (Band.link)
- Блок «О нас» с историей названия MalSu
- Плеер с примерами песен на заказ (5 треков)
- Форма обратной связи с переходом в [Telegram @natali08082020](https://t.me/natali08082020)
- Адаптивная вёрстка и анимации

## Структура проекта

```
├── index.html              # Главная страница
├── privacy.html, offer.html, 404.html
├── style.css               # Стили
├── script.js               # UI главной (через сервисы)
├── pages.js                # Юридические страницы
├── pages/order-status.html # Статус заказа (демо)
├── data/                   # Контент (site, albums, tracks, faq…)
├── services/               # Сервисный слой (albums, orders, faq…)
├── providers/              # local.provider + каркас Supabase
├── crm/order-status.js     # Статусы заказов CRM
├── utils/                  # SEO, номера заказов
├── integrations/telegram.js
├── analytics/events.js
├── admin/                  # CRM и админ-панель
├── audio/                  # Примеры песен (.mp3)
├── malsu/                  # Обложки альбомов
└── start-server.bat
```

Конфигурация сайта: **`data/site.js`** → `baseUrl`, `telegram`, `contacts`, `socialLinks`.

Данные админки: **`localStorage`**. Заказы — ключ **`malsu-orders`**, остальной контент — **`malsu-admin-data`**.

## Админ-панель

Откройте [http://localhost:8080/admin/](http://localhost:8080/admin/) после запуска сервера.

- **Обзор** — статистика, последние заказы, дедлайны
- **Заказы** — CRM с карточкой заказа, творческим кабинетом, файлами и внутренними заметками
- **Альбомы / Треки / Отзывы / FAQ / Стоимость** — управление контентом сайта
- **Настройки** — сайт, контакты, экспорт/импорт JSON

## Локальный запуск

Для корректной работы аудио и путей с кириллицей лучше открывать сайт через локальный HTTP-сервер, а не двойным кликом по `index.html`.

**Windows:** запустите `start-server.bat` — откроется [http://localhost:8080](http://localhost:8080).

**Вручную** (если установлен Python):

```bash
cd "Сайт MalSu"
python -m http.server 8080
```

или:

```bash
py -m http.server 8080
```

## Публикация на GitHub

### 1. Установите Git

Скачайте [Git for Windows](https://git-scm.com/download/win), перезапустите терминал.

### 2. Создайте репозиторий на GitHub

На [github.com/new](https://github.com/new) создайте пустой репозиторий (без README, без .gitignore — они уже в проекте).

### 3. Загрузите проект

В папке проекта выполните (подставьте свой логин и имя репозитория):

```bash
cd "путь/к/папке/Сайт MalSu"

git init
git add .
git commit -m "Первый коммит: сайт MalSu — нейропесни"
git branch -M main
git remote add origin https://github.com/Natali08082020-ru/Sait-MALSU.git
git push -u origin main
```

При первом `push` GitHub запросит вход (логин и [Personal Access Token](https://github.com/settings/tokens) вместо пароля).

### 4. GitHub Pages (бесплатный хостинг)

1. Репозиторий → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` → папка **`/ (root)`** → Save
4. Через 1–2 минуты сайт будет по адресу:  
   `https://natali08082020-ru.github.io/Sait-MALSU/`

## Технологии

- HTML5, CSS3 (кастомные свойства, анимации)
- Vanilla JavaScript (Intersection Observer, Web Audio API через `<audio>`)
- Шрифты: [Google Fonts](https://fonts.google.com/) — Manrope, Unbounded

## Контакты

- Telegram: [@natali08082020](https://t.me/natali08082020)
- «Мысли»: [band.link/cSpGv](https://band.link/cSpGv)
- «Чувства»: [band.link/ZTV8E](https://band.link/ZTV8E)

---

© 2026 MalSu · Нейропесни

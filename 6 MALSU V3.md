# MALSU V3 — Orders, CRM Foundation и подготовка к Supabase

## Главная цель

Сделать систему обработки заказов профессиональной и подготовить проект к будущему подключению Supabase и админ-панели.

Важно:

- НЕ подключать Supabase.

- НЕ создавать серверную часть.

- НЕ менять дизайн сайта кардинально.

- Сохранить всю текущую функциональность.

- Подготовить архитектуру для будущего масштабирования.

---

# ЭТАП 1. Стабилизация проекта

## 1.1 Единый конфиг сайта

Создать файл:

data/site.js

Вынести туда:

baseUrl

telegram

siteTitle

siteDescription

contacts

socialLinks

---

Пример:

export const siteConfig = {

baseUrl: "...",

telegram: "...",

siteTitle: "MalSu",

siteDescription: "...",

};

---

## 1.2 Убрать хардкод домена

Найти все:

canonical

Open Graph

Twitter Card

ссылки в скриптах

ссылки в юридических страницах

и получать адрес сайта через siteConfig.baseUrl

---

## 1.3 Проверка ссылок

Проверить:

- Header

- Footer

- CTA-кнопки

- FAQ

- privacy.html

- offer.html

- 404.html

Не должно быть битых ссылок.

---

# ЭТАП 2. Улучшение формы заказа

## Добавить новое поле

Планируемый бюджет

Тип:

select

Варианты:

- от 4 000 ₽

- 4 000–8 000 ₽

- 8 000–15 000 ₽

- более 15 000 ₽

Поле необязательное.

---

## Итоговая модель заказа

{

id,

orderNumber,

name,

contact,

category,

budget,

story,

deadline,

status,

createdAt,

updatedAt

}

---

# ЭТАП 3. CRM Foundation

Создать каталог:

crm/

---

Создать файл:

crm/order-status.js

---

Статусы:

NEW

DISCUSSION

IN\_PROGRESS

APPROVAL

DONE

ARCHIVED

---

Карта отображения:

NEW → Новая заявка

DISCUSSION → Обсуждение

IN\_PROGRESS → В работе

APPROVAL → Согласование

DONE → Готово

ARCHIVED → Архив

---

# ЭТАП 4. Генератор номеров заказов

Создать:

utils/order-number.js

---

Формат:

MS-2026-001

MS-2026-002

MS-2026-003

---

Создать функцию:

generateOrderNumber()

---

Пока использовать локальную генерацию.

Без базы данных.

---

# ЭТАП 5. Сервис заказов

Создать:

services/orders.service.js

---

Функции:

create()

getAll()

getById()

update()

delete()

---

На текущем этапе использовать localStorage.

Важно:

После подключения Supabase интерфейс не должен измениться.

Меняется только источник данных.

---

# ЭТАП 6. Telegram Integration

Создать:

integrations/telegram.js

---

Перенести всю логику Telegram туда.

Создать функции:

formatOrderMessage()

sendOrder()

---

Формат сообщения:

🎵 Новая заявка MalSu

Номер:

MS-2026-001

Имя:

...

Контакт:

...

Категория:

...

Бюджет:

...

Срок:

...

История:

...

---

# ЭТАП 7. Страница статуса заказа

Создать:

pages/order-status.html

---

Маршрут:

/pages/order-status.html?id=MS-2026-001

---

Отображать:

Номер заказа

Имя клиента

Дата создания

Текущий статус

---

Визуальный прогресс:

✓ Заявка получена

✓ Обсуждение

✓ В работе

✓ Согласование

✓ Готово

---

Использовать тестовые данные.

---

# ЭТАП 8. Подготовка будущей админки

Создать структуру:

admin/

admin/index.html

admin/orders.html

admin/albums.html

admin/tracks.html

admin/reviews.html

admin/pricing.html

admin/settings.html

---

Пока выводить заглушку:

"Раздел находится в разработке"

---

Создать общий стиль будущей админки.

---

# ЭТАП 9. News Foundation

Создать:

data/news.js

---

Структура:

{

id,

title,

excerpt,

content,

image,

date,

published

}

---

Пока оставить пустой массив.

---

# ЭТАП 10. Analytics Foundation

Создать:

analytics/events.js

---

Вынести события:

hero-listen

hero-story

album-open

order-submit

faq-open

contact-click

---

Пока только консольное логирование.

Без внешних сервисов.

---

# ЭТАП 11. Подготовка к Supabase

Создать:

providers/

local.provider.js

supabase.provider.js

---

На данном этапе использовать только local.provider.js

supabase.provider.js оставить каркасом.

---

# ЭТАП 12. Критерии успешного завершения

После выполнения ТЗ:

✓ сайт работает как раньше

✓ все разделы сохранены

✓ форма заказа улучшена

✓ появился сервис заказов

✓ появилась архитектура CRM

✓ появился генератор номеров заказов

✓ появилась страница статуса заказа

✓ создан каркас админки

✓ проект готов к подключению Supabase

✓ проект готов к появлению реальных заказчиков

Без внедрения базы данных и без авторизации.
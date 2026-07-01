# Atelier AI — Виртуальная AI-примерка одежды

> Загрузите фото и примерьте любую одежду за секунды. Реалистичная AI-примерка для онлайн-магазинов и покупателей.

## Возможности

- **AI-примерка одежды** — загрузите своё фото в полный рост, выберите образ или фото одежды — AI наденет его на вас
- **Готовые пресеты** — 6 предустановленных образов для быстрой демонстрации
- **Загрузка своей одежды** — примерьте вещь из магазина или из своего гардероба
- **Compare Slider** — интерактивное сравнение «до/после» на главном экране
- **Личный кабинет** — все примерки сохраняются в галерее, можно просмотреть и скачать
- **Система кредитов** — 3 бесплатные генерации при регистрации, пополнение через ЮKassa
- **Подписки и пакеты** — гибкая система оплаты (разовые пакеты или ежемесячная подписка)
- **Вход через Google** — сессии и баланс привязаны к аккаунту
- **API для магазинов** — встройте примерку в свой каталог через REST API

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Фреймворк | Next.js 16 (App Router) |
| Язык | TypeScript |
| Стили | Tailwind CSS 4, shadcn/ui |
| База данных | PostgreSQL (Supabase / Neon) |
| ORM | Prisma 7 |
| Аутентификация | NextAuth 4 (Google OAuth) |
| Платежи | ЮKassa (YooKassa) |
| AI-генерация | MuAPI (GPT Image 2 Image) |

## Тарифы

### Пакеты (разовая оплата)

| Пакет | Цена | Генераций | За генерацию |
|-------|------|-----------|-------------|
| Стартовый | 199 ₽ | 5 | 40 ₽ |
| Базовый | 499 ₽ | 20 | 25 ₽ |
| Стандарт 🏆 | 999 ₽ | 60 | 17 ₽ |
| Профи | 2 499 ₽ | 120 | 21 ₽ |

### Подписки (ежемесячно)

| План | Цена/мес | Генераций | За генерацию |
|------|----------|-----------|-------------|
| Light | 499 ₽ | 25 | 20 ₽ |
| Pro 🏆 | 999 ₽ | 80 | 12.5 ₽ |
| Unlimited | 2 499 ₽ | 150 | 17 ₽ |

## Переменные окружения

| Сервис | Переменная | Описание |
|--------|-----------|----------|
| **База данных** | `DATABASE_URL` | PostgreSQL (Supabase / Neon) |
| | `DIRECT_URL` | Прямое подключение к БД |
| **NextAuth** | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| | `NEXTAUTH_URL` | URL приложения |
| **Google OAuth** | `GOOGLE_CLIENT_ID` | Из Google Cloud Console |
| | `GOOGLE_CLIENT_SECRET` | Из Google Cloud Console |
| **MuAPI AI** | `MUAPIAPP_API_KEY` | Из muapi.ai |
| | `WEBHOOK_URL` | URL для вебхука MuAPI |
| **ЮKassa** | `YOOKASSA_SHOP_ID` | ID магазина в ЮKassa |
| | `YOOKASSA_SECRET_KEY` | Секретный ключ ЮKassa |

## Быстрый старт

```bash
git clone https://github.com/SunnyS8/fitting
cd fitting
npm install
cp .env.example .env.local  # заполните ключи
npx prisma generate
npx prisma db push
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Деплой на Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SunnyS8/fitting)

После деплоя добавьте переменные окружения в Vercel → Settings → Environment Variables.

## Лицензия

MIT

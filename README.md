# 👕 Примерь — AI-примерка одежды

> **Загрузи своё фото и фото любой одежды — AI примерит её на тебе за секунды.**

Production-ready SaaS на Next.js. Полностью на русском языке.

## Возможности

- **Виртуальная примерочная** — загрузи фото человека и одежды, AI наложит одежду фотореалистично
- **Выбор соотношения сторон** — авто, квадрат, портрет, пейзаж, широкий экран
- **Кастомный промпт** — можно редактировать инструкции для AI
- **Личная галерея** — все примерки сохраняются, можно просмотреть и скачать
- **Оплата кредитами** — пополнение через Stripe, 18 кредитов за одну примерку
- **Вход через Google** — сессии и баланс привязаны к аккаунту

## Технологии

Next.js · Prisma · PostgreSQL · NextAuth (Google OAuth) · Stripe · Tailwind CSS · MuAPI

## Деплой на Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SunnyS8/fitting)

### Переменные окружения

| Сервис | Переменная | Описание |
|---|---|---|
| **База данных** | `DATABASE_URL` | PostgreSQL (Supabase / Neon) |
| | `DIRECT_URL` | Прямое подключение к БД |
| **NextAuth** | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| | `NEXTAUTH_URL` | URL приложения |
| | `GOOGLE_CLIENT_ID` | Из Google Cloud Console |
| | `GOOGLE_CLIENT_SECRET` | Из Google Cloud Console |
| **Stripe** | `STRIPE_SECRET_KEY` | Из Stripe Dashboard |
| | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Из Stripe Dashboard |
| | `STRIPE_WEBHOOK_SECRET` | Секрет вебхука Stripe |
| **MuAPI AI** | `MUAPIAPP_API_KEY` | Из muapi.ai |
| | `WEBHOOK_URL` | URL для вебхука MuAPI |

### Быстрый старт локально

```bash
git clone https://github.com/SunnyS8/fitting
cd fitting
npm install
cp .env.example .env  # заполни ключи
npx prisma generate
npx prisma db push
npm run dev
```

## Лицензия

MIT
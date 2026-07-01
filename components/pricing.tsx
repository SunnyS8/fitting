"use client"

import { useState } from "react"
import { Check, Gift, Package, CreditCard, TrendingDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import toast from "react-hot-toast"

const packIds = ["starter", "basic", "standard", "pro"] as const

const packs = [
  {
    name: "Стартовый",
    price: "199 ₽",
    generations: 5,
    perGen: "40 ₽",
    planId: "starter",
    features: ["5 генераций", "Разрешение до HD"],
    cta: "Купить пакет",
    featured: false,
    badge: null,
  },
  {
    name: "Базовый",
    price: "499 ₽",
    generations: 20,
    perGen: "25 ₽",
    planId: "basic",
    features: ["20 генераций", "Разрешение до HD"],
    cta: "Купить пакет",
    featured: false,
    badge: null,
  },
  {
    name: "Стандарт",
    price: "999 ₽",
    generations: 60,
    perGen: "17 ₽",
    planId: "standard",
    features: ["60 генераций", "Разрешение до 4K", "Без водяных знаков"],
    cta: "Купить пакет",
    featured: true,
    badge: "Лучшая цена",
  },
  {
    name: "Профи",
    price: "2 499 ₽",
    generations: 120,
    perGen: "21 ₽",
    planId: "pro",
    features: ["120 генераций", "Разрешение до 4K", "Без водяных знаков", "Приоритетная обработка"],
    cta: "Купить пакет",
    featured: false,
    badge: null,
  },
]

const subIds = ["light", "pro", "unlimited"] as const

const subscriptions = [
  {
    name: "Light",
    price: "499 ₽",
    period: "в месяц",
    generations: 25,
    perGen: "20 ₽",
    planId: "light",
    features: ["25 генераций в месяц", "Разрешение до HD"],
    cta: "Оформить Light",
    featured: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "999 ₽",
    period: "в месяц",
    generations: 80,
    perGen: "12.5 ₽",
    planId: "pro",
    features: ["80 генераций в месяц", "Разрешение до 4K", "Без водяных знаков", "Приоритетная обработка"],
    cta: "Оформить Pro",
    featured: true,
    badge: "Выгоднее всех",
  },
  {
    name: "Unlimited",
    price: "2 499 ₽",
    period: "в месяц",
    generations: 150,
    perGen: "17 ₽",
    planId: "unlimited",
    features: ["150 генераций в месяц", "Разрешение до 4K", "Без водяных знаков", "Приоритетная обработка", "API-доступ"],
    cta: "Оформить Unlimited",
    featured: false,
    badge: null,
  },
]

export function Pricing() {
  const { data: session } = useSession()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(planId: string, isSubscription: boolean) {
    if (!session?.user) {
      signIn("google", { callbackUrl: "/#pricing" })
      return
    }

    setLoadingPlan(planId)
    try {
      const endpoint = isSubscription ? "/api/payment/create-subscription" : "/api/payment/create"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка оформления")

      if (data.url) {
        window.location.assign(data.url)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка при оплате")
    } finally {
      setLoadingPlan(null)
    }
  }

  const isLoading = (id: string) => loadingPlan === id

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Тарифы</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Простые и прозрачные цены
        </h2>
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-primary/30 bg-primary/5 px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold">
          <Gift className="size-4 text-primary" />
          3 бесплатные генерации при регистрации
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Попробуйте без оплаты — карта не нужна</p>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Package className="size-4 text-primary" />
          Пакеты
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Оплатите один раз — используйте когда удобно</p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((pack, i) => (
          <div
            key={pack.name}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              pack.featured
                ? "border-primary bg-card shadow-[0_0_0_1px_var(--primary)]"
                : "border-border bg-card"
            }`}
          >
            {pack.badge && (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {pack.badge}
              </span>
            )}
            <h3 className="text-base font-semibold">{pack.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-heading text-3xl font-semibold">{pack.price}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingDown className="size-3 text-primary" />
              <span>{pack.perGen} за генерацию</span>
            </div>
            <ul className="mt-4 flex flex-1 flex-col gap-2">
              {pack.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs">
                  <Check className="size-3.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              size="sm"
              variant={pack.featured ? "default" : "outline"}
              disabled={isLoading(pack.planId)}
              onClick={() => handleCheckout(pack.planId, false)}
            >
              {isLoading(pack.planId) ? <Loader2 className="size-4 animate-spin" /> : null}
              {pack.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <CreditCard className="size-4 text-primary" />
          Подписки
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Ежемесячные генерации — дешевле пакетов</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {subscriptions.map((sub) => (
          <div
            key={sub.name}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              sub.featured
                ? "border-primary bg-card shadow-[0_0_0_1px_var(--primary)]"
                : "border-border bg-card"
            }`}
          >
            {sub.badge && (
              <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {sub.badge}
              </span>
            )}
            <h3 className="text-lg font-semibold">{sub.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{sub.generations} генераций в месяц</p>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-heading text-4xl font-semibold">{sub.price}</span>
              <span className="text-sm text-muted-foreground">{sub.period}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingDown className="size-3 text-primary" />
              <span>{sub.perGen} за генерацию</span>
            </div>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {sub.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 w-full"
              variant={sub.featured ? "default" : "outline"}
              disabled={isLoading(sub.planId)}
              onClick={() => handleCheckout(sub.planId, true)}
            >
              {isLoading(sub.planId) ? <Loader2 className="size-4 animate-spin" /> : null}
              {sub.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
        <h3 className="text-lg font-semibold">Бизнес-подписка для магазинов</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Встройте AI-примерку в свой каталог. API, виджет, SLA и кастомные модели — индивидуальные условия.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <a href="#cta">Связаться с нами</a>
        </Button>
      </div>
    </section>
  )
}

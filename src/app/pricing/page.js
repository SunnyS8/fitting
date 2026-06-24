"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCheck, FaInfoCircle, FaStar, FaCrown, FaRocket } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CREDIT_PLANS = [
  { id: "basic", name: "Базовый", price: "$5", credits: 75, gens: "3 примерки", description: "Попробовать технологию — хватит на 3 генерации." },
  { id: "standard", name: "Стандарт", price: "$15", credits: 300, gens: "12 примерок", description: "Для регулярного использования.", popular: false },
  { id: "pro", name: "Профессиональный", price: "$35", credits: 875, gens: "35 примерок", description: "Лучшее соотношение цены и объёма.", popular: true },
  { id: "business", name: "Бизнес", price: "$90", credits: 3000, gens: "120 примерок", description: "Максимальный объём для агентств." },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "light", name: "Light", price: "$12", perMonth: "/мес",
    credits: "150 кредитов", gens: "6 генераций",
    features: ["150 кредитов ежемесячно", "HD качество", "История навсегда"],
  },
  {
    id: "pro", name: "Pro", price: "$29", perMonth: "/мес",
    credits: "600 кредитов", gens: "24 генерации",
    features: ["600 кредитов ежемесячно", "4K Ultra качество", "Приоритетная генерация", "История навсегда"],
    popular: true,
  },
  {
    id: "unlimited", name: "Unlimited", price: "$79", perMonth: "/мес",
    credits: "3000 кредитов", gens: "120 генераций",
    features: ["3000 кредитов ежемесячно", "4K Ultra качество", "Приоритетная генерация", "История навсегда", "Безлимитное хранение"],
  },
];

export default function Pricing() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadingSub, setLoadingSub] = useState(null);

  const handleCheckout = async (planId) => {
    if (status !== "authenticated") {
      toast.error("Войдите через Google для покупки.");
      return;
    }
    setLoadingPlan(planId);
    try {
      const { data } = await axios.post("/api/checkout", { planId });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || "Ошибка Stripe.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSubscription = async (subscriptionId) => {
    if (status !== "authenticated") {
      toast.error("Войдите через Google для оформления подписки.");
      return;
    }
    setLoadingSub(subscriptionId);
    try {
      const { data } = await axios.post("/api/stripe/subscription", { subscriptionId });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || "Ошибка Stripe. Price ID не настроен — создай продукты в Stripe Dashboard.");
    } finally {
      setLoadingSub(null);
    }
  };

  const userSub = session?.user?.subscriptionStatus === "active" ? session.user.subscriptionPlan : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page select-none text-primary-text overflow-hidden">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-16 overflow-y-auto scrollbar-subtle items-center">
        
        {/* ════ КРЕДИТНЫЕ ПАКЕТЫ ════ */}
        <section className="w-full flex flex-col items-center gap-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Купить кредиты</h1>
            <p className="text-xs sm:text-sm text-secondary-text max-w-lg leading-relaxed">
              Одноразовые пакеты — плати один раз, используй когда угодно. Кредиты не сгорают.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
            {CREDIT_PLANS.map((plan) => {
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-bg-card border rounded-lg p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isPopular ? "border-primary shadow-xl shadow-primary/5 scale-105" : "border-divider/50 shadow-md"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow flex items-center gap-1">
                      <FaStar className="text-[8px]" /> Популярное
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary-text">{plan.name}</h3>
                      <p className="text-2xl font-black tracking-tight text-white">{plan.price}</p>
                    </div>
                    
                    <div className="text-xs bg-bg-page/50 border border-divider/30 p-3 rounded text-center font-extrabold text-primary">
                      {plan.gens}
                    </div>

                    <p className="text-xs text-secondary-text leading-relaxed font-medium min-h-[3rem]">{plan.description}</p>
                    
                    <ul className="space-y-2 border-t border-divider/30 pt-4 text-xs font-semibold text-secondary-text">
                      <li className="flex items-center gap-2">
                        <FaCheck className="text-primary text-[10px]" />
                        <span>Динамические соотношения сторон</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheck className="text-primary text-[10px]" />
                        <span>Скачивание в HD</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheck className="text-primary text-[10px]" />
                        <span>Не сгорают</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer select-none active:scale-[0.98] ${
                      isPopular
                        ? "bg-primary text-white hover:bg-primary-hover shadow-primary/15"
                        : "bg-bg-page hover:bg-bg-card text-primary-text border border-divider"
                    }`}
                  >
                    {loadingPlan === plan.id ? "Загрузка..." : "Купить"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════ ПОДПИСКИ ════ */}
        <section className="w-full flex flex-col items-center gap-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <FaCrown className="text-primary text-xs" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Подписка</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">Оформить подписку</h2>
            <p className="text-xs sm:text-sm text-secondary-text max-w-lg leading-relaxed">
              Кредиты начисляются каждый месяц автоматически. Экономия до 40% по сравнению с одноразовыми пакетами.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isPopular = plan.popular;
              const isActive = userSub === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-bg-card border rounded-lg p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isPopular
                      ? "border-primary shadow-xl shadow-primary/5 scale-105 ring-1 ring-primary/30"
                      : "border-divider/50 shadow-md"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow flex items-center gap-1">
                      <FaRocket className="text-[8px]" /> Лучший выбор
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary-text">{plan.name}</h3>
                      <div className="flex items-baseline gap-0.5">
                        <p className="text-2xl font-black tracking-tight text-white">{plan.price}</p>
                        <p className="text-xs text-secondary-text font-semibold">{plan.perMonth}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs bg-bg-page/50 border border-divider/30 p-3 rounded text-center font-extrabold text-primary">
                      {plan.gens} в месяц
                    </div>

                    <ul className="space-y-2 text-xs font-semibold text-secondary-text">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FaCheck className="text-emerald-500 text-[10px]" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isActive ? (
                    <div className="w-full py-3 rounded-full text-xs font-bold text-center bg-emerald-950/30 border border-emerald-800/40 text-emerald-400">
                      ✓ Активна
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscription(plan.id)}
                      disabled={loadingSub !== null}
                      className={`w-full py-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer select-none active:scale-[0.98] ${
                        isPopular
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-500/15"
                          : "bg-bg-page hover:bg-bg-card text-primary-text border border-divider"
                      }`}
                    >
                      {loadingSub === plan.id ? "Загрузка..." : "Подписаться"}
                    </button>
                  )}

                  {plan.id === "pro" && (
                    <p className="text-[9px] text-center text-secondary-text font-medium -mt-3">
                      Экономия ~40% против одноразовых пакетов
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-secondary-text text-center max-w-md leading-relaxed">
            <FaInfoCircle className="inline mr-1 text-primary" />
            Подписки продлеваются автоматически каждый месяц. Кредиты начисляются в день продления.
            Отменить можно в любой момент в Stripe Customer Portal.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
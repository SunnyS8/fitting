"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCheck, FaInfoCircle, FaStar, FaCrown, FaRocket, FaCreditCard } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CREDIT_PLANS = [
  { id: "starter",  name: "Стартовый",  price: "199₽", credits: 125, gens: "5 примерок",     desc: "Попробовать технологию." },
  { id: "basic",    name: "Базовый",    price: "499₽", credits: 375, gens: "15 примерок",    desc: "Для регулярных примерок." },
  { id: "standard", name: "Стандарт",   price: "999₽", credits: 1000, gens: "40 примерок",   desc: "Оптимальный объём.", popular: true },
  { id: "pro",      name: "Профи",      price: "2499₽", credits: 3750, gens: "150 примерок", desc: "Максимум для профи." },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "light", name: "Light", price: "499₽", perMonth: "/мес",
    gens: "15 генераций", features: ["375 кредитов ежемесячно", "HD качество", "История навсегда"],
  },
  {
    id: "pro", name: "Pro", price: "999₽", perMonth: "/мес",
    gens: "50 генераций", features: ["1250 кредитов ежемесячно", "4K Ultra", "Приоритет", "История навсегда"],
    popular: true,
  },
  {
    id: "unlimited", name: "Unlimited", price: "2499₽", perMonth: "/мес",
    gens: "200 генераций", features: ["5000 кредитов ежемесячно", "4K Ultra", "Приоритет", "История", "Безлимит"],
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
      const { data } = await axios.post("/api/payment/create", { planId });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || "Ошибка оплаты.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSubscription = async (subscriptionId) => {
    if (status !== "authenticated") {
      toast.error("Войдите через Google для подписки.");
      return;
    }
    setLoadingSub(subscriptionId);
    try {
      const { data } = await axios.post("/api/stripe/subscription", { subscriptionId });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || "Ошибка. Настрой ЮKassa в личном кабинете.");
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-1">
              <FaCreditCard className="text-primary text-xs" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Кредиты</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Пополнить баланс</h1>
            <p className="text-xs sm:text-sm text-secondary-text max-w-lg leading-relaxed">
              Кредиты не сгорают. 1 генерация = 25 кредитов. Оплата картой или СБП через ЮKassa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
            {CREDIT_PLANS.map((plan) => {
              const isPopular = plan.popular;
              return (
                <div key={plan.id} className={`relative bg-bg-card border rounded-lg p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isPopular ? "border-primary shadow-xl shadow-primary/5 scale-105" : "border-divider/50 shadow-md"
                }`}>
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
                    <div className="text-xs bg-bg-page/50 border border-divider/30 p-3 rounded text-center font-extrabold text-primary">{plan.gens}</div>
                    <p className="text-xs text-secondary-text leading-relaxed font-medium min-h-[2.5rem]">{plan.desc}</p>
                    <ul className="space-y-2 border-t border-divider/30 pt-4 text-xs font-semibold text-secondary-text">
                      <li className="flex items-center gap-2"><FaCheck className="text-primary text-[10px]" /><span>Все соотношения сторон</span></li>
                      <li className="flex items-center gap-2"><FaCheck className="text-primary text-[10px]" /><span>Скачивание в HD</span></li>
                      <li className="flex items-center gap-2"><FaCheck className="text-primary text-[10px]" /><span>Кредиты не сгорают</span></li>
                    </ul>
                  </div>
                  <button onClick={() => handleCheckout(plan.id)} disabled={loadingPlan !== null}
                    className={`w-full py-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer select-none active:scale-[0.98] ${
                      isPopular ? "bg-primary text-white hover:bg-primary-hover shadow-primary/15" : "bg-bg-page hover:bg-bg-card text-primary-text border border-divider"
                    }`}>
                    {loadingPlan === plan.id ? "Загрузка..." : "Оплатить"}
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
              Кредиты начисляются каждый месяц. Выгоднее, чем покупать отдельно.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isPopular = plan.popular;
              const isActive = userSub === plan.id;
              return (
                <div key={plan.id} className={`relative bg-bg-card border rounded-lg p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isPopular ? "border-primary shadow-xl shadow-primary/5 scale-105 ring-1 ring-primary/30" : "border-divider/50 shadow-md"
                }`}>
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
                    <div className="text-xs bg-bg-page/50 border border-divider/30 p-3 rounded text-center font-extrabold text-primary">{plan.gens} / мес</div>
                    <ul className="space-y-2 text-xs font-semibold text-secondary-text">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FaCheck className="text-emerald-500 text-[10px]" /><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {isActive ? (
                    <div className="w-full py-3 rounded-full text-xs font-bold text-center bg-emerald-950/30 border border-emerald-800/40 text-emerald-400">✓ Активна</div>
                  ) : (
                    <button onClick={() => handleSubscription(plan.id)} disabled={loadingSub !== null}
                      className={`w-full py-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer select-none active:scale-[0.98] ${
                        isPopular ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-500/15" : "bg-bg-page hover:bg-bg-card text-primary-text border border-divider"
                      }`}>
                      {loadingSub === plan.id ? "Загрузка..." : "Подписаться"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-secondary-text text-center max-w-md leading-relaxed">
            <FaInfoCircle className="inline mr-1 text-primary" />
            Оплата через ЮKassa — карты Visa, Mastercard, МИР и СБП. Подписка продлевается автоматически каждый месяц.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
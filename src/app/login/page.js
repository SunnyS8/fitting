"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle, FaInfoCircle, FaMagic } from "react-icons/fa";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("callbackUrl") || searchParams.get("next") || "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.push(next);
    }
  }, [status, router, next]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-page px-6 text-primary-text select-none">
      <div className="relative bg-bg-card border border-divider w-full max-w-md rounded-2xl p-8 space-y-8 pastel-shadow-lg animate-scale-up">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400/80 flex items-center justify-center text-2xl text-white font-black shadow-md pastel-shadow-sm">
            <FaMagic className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary-text">Вход в студию</h2>
          <p className="text-xs font-semibold text-secondary-text leading-relaxed px-4">
            Войдите через Google, чтобы создавать примерки, сохранять историю и пополнять баланс кредитов.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: next })}
            className="w-full py-3.5 bg-white text-neutral-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all pastel-shadow-md active:scale-[0.98] cursor-pointer border border-divider/50"
          >
            <FaGoogle className="text-sm text-red-500" />
            <span>Продолжить с Google</span>
          </button>
        </div>

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 p-3.5 rounded-2xl text-[11px] leading-relaxed text-secondary-text">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            Входя в аккаунт, вы соглашаетесь с нашими Условиями использования. Все платежи защищены, кредиты начисляются автоматически.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-bg-page text-primary-text">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
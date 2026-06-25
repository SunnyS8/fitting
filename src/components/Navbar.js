"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import { FiLogOut, FiDollarSign, FiPlus, FiUser } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { SiVercel } from "react-icons/si";
import config from "@/lib/config";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const appName = config?.appName || "AI Примерка";
  const logoLetter = appName.trim().charAt(0).toUpperCase();

  const appMatch = pathname ? pathname.match(/^\/app\/([^\/]+)/) : null;
  const currentAppId = appMatch ? appMatch[1] : null;

  const navLinks = currentAppId
    ? [
        { name: "Студия", path: `/app/${currentAppId}` },
        { name: "Галерея", path: `/app/${currentAppId}/gallery` },
        { name: "Тарифы", path: `/app/${currentAppId}/pricing` },
      ]
    : [
        { name: "Студия", path: "/" },
        { name: "Галерея", path: "/dashboard" },
        { name: "Тарифы", path: "/pricing" },
      ];

  const isSubscribed = session?.user?.subscriptionStatus === "active";
  const subPlan = session?.user?.subscriptionPlan;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-divider/60 pastel-shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 text-white font-extrabold text-lg shadow-md pastel-shadow-sm">
            {logoLetter}
          </div>
          <span className="text-lg font-extrabold tracking-tight text-primary-text text-nowrap">
            {appName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[13px] font-bold transition-all relative py-1 ${
                  isActive ? "text-primary" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://vercel.com/new/clone?repository-url=https://github.com/SunnyS8/fitting"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-divider px-4 py-1.5 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-bg-card-hover transition-colors shadow-sm"
          >
            <SiVercel className="text-xs text-neutral-700" />
            <span>На Vercel</span>
          </a>

          {status === "authenticated" ? (
            <div className="flex items-center">
              {isSubscribed && (
                <div className="flex items-center h-9 border border-divider bg-rose-50/40 px-3 text-[11px] font-bold text-rose-500 gap-1 rounded-l-xl">
                  <FaCrown className="text-rose-400 text-xs" />
                  <span>{subPlan === "unlimited" ? "Unlimited" : subPlan === "pro" ? "Pro" : "Light"}</span>
                </div>
              )}

              <div className={`flex items-center h-9 border border-divider bg-bg-card/40 overflow-hidden ${isSubscribed ? "border-l-0" : "rounded-l-xl"}`}>
                <span className="font-bold text-[13px] px-3 flex items-center text-primary-text gap-1">
                  <FiDollarSign className="text-rose-400 text-xs" />
                  {session.user.credits !== undefined ? session.user.credits : 0}
                </span>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-bg-card-hover text-secondary-text transition-colors"
                >
                  <FiPlus size={14} />
                </Link>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="h-9 w-9 flex items-center justify-center border-y border-r border-divider rounded-r-xl bg-bg-card/40 hover:bg-bg-card transition-colors cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover border border-divider"
                    />
                  ) : (
                    <FiUser className="text-secondary-text" size={16} />
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded-2xl border border-divider bg-white p-1.5 shadow-lg z-[100] pastel-shadow-lg">
                    <div className="px-3 py-2 text-xs text-secondary-text border-b border-divider/50 mb-1 truncate">
                      {session.user.email}
                    </div>
                    {isSubscribed && (
                      <div className="px-3 py-1.5 text-[10px] text-rose-500 font-bold border-b border-divider/50 mb-1 flex items-center gap-1">
                        <FaCrown className="text-xs" /> Подписка {subPlan}
                      </div>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <FiLogOut size={14} />
                      <span>Выйти</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-5 py-1.5 rounded-full text-sm font-bold hover:from-pink-300 hover:to-rose-300 transition-all pastel-shadow-sm"
            >
              Войти
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {status === "authenticated" && (
            <div className="flex items-center h-8 border border-divider rounded-xl bg-bg-card/40 px-2.5 text-xs font-bold text-primary-text gap-0.5">
              <FiDollarSign className="text-rose-400 text-[10px]" />
              {session.user.credits !== undefined ? session.user.credits : 0}
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-bg-card-hover p-2 rounded-xl cursor-pointer transition-colors text-primary-text border border-divider/50"
            aria-label="Меню"
          >
            {isOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[200] glass-dropdown border-b border-divider shadow-2xl py-4 px-6 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-secondary-text tracking-widest mb-1">Навигация</span>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center py-2.5 rounded-xl text-sm font-bold transition-all ${
                  pathname === link.path ? "bg-primary/10 text-primary px-3 border border-primary/20" : "text-primary-text hover:bg-bg-card-hover"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isSubscribed && (
              <div className="flex items-center gap-2 py-1.5 text-xs font-bold text-rose-500 px-1">
                <FaCrown className="text-sm" /> Подписка {subPlan}
              </div>
            )}

            <div className="h-px bg-divider/50 my-2" />

            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/SunnyS8/fitting"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-divider py-3 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-bg-card-hover transition-all"
            >
              <SiVercel className="text-xs text-neutral-700" />
              <span>На Vercel</span>
            </a>

            {status === "authenticated" ? (
              <button
                onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/login" }); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-500 py-3 text-sm font-bold hover:bg-rose-100 transition-all border border-rose-200/60 mt-2"
              >
                <FiLogOut size={16} />
                <span>Выйти</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 text-sm font-bold hover:from-pink-300 hover:to-rose-300 transition-all pastel-shadow-sm mt-2"
              >
                Войти
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import { FiLogOut, FiDollarSign, FiPlus, FiUser, FiCrown } from "react-icons/fi";
import { SiVercel } from "react-icons/si";
import config from "@/lib/config";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const appName = config?.appName || "AI SaaS";
  const logoLetter = appName.trim().charAt(0).toUpperCase();

  useEffect(() => {}, []);

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
        { name: "Галерея", path: "/gallery" },
        { name: "Тарифы", path: "/pricing" },
      ];

  const isSubscribed = session?.user?.subscriptionStatus === "active";
  const subPlan = session?.user?.subscriptionPlan;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-divider/50 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand Title */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg shadow-md shadow-primary/30">
            {logoLetter}
          </div>
          <span className="text-lg font-black tracking-tight text-primary-text text-nowrap">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[13px] font-semibold transition-all relative py-1 ${
                  isActive ? "text-primary" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-[20px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions Section */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Vercel Deploy Button */}
          <a
            href="https://vercel.com/new/clone?repository-url=https://github.com/SunnyS8/fitting"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-divider px-4 py-1.5 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-bg-card transition-colors shadow-sm"
          >
            <SiVercel className="text-xs text-white" />
            <span>На Vercel</span>
          </a>

          {status === "authenticated" ? (
            <div className="flex items-center">
              {/* Subscription badge */}
              {isSubscribed && (
                <div className="flex items-center h-9 border border-divider bg-emerald-950/20 px-3 text-[11px] font-bold text-emerald-400 gap-1">
                  <FiCrown className="text-emerald-400 text-xs" />
                  <span>{subPlan === "unlimited" ? "Unlimited" : subPlan === "pro" ? "Pro" : "Light"}</span>
                </div>
              )}

              {/* Credit Balance */}
              <div className={`flex items-center h-9 border border-divider ${isSubscribed ? "" : "rounded-l"} bg-bg-page/30 overflow-hidden pr-2 ${isSubscribed ? "border-l-0" : ""}`}>
                <span className="font-bold text-[13px] px-3 flex items-center text-primary-text gap-1">
                  <FiDollarSign className="text-emerald-500 text-xs" />
                  {session.user.credits !== undefined ? session.user.credits : 0}
                </span>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-bg-card text-secondary-text transition-colors"
                >
                  <FiPlus size={14} />
                </Link>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="h-9 w-9 flex items-center justify-center border-y border-r border-divider rounded-r bg-bg-page/30 hover:bg-bg-page transition-colors cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-secondary-text" size={16} />
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded border border-divider bg-bg-card p-1 shadow-lg z-[100] animate-scale-up">
                    <div className="px-3 py-2 text-xs text-secondary-text border-b border-divider/50 mb-1 truncate">
                      {session.user.email}
                    </div>
                    {isSubscribed && (
                      <div className="px-3 py-1.5 text-[10px] text-emerald-400 font-bold border-b border-divider/50 mb-1 flex items-center gap-1">
                        <FiCrown size={12} /> Подписка {subPlan === "unlimited" ? "Unlimited" : subPlan === "pro" ? "Pro" : "Light"}
                      </div>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
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
              className="bg-primary text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
            >
              Войти
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {status === "authenticated" && (
            <div className="flex items-center h-8 border border-divider rounded bg-bg-page/30 px-2.5 text-xs font-bold text-primary-text gap-0.5">
              <FiDollarSign className="text-emerald-500 text-[10px]" />
              {session.user.credits !== undefined ? session.user.credits : 0}
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-bg-card p-2 rounded cursor-pointer transition-colors text-primary-text border border-divider/50"
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
                className={`flex items-center py-2.5 rounded text-sm font-semibold transition-all ${
                  pathname === link.path ? "bg-primary/10 text-primary px-3 border border-primary/20" : "text-primary-text hover:bg-bg-card"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isSubscribed && (
              <div className="flex items-center gap-2 py-1.5 text-xs font-bold text-emerald-400 px-1">
                <FiCrown size={14} /> Подписка {subPlan === "unlimited" ? "Unlimited" : subPlan === "pro" ? "Pro" : "Light"}
              </div>
            )}

            <div className="h-px bg-divider/50 my-2" />

            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/SunnyS8/fitting"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-divider py-3 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-bg-card transition-all"
            >
              <SiVercel className="text-xs text-white" />
              <span>На Vercel</span>
            </a>

            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded bg-red-500/10 text-red-500 py-3 text-sm font-bold hover:bg-red-500/20 transition-all border border-red-500/20 mt-2"
              >
                <FiLogOut size={16} />
                <span>Выйти</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded bg-primary text-white py-3 text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20 mt-2"
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
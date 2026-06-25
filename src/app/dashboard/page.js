"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  FaPlus, FaTrashAlt, FaEye, FaDownload, FaSpinner,
  FaGoogle, FaImages, FaCoins, FaCheck, FaExclamationTriangle, FaTshirt, FaTimes
} from "react-icons/fa";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tryons, setTryons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedTryOn, setSelectedTryOn] = useState(null);

  useEffect(() => {
    if (session?.user) {
      fetchTryOns();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    const hasProcessing = tryons.some(t => t.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/tryons");
        if (res.ok) {
          const data = await res.json();
          setTryons(data);
        }
      } catch (e) {
        console.error("Dashboard refresh error:", e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [tryons]);

  const fetchTryOns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tryons");
      if (res.ok) {
        const data = await res.json();
        setTryons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Вы уверены, что хотите удалить эту примерку? Это действие нельзя отменить.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tryons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTryons(p => p.filter(t => t.id !== id));
        if (selectedTryOn?.id === id) setSelectedTryOn(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (tryon) => {
    if (!tryon.resultImage) return;
    try {
      const response = await fetch(tryon.resultImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `tryon-${tryon.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(tryon.resultImage, "_blank");
    }
  };

  if (status === "loading" || (loading && tryons.length === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-page text-secondary-text">
        <FaSpinner className="animate-spin text-3xl text-primary mb-4" />
        <p className="text-sm font-bold">Загрузка галереи...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-page px-4 py-12">
        <div className="max-w-md w-full bg-bg-card border border-divider rounded-2xl p-8 text-center pastel-shadow-lg">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto mb-6 animate-float">
            <FaImages className="text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary-text tracking-tight mb-2">Моя галерея</h1>
          <p className="text-sm text-secondary-text leading-relaxed mb-8">
            Войдите в свой кабинет, просматривайте примерки и скачивайте фотореалистичные результаты.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 pastel-shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <FaGoogle className="text-xs" />
            <span>Войти через Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-page text-primary-text py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-primary-text tracking-tight">Мои примерки</h1>
            <p className="text-xs sm:text-sm text-secondary-text mt-1.5 font-medium">Просмотр, скачивание и удаление AI-примерок</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 text-white text-xs font-extrabold rounded-2xl pastel-shadow-sm transition-all w-fit cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaPlus className="text-[10px]" /> Создать примерку
          </Link>
        </div>

        {/* Empty state */}
        {tryons.length === 0 ? (
          <div className="bg-bg-card border border-divider rounded-2xl p-12 text-center pastel-shadow-md max-w-xl mx-auto my-12">
            <div className="h-16 w-16 bg-bg-elevated text-secondary-text border border-divider rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaTshirt className="text-3xl text-secondary-text" />
            </div>
            <h2 className="text-lg font-extrabold text-primary-text mb-2">Примерок пока нет</h2>
            <p className="text-sm text-secondary-text leading-relaxed max-w-sm mx-auto mb-8 font-medium">
              Вы ещё не создали ни одной примерки. Загрузите фото человека и одежды, чтобы начать!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 text-white text-sm font-extrabold rounded-2xl pastel-shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaPlus className="text-xs" /> Создать примерку
            </Link>
          </div>
        ) : (
          /* Tryons Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryons.map((tryon) => (
              <div
                key={tryon.id}
                className="bg-bg-card border border-divider rounded-2xl overflow-hidden pastel-shadow-sm hover:pastel-shadow-md hover:border-primary/30 transition-all flex flex-col h-full group"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] bg-bg-elevated border-b border-divider overflow-hidden flex items-center justify-center">
                  {tryon.status === "processing" ? (
                    <>
                      <img src={tryon.personImage} alt="Оригинал" className="w-full h-full object-cover blur-sm opacity-50" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 text-primary-text gap-2">
                        <FaSpinner className="animate-spin text-lg text-primary" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">Подгонка одежды...</span>
                      </div>
                    </>
                  ) : tryon.status === "failed" ? (
                    <>
                      <img src={tryon.personImage} alt="Оригинал" className="w-full h-full object-cover opacity-20 grayscale" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 text-rose-600 gap-1.5 p-4 text-center">
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">Ошибка</span>
                        <span className="text-[9px] text-secondary-text leading-tight font-medium">Ошибка при подгонке одежды</span>
                      </div>
                    </>
                  ) : (
                    <img src={tryon.resultImage} alt="Результат примерки" className="w-full h-full object-cover" />
                  )}

                  <span className="absolute top-3 left-3 text-[10px] font-bold text-primary bg-white/80 backdrop-blur-sm border border-divider px-2.5 py-1 rounded-full shadow-sm">
                    Соотношение: {tryon.aspectRatio}
                  </span>
                </div>

                {/* Info + Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2">Промпт AI</span>
                    <p className="text-[11px] text-primary-text font-medium italic line-clamp-2 bg-bg-elevated rounded-xl p-2.5 border border-divider mb-4">
                      &ldquo;{tryon.prompt}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={() => setSelectedTryOn(tryon)}
                      disabled={tryon.status !== "completed"}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-bg-card-hover border border-divider text-primary-text rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/30"
                    >
                      <FaEye className="text-[10px]" /> Просмотр
                    </button>
                    <button
                      onClick={() => handleDownload(tryon)}
                      disabled={tryon.status !== "completed"}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pastel-shadow-sm hover:from-pink-300 hover:to-rose-300"
                    >
                      <FaDownload className="text-[10px]" /> Скачать
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-bg-elevated border-t border-divider flex items-center justify-between text-[11px] text-secondary-text font-bold">
                  <span>
                    {new Date(tryon.createTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => handleDelete(tryon.id)}
                    disabled={deletingId === tryon.id}
                    className="text-secondary-text hover:text-rose-500 transition-colors flex items-center gap-1 font-bold disabled:opacity-50 cursor-pointer"
                    title="Удалить примерку"
                  >
                    {deletingId === tryon.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrashAlt />
                    )}
                    <span>Удалить</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Detail Modal ────────────────────── */}
        {selectedTryOn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white border border-divider rounded-2xl max-w-lg w-full p-5 sm:p-6 pastel-shadow-lg relative animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden max-h-[90vh]">
              
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-divider pb-3 mb-4 flex-shrink-0">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-primary-text flex items-center gap-2">
                    <span>Результат примерки</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                      {selectedTryOn.aspectRatio}
                    </span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTryOn(null)}
                  className="text-secondary-text hover:text-primary-text font-bold text-sm p-1.5 hover:bg-bg-card-hover rounded-xl transition-all cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 relative select-none">
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-divider bg-bg-card pastel-shadow-sm select-none max-h-[60vh] max-w-sm">
                  <img
                    src={selectedTryOn.resultImage}
                    alt="Результат примерки"
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md border border-divider p-2.5 rounded-2xl flex flex-col gap-1.5 z-20 shadow-lg max-w-[100px]">
                    <div className="text-[8px] font-bold text-secondary-text uppercase tracking-wider">Исходные фото</div>
                    <div className="flex gap-1.5">
                      <div className="h-8 w-6 rounded-lg overflow-hidden border border-divider bg-bg-card">
                        <img src={selectedTryOn.personImage} alt="Фото" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-8 w-6 rounded-lg overflow-hidden border border-divider bg-bg-card">
                        <img src={selectedTryOn.clothesImage} alt="Одежда" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md border border-divider text-primary text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-20">
                    Результат
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-divider pt-4 mt-4 flex justify-between items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => handleDelete(selectedTryOn.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-200/60 flex items-center gap-1.5"
                >
                  <FaTrashAlt className="text-[10px]" /> Удалить
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedTryOn)}
                    className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 text-white rounded-xl text-xs font-bold pastel-shadow-sm transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
                  >
                    <FaDownload className="text-[10px]" /> Скачать
                  </button>
                  <button
                    onClick={() => setSelectedTryOn(null)}
                    className="px-4 py-2 bg-bg-card-hover border border-divider text-primary-text rounded-xl text-xs font-bold transition-all cursor-pointer hover:border-primary/30"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
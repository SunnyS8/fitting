"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  FaUpload, FaSpinner, FaMagic, FaDownload,
  FaTshirt, FaCoins, FaGoogle, FaUser, FaCheck, FaExclamationTriangle, FaTimes, FaChevronDown
} from "react-icons/fa";
import clsx from "clsx";

const ASPECT_RATIOS = [
  { id: "auto", name: "Авто", desc: "Исходные пропорции" },
  { id: "1:1", name: "1:1", desc: "Квадрат (1024x1024)" },
  { id: "9:16", name: "9:16", desc: "История / Портрет" },
  { id: "3:4", name: "3:4", desc: "Стандартный портрет" },
  { id: "4:3", name: "4:3", desc: "Пейзаж" },
  { id: "16:9", name: "16:9", desc: "Широкий экран" },
];

const DEFAULT_PROMPT = "Создай фотореалистичную виртуальную примерку: человек одет в одежду с предоставленного фото одежды. Сохрани лицо, телосложение, позу, тон кожи, волосы и черты лица без изменений. Одежда должна сидеть естественно, с соответствующим освещением, складками, тенями и драпировкой, в высоком разрешении.";

export default function StudioPage() {
  const { data: session, update: updateSession } = useSession();

  // Selected state
  const [personImage, setPersonImage] = useState("");
  const [clothesImage, setClothesImage] = useState("");
  const [aspectRatio, setAspectRatio] = useState("auto");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [resultImage, setResultImage] = useState("");

  // Dropdown toggles
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Upload/Status states
  const [isUploadingPerson, setIsUploadingPerson] = useState(false);
  const [isUploadingClothes, setIsUploadingClothes] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState(""); // "", "generating", "success", "error"
  const [generatingError, setGeneratingError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tryonId, setTryonId] = useState("");

  const timerIntervalRef = useRef(null);

  // Load saved try-on if ID query parameter is present on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedId = params.get("id");

    if (savedId) {
      const loadSavedTryOn = async () => {
        try {
          const res = await fetch(`/api/tryons?id=${savedId}`);
          if (res.ok) {
            const data = await res.json();
            setPersonImage(data.personImage);
            setClothesImage(data.clothesImage);
            setResultImage(data.resultImage);
            setTryonId(data.id);
            setAspectRatio(data.aspectRatio);
            setPrompt(data.prompt);
          }
        } catch (e) {
          console.error("Error loading saved tryon:", e);
        }
      };
      loadSavedTryOn();
    }
  }, []);

  // Timer logic for generation
  useEffect(() => {
    if (generatingStatus === "generating") {
      setElapsedSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [generatingStatus]);

  // Click outside to close custom dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsRatioDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "person") setIsUploadingPerson(true);
    else setIsUploadingClothes(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (type === "person") {
        setPersonImage(data.url);
        setResultImage("");
      } else {
        setClothesImage(data.url);
        setResultImage("");
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить изображение. Попробуйте снова.");
    } finally {
      if (type === "person") setIsUploadingPerson(false);
      else setIsUploadingClothes(false);
    }
  };

  const handleTryOnSubmit = async () => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    if (!personImage || !clothesImage) {
      setGeneratingError("Загрузите фото человека и фото одежды.");
      setGeneratingStatus("error");
      return;
    }

    setGeneratingStatus("generating");
    setGeneratingError("");
    setResultImage("");

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImage,
          clothesImage,
          aspectRatio,
          prompt
        })
      });

      if (res.status === 402) {
        setGeneratingError("Недостаточно кредитов. Пополните баланс на странице тарифов.");
        setGeneratingStatus("error");
        return;
      }

      if (!res.ok) {
        throw new Error("Generation request failed");
      }

      const data = await res.json();

      // Trigger session update to show new credit balance
      updateSession();

      if (data.status === "completed" && data.resultImage) {
        setResultImage(data.resultImage);
        setTryonId(data.tryonId);
        setGeneratingStatus("success");
      } else {
        pollTryOnResult(data.tryonId);
      }
    } catch (err) {
      console.error(err);
      setGeneratingError("Произошла ошибка при генерации. Попробуйте снова.");
      setGeneratingStatus("error");
    }
  };

  const pollTryOnResult = async (id) => {
    let completed = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!completed && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      attempts++;

      try {
        const res = await fetch(`/api/tryons?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed" && data.resultImage) {
            setResultImage(data.resultImage);
            setTryonId(data.id);
            setGeneratingStatus("success");
            completed = true;
          } else if (data.status === "failed") {
            setGeneratingError("AI не удалось выполнить примерку. Проверьте фото и попробуйте снова.");
            setGeneratingStatus("error");
            completed = true;
          }
        }
      } catch (err) {
        console.error("Error polling database status:", err);
      }
    }

    if (!completed) {
      setGeneratingError("Генерация занимает больше времени. Она завершится в фоне и появится в галерее.");
      setGeneratingStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tryon_${tryonId || Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(resultImage, "_blank");
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden overflow-y-auto bg-zinc-950 text-zinc-100 font-sans">
      {/* ─── LEFT PANEL: STUDIO OPTIONS ────────────────────────────────────────── */}
      <div className="w-full md:w-[420px] border-r border-zinc-700 bg-zinc-900/60 flex flex-col md:overflow-y-auto overflow-visible flex-shrink-0">
        <div className="p-5 border-b border-zinc-700 flex-shrink-0 bg-zinc-900/80">
          <h1 className="text-lg font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
            <FaTshirt className="text-violet-400" /> Виртуальная примерочная
          </h1>
          <p className="text-xs text-zinc-200 mt-1.5 font-medium">Загрузите фото, настройте промпт и примерите одежду за секунды с помощью AI.</p>
        </div>

        <div className="p-5 space-y-6 flex-1 bg-zinc-900/30">
          {/* 1. Dual Image Dropzones */}
          <div className="flex items-center gap-3 w-full">
            {/* Person upload */}
            <div className="w-full">
              <label className="block text-[11px] font-black text-zinc-200 uppercase tracking-wider mb-2">
                1. Фото человека
              </label>
              <div className="relative group border border-dashed border-zinc-600 rounded overflow-hidden bg-zinc-950 hover:border-violet-400 transition-all duration-200">
                {personImage ? (
                  <div className="relative aspect-[4/3] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={personImage} alt="Фото человека" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setPersonImage("");
                        setResultImage("");
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 hover:text-red-400 border border-zinc-700 cursor-pointer"
                      title="Очистить"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 text-center cursor-pointer aspect-[4/3]">
                    {isUploadingPerson ? (
                      <FaSpinner className="animate-spin text-xl text-violet-400 mb-2" />
                    ) : (
                      <FaUpload className="text-zinc-400 mb-2 group-hover:text-violet-400 transition-colors" />
                    )}
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                      {isUploadingPerson ? "Загрузка..." : "Нажмите или перетащите фото"}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold mt-1">PNG, JPG до 10MB</span>
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "person")} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Clothes upload */}
            <div className="w-full">
              <label className="block text-[11px] font-black text-zinc-200 uppercase tracking-wider mb-2">
                2. Фото одежды
              </label>
              <div className="relative group border border-dashed border-zinc-600 rounded overflow-hidden bg-zinc-950 hover:border-fuchsia-400 transition-all duration-200">
                {clothesImage ? (
                  <div className="relative aspect-[4/3] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={clothesImage} alt="Фото одежды" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setClothesImage("");
                        setResultImage("");
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 hover:text-red-400 border border-zinc-700 cursor-pointer"
                      title="Очистить"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 text-center cursor-pointer aspect-[4/3]">
                    {isUploadingClothes ? (
                      <FaSpinner className="animate-spin text-xl text-fuchsia-400 mb-2" />
                    ) : (
                      <FaUpload className="text-zinc-400 mb-2 group-hover:text-fuchsia-400 transition-colors" />
                    )}
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                      {isUploadingClothes ? "Загрузка..." : "Нажмите или перетащите фото"}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold mt-1">PNG, JPG до 10MB</span>
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "clothes")} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 2. Custom Aspect Ratio Dropdown */}
          <div ref={dropdownRef}>
            <label className="block text-[11px] font-black text-zinc-200 uppercase tracking-wider mb-2.5">
              3. Соотношение сторон
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRatioDropdownOpen(!isRatioDropdownOpen)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-4 py-3.5 text-left text-xs font-extrabold text-white hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 flex justify-between items-center cursor-pointer transition-all"
              >
                <span>
                  {ASPECT_RATIOS.find(r => r.id === aspectRatio)?.name} ({aspectRatio})
                </span>
                <FaChevronDown className={clsx("text-zinc-300 text-[10px] transition-transform duration-200", isRatioDropdownOpen && "transform rotate-180")} />
              </button>

              {isRatioDropdownOpen && (
                <div className="absolute z-30 bottom-full mb-1 w-full bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-72 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isSelected = aspectRatio === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => {
                          setAspectRatio(ratio.id);
                          setIsRatioDropdownOpen(false);
                        }}
                        className={clsx(
                          "w-full text-left px-4 py-2.5 text-xs transition-colors flex justify-between items-center cursor-pointer",
                          isSelected
                            ? "bg-violet-650/30 text-white font-extrabold border-l-2 border-violet-500"
                            : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
                        )}
                      >
                        <div>
                          <div className="font-bold">{ratio.name}</div>
                          <div className="text-[9px] text-zinc-400 mt-0.5">{ratio.desc}</div>
                        </div>
                        {isSelected && <FaCheck className="text-violet-400 text-xs" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. AI Text Prompt */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-black text-zinc-200 uppercase tracking-wider">
                4. Промпт для AI
              </label>
              <button
                onClick={() => setPrompt(DEFAULT_PROMPT)}
                className="text-[9px] font-black text-violet-400 hover:text-violet-300 cursor-pointer"
                type="button"
              >
                Сбросить
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2.5 text-xs font-medium text-white placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/85 resize-none transition-all leading-normal"
              placeholder="Опишите детали примерки..."
            />
          </div>
        </div>

        {/* Action Trigger footer CTA */}
        <div className="p-5 border-t border-zinc-700 bg-zinc-900 flex-shrink-0 space-y-3">
          <button
            onClick={handleTryOnSubmit}
            disabled={generatingStatus === "generating" || isUploadingPerson || isUploadingClothes}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded py-3.5 text-xs font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10 active:scale-[0.99]"
          >
            {generatingStatus === "generating" ? (
              <>
                <FaSpinner className="animate-spin text-xs text-white" />
                <span>Создание... ({elapsedSeconds}s)</span>
              </>
            ) : (
              <>
                <FaMagic className="text-xs text-white animate-pulse" />
                <span>{session?.user ? "Создать примерку" : "Войдите, чтобы создать"}</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-between text-[9px] font-black text-zinc-300 px-1">
            <span>Стоимость: 18 кредитов</span>
            <span className="flex items-center gap-1 text-amber-300 bg-amber-955/20 border border-amber-800/40 rounded px-2 py-0.5 font-bold">
              <FaCoins /> Списание в реальном времени
            </span>
          </div>

          {generatingStatus === "error" && (
            <p className="text-[10px] text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2 flex items-start gap-2 shadow-inner">
              <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{generatingError}</span>
            </p>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL: PREVIEW OUTPUT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:overflow-hidden bg-zinc-950">
        {/* Preview Toolbar */}
        <div className="px-5 py-3.5 bg-zinc-900/40 border-b border-zinc-700 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">Результат примерки</h2>
            <p className="text-[10px] text-zinc-300 mt-1 font-medium">Просмотр готового результата виртуальной примерки</p>
          </div>
          {resultImage && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-zinc-900 border border-zinc-700 px-3.5 py-2 rounded hover:bg-zinc-800 hover:border-zinc-500 transition-all cursor-pointer"
            >
              <FaDownload className="text-[10px]" /> Скачать
            </button>
          )}
        </div>

        {/* Interactive Preview panel */}
        <div className="flex-1 p-5 flex flex-col justify-center items-center overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="relative w-full aspect-[4/5] rounded overflow-hidden border border-zinc-700 bg-zinc-950 shadow-2xl flex items-center justify-center max-h-[75vh]">
            
            {resultImage ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultImage}
                  alt="Результат примерки"
                  className="w-full h-full object-cover"
                />

                {/* Floating Inputs Badge for visual reference */}
                {personImage && clothesImage && (
                  <div className="absolute bottom-4 right-4 bg-zinc-900 border border-zinc-700/80 p-2.5 rounded flex flex-col gap-1.5 z-20 shadow-xl max-w-[130px]">
                    <div className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">Исходные фото</div>
                    <div className="flex gap-1.5">
                      <div className="h-10 w-8 rounded overflow-hidden border border-zinc-700 bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={personImage} alt="Фото человека" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-10 w-8 rounded overflow-hidden border border-zinc-700 bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={clothesImage} alt="Фото одежды" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : generatingStatus === "generating" ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950 text-zinc-200">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-violet-500 animate-spin" />
                  <FaTshirt className="absolute text-xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 animate-bounce" />
                </div>
                <p className="text-sm font-heading font-black text-white">Подгонка одежды...</p>
                <p className="text-xs text-zinc-300 mt-2.5 max-w-xs leading-relaxed font-medium">
                  AI-агент обрабатывает изображение: накладывает текстуру одежды, подгоняет тени и складки. Примерное время: 10–15 секунд.
                </p>
              </div>
            ) : (
              personImage || clothesImage ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6 w-full h-full max-h-[70vh]">
                  {personImage && (
                    <div className="flex flex-col items-center gap-2 max-w-[200px] w-full">
                      <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Вы</div>
                      <div className="aspect-[4/5] w-full rounded overflow-hidden border border-zinc-700 bg-zinc-900 shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={personImage} alt="Превью человека" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {clothesImage && (
                    <div className="flex flex-col items-center gap-2 max-w-[200px] w-full">
                      <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Одежда</div>
                      <div className="aspect-[4/5] w-full rounded overflow-hidden border border-zinc-700 bg-zinc-900 shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={clothesImage} alt="Превью одежды" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {(!personImage || !clothesImage) && (
                    <div className="flex flex-col justify-center text-center p-4">
                      <p className="text-xs text-zinc-300 mt-1.5 max-w-[150px] leading-relaxed font-bold">
                        {!personImage ? "Загрузите фото человека" : "Загрузите фото одежды"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950 text-zinc-300">
                  <p className="text-sm font-bold text-white">Фото не загружены</p>
                  <p className="text-xs text-zinc-300 mt-1.5 font-medium">Загрузите фото человека и одежды в левой панели, чтобы начать</p>
                </div>
              )
            )}

            {/* Status indicators */}
            {resultImage && (
              <div className="absolute top-4 left-4 bg-zinc-950 border border-zinc-700 text-violet-400 text-[9px] font-black px-2.5 py-1 rounded z-20 shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                <span>Результат</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
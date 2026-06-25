"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  FaUpload, FaSpinner, FaMagic, FaDownload,
  FaTshirt, FaCoins, FaGoogle, FaCheck, FaExclamationTriangle, FaTimes, FaChevronDown
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

  const [personImage, setPersonImage] = useState("");
  const [clothesImage, setClothesImage] = useState("");
  const [aspectRatio, setAspectRatio] = useState("auto");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [resultImage, setResultImage] = useState("");

  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isUploadingPerson, setIsUploadingPerson] = useState(false);
  const [isUploadingClothes, setIsUploadingClothes] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [generatingError, setGeneratingError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tryonId, setTryonId] = useState("");

  const timerIntervalRef = useRef(null);

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

  const selectedRatio = ASPECT_RATIOS.find(r => r.id === aspectRatio);

  return (
    <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden overflow-y-auto bg-bg-page text-primary-text font-sans">
      {/* ─── LEFT PANEL ────────────────────────────────────────── */}
      <div className="w-full md:w-[420px] border-r border-divider bg-bg-card/30 flex flex-col md:overflow-y-auto overflow-visible flex-shrink-0">
        <div className="p-5 border-b border-divider flex-shrink-0 bg-bg-card/40 rounded-tr-2xl">
          <h1 className="text-lg font-extrabold tracking-tight text-primary-text flex items-center gap-2">
            <FaTshirt className="text-primary" /> Виртуальная примерочная
          </h1>
          <p className="text-xs text-secondary-text mt-1.5 font-medium">
            Загрузите фото, настройте промпт — AI примерит одежду за секунды.
          </p>
        </div>

        <div className="p-5 space-y-6 flex-1">
          {/* Dual Image Uploads */}
          <div className="flex items-center gap-3 w-full">
            <div className="w-full">
              <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-2">
                1. Фото человека
              </label>
              <div className="relative group border-2 border-dashed border-divider rounded-2xl overflow-hidden bg-bg-card hover:border-primary/50 transition-all duration-200 pastel-shadow-sm">
                {personImage ? (
                  <div className="relative aspect-[4/3] w-full">
                    <img src={personImage} alt="Фото человека" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPersonImage(""); setResultImage(""); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-secondary-text hover:text-rose-400 border border-divider cursor-pointer shadow-sm"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 text-center cursor-pointer aspect-[4/3]">
                    {isUploadingPerson ? (
                      <FaSpinner className="animate-spin text-xl text-primary mb-2" />
                    ) : (
                      <FaUpload className="text-secondary-text mb-2 group-hover:text-primary transition-colors" />
                    )}
                    <span className="text-xs font-bold text-primary-text group-hover:text-primary transition-colors">
                      {isUploadingPerson ? "Загрузка..." : "Нажмите или перетащите"}
                    </span>
                    <span className="text-[9px] text-secondary-text font-medium mt-1">PNG, JPG до 10MB</span>
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "person")} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-2">
                2. Фото одежды
              </label>
              <div className="relative group border-2 border-dashed border-divider rounded-2xl overflow-hidden bg-bg-card hover:border-rose-300 transition-all duration-200 pastel-shadow-sm">
                {clothesImage ? (
                  <div className="relative aspect-[4/3] w-full">
                    <img src={clothesImage} alt="Фото одежды" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setClothesImage(""); setResultImage(""); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-secondary-text hover:text-rose-400 border border-divider cursor-pointer shadow-sm"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 text-center cursor-pointer aspect-[4/3]">
                    {isUploadingClothes ? (
                      <FaSpinner className="animate-spin text-xl text-rose-400 mb-2" />
                    ) : (
                      <FaUpload className="text-secondary-text mb-2 group-hover:text-rose-400 transition-colors" />
                    )}
                    <span className="text-xs font-bold text-primary-text group-hover:text-rose-400 transition-colors">
                      {isUploadingClothes ? "Загрузка..." : "Нажмите или перетащите"}
                    </span>
                    <span className="text-[9px] text-secondary-text font-medium mt-1">PNG, JPG до 10MB</span>
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "clothes")} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Aspect Ratio Dropdown */}
          <div ref={dropdownRef}>
            <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider mb-2.5">
              3. Соотношение сторон
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRatioDropdownOpen(!isRatioDropdownOpen)}
                className="w-full bg-bg-card border border-divider rounded-2xl px-4 py-3.5 text-left text-xs font-bold text-primary-text hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 flex justify-between items-center cursor-pointer transition-all pastel-shadow-sm"
              >
                <span>{selectedRatio?.name} ({aspectRatio})</span>
                <FaChevronDown className={clsx("text-secondary-text text-[10px] transition-transform duration-200", isRatioDropdownOpen && "transform rotate-180")} />
              </button>

              {isRatioDropdownOpen && (
                <div className="absolute z-30 bottom-full mb-1 w-full bg-bg-elevated border border-divider rounded-2xl shadow-lg max-h-72 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1 duration-150 pastel-shadow-lg">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isSelected = aspectRatio === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => { setAspectRatio(ratio.id); setIsRatioDropdownOpen(false); }}
                        className={clsx(
                          "w-full text-left px-4 py-2.5 text-xs transition-colors flex justify-between items-center cursor-pointer",
                          isSelected
                            ? "bg-primary/10 text-primary font-extrabold border-l-2 border-primary"
                            : "text-primary-text hover:bg-bg-card-hover"
                        )}
                      >
                        <div>
                          <div className="font-bold">{ratio.name}</div>
                          <div className="text-[9px] text-secondary-text mt-0.5">{ratio.desc}</div>
                        </div>
                        {isSelected && <FaCheck className="text-primary text-xs" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                4. Промпт для AI
              </label>
              <button
                onClick={() => setPrompt(DEFAULT_PROMPT)}
                className="text-[9px] font-bold text-primary hover:text-primary-hover cursor-pointer"
                type="button"
              >
                Сбросить
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-bg-card border border-divider rounded-2xl px-3 py-2.5 text-xs font-medium text-primary-text placeholder-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all leading-normal"
              placeholder="Опишите детали примерки..."
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-divider bg-bg-card/40 flex-shrink-0 space-y-3 rounded-bl-2xl">
          <button
            onClick={handleTryOnSubmit}
            disabled={generatingStatus === "generating" || isUploadingPerson || isUploadingClothes}
            className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 text-white rounded-2xl py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer pastel-shadow-md active:scale-[0.98]"
          >
            {generatingStatus === "generating" ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Создание... ({elapsedSeconds}s)</span>
              </>
            ) : (
              <>
                <FaMagic className="text-xs" />
                <span>{session?.user ? "Создать примерку" : "Войдите, чтобы создать"}</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-between text-[9px] font-bold text-secondary-text px-1">
            <span>Стоимость: 18 кредитов</span>
            <span className="flex items-center gap-1 text-rose-500 bg-rose-50/50 border border-rose-200/60 rounded-full px-2.5 py-0.5 font-bold">
              <FaCoins /> Списание в реальном времени
            </span>
          </div>

          {generatingStatus === "error" && (
            <p className="text-[10px] text-rose-600 bg-rose-50/50 border border-rose-200/60 rounded-2xl px-3 py-2 flex items-start gap-2">
              <FaExclamationTriangle className="text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{generatingError}</span>
            </p>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL: PREVIEW ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:overflow-hidden bg-bg-page">
        {/* Toolbar */}
        <div className="px-5 py-3.5 bg-bg-card/40 border-b border-divider flex items-center justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-extrabold text-primary-text tracking-tight leading-none">Результат примерки</h2>
            <p className="text-[10px] text-secondary-text mt-1 font-medium">Просмотр готового результата</p>
          </div>
          {resultImage && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-bold text-primary-text bg-bg-card border border-divider px-3.5 py-2 rounded-2xl hover:bg-bg-card-hover hover:border-primary/30 transition-all cursor-pointer pastel-shadow-sm"
            >
              <FaDownload className="text-[10px]" /> Скачать
            </button>
          )}
        </div>

        {/* Preview panel */}
        <div className="flex-1 p-5 flex flex-col justify-center items-center overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-divider bg-bg-card flex items-center justify-center max-h-[75vh] pastel-shadow-md">
            
            {resultImage ? (
              <div className="relative w-full h-full">
                <img
                  src={resultImage}
                  alt="Результат примерки"
                  className="w-full h-full object-cover"
                />

                {personImage && clothesImage && (
                  <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md border border-divider p-2.5 rounded-2xl flex flex-col gap-1.5 z-20 shadow-lg max-w-[130px]">
                    <div className="text-[8px] font-bold text-secondary-text uppercase tracking-wider">Исходные фото</div>
                    <div className="flex gap-1.5">
                      <div className="h-10 w-8 rounded-lg overflow-hidden border border-divider bg-bg-card">
                        <img src={personImage} alt="Фото человека" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-10 w-8 rounded-lg overflow-hidden border border-divider bg-bg-card">
                        <img src={clothesImage} alt="Фото одежды" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : generatingStatus === "generating" ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-bg-card text-primary-text">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-primary animate-spin" />
                  <FaTshirt className="absolute text-xl text-primary animate-float" />
                </div>
                <p className="text-sm font-extrabold text-primary-text">Подгонка одежды...</p>
                <p className="text-xs text-secondary-text mt-2.5 max-w-xs leading-relaxed font-medium">
                  AI-агент обрабатывает изображение: накладывает текстуру одежды, подгоняет тени и складки. Примерное время: 10–15 секунд.
                </p>
              </div>
            ) : (
              personImage || clothesImage ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6 w-full h-full max-h-[70vh]">
                  {personImage && (
                    <div className="flex flex-col items-center gap-2 max-w-[200px] w-full">
                      <div className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">Вы</div>
                      <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden border border-divider bg-bg-card shadow-sm">
                        <img src={personImage} alt="Превью человека" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {clothesImage && (
                    <div className="flex flex-col items-center gap-2 max-w-[200px] w-full">
                      <div className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">Одежда</div>
                      <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden border border-divider bg-bg-card shadow-sm">
                        <img src={clothesImage} alt="Превью одежды" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {(!personImage || !clothesImage) && (
                    <div className="flex flex-col justify-center text-center p-4">
                      <p className="text-xs text-secondary-text mt-1.5 max-w-[150px] leading-relaxed font-bold">
                        {!personImage ? "Загрузите фото человека" : "Загрузите фото одежды"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-bg-card text-primary-text">
                  <p className="text-sm font-bold text-primary-text">Фото не загружены</p>
                  <p className="text-xs text-secondary-text mt-1.5 font-medium">Загрузите фото человека и одежды в левой панели, чтобы начать</p>
                </div>
              )
            )}

            {resultImage && (
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md border border-divider text-primary text-[9px] font-bold px-2.5 py-1 rounded-full z-20 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Результат</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
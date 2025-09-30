import React, { useRef, useState } from "react";
import { removeBackground, enhanceQuality } from "../gemini";

type Props = {
  language: string;
  originalImage: string | null;
  setOriginalImage: (v: string | null) => void;
  modifiedImage: string | null;
  setModifiedImage: (v: string | null) => void;
  width: number;
  setWidth: (n: number) => void;
  height: number;
  setHeight: (n: number) => void;
};

const ImageResizer: React.FC<Props> = ({
  language,
  originalImage,
  setOriginalImage,
  modifiedImage,
  setModifiedImage,
  width,
  setWidth,
  height,
  setHeight,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // — رفع صورة —
  const onPickImage = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setModifiedImage(null);
      setError(null);
    };
    reader.readAsDataURL(f);
  };

  // — إزالة الخلفية عبر Gemini —
  const handleRemoveBg = async () => {
    if (!originalImage) return;
    try {
      setLoading(true);
      setError(null);
      const { dataUrl } = await removeBackground(originalImage);
      setModifiedImage(dataUrl);
    } catch (e: any) {
      setError(e?.message || "فشل في إزالة الخلفية. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // — تحسين الجودة عبر Gemini —
  const handleEnhance = async () => {
    if (!originalImage) return;
    try {
      setLoading(true);
      setError(null);
      const { dataUrl } = await enhanceQuality(originalImage);
      setModifiedImage(dataUrl);
    } catch (e: any) {
      setError(e?.message || "فشل في تحسين الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // — تغيير الحجم (محليًا في المتصفح) —
  const handleResize = async () => {
    if (!originalImage) return;
    try {
      setLoading(true);
      setError(null);

      const img = new Image();
      img.src = originalImage;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported.");

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/png");
      setModifiedImage(dataUrl);
    } catch (e: any) {
      setError(e?.message || "فشل في تغيير الحجم.");
    } finally {
      setLoading(false);
    }
  };

  // — تنزيل الصورة المعدّلة —
  const handleDownload = () => {
    if (!modifiedImage) return;
    const a = document.createElement("a");
    a.href = modifiedImage;
    a.download = "edited.png";
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* المعدّلة */}
      <section className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
        <h2 className="text-center text-cyan-300 mb-3">
          {language === "ar" ? "الصورة المعدلة" : "Edited Image"}
        </h2>
        <div className="aspect-video bg-slate-900/60 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden">
          {modifiedImage ? (
            <img src={modifiedImage} alt="edited" className="w-full h-full object-contain" />
          ) : (
            <span className="text-slate-500">
              {language === "ar" ? "ستظهر الصورة المعدلة هنا" : "Edited image will appear here"}
            </span>
          )}
        </div>

        <div className="mt-3">
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-2 rounded-md"
            onClick={handleDownload}
            disabled={!modifiedImage}
          >
            {language === "ar" ? "تحميل الصورة المعدلة" : "Download"}
          </button>
        </div>
      </section>

      {/* الأصلية + الأدوات */}
      <section className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
        <h2 className="text-center text-cyan-300 mb-3">
          {language === "ar" ? "الصورة الأصلية" : "Original Image"}
        </h2>

        <div className="aspect-video bg-slate-900/60 rounded-lg border border-slate-700 overflow-hidden">
          {originalImage ? (
            <img src={originalImage} alt="original" className="w-full h-full object-contain" />
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <button className="bg-slate-600 hover:bg-slate-700 py-2 rounded-md" onClick={onPickImage}>
            {language === "ar" ? "استخدام صورة جديدة" : "Choose Image"}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={onFileChange}
            hidden
          />
        </div>

        {/* المقاسات */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm mb-1">{language === "ar" ? "العرض (بكسل)" : "Width (px)"}</label>
            <input
              className="bg-slate-900/70 border border-slate-700 rounded-md px-3 py-2"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1">
              {language === "ar" ? "الارتفاع (بكسل)" : "Height (px)"}
            </label>
            <input
              className="bg-slate-900/70 border border-slate-700 rounded-md px-3 py-2"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
        </div>

        {/* الأزرار */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 py-2 rounded-md"
            onClick={handleResize}
            disabled={loading || !originalImage}
          >
            {language === "ar" ? "تغيير الحجم" : "Resize"}
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-md"
            onClick={handleEnhance}
            disabled={loading || !originalImage}
          >
            {language === "ar" ? "تحسين الجودة" : "Enhance"}
          </button>

          <button
            className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 py-2 rounded-md"
            onClick={handleRemoveBg}
            disabled={loading || !originalImage}
          >
            {language === "ar" ? "إزالة الخلفية" : "Remove BG"}
          </button>
        </div>

        {/* حالات */}
        {loading && (
          <div className="mt-3 text-center text-sm text-slate-400">
            {language === "ar" ? "جاري المعالجة..." : "Processing..."}
          </div>
        )}
        {error && (
          <div className="mt-3 bg-rose-800/50 text-rose-100 border border-rose-700 rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default ImageResizer;

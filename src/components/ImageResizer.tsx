import React, { useState } from "react";
import { removeBackground, enhanceQuality } from "../gemini";

interface Props {
  language: string;
  originalImage: string | null;
  setOriginalImage: (img: string | null) => void;
  modifiedImage: string | null;
  setModifiedImage: (img: string | null) => void;
  width: number;
  setWidth: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دالة لإزالة الخلفية
  const handleRemoveBg = async () => {
    if (!originalImage) return;
    try {
      setLoading(true);
      setError(null);
      const { dataUrl } = await removeBackground(originalImage);
      setModifiedImage(dataUrl);
    } catch (err: any) {
      setError("فشل في إزالة الخلفية: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحسين الجودة
  const handleEnhance = async () => {
    if (!originalImage) return;
    try {
      setLoading(true);
      setError(null);
      const { dataUrl } = await enhanceQuality(originalImage);
      setModifiedImage(dataUrl);
    } catch (err: any) {
      setError("فشل في تحسين الصورة: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة لتغيير الحجم محلياً
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
      if (!ctx) throw new Error("Canvas غير مدعوم");

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/png");
      setModifiedImage(dataUrl);
    } catch (err: any) {
      setError("فشل في تغيير الحجم: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h2 className="text-center text-cyan-400 mb-4">
        {language === "ar" ? "تغيير وتعديل الصور" : "Image Editor"}
      </h2>

      {/* عرض الصورة الأصلية */}
      <div className="mb-4">
        {originalImage ? (
          <img src={originalImage} alt="original" className="max-w-full rounded" />
        ) : (
          <p className="text-gray-400 text-center">
            {language === "ar" ? "حمّل صورة للبدء" : "Upload an image to start"}
          </p>
        )}
      </div>

      {/* أزرار */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={handleRemoveBg}
          className="bg-purple-600 px-3 py-2 rounded"
          disabled={loading}
        >
          {language === "ar" ? "إزالة الخلفية" : "Remove Background"}
        </button>
        <button
          onClick={handleEnhance}
          className="bg-blue-600 px-3 py-2 rounded"
          disabled={loading}
        >
          {language === "ar" ? "تحسين الجودة" : "Enhance"}
        </button>
        <button
          onClick={handleResize}
          className="bg-cyan-600 px-3 py-2 rounded"
          disabled={loading}
        >
          {language === "ar" ? "تغيير الحجم" : "Resize"}
        </button>
      </div>

      {/* الصورة المعدلة */}
      {modifiedImage && (
        <div>
          <h3 className="text-center text-green-400 mb-2">
            {language === "ar" ? "الصورة المعدلة" : "Modified Image"}
          </h3>
          <img src={modifiedImage} alt="modified" className="max-w-full rounded" />
        </div>
      )}

      {/* خطأ */}
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

      {/* جاري التحميل */}
      {loading && (
        <p className="text-yellow-400 text-center mt-2">
          {language === "ar" ? "جاري المعالجة..." : "Processing..."}
        </p>
      )}
    </div>
  );
};

export default ImageResizer;

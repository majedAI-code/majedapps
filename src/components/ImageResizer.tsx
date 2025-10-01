import React, { useState, useRef, useCallback } from "react";
import { Language } from "./types";
import { translations } from "./constants";
import { removeBackground, enhanceQuality } from "./gemini";

interface Props {
  language: Language;
}

const ImageResizer: React.FC<Props> = ({ language }) => {
  const t = translations[language];

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");

  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  const [isResizing, setIsResizing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const anyProcessing = isResizing || isRemovingBg || isEnhancing;

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setOriginalFile(file);
      setError(null);
      setResizedUrl(null);
      setDownloadFilename("");

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        const img = new Image();
        img.onload = () => {
          setWidth(String(img.width));
          setHeight(String(img.height));
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalFile(null);
      setPreviewUrl(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleNewImage = () => {
    setOriginalFile(null);
    setPreviewUrl(null);
    setResizedUrl(null);
    setDownloadFilename("");
    setWidth("");
    setHeight("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResize = useCallback(async () => {
    if (!originalFile || !previewUrl) {
      setError(t.errorNoImage);
      return;
    }
    const numWidth = parseInt(width, 10);
    const numHeight = parseInt(height, 10);
    if (isNaN(numWidth) || isNaN(numHeight) || numWidth <= 0 || numHeight <= 0) {
      setError(t.errorInvalidDims);
      return;
    }

    setError(null);
    setIsResizing(true);
    setResizedUrl(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = numWidth;
          canvas.height = numHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported."));
          ctx.drawImage(img, 0, 0, numWidth, numHeight);
          resolve(canvas.toDataURL(originalFile.type));
        };
        img.onerror = () => reject(new Error("Failed to load image."));
      });

      setResizedUrl(dataUrl);
      setDownloadFilename(`resized-${originalFile.name || "image.png"}`);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
      setResizedUrl(null);
    } finally {
      setIsResizing(false);
    }
  }, [originalFile, previewUrl, width, height, t]);

  const handleRemoveBackground = async () => {
    if (!previewUrl || !originalFile) {
      setError(t.errorNoImage);
      return;
    }
    setError(null);
    setIsRemovingBg(true);
    setResizedUrl(null);
    try {
      const { dataUrl } = await removeBackground(previewUrl, originalFile.name);
      setResizedUrl(dataUrl);
      setDownloadFilename(`bg-removed-${originalFile.name}`);
    } catch (e) {
      console.error(e);
      setError(t.errorRemoveBg);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleEnhanceQuality = async () => {
    if (!previewUrl || !originalFile) {
      setError(t.errorNoImage);
      return;
    }
    setError(null);
    setIsEnhancing(true);
    setResizedUrl(null);
    try {
      const { dataUrl } = await enhanceQuality(previewUrl, originalFile.name);
      setResizedUrl(dataUrl);
      setDownloadFilename(`enhanced-${originalFile.name}`);
    } catch (e) {
      console.error(e);
      setError(t.errorEnhance);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* العمود الأيمن/الأيسر حسب اللغة: أصلية + أدوات */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">
              {t.original}
            </h2>

            {!previewUrl ? (
              <label
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-slate-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-slate-400">
                    <span className="font-semibold text-cyan-400">
                      {t.uploadImage}
                    </span>{" "}
                    {t.orDrop}
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="w-full">
                <div className="p-2 border border-slate-700 rounded-lg bg-black/20">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-auto max-h-80 object-contain rounded-md"
                  />
                </div>
                <button
                  onClick={handleNewImage}
                  disabled={anyProcessing}
                  className="mt-4 w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-all disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                  {t.useNewImage}
                </button>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="width"
                    className="block text-sm font-medium text-slate-400 mb-1"
                  >
                    {t.width}
                  </label>
                  <input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-slate-400 mb-1"
                  >
                    {t.height}
                  </label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleResize}
                  disabled={anyProcessing}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed sm:col-span-2"
                >
                  {isResizing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    t.resize
                  )}
                </button>

                <button
                  onClick={handleRemoveBackground}
                  disabled={anyProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  {isRemovingBg ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t.removing}
                    </>
                  ) : (
                    t.removeBackground
                  )}
                </button>

                <button
                  onClick={handleEnhanceQuality}
                  disabled={anyProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  {isEnhancing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t.enhancing}
                    </>
                  ) : (
                    t.enhanceQuality
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* العمود الآخر: المعاينة / التحميل */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex-grow flex flex-col">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">
              {t.resized}
            </h2>
            <div className="flex-grow flex items-center justify-center w-full min-h-[20rem] bg-black/20 p-2 border border-slate-700 rounded-lg">
              {resizedUrl ? (
                <img
                  src={resizedUrl}
                  alt="Resized"
                  className="w-full h-auto max-h-80 object-contain rounded-md"
                />
              ) : (
                <p className="text-slate-500">{t.noResizedImage}</p>
              )}
            </div>
            {resizedUrl && (
              <a
                href={resizedUrl}
                download={downloadFilename}
                className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md transition-all text-center"
              >
                {t.download}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;

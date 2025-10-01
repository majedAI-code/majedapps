import { Language } from "./types";

export const translations = {
  [Language.AR]: {
    original: "الصورة الأصلية",
    resized: "الصورة المعدّلة",
    uploadImage: "رفع صورة",
    orDrop: "أو اسحب صورة هنا",
    width: "العرض (بكسل)",
    height: "الارتفاع (بكسل)",
    resize: "تغيير الحجم",
    removeBackground: "إزالة الخلفية",
    enhanceQuality: "تحسين الجودة",
    removing: "جارٍ الإزالة...",
    enhancing: "جارٍ التحسين...",
    useNewImage: "استخدام صورة جديدة",
    download: "تحميل الصورة المعدّلة",
    noResizedImage: "ستظهر الصورة المعدّلة هنا",
    errorNoImage: "فضلاً اختر صورة أولاً.",
    errorInvalidDims: "أبعاد غير صالحة.",
    errorRemoveBg: "فشل في إزالة الخلفية. يرجى المحاولة مرة أخرى.",
    errorEnhance: "فشل في تحسين الصورة. يرجى المحاولة مرة أخرى."
  },
  [Language.EN]: {
    original: "Original Image",
    resized: "Edited Image",
    uploadImage: "Upload image",
    orDrop: "or drop an image here",
    width: "Width (px)",
    height: "Height (px)",
    resize: "Resize",
    removeBackground: "Remove Background",
    enhanceQuality: "Enhance Quality",
    removing: "Removing...",
    enhancing: "Enhancing...",
    useNewImage: "Use a new image",
    download: "Download Edited Image",
    noResizedImage: "Edited image will appear here",
    errorNoImage: "Please select an image first.",
    errorInvalidDims: "Invalid dimensions.",
    errorRemoveBg: "Failed to remove background. Try again.",
    errorEnhance: "Failed to enhance image. Try again."
  }
} as const;

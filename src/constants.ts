import { Language } from "./types";

export const translations: Record<Language, Record<string, string>> = {
  AR: {
    original: "الصورة الأصلية",
    resized: "الصورة المعدلة",
    uploadImage: "رفع صورة",
    orDrop: "أو اسحب صورة هنا",
    useNewImage: "استخدام صورة جديدة",
    width: "العرض (بكسل)",
    height: "الارتفاع (بكسل)",
    resize: "تغيير الحجم",
    removeBackground: "إزالة الخلفية",
    enhanceQuality: "تحسين الجودة",
    removing: "جاري الإزالة...",
    enhancing: "جاري التحسين...",
    download: "تحميل الصورة المعدلة",
    noResizedImage: "ستظهر الصورة المعدلة هنا",
    errorNoImage: "لم يتم اختيار صورة.",
    errorInvalidDims: "الأبعاد غير صالحة.",
    errorRemoveBg: "فشل في إزالة الخلفية.",
    errorEnhance: "فشل في تحسين الجودة.",
    cloudFeatureHint: "هذه الميزة تتطلب مفتاح خدمة خارجية. اتركها معطّلة إن لم يتوفر لديك مفتاح.",
    cloudFeatureDisabled: "الميزة معطّلة لعدم توفر مفتاح خدمة خارجية."
  },
  EN: {
    original: "Original",
    resized: "Edited Image",
    uploadImage: "Upload image",
    orDrop: "or drag & drop here",
    useNewImage: "Use a new image",
    width: "Width (px)",
    height: "Height (px)",
    resize: "Resize",
    removeBackground: "Remove Background",
    enhanceQuality: "Enhance Quality",
    removing: "Removing...",
    enhancing: "Enhancing...",
    download: "Download Edited Image",
    noResizedImage: "The edited image will appear here",
    errorNoImage: "No image selected.",
    errorInvalidDims: "Invalid dimensions.",
    errorRemoveBg: "Failed to remove background.",
    errorEnhance: "Failed to enhance quality.",
    cloudFeatureHint:
      "This feature requires a third-party API key. Keep it disabled if you don't have one.",
    cloudFeatureDisabled: "Feature disabled: no third-party API key."
  }
};

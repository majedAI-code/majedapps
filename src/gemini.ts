// ملاحظة مهمة:
// Google Gemini لا يُرجع صورة ثنائية مباشرة عبر generateContent حالياً.
// لذلك نحن نوفّر هنا واجهات (stubs). إذا أضفت لاحقاً خدمة خارجية
// مثل ClipDrop/Remove.bg/Replicate … يمكنك تعديل الدالتين لتستدعي تلك الخدمة.

const API_KEY =
  (import.meta as any).env?.GOOGLE_API_KEY ||
  (import.meta as any).env?.VITE_API_KEY ||
  "";

export const CLOUD_ENABLED = Boolean(API_KEY);

// توقيع الإرجاع موحّد مع المكوّن
export async function removeBackground(
  dataUrl: string,
  _filename: string
): Promise<{ dataUrl: string }> {
  if (!CLOUD_ENABLED) {
    const err: any = new Error("Feature disabled");
    err.code = "FEATURE_DISABLED";
    throw err;
  }

  // ضع هنا لاحقاً استدعاء خدمة الإزالة الفعلية، ثم أعد dataUrl الناتج
  // مؤقتاً، نرمي خطأ لتوضيح أن التنفيذ الحقيقي غير مضاف:
  throw new Error("Please integrate a background-removal API.");
}

export async function enhanceQuality(
  dataUrl: string,
  _filename: string
): Promise<{ dataUrl: string }> {
  if (!CLOUD_ENABLED) {
    const err: any = new Error("Feature disabled");
    err.code = "FEATURE_DISABLED";
    throw err;
  }

  // ضع هنا لاحقاً استدعاء خدمة التحسين الفعلية.
  throw new Error("Please integrate an image-enhancement API.");
}

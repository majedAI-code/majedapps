// src/gemini.ts
// ----------------------------------------------------
// Gemini helpers for image background removal & enhance
// ----------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1) API key from env (Vercel → Environment Variables)
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
if (!apiKey) {
  throw new Error(
    "VITE_API_KEY is missing. Add it in Vercel → Project → Settings → Environment Variables."
  );
}

// 2) Create client + pick a model that accepts image inputs
// جرّب "gemini-2.5-flash" إن تبي الأحدث، لكن سنبقيه افتراضيًا على 2.0-flash
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ---------- small helpers ----------
function dataUrlToInfo(dataUrl: string): { base64: string; mimeType: string } {
  const [meta, base64] = dataUrl.split(",");
  if (!base64) throw new Error("Invalid data URL: missing base64 part.");
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
  return { base64: base64.trim(), mimeType };
}

function cleanBase64(text: string): string {
  // أحيانًا النماذج ترجع النص بين ``` أو مع أسطر إضافية — ننظفه
  let t = text.trim();
  t = t.replace(/^```(png|image|base64)?/i, "").replace(/```$/i, "").trim();
  // خذ أول سطر يشبه base64 إذا فيه شرح
  const base64Match = t.match(/[A-Za-z0-9+/=]{100,}/);
  return base64Match ? base64Match[0] : t;
}

function toDataUrlPNG(base64: string): string {
  return `data:image/png;base64,${base64}`;
}

async function callModelWithImage(
  imageDataUrl: string,
  instruction: string
): Promise<string> {
  const { base64, mimeType } = dataUrlToInfo(imageDataUrl);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64, mimeType } },
          {
            text:
              `${instruction}\n\n` +
              // نطلب صراحة إرجاع base64 فقط بدون أي زيادات
              "Return ONLY the resulting PNG image as BASE64 string. " +
              "Do NOT include markdown, code fences, JSON, or any extra text."
          }
        ]
      }
    ],
    // مهم: لا نطلب image/png مباشرة لأن بعض الإصدارات لا تدعمها → 400
    generationConfig: { responseMimeType: "text/plain" }
  });

  const text = (await result.response.text()) ?? "";
  const b64 = cleanBase64(text);
  if (!b64 || b64.length < 100) {
    throw new Error("Model did not return a valid base64 image.");
  }
  return toDataUrlPNG(b64);
}

// ---------- Public API ----------

/**
 * يزيل الخلفية ويُرجع DataURL للصورة الناتجة (PNG base64).
 * @param imageDataUrl data:image/*;base64,....
 */
export async function removeBackground(
  imageDataUrl: string
): Promise<{ dataUrl: string }> {
  try {
    const dataUrl = await callModelWithImage(
      imageDataUrl,
      "Remove the background from this image. Keep the subject only on a transparent background (PNG)."
    );
    return { dataUrl };
  } catch (err: any) {
    const msg =
      err?.message ||
      "Failed to remove background. Please try again with a different image.";
    throw new Error(msg);
  }
}

/**
 * يحسّن الجودة (إزالة تشويش/حدة/ترقية خفيفة) ويُرجع DataURL (PNG base64).
 * @param imageDataUrl data:image/*;base64,....
 */
export async function enhanceQuality(
  imageDataUrl: string
): Promise<{ dataUrl: string }> {
  try {
    const dataUrl = await callModelWithImage(
      imageDataUrl,
      "Enhance this image quality: denoise, sharpen edges, improve clarity, slightly upscale if beneficial, then output as high-quality PNG."
    );
    return { dataUrl };
  } catch (err: any) {
    const msg =
      err?.message ||
      "Failed to enhance image. Please try again with a different image.";
    throw new Error(msg);
  }
}

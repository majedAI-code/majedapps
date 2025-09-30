// src/gemini.ts
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
  throw new Error("VITE_API_KEY is missing. Add it in Vercel → Environment Variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ـــ أدوات مساعدة ـــ
function dataUrlToInfo(dataUrl: string): { base64: string; mimeType: string } {
  const [meta, base64] = dataUrl.split(",");
  if (!base64) throw new Error("Invalid data URL");
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
  return { base64, mimeType };
}

function base64ToFile(b64: string, mime: string, name = "output.png") {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

function pickInlineImage(resp: any) {
  return resp?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData)?.inlineData;
}

// ـــ إزالة الخلفية ـــ
export async function removeBackground(
  imageDataUrl: string
): Promise<{ dataUrl: string; file: File }> {
  const { base64, mimeType } = dataUrlToInfo(imageDataUrl);

  // مهم: استخدم موديل يدعم مخرجات صورة
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image-preview", // يعمل لإخراج IMAGE
    // ملاحظة: لو حسابك ما يفعّل هذا الموديل جرّب "gemini-2.0-flash-exp" أو الأقرب المتاح
  });

  const prompt =
    "Remove the background. Return only the subject on a fully transparent background (PNG).";

  const res = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      // نطلب صورة في المخرجات
      responseMimeType: "image/png",
    },
  });

  const img = pickInlineImage(res.response);
  if (!img) throw new Error("API did not return an image.");

  const outMime = img.mimeType || "image/png";
  const outDataUrl = `data:${outMime};base64,${img.data}`;
  const file = base64ToFile(img.data, outMime, "removed-bg.png");

  return { dataUrl: outDataUrl, file };
}

// ـــ تحسين الجودة/الوضوح (Upscale + Denoise + Sharpen) ـــ
export async function enhanceQuality(
  imageDataUrl: string
): Promise<{ dataUrl: string; file: File }> {
  const { base64, mimeType } = dataUrlToInfo(imageDataUrl);

  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image-preview",
  });

  const prompt =
    "Enhance this image: upscale 2x, reduce noise, improve sharpness and details while keeping natural look. Return PNG.";

  const res = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "image/png",
    },
  });

  const img = pickInlineImage(res.response);
  if (!img) throw new Error("API did not return an image.");

  const outMime = img.mimeType || "image/png";
  const outDataUrl = `data:${outMime};base64,${img.data}`;
  const file = base64ToFile(img.data, outMime, "enhanced.png");

  return { dataUrl: outDataUrl, file };
}

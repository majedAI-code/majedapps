// src/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// مفتاح API من بيئة Vite/Vercel
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
if (!API_KEY) {
  throw new Error(
    "VITE_API_KEY مفقود. أضفه في Vercel → Project → Settings → Environment Variables."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);
// جرّب هذا النموذج أولاً. لو ما أعاد صورة، جرّب "gemini-2.0-flash" أو "gemini-2.0-flash-exp".
const MODEL_ID = "gemini-2.5-flash-image-preview";

// يحوّل DataURL إلى base64 + mimeType
function dataUrlToInline(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  if (!base64) throw new Error("Invalid data URL");
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  return { inlineData: { data: base64, mimeType } };
}

// يستخرج أول صورة من رد Gemini (inlineData)
function extractImageDataUrl(res: any): string {
  const parts = res?.response?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p: any) => p?.inlineData?.data)?.inlineData;
  if (!img?.data || !img?.mimeType) {
    throw new Error("API did not return an image.");
  }
  return `data:${img.mimeType};base64,${img.data}`;
}

/** إزالة الخلفية وإرجاع DataURL */
export async function removeBackground(
  imageDataUrl: string,
  filename?: string
): Promise<{ dataUrl: string; filename: string }> {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const res = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          dataUrlToInline(imageDataUrl),
          {
            text:
              "Remove the background of this image. Return ONLY the subject on a fully transparent background (PNG). Do not add or change content.",
          },
        ],

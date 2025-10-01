import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
if (!apiKey) {
  throw new Error(
    "VITE_API_KEY is missing. Add it in Vercel → Project → Settings → Environment Variables."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

/** يحوّل dataURL إلى { base64, mimeType } */
function dataUrlToInfo(dataUrl: string): { base64: string; mimeType: string } {
  const [meta, base64] = dataUrl.split(",");
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
  return { base64, mimeType };
}

export async function removeBackground(
  imageDataUrl: string,
  fileName = "image.png"
): Promise<{ dataUrl: string }> {
  const { base64, mimeType } = dataUrlToInfo(imageDataUrl);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // هذا السطر هو الفارق: نريد صورة كإخراج
    generationConfig: { responseMimeType: "image/png" }
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType
            }
          },
          {
            text:
              "Remove the background of this image. The output must be just the subject on a transparent background."
          }
        ]
      }
    ]
  });

  const inline =
    result.response?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    )?.inlineData;

  if (!inline?.data) {
    throw new Error("API did not return an image.");
  }

  const outDataUrl = `data:image/png;base64,${inline.data}`;
  return { dataUrl: outDataUrl };
}

export async function enhanceQuality(
  imageDataUrl: string,
  fileName = "image.png"
): Promise<{ dataUrl: string }> {
  const { base64, mimeType } = dataUrlToInfo(imageDataUrl);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "image/png" }
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType
            }
          },
          {
            text:
              "Enhance this image quality: denoise, sharpen, improve details and color, and keep the same aspect ratio."
          }
        ]
      }
    ]
  });

  const inline =
    result.response?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    )?.inlineData;

  if (!inline?.data) {
    throw new Error("API did not return an image.");
  }

  const outDataUrl = `data:image/png;base64,${inline.data}`;
  return { dataUrl: outDataUrl };
}

import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

// ممنوع كشف المفتاح للمتصفح
const isBrowser = typeof window !== 'undefined';

// Singleton instance of the AI client (server-only)
let ai: GoogleGenAI | null = null;

// يقرأ المفتاح من بيئة السيرفر فقط
const getServerApiKey = (): string => {
  if (isBrowser) {
    // أي محاولة لاستخدام المفتاح من المتصفح تُمنع ويحوَّل الطلب للراوت
    throw new Error('Client cannot access AI key. Route via /api/process-image.');
  }
  // eslint-disable-next-line no-undef
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY / API_KEY is missing on the server.');
    throw new Error('Server API Key is not configured. Cannot process image with AI.');
  }
  return apiKey;
};

const getAiClient = (): GoogleGenAI => {
  if (ai) return ai;
  const apiKey = getServerApiKey(); // <-- سيرفر فقط
  ai = new GoogleGenAI({ apiKey });
  return ai;
};

// يُستخدم في المتصفح: يرسل للراوت السيرفري بدون كشف المفتاح
const processImageViaApi = async (imageFile: File, prompt: string): Promise<string> => {
  const { base64, mimeType } = await fileToBase64(imageFile);
  const res = await fetch('/api/process-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType, prompt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? 'Server failed to process image');
  if (!json?.dataUrl) throw new Error('Server returned no image data');
  return json.dataUrl as string;
};

const processImageWithPrompt = async (imageFile: File, prompt: string): Promise<string> => {
  try {
    // في المتصفح: وجّه الطلب إلى الراوت /api/process-image
    if (isBrowser) {
      return await processImageViaApi(imageFile, prompt);
    }

    // في السيرفر: استدع Gemini مباشرة (المفتاح من process.env)
    const aiClient = getAiClient();
    const { base64, mimeType } = await fileToBase64(imageFile);

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find((part: any) => part.inlineData);
    if (imagePart?.inlineData) {
      const base64ImageBytes = imagePart.inlineData.data;
      const outputMimeType = imagePart.inlineData.mimeType;
      return `data:${outputMimeType};base64,${base64ImageBytes}`;
    }

    // @ts-ignore: بعض إصدارات الـSDK تعرض text مباشرة
    const textResponse = response.text;
    if (textResponse && String(textResponse).toLowerCase().includes('cannot')) {
      throw new Error(`AI could not process image: ${textResponse}`);
    }
    throw new Error('AI processing failed: No image data in response.');
  } catch (error) {
    console.error('Gemini API call failed:', error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw error instanceof Error ? error : new Error('Failed to communicate with the AI model.');
  }
};

export const removeBackground = async (imageFile: File): Promise<string> => {
  const prompt =
    'Remove the background from this image. The main subject should be perfectly preserved. The output must be a PNG with a transparent background.';
  return processImageWithPrompt(imageFile, prompt);
};

export const enhanceImage = async (imageFile: File): Promise<string> => {
  const prompt =
    'Enhance the quality of this image. Improve sharpness, clarity, lighting, and color balance for a professional look. Do not add, remove, or change any elements in the image.';
  return processImageWithPrompt(imageFile, prompt);
};

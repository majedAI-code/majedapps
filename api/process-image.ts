import { GoogleGenAI, Modality } from '@google/genai';

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const { base64, mimeType, prompt } = await req.json();
    if (!base64 || !mimeType || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    // المفتاح من بيئة السيرفر فقط
    // @ts-ignore
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server API Key missing' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData) {
      return new Response(JSON.stringify({ error: 'No image returned from AI' }), { status: 400 });
    }

    const out = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    return new Response(JSON.stringify({ dataUrl: out }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('API route error:', err);
    return new Response(JSON.stringify({ error: err?.message ?? 'Server error' }), { status: 500 });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageDataUrl } = req.body as { imageDataUrl: string };
    if (!imageDataUrl) return res.status(400).json({ error: 'imageDataUrl is required' });

    const match = imageDataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!match) return res.status(400).json({ error: 'Invalid data URL' });

    const mimeType = match[1];
    const base64Data = match[2];

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });

    const prompt =
      'Remove the background of this image. Output must be the subject on a transparent background as a clean PNG. Return only the edited image.';

    const payload = {
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'image/png',
      },
    };

    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: 'Gemini error', details: text });
    }

    const json = await resp.json();
    const data =
      json?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

    if (!data) {
      return res.status(500).json({ error: 'No inlineData returned from Gemini' });
    }

    // أعد كـ Data URL جاهز للعرض/التحميل
    const dataUrl = `data:image/png;base64,${data}`;
    return res.status(200).json({ dataUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}

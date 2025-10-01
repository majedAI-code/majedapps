// api/upscale.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { imageDataUrl } = req.body as { imageDataUrl?: string };
    if (!imageDataUrl) return res.status(400).send("imageDataUrl is required");

    const m = /^data:(.+);base64,(.*)$/.exec(imageDataUrl);
    if (!m) return res.status(400).send("Bad data URL");
    const b64 = m[2];
    const buf = Buffer.from(b64, "base64");

    const form = new FormData();
    form.append("image_file", new Blob([buf], { type: "image/png" }), "image.png");
    // ممكن إضافة بارامترات لو حبيت: scale=2 مثلا
    // form.append("scale", "2");

    const clip = await fetch("https://clipdrop-api.co/super-resolution/v1", {
      method: "POST",
      headers: { "x-api-key": process.env.CLIPDROP_API_KEY ?? "" },
      body: form,
    });

    if (!clip.ok) {
      const txt = await clip.text();
      return res.status(500).send(`ClipDrop error: ${txt}`);
    }

    const outBuf = Buffer.from(await clip.arrayBuffer());
    const outDataUrl = `data:image/png;base64,${outBuf.toString("base64")}`;
    return res.status(200).json({ dataUrl: outDataUrl });
  } catch (e: any) {
    return res.status(500).send(e?.message || "Server error");
  }
}

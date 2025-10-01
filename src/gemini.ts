// src/gemini.ts
export async function removeBackground(imageDataUrl: string, _filename: string) {
  const res = await fetch('/api/remove-bg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to remove background');
  }
  return (await res.json()) as { dataUrl: string };
}

export async function enhanceQuality(imageDataUrl: string, _filename: string) {
  const res = await fetch('/api/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to enhance image');
  }
  return (await res.json()) as { dataUrl: string };
}

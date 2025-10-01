// src/gemini.ts
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

/** حمل صورة من dataURL كـ HTMLImageElement */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** تطبيق التفاف (Convolution) على ImageData */
function convolve(src: ImageData, kernel: number[], divisor = 1, bias = 0): ImageData {
  const { width, height, data } = src;
  const out = new ImageData(width, height);
  const side = Math.sqrt(kernel.length);
  const half = Math.floor(side / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const weight = kernel[ky * side + kx];
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          a += data[idx + 3] * weight;
        }
      }
      const di = (y * width + x) * 4;
      out.data[di]     = Math.min(255, Math.max(0, r / divisor + bias));
      out.data[di + 1] = Math.min(255, Math.max(0, g / divisor + bias));
      out.data[di + 2] = Math.min(255, Math.max(0, b / divisor + bias));
      out.data[di + 3] = Math.min(255, Math.max(0, a / divisor + bias));
    }
  }
  return out;
}

/** تحسين بسيط للجودة: Unsharp Mask + زيادة طفيفة للتباين/التشبع */
export async function enhanceQuality(
  dataUrl: string,
  filename?: string
): Promise<{ dataUrl: string }> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // ارسم الصورة الأصل
  ctx.drawImage(img, 0, 0);

  // خذ نسخة بيانات
  const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Gaussian blur تقريبي بـ kernel بسيط
  const blurKernel = [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ];
  const blurred = convolve(srcData, blurKernel, 16);

  // Unsharp: original * 1.5 - blurred * 0.5
  const sharp = new ImageData(canvas.width, canvas.height);
  for (let i = 0; i < srcData.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = 1.5 * srcData.data[i + c] - 0.5 * blurred.data[i + c];
      sharp.data[i + c] = Math.max(0, Math.min(255, v));
    }
    sharp.data[i + 3] = srcData.data[i + 3];
  }
  ctx.putImageData(sharp, 0, 0);

  // لمسة تباين/تشبع طفيفة
  ctx.globalCompositeOperation = 'source-over';
  (ctx as any).filter = 'contrast(105%) saturate(105%)';
  ctx.drawImage(canvas, 0, 0);

  const out = canvas.toDataURL('image/png');
  return { dataUrl: out };
}

/** إزالة الخلفية بـ BodyPix (يعزل الأشخاص فقط) */
export async function removeBackground(
  dataUrl: string,
  filename?: string
): Promise<{ dataUrl: string }> {
  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });

  const img = await loadImage(dataUrl);

  // نحاول اكتشاف شخص؛ BodyPix مخصصة للأشخاص
  const segmentation = await net.segmentPerson(img, {
    internalResolution: 'medium',
    segmentationThreshold: 0.7,
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // ارسم الصورة
  ctx.drawImage(img, 0, 0);

  // حوّل الـ segmentation إلى Mask
  const mask = bodyPix.toMask(segmentation, { r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 });
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const mctx = maskCanvas.getContext('2d')!;
  const maskImgData = new ImageData(new Uint8ClampedArray(mask.data), mask.width, mask.height);
  mctx.putImageData(maskImgData, 0, 0);

  // استخدم الماسك كـ alpha
  const base = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const alpha = mctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < base.data.length; i += 4) {
    // قناة ألفا من الماسك (قيمة 255 تعني موضوع/شخص)
    base.data[i + 3] = alpha.data[i]; // نقرأ قناة واحدة تكفينا
  }
  ctx.putImageData(base, 0, 0);

  const out = canvas.toDataURL('image/png'); // شفافة
  return { dataUrl: out };
}

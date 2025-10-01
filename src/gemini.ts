import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to extract base64 data and mime type from a data URL
function dataUrlToInfo(dataUrl: string): { base64: string; mimeType: string } {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) throw new Error('Invalid data URL');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const base64 = parts[1];
  return { base64, mimeType };
}

async function processImage(
  imageDataUrl: string,
  prompt: string
): Promise<{ dataUrl: string; }> {
  try {
    const { base64, mimeType } = dataUrlToInfo(imageDataUrl);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    // Find the first part that contains image data
    for (const candidate of response.candidates ?? []) {
        for (const part of candidate.content.parts ?? []) {
            if (part.inlineData) {
                const newMimeType = part.inlineData.mimeType;
                const newBase64Data = part.inlineData.data;
                const newImageDataUrl = `data:${newMimeType};base64,${newBase64Data}`;
                return { dataUrl: newImageDataUrl };
            }
        }
    }

    throw new Error("API did not return an image.");

  } catch (error) {
    console.error("Error processing image with Gemini:", error);
    throw new Error("Failed to process image with the API.");
  }
}

export async function removeBackground(
  imageDataUrl: string
): Promise<{ dataUrl: string; }> {
    const prompt = 'Remove the background of this image. The output should be the subject on a transparent background.';
    return processImage(imageDataUrl, prompt);
}

export async function enhanceQuality(
  imageDataUrl: string
): Promise<{ dataUrl: string; }> {
    const prompt = 'Enhance the quality of this image, improving sharpness, clarity, and color balance. The output should be only the enhanced image.';
    return processImage(imageDataUrl, prompt);
}

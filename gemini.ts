import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// Function to extract base64 data and mime type from a data URL
function dataUrlToInfo(dataUrl: string): { base64: string; mimeType: string } {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) throw new Error('Invalid data URL');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const base64 = parts[1];
  return { base64, mimeType };
}

export async function removeBackground(
  imageDataUrl: string
): Promise<{ dataUrl: string; file: File }> {
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
            text: 'Remove the background of this image. The output should be the subject on a transparent background.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (part) => part.inlineData
    )?.inlineData;

    if (!imagePart) {
      throw new Error("API did not return an image.");
    }

    const newMimeType = imagePart.mimeType;
    const newBase64Data = imagePart.data;
    const newImageDataUrl = `data:${newMimeType};base64,${newBase64Data}`;

    const res = await fetch(newImageDataUrl);
    const blob = await res.blob();
    const newFile = new File([blob], "background-removed.png", { type: newMimeType });

    return { dataUrl: newImageDataUrl, file: newFile };
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to process image with the API.");
  }
}

export async function enhanceQuality(
  imageDataUrl: string
): Promise<{ dataUrl: string; file: File }> {
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
            text: 'Enhance the quality of this image. Improve sharpness, clarity, and color balance. Upscale if possible without introducing artifacts.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (part) => part.inlineData
    )?.inlineData;

    if (!imagePart) {
      throw new Error("API did not return an image for enhancement.");
    }

    const newMimeType = imagePart.mimeType;
    const newBase64Data = imagePart.data;
    const newImageDataUrl = `data:${newMimeType};base64,${newBase64Data}`;

    const res = await fetch(newImageDataUrl);
    const blob = await res.blob();
    const newFile = new File([blob], "enhanced-image.png", { type: newMimeType });

    return { dataUrl: newImageDataUrl, file: newFile };
  } catch (error) {
    console.error("Error enhancing image:", error);
    throw new Error("Failed to process image enhancement with the API.");
  }
}

export async function generateResizeCode(
  originalFilename: string,
  width: number,
  height: number
): Promise<string> {
  try {
    const prompt = `
Generate a complete and runnable Python script that uses the Pillow library (PIL) to resize an image.

- The original image file is named "${originalFilename}".
- The target dimensions are ${width} pixels wide and ${height} pixels high.
- The resized image should be saved with a new filename, like "resized_${originalFilename}".
- The code should be clear, well-commented, and include necessary imports.
- Explain the purpose of each main step in the comments.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let code = response.text;
    // The response text might be wrapped in markdown backticks, let's clean it up.
    if (code.startsWith('```python')) {
      code = code.substring(9);
    } else if (code.startsWith('```')) {
      code = code.substring(3);
    }
    if (code.endsWith('```')) {
      code = code.slice(0, -3);
    }
    
    return code.trim();

  } catch (error) {
    console.error("Error generating Python code:", error);
    return `# An error occurred while generating the code.
# Please check your API key and network connection.`;
  }
}

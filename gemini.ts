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

// FIX: Update function signature to accept a filename and return a File object.
export async function removeBackground(
  imageDataUrl: string,
  filename: string,
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

    const bstr = atob(newBase64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const newFile = new File([u8arr], filename, { type: newMimeType });


    return { dataUrl: newImageDataUrl, file: newFile };
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to process image with the API.");
  }
}

// FIX: Update function signature to accept a filename and return a File object.
export async function enhanceQuality(
  imageDataUrl: string,
  filename: string,
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
            text: 'Enhance the quality of this image, improving sharpness, clarity, and color balance. The output should be only the enhanced image.',
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

    const bstr = atob(newBase64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const newFile = new File([u8arr], filename, { type: newMimeType });

    return { dataUrl: newImageDataUrl, file: newFile };
  } catch (error) {
    console.error("Error enhancing image:", error);
    throw new Error("Failed to process image enhancement with the API.");
  }
}

// FIX: Add missing generateResizeCode function to resolve import error.
export async function generateResizeCode(filename: string, width: number, height: number): Promise<string> {
    try {
        const prompt = `Generate a Python script that resizes an image.
- The script should use the Pillow (PIL) library.
- It should resize the image named "${filename}" to a width of ${width} pixels and a height of ${height} pixels.
- The resized image should be saved with a new filename, like "resized_${filename}".
- The code should be simple, well-commented, and ready to run.
- Only provide the python code, no explanation or markdown.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let code = response.text;
        // Clean up markdown formatting if present
        if (code.startsWith('```python')) {
            code = code.substring('```python'.length, code.length - 3).trim();
        } else if (code.startsWith('```')) {
             code = code.substring(3, code.length - 3).trim();
        }

        return code;
    } catch (error) {
        console.error("Error generating resize code:", error);
        throw new Error("Failed to generate Python code with the API.");
    }
}
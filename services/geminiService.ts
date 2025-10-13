
import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

// Singleton instance of the AI client, initialized lazily.
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set.");
        // This error will be caught by the handleProcessing function in App.tsx
        // and displayed on the corresponding image card.
        throw new Error("API Key is not configured. Cannot process image with AI.");
    }

    ai = new GoogleGenAI({ apiKey });
    return ai;
};


const processImageWithPrompt = async (imageFile: File, prompt: string): Promise<string> => {
    try {
        const aiClient = getAiClient();
        const { base64, mimeType } = await fileToBase64(imageFile);

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash-image',
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

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const outputMimeType = imagePart.inlineData.mimeType;
            return `data:${outputMimeType};base64,${base64ImageBytes}`;
        } else {
            const textResponse = response.text;
            if (textResponse && textResponse.toLowerCase().includes("cannot")) {
                 throw new Error(`AI could not process image: ${textResponse}`);
            }
            throw new Error("AI processing failed: No image data in response.");
        }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        if(error instanceof Error) {
            if (error.message.includes('429')){
                 throw new Error("API rate limit exceeded. Please try again later.");
            }
            throw error; // Rethrow to be handled by the caller
        }
        throw new Error("Failed to communicate with the AI model.");
    }
};

export const removeBackground = async (imageFile: File): Promise<string> => {
    const prompt = "Remove the background from this image. The main subject should be perfectly preserved. The output must be a PNG with a transparent background.";
    return processImageWithPrompt(imageFile, prompt);
};

export const enhanceImage = async (imageFile: File): Promise<string> => {
    const prompt = "Enhance the quality of this image. Improve sharpness, clarity, lighting, and color balance for a professional look. Do not add, remove, or change any elements in the image.";
    return processImageWithPrompt(imageFile, prompt);
};

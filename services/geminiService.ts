import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

const getAiClient = (apiKey: string): GoogleGenAI => {
    if (!apiKey) {
        throw new Error("API Key is not provided. Cannot process image with AI.");
    }
    return new GoogleGenAI({ apiKey });
};


const processImageWithPrompt = async (imageFile: File, prompt: string, apiKey: string): Promise<string> => {
    try {
        const aiClient = getAiClient(apiKey);
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

export const removeBackground = async (imageFile: File, apiKey: string): Promise<string> => {
    const prompt = "Remove the background from this image. The main subject should be perfectly preserved. The output must be a PNG with a transparent background.";
    return processImageWithPrompt(imageFile, prompt, apiKey);
};

export const enhanceImage = async (imageFile: File, apiKey: string): Promise<string> => {
    const prompt = "Enhance the quality of this image. Improve sharpness, clarity, lighting, and color balance for a professional look. Do not add, remove, or change any elements in the image.";
    return processImageWithPrompt(imageFile, prompt, apiKey);
};
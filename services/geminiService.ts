import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

const getAiClient = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("لم يتم تكوين مفتاح API. لا يمكن معالجة الصورة.");
    }
    return new GoogleGenAI({ apiKey });
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
                 throw new Error(`لم يتمكن الذكاء الاصطناعي من معالجة الصورة: ${textResponse}`);
            }
            throw new Error("فشلت المعالجة: لم يتم العثور على بيانات صورة في الاستجابة.");
        }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            if (error.message.includes('429')) {
                throw new Error("تم تجاوز حد الطلبات. يرجى المحاولة مرة أخرى لاحقًا.");
            }
            // A JSON parsing error often means the API returned an HTML error page due to an invalid key.
            if (error instanceof SyntaxError || error.message.toLowerCase().includes('json')) {
                throw new Error("فشل الاتصال. يرجى التأكد من أن مفتاح API صحيح ومُهيأ.");
            }
            throw error; // Rethrow other errors to be handled by the caller
        }
        throw new Error("فشل الاتصال بنموذج الذكاء الاصطناعي.");
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
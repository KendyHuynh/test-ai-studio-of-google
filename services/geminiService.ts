import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";
import { ImageFile, GeneratedResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

export async function composeImages(
  personImage: ImageFile,
  productImage: ImageFile,
  prompt: string
): Promise<GeneratedResult> {
  try {
    const personImagePart = {
      inlineData: {
        data: personImage.base64,
        mimeType: personImage.mimeType,
      },
    };

    const productImagePart = {
      inlineData: {
        data: productImage.base64,
        mimeType: productImage.mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [personImagePart, productImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const result: GeneratedResult = { image: null, text: null };
    
    if (response.candidates && response.candidates.length > 0) {
      const parts: Part[] = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          result.image = `data:${mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
          result.text = part.text;
        }
      }
    }
    
    if (!result.image) {
        throw new Error("The AI did not return an image. Please try again with a different prompt or images.");
    }

    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}

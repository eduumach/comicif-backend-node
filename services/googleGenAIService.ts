import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

export class GoogleGenAIService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GENAI_API_KEY não está definida nas variáveis de ambiente");
    }

    this.ai = new GoogleGenAI({
      apiKey: apiKey
    });
  }

  async generateContentFromImage(imagePath: string, prompt: string = "Caption this image.", mimeType: string = "image/jpeg"): Promise<string> {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Arquivo não encontrado: ${imagePath}`);
      }

      const base64ImageFile = fs.readFileSync(imagePath, {
        encoding: "base64",
      });

      const contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageFile,
          },
        },
        { text: prompt },
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      return response.text || "";
    } catch (error) {
      console.error("Erro ao gerar conteúdo com imagem:", error);
      throw error;
    }
  }

  async generateTextContent(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt }],
      });

      return response.text || "";
    } catch (error) {
      console.error("Erro ao gerar conteúdo de texto:", error);
      throw error;
    }
  }

  async generateContentFromImageBuffer(imageBuffer: Buffer, prompt: string = "Caption this image.", mimeType: string = "image/jpeg"): Promise<string> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
        { text: prompt },
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      return response.text || "";
    } catch (error) {
      console.error("Erro ao gerar conteúdo com buffer de imagem:", error);
      throw error;
    }
  }

  async generateImage(textPrompt: string, referenceImageBuffer?: Buffer, mimeType: string = "image/png"): Promise<Buffer> {
    try {
      const contents: any[] = [{ text: textPrompt }];

      if (referenceImageBuffer) {
        const base64Image = referenceImageBuffer.toString('base64');
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        });
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: contents,
      });

      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error("Resposta inválida da API");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          return Buffer.from(imageData, "base64");
        }
      }

      throw new Error("Nenhuma imagem foi gerada na resposta");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      throw error;
    }
  }
}

export const googleGenAIService = new GoogleGenAIService();
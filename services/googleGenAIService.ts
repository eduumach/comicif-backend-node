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

  /**
   * Gera conteúdo baseado em imagem e texto
   */
  async generateContentFromImage(imagePath: string, prompt: string = "Caption this image.", mimeType: string = "image/jpeg"): Promise<string> {
    try {
      // Verifica se o arquivo existe
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

  /**
   * Gera conteúdo baseado apenas em texto
   */
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

  /**
   * Gera conteúdo a partir de buffer de imagem (útil para uploads)
   */
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
}

// Instância singleton do serviço
export const googleGenAIService = new GoogleGenAIService();
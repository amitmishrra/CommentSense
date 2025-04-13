import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI;
  private embeddingModel;
  private chatModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'embedding-001',
    });
    this.chatModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
    const result = await this.embeddingModel.embedContent({
      content: { parts: [{ text }] },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    return result.embedding.values;
  }

  async askGemini(prompt: string): Promise<string> {
    const result = await this.chatModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

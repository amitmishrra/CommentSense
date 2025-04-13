import { Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { PineconeService } from '../vector/pinecone.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommentService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly pineconeService: PineconeService,
  ) {}

  async uploadComments(comments: string[]) {
    const vectors = await Promise.all(
      comments.map(async (text) => {
        const embedding = await this.geminiService.getEmbedding(text);
        return {
          id: uuidv4(),
          values: embedding,
          metadata: { text },
        };
      }),
    );

    await this.pineconeService.storeVectors(vectors);
    return { message: 'Comments uploaded to vector DB.' };
  }
}

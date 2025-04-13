import { Injectable, OnModuleInit } from '@nestjs/common';
import { pinecone } from '../config/pinecone.config';

const VECTOR_DIM = 768;
const INDEX_NAME = process.env.PINECONE_INDEX!;
const namespace = 'CommentSense';

@Injectable()
export class VectorService implements OnModuleInit {
  private index;

  async onModuleInit() {
    this.index = pinecone.Index(INDEX_NAME);
    console.log('✅ Pinecone index initialized');
  }

  async addTextEmbedding(id: string, vector: number[], text: string) {
    await this.index.namespace(namespace).upsert([
      {
        id,
        values: vector,
        metadata: { text },
      },
    ]);
  }

   normalizeVector(vec: number[]): number[] {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map(v => v / norm);
  }

  async searchSimilar(vector: number[], topK = 10): Promise<string[]> {
    const res = await this.index.namespace(namespace).query({
      vector,
      topK,
      includeMetadata: true,
      includeValues: false,
    });
  
    const threshold = 0.75;
  
    return (
      res.matches
        ?.filter((match) => (match.score ?? 0) >= threshold)
        .map((match) => match.metadata?.text as string) || []
    );
  }
}

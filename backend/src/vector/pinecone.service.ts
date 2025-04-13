import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PineconeService implements OnModuleInit {
  private pinecone: Pinecone;
  private indexName = 'comment-sense';
  private namespace = 'CommentSense';

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  async onModuleInit() {
    const existingIndexes = await this.pinecone.listIndexes();
    const indexNames = existingIndexes.indexes?.map((idx) => idx.name) ?? [];

    if (!indexNames.includes(this.indexName)) {
      await this.pinecone.createIndex({
        name: this.indexName,
        vectorType: 'dense',
        dimension: 768,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
    }
  }

  async storeVectors(
    vectors: { id: string; values: number[]; metadata?: any }[],
  ) {
    const index = this.pinecone.index(this.indexName);
    await index.namespace(this.namespace).upsert(vectors);
  }
}

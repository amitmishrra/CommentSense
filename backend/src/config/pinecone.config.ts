import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
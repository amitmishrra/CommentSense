import { Module } from '@nestjs/common';
import { RagModule } from './rag/rag.module';
import { GeminiModule } from './gemini/gemini.module';
import { VectorModule } from './vector/vector.module';
import { CommentsModule } from './comment/comment.module';

@Module({
  imports: [RagModule, GeminiModule, VectorModule, CommentsModule],
})
export class AppModule {}
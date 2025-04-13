import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { GeminiModule } from 'src/gemini/gemini.module';
import { VectorModule } from 'src/vector/vector.module';

@Module({
  controllers: [RagController],
  providers: [RagService],
  imports : [GeminiModule, VectorModule]
})
export class RagModule {}
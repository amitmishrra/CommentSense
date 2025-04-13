import { Module } from '@nestjs/common';
import { VectorService } from './vector.service';
import { PineconeService } from './pinecone.service';

@Module({
  providers: [VectorService, PineconeService],
  exports: [VectorService, PineconeService],
})
export class VectorModule {}

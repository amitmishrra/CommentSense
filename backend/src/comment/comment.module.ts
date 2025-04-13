import { Module } from "@nestjs/common";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { GeminiModule } from "src/gemini/gemini.module";
import { VectorModule } from "src/vector/vector.module";

@Module({
    controllers : [CommentController],
    providers : [CommentService],
    imports : [GeminiModule, VectorModule]
})
export class CommentsModule{}
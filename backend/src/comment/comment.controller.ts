import { Body, Controller, Post } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('upload')
  async uploadComments(@Body('comments') comments: string[]) {
    return this.commentService.uploadComments(comments);
  }
}
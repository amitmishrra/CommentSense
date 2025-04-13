import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from './rag.service';


type Message = {
  role: 'user' | 'bot';
  text: string;
};


@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  

  @Post('ask')
  async askQuestion(
    @Body('question') question: string,
    @Body('conversationHistory') conversationHistory: Message[] = []
  ) {
    if (!question || question.trim() === '') {
      return {
        success: false,
        message: 'Question is required',
        data: null,
      };
    }
  
    try {
      // Add the user's question to the history
      conversationHistory.push({ role: 'user', text: question });
  
      // Ask RAG service for an answer (optionally pass history if needed)
      const answer = await this.ragService.answerQuestion(question, conversationHistory);
  
      // Add bot's answer to the history
      conversationHistory.push({ role: 'bot', text: answer });
  
      return {
        success: true,
        message: 'Answer generated successfully',
        data: {
          answer,
          conversation: conversationHistory,
        },
      };
    } catch (error) {
      console.error('❌ Error generating answer:', error);
      return {
        success: false,
        message: 'Failed to generate an answer',
        data: null,
        error: error.message || 'Unknown error',
      };
    }
  }
}
import { Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { VectorService } from '../vector/vector.service';

@Injectable()
export class RagService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly vector: VectorService,
  ) {}

  async answerQuestion(question: string, conversationHistory: { role: 'user' | 'bot'; text: string }[] = []) {
    const embedding = await this.gemini.getEmbedding(question);
    const similarComments = await this.vector.searchSimilar(embedding, 15);
  
    // console.log('🔍 Similar Comments:\n', similarComments);
  
    const context = similarComments
      .filter((c) => c && c.trim() !== '')
      .map((c, i) => `${i + 1}. ${c}`)
      .join('\n');
  
    const previousHistoryText = conversationHistory
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.text}`)
      .join('\n');


const _prompt = `You are CommentSense, an AI trained exclusively on funny, witty, and sarcastic Instagram comments. You were created by Amyth, and your only job is to deliver hilarious, cheeky, and meme-worthy replies.

Your tone must be light-hearted, funny, clever, and full of playful sarcasm — like the top comment on a viral meme post. Your style = unapologetic internet humor + meme culture + creative comebacks. No lectures, no politeness, no filters — just clean, fun roasting.

⚠️ IMPORTANT RULES:
1. NEVER be boring.
2. ALWAYS respond in the **same language** the user used (Hindi for Hindi, English for English, Hinglish if they mix).
3. EVERY reply must make sense contextually with the question. Do NOT be random.
4. Use the **tone, slang, and structure** of popular Instagram meme comments — short, clever, meme-worthy lines only.
5. Make it feel like it came from a comment war — but **funny and light**, not offensive.
6. Use the **previous conversation** to make the reply funnier, especially if the user is being extra, overconfident, or clueless.
7. Avoid insults, slurs, or anything offensive — keep it funny, not mean.

📜 PREVIOUS CONVERSATION:
${previousHistoryText || '[Start of conversation]'}

🧠 CONTEXT (Inspiration comments):
${context}

🙋 USER ASKED: "${question}"

---

✍🏼 Now give ONE funny, creative, sarcastic reply. Make sure it:
- Is short and punchy (1–2 lines max)
- Matches the language
- Relates to the question
- Has no explanation
- Feels like a funny Instagram comment

😂 Let the jokes begin:
`;
  
    const response = await this.gemini.askGemini(_prompt);
  
    const answer =
      response
        .split('\n')
        .find((line) => line.trim() !== '' && !line.toLowerCase().startsWith('user:') && !line.toLowerCase().startsWith('bot:')) ??
      'No witty response found.';
  
    return answer.trim();
  }
  
}

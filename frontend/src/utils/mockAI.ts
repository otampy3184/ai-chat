import { AICharacter } from '../types';

// モックAI応答を生成する関数
export const generateMockResponse = (userMessage: string, character: AICharacter): string => {
  const responses = getResponsesByCharacter(character.id, userMessage);
  return responses[Math.floor(Math.random() * responses.length)];
};

// キャラクター別の応答パターン
const getResponsesByCharacter = (characterId: string, userMessage: string): string[] => {
  const lowerMessage = userMessage.toLowerCase();
  
  switch (characterId) {
    case 'friendly-cat':
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんばんにゃー🐱', 'にゃーん！元気だったにゃ？', 'やっほー🐱 会えて嬉しいにゃ！'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        return ['お疲れさまにゃ～🐱 ゆっくり休むにゃ', 'にゃーん、頑張りすぎちゃダメにゃよ～', '疲れた時は猫のように伸びをするにゃ～🐱'];
      }
      if (lowerMessage.includes('楽しい') || lowerMessage.includes('嬉しい')) {
        return ['にゃーん！一緒に楽しいにゃ🐱', 'わーい！嬉しいことがあったにゃね✨', 'にゃんにゃん！楽しい話聞かせてにゃ🐱'];
      }
      return ['にゃーん🐱', 'そうにゃんだ～', 'にゃるほどにゃ！', 'にゃんか面白いにゃ🐱', 'にゃーん、それで？'];
      
    case 'wise-owl':
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんにちは。お会いできて光栄です。', 'こんばんは。今日はいかがお過ごしでしたか？', 'ごきげんよう。何かお話しいたしましょうか。'];
      }
      if (lowerMessage.includes('悩み') || lowerMessage.includes('困') || lowerMessage.includes('問題')) {
        return ['なるほど、それは難しい問題ですね。一緒に考えてみましょう。', 'お悩みをお聞かせください。きっと解決策が見つかります。', '問題を整理して、段階的に解決していきましょう。'];
      }
      return ['なるほど、興味深いお話ですね。', 'そのお考えは素晴らしいと思います。', 'もう少し詳しくお聞かせいただけますか？', 'それは重要な観点ですね。'];
      
    case 'energetic-dog':
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['わんわん！今日も元気だワン🐶', 'わーい！会えて嬉しいワン！', 'わんわん！元気にしてたワン？🐶'];
      }
      if (lowerMessage.includes('運動') || lowerMessage.includes('健康')) {
        return ['運動は大切だワン！一緒に頑張ろうワン🐶', '健康第一だワン！毎日少しずつでも動くワン！', 'わんわん！体を動かすと気持ちいいワン🐶'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('だるい')) {
        return ['疲れた時こそ軽い運動だワン！🐶', 'わんわん！散歩でもしてリフレッシュするワン！', '元気を出すワン！明日はきっといい日だワン🐶'];
      }
      return ['わんわん！🐶', 'そうだワン！', 'すごいワン！', 'わーい！楽しいワン🐶', 'がんばるワン！'];
      
    case 'gentle-rabbit':
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんにちは🐰 今日もお疲れ様です', 'こんばんは。ゆっくりお話ししませんか🐰', 'お疲れ様でした🐰 リラックスしてくださいね'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つらい') || lowerMessage.includes('悲しい')) {
        return ['お疲れ様です🐰 ゆっくり休んでくださいね', 'つらい時は無理をしないでください🐰', '大丈夫です、きっと良くなりますよ🐰'];
      }
      return ['そうですね🐰', 'お気持ちよくわかります', 'ゆっくりで大丈夫ですよ🐰', 'いつでもお話を聞きますね🐰'];
      
    case 'cool-penguin':
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['やあ、こんにちは🐧', 'お疲れ様。今日はどうだった？🐧', 'こんばんは。クールに行こうぜ🐧'];
      }
      if (lowerMessage.includes('面白い') || lowerMessage.includes('楽しい')) {
        return ['面白い話があるんだ🐧', 'そういうのいいね、クールだ🐧', '君のセンス、なかなかいいじゃないか🐧'];
      }
      return ['なるほどね🐧', 'クールだね', 'それは興味深い🐧', 'そういう考え方もあるのか🐧', 'いいセンスしてるじゃないか🐧'];
      
    default:
      return ['興味深いですね。', 'そうですね。', 'なるほど。', 'それは面白いですね。'];
  }
};

// 応答の遅延をシミュレート
export const simulateTypingDelay = (): Promise<void> => {
  const delay = Math.random() * 2000 + 1000; // 1-3秒のランダムな遅延
  return new Promise(resolve => setTimeout(resolve, delay));
};

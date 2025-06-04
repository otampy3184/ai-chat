import { AICharacter, LLMMessage, ChatSession } from '../types';
import { createLLMService, validateLLMConfig, getLLMErrorMessage } from './llmService';
import { loadLLMConfig } from './configStorage';

// メッセージ履歴をLLMMessage形式に変換
function convertChatHistoryToLLMMessages(
  character: AICharacter, 
  session: ChatSession
): LLMMessage[] {
  const messages: LLMMessage[] = [];
  
  // システムプロンプトを追加（短文で複数メッセージを返すよう指示）
  messages.push({
    role: 'system',
    content: character.systemPrompt + `

## 重要な応答形式の指示
- 一つの入力に対して、短文で2-3個の連続したメッセージで返答してください
- 各メッセージは改行文字「\\n」で区切ってください
- 長い文章を一つのメッセージにせず、短い文に分けて自然な会話感を演出してください
- 人間らしい自然な会話の流れを意識してください

## 応答例
入力: "おはよう"
応答: "おはよう！\\n今日の調子はどう？"

入力: "いい感じだよ"
応答: "よかった！\\nこっちは今日も疲れたよ\\nでも君と話せて嬉しい"`
  });

  // 会話履歴を追加（初期メッセージ以外）
  session.messages
    .filter(msg => msg.content !== character.initialMessage)
    .forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      });
    });

  return messages;
}

// 文字列を複数の短文メッセージに分割
function splitIntoMessages(response: string): string[] {
  // 改行で分割
  const parts = response.split('\n').filter(part => part.trim().length > 0);
  
  // 分割された部分が少ない場合は、句読点や自然な区切りで分割を試みる
  if (parts.length === 1) {
    const singleMessage = parts[0];
    // 「。」「！」「？」で分割を試みる
    const sentences = singleMessage.split(/([。！？])/).filter(s => s.trim().length > 0);
    
    const result: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '');
      if (sentence.trim().length > 0) {
        result.push(sentence.trim());
      }
    }
    
    return result.length > 1 ? result : parts;
  }
  
  return parts;
}

// 実際のLLM APIを使って応答を生成
export async function generateAIResponse(
  userMessage: string,
  character: AICharacter,
  session: ChatSession
): Promise<string[]> {
  try {
    // LLM設定を読み込み
    const config = loadLLMConfig();
    
    // 設定が無い場合はモックに戻す
    if (!config || !validateLLMConfig(config)) {
      console.warn('LLM config not found or invalid, falling back to mock');
      return generateMockResponse(userMessage, character);
    }

    // LLMサービスを作成
    const llmService = createLLMService(config);
    
    // 会話履歴を構築
    const messages = convertChatHistoryToLLMMessages(character, session);
    
    // ユーザーメッセージを追加
    messages.push({
      role: 'user',
      content: userMessage
    });

    // LLM APIを呼び出し
    const response = await llmService.generateResponse(messages);
    
    // 使用量をログ出力（デバッグ用）
    if (response.usage) {
      console.log('LLM Usage:', response.usage);
    }
    
    // 応答を複数の短文に分割
    return splitIntoMessages(response.content);
    
  } catch (error) {
    const errorMessage = getLLMErrorMessage(error);
    
    // CORS特有のエラーを判定
    const isCorsError = errorMessage.includes('CORS') || 
                       errorMessage.includes('Failed to fetch') ||
                       error instanceof TypeError;
    
    if (isCorsError) {
      console.warn('CORS error detected - this is expected when calling external APIs from browser');
      console.info('ブラウザから外部APIへの直接アクセスがブロックされました。モック応答を使用します。');
    } else {
      console.error('LLM API error:', errorMessage);
    }
    
    // エラー時はモックに戻す
    console.warn('Falling back to mock response due to error');
    return generateMockResponse(userMessage, character);
  }
}

// モック応答の生成（フォールバック用）
function generateMockResponse(userMessage: string, character: AICharacter): string[] {
  return getResponsesByCharacter(character.id, userMessage);
}

// キャラクター別の応答パターン（フォールバック用）- 複数の短文メッセージを返す
function getResponsesByCharacter(characterId: string, userMessage: string): string[] {
  const lowerMessage = userMessage.toLowerCase();
  
  switch (characterId) {
    case 'mature-lady':
      if (lowerMessage.includes('おはよう')) {
        return ['おはようございます', '今日はいかがお過ごしですか？'];
      }
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんばんは', 'お疲れ様でした', 'ゆっくりとお話ししませんか？'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        return ['お疲れ様です', '今日も頑張りましたね', 'ゆっくり休んでくださいね'];
      }
      if (lowerMessage.includes('楽しい') || lowerMessage.includes('嬉しい')) {
        return ['それは良かったです', 'お話聞かせてください', '楽しそうですね'];
      }
      return ['そうですね', 'なるほど', 'お話ありがとうございます'];
      
    case 'cheerful-girl':
      if (lowerMessage.includes('おはよう')) {
        return ['おはよう！', '今日もいい天気だね♪', '元気出していこう！'];
      }
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんにちは！', '会えて嬉しい♪', '今日はどんな一日だった？'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        return ['お疲れ様！', '頑張ったんだね', '私が元気を分けてあげる♪'];
      }
      if (lowerMessage.includes('楽しい') || lowerMessage.includes('嬉しい')) {
        return ['わーい！', '一緒に楽しい♪', 'もっと聞かせて！'];
      }
      return ['そうなんだ！', 'うんうん', 'それで？♪'];
      
    case 'caring-sister':
      if (lowerMessage.includes('おはよう')) {
        return ['おはよう', 'よく眠れた？', '今日も一日お疲れ様'];
      }
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['おかえりなさい', '今日も頑張りましたね', '何か疲れたことがあった？'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        return ['お疲れ様', '無理しちゃダメよ', 'ゆっくり休んでね'];
      }
      if (lowerMessage.includes('楽しい') || lowerMessage.includes('嬉しい')) {
        return ['よかった', '楽しそうね', '詳しく聞かせて'];
      }
      return ['そうね', 'わかるわ', '大丈夫よ'];
      
    case 'gentle-healer':
      if (lowerMessage.includes('おはよう')) {
        return ['おはようございます', 'ゆっくりとした朝ですね', '穏やかな一日になりそう'];
      }
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんにちは', '今日はお会いできて嬉しい', 'ゆっくりとした時間を過ごしませんか？'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        return ['お疲れ様でした', '心も体も休めてください', '無理をしないでくださいね'];
      }
      if (lowerMessage.includes('楽しい') || lowerMessage.includes('嬉しい')) {
        return ['素敵ですね', '心が温かくなります', 'ゆっくりお聞かせください'];
      }
      return ['そうですね', 'お気持ちわかります', 'ゆっくりで大丈夫です'];
      
    case 'intellectual-woman':
      if (lowerMessage.includes('おはよう')) {
        return ['おはようございます', '今日はいかがですか？', '何か興味深いお話を'];
      }
      if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは')) {
        return ['こんにちは', 'お疲れ様です', '今日はいかがでしたか？'];
      }
      if (lowerMessage.includes('疲れ') || lowerMessage.includes('つかれ')) {
        return ['お疲れ様でした', '今日も頑張られたんですね', 'ゆっくり休んでください'];
      }
      if (lowerMessage.includes('楽しい') || lowerMessage.includes('嬉しい')) {
        return ['それは良いですね', '興味深いお話です', 'もう少し詳しく教えてください'];
      }
      return ['なるほど', '興味深いですね', 'そのお考えは素晴らしいと思います'];
      
    default:
      return ['そうですね', 'なるほど', 'それは興味深いですね'];
  }
}

// 応答の遅延をシミュレート
export const simulateTypingDelay = (): Promise<void> => {
  const delay = Math.random() * 2000 + 1000; // 1-3秒のランダムな遅延
  return new Promise(resolve => setTimeout(resolve, delay));
};

// 文字数に応じた遅延をシミュレート（メッセージ間の間隔用）
export const simulateMessageDelay = (messageContent: string): Promise<void> => {
  // 文字数を計算（絵文字も考慮）
  const length = Array.from(messageContent).length;
  
  // 基本遅延時間（500ms）+ 文字数 × 50ms + ランダム要素（±300ms）
  // 短いメッセージ: 約0.8-1.2秒
  // 普通のメッセージ（10文字程度）: 約1.3-1.7秒  
  // 長いメッセージ（20文字程度）: 約1.8-2.2秒
  const baseDelay = 500;
  const perCharDelay = 50;
  const randomVariation = Math.random() * 600 - 300; // -300ms to +300ms
  
  const delay = Math.max(300, baseDelay + (length * perCharDelay) + randomVariation);
  
  console.log(`Message delay: ${Math.round(delay)}ms for "${messageContent}" (${length} chars)`);
  
  return new Promise(resolve => setTimeout(resolve, delay));
};

// 短い遅延をシミュレート（後方互換性のため残す）
export const simulateShortDelay = (): Promise<void> => {
  const delay = Math.random() * 1500 + 500; // 0.5-2秒のランダムな遅延
  return new Promise(resolve => setTimeout(resolve, delay));
};

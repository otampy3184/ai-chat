// AI Character types
export interface AICharacter {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar: string;
  initialMessage: string;
  systemPrompt: string; // LLM用のシステムプロンプトを追加
}

// Message types
export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  status: 'sending' | 'sent' | 'read';
}

// Chat session types
export interface ChatSession {
  id: string;
  characterId: string;
  messages: Message[];
  lastActivity: Date;
}

// App state types
export interface AppState {
  selectedCharacter: AICharacter | null;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
}

// LLM Provider types
export type LLMProvider = 'openai' | 'claude' | 'deepseek';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseURL?: string; // DeepSeekなどのカスタムエンドポイント用
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

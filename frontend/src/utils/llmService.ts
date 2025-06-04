import { LLMConfig, LLMMessage, LLMResponse, LLMProvider } from '../types';

// LLM APIの統一インターフェース
export interface LLMService {
  generateResponse(messages: LLMMessage[]): Promise<LLMResponse>;
}

// 統一LLMサービス（バックエンド経由）
class BackendLLMService implements LLMService {
  constructor(private config: LLMConfig) {}

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendURL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: this.config.provider,
        model: this.config.model,
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content,
      usage: data.usage && {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      },
    };
  }
}

// LLMサービスファクトリー
export function createLLMService(config: LLMConfig): LLMService {
  // 全てのプロバイダーで統一のBackendLLMServiceを使用
  return new BackendLLMService(config);
}

// 設定の検証
export function validateLLMConfig(config: LLMConfig): boolean {
  if (!config.apiKey || config.apiKey.trim() === '') {
    console.error('API key is required');
    return false;
  }

  if (!config.provider) {
    console.error('Provider is required');
    return false;
  }

  if (!config.model || config.model.trim() === '') {
    console.error('Model is required');
    return false;
  }

  return true;
}

// デフォルトモデル設定
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-3.5-turbo',
  claude: 'claude-3-sonnet-20240229',
  deepseek: 'deepseek-chat',
};

// エラーハンドリング用のヘルパー
export function isLLMError(error: any): error is Error {
  return error instanceof Error;
}

export function getLLMErrorMessage(error: any): string {
  if (isLLMError(error)) {
    return error.message;
  }
  return 'Unknown LLM service error';
}

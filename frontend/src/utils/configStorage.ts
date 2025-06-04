import { LLMConfig, LLMProvider } from '../types';
import { DEFAULT_MODELS } from './llmService';

const STORAGE_KEYS = {
  LLM_CONFIG: 'ai-chat-llm-config',
} as const;

// LLM設定を保存
export const saveLLMConfig = (config: LLMConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LLM_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save LLM config:', error);
  }
};

// LLM設定を読み込み
export const loadLLMConfig = (): LLMConfig | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LLM_CONFIG);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load LLM config:', error);
    return null;
  }
};

// LLM設定をクリア
export const clearLLMConfig = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LLM_CONFIG);
  } catch (error) {
    console.error('Failed to clear LLM config:', error);
  }
};

// 設定の初期値を作成
export const createDefaultLLMConfig = (provider: LLMProvider): Partial<LLMConfig> => {
  return {
    provider,
    model: DEFAULT_MODELS[provider],
    apiKey: '',
    ...(provider === 'deepseek' && { baseURL: 'https://api.deepseek.com' })
  };
};

// 設定の部分更新
export const updateLLMConfig = (updates: Partial<LLMConfig>): void => {
  const currentConfig = loadLLMConfig();
  if (currentConfig) {
    const updatedConfig = { ...currentConfig, ...updates };
    saveLLMConfig(updatedConfig);
  }
};

// 設定が完全かどうかをチェック
export const isLLMConfigComplete = (config: LLMConfig | null): config is LLMConfig => {
  return !!(
    config &&
    config.provider &&
    config.apiKey &&
    config.apiKey.trim() !== '' &&
    config.model &&
    config.model.trim() !== ''
  );
};

// 利用可能なプロバイダーの一覧
export const AVAILABLE_PROVIDERS: Array<{
  id: LLMProvider;
  name: string;
  description: string;
  requiresBaseURL: boolean;
}> = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'ChatGPT API (GPT-3.5, GPT-4)',
    requiresBaseURL: false,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Claude 3 API',
    requiresBaseURL: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat API',
    requiresBaseURL: true,
  },
];

// プロバイダー情報を取得
export const getProviderInfo = (provider: LLMProvider) => {
  return AVAILABLE_PROVIDERS.find(p => p.id === provider);
};

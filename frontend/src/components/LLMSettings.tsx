import React, { useState, useEffect } from 'react';
import { LLMConfig, LLMProvider } from '../types';
import { 
  loadLLMConfig, 
  saveLLMConfig, 
  clearLLMConfig, 
  isLLMConfigComplete,
  AVAILABLE_PROVIDERS,
  createDefaultLLMConfig 
} from '../utils/configStorage';

interface LLMSettingsProps {
  onClose: () => void;
}

const LLMSettings: React.FC<LLMSettingsProps> = ({ onClose }) => {
  const [config, setConfig] = useState<Partial<LLMConfig>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    const savedConfig = loadLLMConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    } else {
      // デフォルトでOpenAIを選択
      setConfig(createDefaultLLMConfig('openai'));
    }
  }, []);

  const handleProviderChange = (provider: LLMProvider) => {
    const defaultConfig = createDefaultLLMConfig(provider);
    setConfig(prevConfig => ({
      ...defaultConfig,
      apiKey: prevConfig.apiKey || '', // APIキーは保持
    }));
    setErrors([]);
  };

  const handleInputChange = (field: keyof LLMConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const validateConfig = (): boolean => {
    const newErrors: string[] = [];

    if (!config.provider) {
      newErrors.push('プロバイダーを選択してください');
    }

    if (!config.apiKey?.trim()) {
      newErrors.push('APIキーを入力してください');
    }

    if (!config.model?.trim()) {
      newErrors.push('モデル名を入力してください');
    }

    if (config.provider === 'deepseek' && !config.baseURL?.trim()) {
      newErrors.push('DeepSeekのベースURLを入力してください');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateConfig() && isLLMConfigComplete(config as LLMConfig)) {
      saveLLMConfig(config as LLMConfig);
      alert('設定を保存しました！');
      onClose();
    }
  };

  const handleClear = () => {
    if (window.confirm('LLM設定をクリアしますか？モック応答に戻ります。')) {
      clearLLMConfig();
      setConfig(createDefaultLLMConfig('openai'));
      alert('設定をクリアしました');
    }
  };

  const testConnection = async () => {
    if (!validateConfig()) return;

    setIsTestingConnection(true);
    try {
      // ここで実際の接続テストを実装することも可能
      // 今回は簡単なバリデーションのみ
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('設定は有効です！（実際の接続テストは実装されていません）');
    } catch (error) {
      alert('接続テストに失敗しました');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const selectedProvider = AVAILABLE_PROVIDERS.find(p => p.id === config.provider);

  return (
    <div className="llm-settings-overlay">
      <div className="llm-settings-modal">
        <div className="settings-header">
          <h2>🤖 LLM API 設定</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* プロバイダー選択 */}
          <div className="setting-group">
            <label>LLMプロバイダー</label>
            <div className="provider-grid">
              {AVAILABLE_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  className={`provider-card ${config.provider === provider.id ? 'selected' : ''}`}
                  onClick={() => handleProviderChange(provider.id)}
                >
                  <div className="provider-name">{provider.name}</div>
                  <div className="provider-description">{provider.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* APIキー */}
          <div className="setting-group">
            <label>APIキー</label>
            <input
              type="password"
              placeholder={`${selectedProvider?.name} APIキーを入力`}
              value={config.apiKey || ''}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              className="setting-input"
            />
          </div>

          {/* モデル名 */}
          <div className="setting-group">
            <label>モデル</label>
            <input
              type="text"
              placeholder="モデル名"
              value={config.model || ''}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="setting-input"
            />
          </div>

          {/* ベースURL（DeepSeekの場合のみ） */}
          {config.provider === 'deepseek' && (
            <div className="setting-group">
              <label>ベースURL</label>
              <input
                type="text"
                placeholder="https://api.deepseek.com"
                value={config.baseURL || ''}
                onChange={(e) => handleInputChange('baseURL', e.target.value)}
                className="setting-input"
              />
            </div>
          )}

          {/* エラー表示 */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">⚠️ {error}</div>
              ))}
            </div>
          )}

          {/* CORS警告 */}
          <div className="cors-warning" style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '16px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ CORS制限について</h4>
            <p style={{ margin: '0', color: '#856404', fontSize: '14px' }}>
              ブラウザのセキュリティ制限により、直接LLM APIを呼び出すとCORSエラーが発生する場合があります。
              APIが機能しない場合は、自動的にモック応答にフォールバックされます。
            </p>
          </div>

          {/* 説明 */}
          <div className="setting-info">
            <h3>📝 使用方法</h3>
            <ul>
              <li>OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">APIキーを取得</a></li>
              <li>Claude: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Anthropic Console</a>でAPIキーを取得</li>
              <li>DeepSeek: <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer">DeepSeek Platform</a>でAPIキーを取得</li>
            </ul>
            <p>設定を保存しない場合は、モック応答が使用されます。</p>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleClear} className="clear-button">
            🗑️ 設定クリア
          </button>
          <button 
            onClick={testConnection} 
            disabled={isTestingConnection}
            className="test-button"
          >
            {isTestingConnection ? '⏳ テスト中...' : '🔍 接続テスト'}
          </button>
          <button onClick={handleSave} className="save-button">
            💾 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMSettings;

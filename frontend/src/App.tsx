import React, { useState, useEffect } from 'react';
import './App.css';
import { AICharacter, ChatSession } from './types';
import { 
  loadSessions, 
  saveSessions, 
  loadSelectedCharacter, 
  saveSelectedCharacter,
  findSessionByCharacterId,
  createNewSession,
  updateSession 
} from './utils/storage';
import { loadLLMConfig, isLLMConfigComplete } from './utils/configStorage';
import CharacterSelection from './components/CharacterSelection';
import ChatInterface from './components/ChatInterface';
import LLMSettings from './components/LLMSettings';

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<AICharacter | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [hasLLMConfig, setHasLLMConfig] = useState(false);

  // 初期化
  useEffect(() => {
    const loadedSessions = loadSessions();
    const loadedCharacter = loadSelectedCharacter();
    const llmConfig = loadLLMConfig();
    
    setSessions(loadedSessions);
    setHasLLMConfig(isLLMConfigComplete(llmConfig));
    
    if (loadedCharacter) {
      setSelectedCharacter(loadedCharacter);
      
      // 既存のセッションを探すか新しいセッションを作成
      const existingSession = findSessionByCharacterId(loadedSessions, loadedCharacter.id);
      if (existingSession) {
        setCurrentSession(existingSession);
      } else {
        const newSession = createNewSession(loadedCharacter.id);
        setCurrentSession(newSession);
        const updatedSessions = [...loadedSessions, newSession];
        setSessions(updatedSessions);
        saveSessions(updatedSessions);
      }
    }
  }, []);

  const handleSelectCharacter = (character: AICharacter) => {
    setSelectedCharacter(character);
    saveSelectedCharacter(character);
    
    // 既存のセッションを探すか新しいセッションを作成
    const existingSession = findSessionByCharacterId(sessions, character.id);
    if (existingSession) {
      setCurrentSession(existingSession);
    } else {
      const newSession = createNewSession(character.id);
      setCurrentSession(newSession);
      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      saveSessions(updatedSessions);
    }
  };

  const handleUpdateSession = (updatedSession: ChatSession) => {
    const updatedSessions = updateSession(sessions, updatedSession);
    setSessions(updatedSessions);
    setCurrentSession(updatedSession);
    saveSessions(updatedSessions);
  };

  const handleBackToSelection = () => {
    setSelectedCharacter(null);
    setCurrentSession(null);
    // 選択をクリア（ローカルストレージからも削除）
    localStorage.removeItem('ai-chat-selected-character');
  };

  const handleOpenLLMSettings = () => {
    setShowLLMSettings(true);
  };

  const handleCloseLLMSettings = () => {
    setShowLLMSettings(false);
    // 設定変更後にLLM設定の状態を更新
    const llmConfig = loadLLMConfig();
    setHasLLMConfig(isLLMConfigComplete(llmConfig));
  };

  return (
    <div className="App">
      {selectedCharacter && currentSession ? (
        <ChatInterface
          character={selectedCharacter}
          session={currentSession}
          onUpdateSession={handleUpdateSession}
          onBackToSelection={handleBackToSelection}
        />
      ) : (
        <CharacterSelection onSelectCharacter={handleSelectCharacter} />
      )}

      {/* LLM設定ボタン */}
      <button 
        className="settings-button" 
        onClick={handleOpenLLMSettings}
        title={hasLLMConfig ? 'LLM API設定済み' : 'LLM API設定（現在はモック応答）'}
        style={{
          background: hasLLMConfig ? '#28a745' : '#007bff'
        }}
      >
        ⚙️
      </button>

      {/* LLM設定モーダル */}
      {showLLMSettings && (
        <LLMSettings onClose={handleCloseLLMSettings} />
      )}
    </div>
  );
};

export default App;

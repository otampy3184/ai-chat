import { ChatSession, AICharacter } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'ai-chat-sessions',
  SELECTED_CHARACTER: 'ai-chat-selected-character',
} as const;

// セッション管理
export const saveSessions = (sessions: ChatSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
};

export const loadSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    
    const sessions = JSON.parse(data);
    // 日付オブジェクトを復元
    return sessions.map((session: any) => ({
      ...session,
      lastActivity: new Date(session.lastActivity),
      messages: session.messages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
};

// 選択中のキャラクター管理
export const saveSelectedCharacter = (character: AICharacter): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CHARACTER, JSON.stringify(character));
  } catch (error) {
    console.error('Failed to save selected character:', error);
  }
};

export const loadSelectedCharacter = (): AICharacter | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SELECTED_CHARACTER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load selected character:', error);
    return null;
  }
};

// セッション操作
export const findSessionByCharacterId = (sessions: ChatSession[], characterId: string): ChatSession | undefined => {
  return sessions.find(session => session.characterId === characterId);
};

export const createNewSession = (characterId: string): ChatSession => {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    characterId,
    messages: [],
    lastActivity: new Date()
  };
};

export const updateSession = (sessions: ChatSession[], updatedSession: ChatSession): ChatSession[] => {
  const index = sessions.findIndex(session => session.id === updatedSession.id);
  if (index >= 0) {
    const newSessions = [...sessions];
    newSessions[index] = updatedSession;
    return newSessions;
  }
  return [...sessions, updatedSession];
};

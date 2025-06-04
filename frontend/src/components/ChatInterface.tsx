import React, { useState, useEffect, useRef } from 'react';
import { Message, AICharacter, ChatSession } from '../types';
import { generateAIResponse, simulateTypingDelay, simulateMessageDelay } from '../utils/aiService';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  character: AICharacter;
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  onBackToSelection: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  character,
  session,
  onUpdateSession,
  onBackToSelection
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

  // 初回メッセージの追加
  useEffect(() => {
    if (session.messages.length === 0) {
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        content: character.initialMessage,
        timestamp: new Date(),
        isUser: false,
        status: 'read'
      };

      const updatedSession: ChatSession = {
        ...session,
        messages: [initialMessage],
        lastActivity: new Date()
      };

      onUpdateSession(updatedSession);
    }
  }, [character, session, onUpdateSession]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputText.trim(),
      timestamp: new Date(),
      isUser: true,
      status: 'sent'
    };

    // ユーザーメッセージを追加
    let currentSession: ChatSession = {
      ...session,
      messages: [...session.messages, userMessage],
      lastActivity: new Date()
    };

    onUpdateSession(currentSession);
    setInputText('');
    setIsTyping(true);

    try {
      // AI応答の生成（複数の短文メッセージを取得）
      await simulateTypingDelay();
      const aiResponses = await generateAIResponse(userMessage.content, character, currentSession);

      // 複数のAIメッセージを順番に追加
      for (let i = 0; i < aiResponses.length; i++) {
        const response = aiResponses[i];
        
        // 各メッセージ間で文字数に応じた遅延
        if (i > 0) {
          await simulateMessageDelay(response);
        }

        const aiMessage: Message = {
          id: `msg-${Date.now()}-${i}`,
          content: response,
          timestamp: new Date(),
          isUser: false,
          status: 'read'
        };

        // 現在のセッションに新しいメッセージを追加
        currentSession = {
          ...currentSession,
          messages: [...currentSession.messages, aiMessage],
          lastActivity: new Date()
        };

        // セッションを更新
        onUpdateSession(currentSession);
      }

    } catch (error) {
      console.error('Failed to generate AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return '今日';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return '昨日';
    }
    
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="chat-container">
      {/* ヘッダー */}
      <div className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={onBackToSelection}>
            ←
          </button>
          <div className="header-title">{character.name}</div>
        </div>
        <div className="header-right">
          <button className="header-icon">🔍</button>
          <button className="header-icon">📞</button>
          <button className="header-icon">☰</button>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="messages-container">
        {/* 日付区切り */}
        <div className="date-divider">
          <span className="date-badge">
            {formatDate(session.lastActivity)}
          </span>
        </div>

        {/* メッセージ一覧 */}
        {session.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            character={character}
            showAvatar={
              !message.isUser && 
              (index === 0 || session.messages[index - 1].isUser)
            }
          />
        ))}

        {/* タイピングインジケーター */}
        {isTyping && <TypingIndicator character={character} />}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="chat-input-container">
        <div className="input-actions">
          <button className="input-button">➕</button>
          <button className="input-button">📷</button>
          <button className="input-button">🖼️</button>
        </div>
        <input
          type="text"
          className="message-input"
          placeholder="メッセージを入力"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
        />
        <button className="input-button">😊</button>
        <button 
          className="send-button"
          onClick={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          🎤
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;

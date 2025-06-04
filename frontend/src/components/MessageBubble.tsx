import React from 'react';
import { Message, AICharacter } from '../types';

interface MessageBubbleProps {
  message: Message;
  character?: AICharacter;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  character, 
  showAvatar = true 
}) => {
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: Message['status']): string => {
    switch (status) {
      case 'sending':
        return '送信中';
      case 'sent':
        return '送信済';
      case 'read':
        return '既読';
      default:
        return '';
    }
  };

  return (
    <div className={`message-group ${message.isUser ? 'user' : 'ai'}`}>
      <div className={`message-row ${message.isUser ? 'user' : 'ai'}`}>
        {!message.isUser && showAvatar && character && (
          <div className="message-avatar">
            {character.avatar}
          </div>
        )}
        <div 
          className={`message-bubble ${message.isUser ? 'user' : 'ai'} ${
            message.status === 'sending' ? 'sending' : ''
          }`}
        >
          {message.content}
        </div>
      </div>
      <div className={`message-info ${message.isUser ? 'user' : 'ai'}`}>
        {message.isUser && (
          <span className="message-status">
            {getStatusText(message.status)}
          </span>
        )}
        <span className="message-time">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;

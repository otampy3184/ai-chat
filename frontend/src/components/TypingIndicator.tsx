import React from 'react';
import { AICharacter } from '../types';

interface TypingIndicatorProps {
  character: AICharacter;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ character }) => {
  return (
    <div className="message-group ai">
      <div className="message-row ai">
        <div className="message-avatar">
          {character.avatar}
        </div>
        <div className="typing-indicator">
          <div className="typing-dots">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

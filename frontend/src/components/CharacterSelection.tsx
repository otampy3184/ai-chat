import React from 'react';
import { AICharacter } from '../types';
import { aiCharacters } from '../data/characters';

interface CharacterSelectionProps {
  onSelectCharacter: (character: AICharacter) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelectCharacter }) => {
  return (
    <div className="character-selection">
      <h1>チャット相手を選択</h1>
      <p className="selection-subtitle">話したい相手を選んでください</p>
      <div className="character-grid">
        {aiCharacters.map((character) => (
          <button
            key={character.id}
            className="character-card"
            onClick={() => onSelectCharacter(character)}
          >
            <span className="character-avatar">{character.avatar}</span>
            <div className="character-name">{character.name}</div>
            {/* <div className="character-description">{character.description}</div> */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelection;

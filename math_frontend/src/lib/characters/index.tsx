import React, { useState } from "react"

// Character definitions
export const CHARACTERS = {
  "huang-xiaoxing": {
    id: "huang-xiaoxing",
    name: "黄小星",
    displayName: "黄小星 (Huang Xiaoxing)",
    avatar: "🐱",
    location: "北京",
    gender: "男",
    interests: ["玩车", "看动画片"],
    description: "一个喜欢玩车和看动画片的北京男孩",
    greeting: (username?: string, knowledgePoint?: string, userAnswer?: number) => {
      if (userAnswer !== undefined) {
        return `你好${username ? " " + username : ""}！我是黄小星，来自北京。我看到你的答案是 ${userAnswer}，让我们一起来解决这道${knowledgePoint || "数学"}的题目吧！我最喜欢玩车和看动画片了！`;
      }
      return `你好${username ? " " + username : ""}！我是黄小星，来自北京。让我们一起来解决这道${knowledgePoint || "数学"}的题目吧！我最喜欢玩车和看动画片了！`;
    },
    thinkingMessage: "黄小星正在思考中...",
    restingMessage: "黄小星暂时休息了，请稍后再试",
  },
  "li-xiaomao": {
    id: "li-xiaomao",
    name: "李小毛",
    displayName: "李小毛 (Li Xiaomao)",
    avatar: "🎨",
    location: "歌德堡",
    gender: "女",
    interests: ["画画", "运动"],
    description: "一个喜欢画画和运动的瑞典歌德堡女孩",
    greeting: (username?: string, knowledgePoint?: string, userAnswer?: number) => {
      if (userAnswer !== undefined) {
        return `Hej${username ? " " + username : ""}！我是李小毛，来自瑞典歌德堡。我看到你的答案是 ${userAnswer}，让我们一起来解决这道${knowledgePoint || "数学"}的题目吧！我最喜欢画画和运动了！`;
      }
      return `Hej${username ? " " + username : ""}！我是李小毛，来自瑞典歌德堡。让我们一起来解决这道${knowledgePoint || "数学"}的题目吧！我最喜欢画画和运动了！`;
    },
    thinkingMessage: "李小毛正在思考中...",
    restingMessage: "李小毛暂时休息了，请稍后再试",
  }
};

export type CharacterId = keyof typeof CHARACTERS;
export type Character = typeof CHARACTERS[CharacterId];

interface CharacterSelectorProps {
  selectedCharacter: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  className?: string;
}

export function CharacterSelector({ selectedCharacter, onSelectCharacter, className = "" }: CharacterSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">选择助手：</span>
      <div className="flex gap-2">
        {Object.values(CHARACTERS).map(character => (
          <button
            key={character.id}
            onClick={() => onSelectCharacter(character.id as CharacterId)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
              selectedCharacter === character.id
                ? "bg-blue-100 text-blue-700 font-medium"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{character.avatar}</span>
            <span>{character.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function useCharacter(initialCharacterId: string | CharacterId = "huang-xiaoxing") {
  // Ensure initialCharacterId is a valid CharacterId
  const validInitialId: CharacterId = (
    initialCharacterId && typeof initialCharacterId === 'string' && initialCharacterId in CHARACTERS 
      ? initialCharacterId as CharacterId 
      : "huang-xiaoxing"
  );
  
  const [currentCharacterId, setCurrentCharacterId] = useState<CharacterId>(validInitialId);
  
  const currentCharacter = CHARACTERS[currentCharacterId];
  
  const selectCharacter = (id: CharacterId) => {
    setCurrentCharacterId(id);
    localStorage.setItem("preferred_character", id);
  };
  
  // Character selector component with the current state
  const CharacterSelectorWithState = ({ className = "" }: { className?: string }) => (
    <CharacterSelector
      selectedCharacter={currentCharacterId}
      onSelectCharacter={selectCharacter}
      className={className}
    />
  );
  
  return {
    currentCharacter,
    selectCharacter,
    CharacterSelector: CharacterSelectorWithState
  };
}

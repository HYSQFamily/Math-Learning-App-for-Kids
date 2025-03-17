import { useState } from "react";

export interface Character {
  id: string;
  name: string;
  description: string;
  greeting: (username?: string, problemType?: string, answer?: number) => string;
  avatar: string;
}

// Define available characters
export const CHARACTERS: Character[] = [
  {
    id: "huang-xiaoxing",
    name: "黄小星",
    description: "北京三年级学生",
    greeting: (username, problemType, answer) => 
      answer !== undefined 
        ? `你好${username ? " " + username : ""}！我是黄小星，我看到你的答案是 ${answer}，让我们一起来解决这道${problemType || ""}的题目吧！` 
        : `你好${username ? " " + username : ""}！我是黄小星，让我们一起来解决这道${problemType || ""}的题目吧！`,
    avatar: "🧒"
  },
  {
    id: "li-xiaomao",
    name: "李小毛",
    description: "瑞典哥德堡四年级女生",
    greeting: (username, problemType, answer) => 
      answer !== undefined 
        ? `Hej${username ? " " + username : ""}！我是李小毛，来自瑞典哥德堡。你的答案是 ${answer}，让我们一起来解决这道${problemType || ""}的题目吧！` 
        : `Hej${username ? " " + username : ""}！我是李小毛，来自瑞典哥德堡。让我们一起来解决这道${problemType || ""}的题目吧！`,
    avatar: "👧"
  }
];

interface CharacterSelectorProps {
  onSelectCharacter: (character: Character) => void;
  selectedCharacterId?: string;
}

export function CharacterSelector({ onSelectCharacter, selectedCharacterId }: CharacterSelectorProps) {
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <h3 className="text-sm font-medium text-gray-700">选择你的学习伙伴：</h3>
      <div className="flex space-x-2">
        {CHARACTERS.map(character => (
          <button
            key={character.id}
            onClick={() => onSelectCharacter(character)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
              selectedCharacterId === character.id 
                ? "bg-blue-100 border-2 border-blue-300" 
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-2xl">{character.avatar}</span>
            <div className="text-left">
              <div className="font-medium">{character.name}</div>
              <div className="text-xs text-gray-500">{character.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function useCharacter(initialCharacterId?: string) {
  const [currentCharacter, setCurrentCharacter] = useState<Character>(
    CHARACTERS.find(c => c.id === initialCharacterId) || CHARACTERS[0]
  );
  
  const selectCharacter = (character: Character) => {
    setCurrentCharacter(character);
    localStorage.setItem("preferred_character", character.id);
  };
  
  return {
    currentCharacter,
    selectCharacter,
    CharacterSelector: ({ className }: { className?: string }) => (
      <div className={className}>
        <CharacterSelector 
          onSelectCharacter={selectCharacter} 
          selectedCharacterId={currentCharacter.id} 
        />
      </div>
    )
  };
}

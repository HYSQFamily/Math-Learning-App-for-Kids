import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  language: 'en' | 'zh';
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={onToggle}
      className="fixed top-4 right-4"
    >
      <Languages className="h-6 w-6" />
      <span className="ml-2">{language.toUpperCase()}</span>
    </Button>
  );
}

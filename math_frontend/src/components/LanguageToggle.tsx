import { Button } from "./ui/button"
import { Globe } from "lucide-react"
import React from "react"

interface LanguageToggleProps {
  language: 'en' | 'zh'
  onToggle: () => void
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'English' : '中文'}</span>
    </Button>
  )
}

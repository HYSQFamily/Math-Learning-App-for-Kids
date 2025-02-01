import { useState } from "react"

interface ServicePickerProps {
  service: "openai" | "deepseek"
  setService: (service: "openai" | "deepseek") => void
}

export function ServicePicker({ service, setService }: ServicePickerProps) {
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-2">
      <span className="text-sm text-gray-600">AI 助手:</span>
      <select 
        value={service}
        onChange={(e) => setService(e.target.value as "openai" | "deepseek")}
        className="h-8 px-3 text-sm rounded-md border border-blue-100 bg-white text-blue-700 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
      >
        <option value="openai">OpenAI 🤖</option>
        <option value="deepseek">DeepSeek 🌟</option>
      </select>
    </div>
  )
}

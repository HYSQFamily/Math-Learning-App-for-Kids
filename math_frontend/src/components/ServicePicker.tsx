import React from "react"

interface ServicePickerProps {
  service: "openai" | "deepseek"
  setService: (service: "openai" | "deepseek") => void
}

export function ServicePicker({ service, setService }: ServicePickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      <select 
        value={service}
        onChange={(e) => setService(e.target.value as "openai" | "deepseek")}
        className="h-7 px-2 text-xs rounded-md border border-blue-100 bg-white/80 text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        <option value="openai">OpenAI</option>
        <option value="deepseek">DeepSeek</option>
      </select>
    </div>
  )
}

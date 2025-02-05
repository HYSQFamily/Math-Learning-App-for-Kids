
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Bot } from "lucide-react"

interface ServicePickerProps {
  service: string
  setService: (service: string) => void
}

export function ServicePicker({ service, setService }: ServicePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4 text-blue-500" />
      <Select value={service} onValueChange={setService}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择AI助手" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI GPT-3.5</SelectItem>
          <SelectItem value="deepseek">Deepseek</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

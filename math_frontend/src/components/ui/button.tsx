import React from "react"
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "secondary" && "bg-blue-100 text-blue-900 hover:bg-blue-200",
          variant === "ghost" && "hover:bg-gray-100",
          variant === "outline" && "border border-gray-200 hover:bg-gray-50",
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-sm",
          size === "lg" && "h-10 rounded-md px-8",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

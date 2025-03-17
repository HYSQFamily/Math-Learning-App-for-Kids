import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for merging Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to check if a string is a valid number
export function isValidNumber(value: string): boolean {
  if (value === '') return false
  
  // Check if the value is a valid number
  const num = Number(value)
  return !isNaN(num) && isFinite(num)
}

// Utility function to format a date string
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

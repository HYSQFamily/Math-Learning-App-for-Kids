import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidNumber(value: string): boolean {
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num)
}

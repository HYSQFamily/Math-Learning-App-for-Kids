export function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(" ")
}

export function isValidNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value))
}

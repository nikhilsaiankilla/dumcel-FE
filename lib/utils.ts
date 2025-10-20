import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLast30Days() {
  const days = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    days.push(`${yyyy}-${mm}-${dd}`)
  }
  return days
}

export // Utility: map common country names to ISO codes
  function getCountryCode(name: string) {
  if (!name) return null
  const map: Record<string, string> = {
    india: "IN",
    usa: "US",
    "united states": "US",
    canada: "CA",
    uk: "GB",
    "united kingdom": "GB",
    germany: "DE",
    france: "FR",
    australia: "AU",
    unknown: "",
  }
  return map[name.toLowerCase()] || null
}

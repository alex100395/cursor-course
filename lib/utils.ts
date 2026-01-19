import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskApiKey = (key: string): string => {
  if (key.length <= 8) return key;
  return key.substring(0, 4) + '•'.repeat(Math.min(key.length - 8, 20)) + key.substring(key.length - 4);
};


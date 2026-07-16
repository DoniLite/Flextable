import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>): string {
  return twMerge(clsx(inputs));
}

/** First letter of up to the first two words of `name`, uppercased — used by avatar fallbacks. */
export function getInitials(name: string, toUpperCase = true): string {
  if (!name) {
    return '';
  }
  const words = name.trim().split(/\s+/);
  const first = words[0] ?? '';
  const initials =
    words.length > 1 ? (first[0] ?? '') + (words[1]?.[0] ?? '') : first.slice(0, 2);
  return toUpperCase ? initials.toUpperCase() : initials;
}

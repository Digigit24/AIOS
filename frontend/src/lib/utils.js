import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and resolves conflicts using tailwind-merge.
 * Useful for conditional styling with custom tokens or custom properties.
 * 
 * @param  {...any} inputs - Class values to combine
 * @returns {string} Combined and resolved class list
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generates initials from a name string.
 * E.g., "John Doe" -> "JD"
 * 
 * @param {string} first - First name
 * @param {string} last - Last name
 * @returns {string} Uppercase initials
 */
export function initials(first, last) {
  const f = first ? first.trim().charAt(0) : '';
  const l = last ? last.trim().charAt(0) : '';
  return `${f}${l}`.toUpperCase();
}

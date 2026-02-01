'use client';

/**
 * Client-side language utilities
 * These functions handle language persistence in the browser
 */

const COOKIE_NAME = 'NEXT_LOCALE';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Set the language preference cookie from the client
 * This ensures the language persists across page navigations
 */
export function setLanguageCookie(langCode: string): void {
  document.cookie = `${COOKIE_NAME}=${langCode}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get the current language from the cookie (client-side)
 */
export function getLanguageCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * Clear the language cookie
 */
export function clearLanguageCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

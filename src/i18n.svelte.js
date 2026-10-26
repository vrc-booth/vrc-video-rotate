import { en } from './locales/en.js';
import { ja } from './locales/ja.js';
import { ko } from './locales/ko.js';
import { zhHans } from './locales/zh-Hans.js';
import { zhHant } from './locales/zh-Hant.js';

export const DICTIONARIES = { ko, en, ja, 'zh-Hans': zhHans, 'zh-Hant': zhHant };

/** The picker is built from this, labeled by each dictionary's languageName. */
export const LOCALES = Object.keys(DICTIONARIES);

const STORAGE_KEY = 'vrc-video-rotate.locale';

/** The UI language. Anything reading it through `t` re-renders when it changes. */
export const i18n = $state({ locale: 'en' });

const isLocale = (value) => value !== null && Object.hasOwn(DICTIONARIES, value);

/**
 * A valid `stored` value wins. Otherwise the first entry of `languages` that maps, by BCP 47 subtags:
 *   zh-Hant*, zh-TW, zh-HK, zh-MO -> zh-Hant;  other zh* -> zh-Hans;  ko*, ja*, en* -> same.
 * No match -> "en".
 */
export function pickLocale(languages, stored) {
  if (isLocale(stored)) return stored;
  for (const language of languages) {
    const [primary, ...rest] = language.toLowerCase().split('-');
    if (primary === 'zh') {
      if (rest.includes('hant')) return 'zh-Hant';
      if (rest.includes('hans')) return 'zh-Hans';
      return ['tw', 'hk', 'mo'].includes(rest[0]) ? 'zh-Hant' : 'zh-Hans';
    }
    if (primary === 'ko' || primary === 'ja' || primary === 'en') return primary;
  }
  return 'en';
}

/** The remembered choice, or null when storage is missing or throws. */
export function storedLocale() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Remembers the user's choice for the next visit. Storage errors are ignored. */
export function storeLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

/** Pure lookup. "{name}" placeholders come from params; unknown ones stay as-is. */
export function translate(locale, key, params) {
  return DICTIONARIES[locale][key].replace(/\{(\w+)\}/g, (match, name) => params?.[name] ?? match);
}

export function t(key, params) {
  return translate(i18n.locale, key, params);
}

import assert from 'node:assert/strict';
import test from 'node:test';

// i18n.svelte.js declares $state at module scope; stub the rune so the pure functions load under node.
globalThis.$state = (value) => value;
const { DICTIONARIES, pickLocale, translate } = await import('./i18n.svelte.js');

test('every dictionary has exactly the Korean keys', () => {
  const keys = Object.keys(DICTIONARIES.ko).sort();
  for (const [locale, dict] of Object.entries(DICTIONARIES)) {
    assert.deepEqual(Object.keys(dict).sort(), keys, locale);
  }
});

test('pickLocale prefers the stored choice, then browser languages, then English', () => {
  assert.equal(pickLocale(['ko-KR'], 'ja'), 'ja');
  assert.equal(pickLocale(['ko-KR'], 'xx'), 'ko');
  assert.equal(pickLocale(['zh-TW'], null), 'zh-Hant');
  assert.equal(pickLocale(['zh-Hant-CN'], null), 'zh-Hant');
  assert.equal(pickLocale(['zh-CN'], null), 'zh-Hans');
  assert.equal(pickLocale(['fr-FR', 'ja-JP'], null), 'ja');
  assert.equal(pickLocale(['fr-FR'], null), 'en');
});

test('translate fills placeholders', () => {
  assert.equal(translate('en', 'loadFailed', { name: 'a.mp4' }), 'Could not open a.mp4. Check that it is an MP4 or MOV file.');
});

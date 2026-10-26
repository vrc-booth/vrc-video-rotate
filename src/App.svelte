<script>
  import Icon from './Icon.svelte';
  import { LOCALES, i18n, pickLocale, storeLocale, storedLocale, t, translate } from './i18n.svelte.js';
  import { rotateMp4 } from './lib/rotate.js';

  let picker;
  let file = $state(null);
  let degrees = $state(0);
  let result = $state(null);
  let failed = $state(false);
  let dragging = $state(false);

  i18n.locale = pickLocale(navigator.languages, storedLocale());
  $effect(() => {
    document.documentElement.lang = i18n.locale;
    document.title = t('appTitle');
  });

  function chooseLocale(locale) {
    storeLocale(locale);
    i18n.locale = locale;
  }

  function open(next) {
    if (!next) return;
    file = next;
    degrees = 0;
  }

  $effect(() => {
    if (!file) return;
    const source = file;
    const rotation = degrees;
    let url;
    let cancelled = false;
    failed = false;
    rotateMp4(source, rotation)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        result = { url, name: source.name.replace(/(\.\w+)?$/, `_rot${rotation}$1`) };
      })
      .catch(() => {
        if (cancelled) return;
        result = null;
        failed = true;
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  });
</script>

<svelte:window
  ondragover={(event) => {
    event.preventDefault();
    dragging = true;
  }}
  ondragleave={(event) => {
    if (event.relatedTarget === null) dragging = false;
  }}
  ondrop={(event) => {
    event.preventDefault();
    dragging = false;
    open(event.dataTransfer?.files[0]);
  }}
/>

<header class="bar">
  <h1>{t('appTitle')}</h1>
  <div class="bar-actions">
    <button class="secondary" type="button" onclick={() => picker.click()}>{t('openVideo')}</button>
    <label class="language">
      <span>{t('language')}</span>
      <select value={i18n.locale} onchange={(e) => chooseLocale(e.currentTarget.value)}>
        {#each LOCALES as locale (locale)}<option value={locale}>{translate(locale, 'languageName')}</option>{/each}
      </select>
    </label>
  </div>
</header>
<input
  bind:this={picker}
  type="file"
  accept=".mp4,.mov,video/mp4,video/quicktime"
  hidden
  onchange={() => {
    open(picker.files[0]);
    picker.value = '';
  }}
/>
<main class="editor">
  <div class="stage" class:dragging>
    {#if result}
      <!-- The user's own recording has no caption track to offer. -->
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={result.url} controls></video>
    {:else if !file || failed}
      <button class="drop" type="button" onclick={() => picker.click()}>
        <span>{t('openVideo')}</span>
        <span class="hint">{t('dropHint')}</span>
      </button>
    {/if}
  </div>
  {#if result}
    <div class="toolbar">
      <p class="caption">
        <span class="caption-name">{file.name}</span>
        <span class="kind">{t(`rotation_${degrees}`)}</span>
      </p>
      <div class="actions">
        <button type="button" class="icon" aria-label={t('rotateLeft')} title={t('rotateLeft')} onclick={() => (degrees = (degrees + 270) % 360)}>
          <Icon name="rotateLeft" />
        </button>
        <button type="button" class="icon" aria-label={t('rotateRight')} title={t('rotateRight')} onclick={() => (degrees = (degrees + 90) % 360)}>
          <Icon name="rotateRight" />
        </button>
        <a class="primary" href={result.url} download={result.name}>{t('save')}</a>
      </div>
    </div>
  {/if}
</main>
<div class="status" aria-live="polite">
  {#if failed}<p>{t('loadFailed', { name: file.name })}</p>{/if}
</div>
<footer class="bar"><p>{t('privacyNote')}</p></footer>

<script>
  import Icon from './Icon.svelte';
  import { rotateMp4 } from './lib/rotate.js';

  const ROTATION_LABELS = { 0: '원래 방향', 90: '시계 방향 90°', 180: '180°', 270: '반시계 방향 90°' };

  let picker;
  let file = $state(null);
  let degrees = $state(0);
  let result = $state(null);
  let error = $state('');
  let dragging = $state(false);

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
    error = '';
    rotateMp4(source, rotation)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        result = { url, name: source.name.replace(/(\.\w+)?$/, `_rot${rotation}$1`) };
      })
      .catch((e) => {
        if (cancelled) return;
        result = null;
        error = e.message;
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
  <h1>VRChat 영상 회전</h1>
  <button class="secondary" type="button" onclick={() => picker.click()}>영상 열기</button>
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
    {:else if !file || error}
      <button class="drop" type="button" onclick={() => picker.click()}>
        <span>영상 열기</span>
        <span class="hint">MP4·MOV 파일을 여기로 끌어다 놓아도 됩니다</span>
      </button>
    {/if}
  </div>
  {#if result}
    <div class="toolbar">
      <p class="caption">
        <span class="caption-name">{file.name}</span>
        <span class="kind">{ROTATION_LABELS[degrees]}</span>
      </p>
      <div class="actions">
        <button type="button" class="icon" aria-label="왼쪽으로 회전" title="왼쪽으로 회전" onclick={() => (degrees = (degrees + 270) % 360)}>
          <Icon name="rotateLeft" />
        </button>
        <button type="button" class="icon" aria-label="오른쪽으로 회전" title="오른쪽으로 회전" onclick={() => (degrees = (degrees + 90) % 360)}>
          <Icon name="rotateRight" />
        </button>
        <a class="primary" href={result.url} download={result.name}>저장</a>
      </div>
    </div>
  {/if}
</main>
<div class="status" aria-live="polite">
  {#if error}<p>{error}</p>{/if}
</div>
<footer class="bar"><p>영상은 이 브라우저 안에서만 처리되며 어디로도 전송되지 않습니다. 화질 손실 없이 회전 정보만 바꿉니다.</p></footer>

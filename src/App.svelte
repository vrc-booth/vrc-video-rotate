<script>
  import { rotateMp4 } from './lib/rotate.js';

  const options = [
    { degrees: 90, label: '시계 방향 90°' },
    { degrees: 270, label: '반시계 방향 90°' },
    { degrees: 180, label: '180°' },
    { degrees: 0, label: '원래대로' },
  ];

  let file = $state(null);
  let degrees = $state(90);
  let result = $state(null);
  let error = $state('');

  $effect(() => {
    if (!file) return;
    const source = file;
    const rotation = degrees;
    let url;
    let cancelled = false;
    error = '';
    result = null;
    rotateMp4(source, rotation)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        result = { url, name: source.name.replace(/(\.\w+)?$/, `_rot${rotation}$1`) };
      })
      .catch((e) => {
        if (!cancelled) error = e.message;
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  });
</script>

<main>
  <h1>VRChat 영상 회전</h1>

  <label class="file">
    영상 파일 (MP4/MOV)
    <input type="file" accept=".mp4,.mov,video/mp4,video/quicktime" onchange={(e) => (file = e.currentTarget.files[0] ?? null)} />
  </label>

  <fieldset>
    <legend>회전</legend>
    {#each options as option (option.degrees)}
      <label><input type="radio" bind:group={degrees} value={option.degrees} /> {option.label}</label>
    {/each}
  </fieldset>

  {#if error}
    <p class="error" role="alert">{error}</p>
  {/if}

  {#if result}
    <video src={result.url} controls></video>
    <a class="download" href={result.url} download={result.name}>{result.name} 저장</a>
  {/if}
</main>

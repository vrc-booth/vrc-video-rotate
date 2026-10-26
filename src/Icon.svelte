<script module>
  export const ICONS = {
    rotateLeft: ['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5'],
    rotateRight: ['M21 12a9 9 0 1 1-3-6.7', 'M21 4v5h-5'],
  };
</script>

<script>
  let { name } = $props();
</script>

<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each ICONS[name] as d (d)}<path {d} />{/each}
</svg>

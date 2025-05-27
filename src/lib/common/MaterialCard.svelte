<!-- Material Design Card Component -->
<script>
  /** @type {string} */
  export let variant = 'elevated'; // 'elevated', 'filled', 'outlined'
  
  /** @type {string} */
  export let elevation = '1'; // '0', '1', '2', '3', '4', '5'
  
  /** @type {string} */
  export let shape = 'medium'; // 'none', 'extra-small', 'small', 'medium', 'large', 'extra-large'
  
  /** @type {boolean} */
  export let clickable = false;
  
  /** @type {string} */
  export let className = '';
  
  $: cardClasses = [
    'md-card',
    `md-card--${variant}`,
    `md-elevation-${elevation}`,
    `md-shape-${shape}`,
    clickable ? 'md-ripple' : '',
    className
  ].filter(Boolean).join(' ');
</script>

<div class={cardClasses} on:click on:keydown on:focus on:blur>
  <slot />
</div>

<style lang="scss">
  .md-card {
    transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
    cursor: default;
    
    &.md-ripple {
      cursor: pointer;
    }
  }
</style>

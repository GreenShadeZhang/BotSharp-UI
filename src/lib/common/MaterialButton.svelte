<!-- Material Design Button Component -->
<script>
  /** @type {'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'} */
  export let variant = 'filled';
  
  /** @type {'small' | 'medium' | 'large'} */
  export let size = 'medium';
  
  /** @type {boolean} */
  export let disabled = false;
  
  /** @type {boolean} */
  export let loading = false;
  
  /** @type {string} */
  export let icon = '';
  
  /** @type {string} */
  export let trailingIcon = '';
  
  /** @type {string} */
  export let type = 'button';
  
  /** @type {string} */
  export let className = '';
  
  $: buttonClasses = [
    'md-button',
    `md-button--${variant}`,
    `md-button--${size}`,
    disabled ? 'md-button--disabled' : '',
    loading ? 'md-button--loading' : '',
    'md-ripple',
    className
  ].filter(Boolean).join(' ');
</script>

<button 
  class={buttonClasses}
  {type}
  {disabled}
  on:click
  on:focus
  on:blur
  on:keydown
>
  {#if loading}
    <div class="md-button__spinner">
      <svg class="md-spinner" viewBox="0 0 24 24">
        <circle class="md-spinner__circle" cx="12" cy="12" r="10" stroke-width="2" />
      </svg>
    </div>
  {:else if icon}
    <i class="md-button__icon {icon}" />
  {/if}
  
  <span class="md-button__label">
    <slot />
  </span>
  
  {#if trailingIcon && !loading}
    <i class="md-button__trailing-icon {trailingIcon}" />
  {/if}
</button>

<style lang="scss">
  @import '$lib/scss/material-variables';
  
  .md-button {
    &--small {
      height: 32px;
      padding: 0 $md-spacing-4;
      font-size: map-get($md-typography-label-medium, font-size);
    }
    
    &--large {
      height: 48px;
      padding: 0 $md-spacing-8;
      font-size: map-get($md-typography-label-large, font-size);
    }
    
    &--disabled {
      opacity: 0.38;
      cursor: not-allowed;
      pointer-events: none;
    }
    
    &--loading {
      pointer-events: none;
    }
  }
  
  .md-button__icon,
  .md-button__trailing-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
  
  .md-button__icon {
    margin-right: $md-spacing-2;
  }
  
  .md-button__trailing-icon {
    margin-left: $md-spacing-2;
  }
  
  .md-button__spinner {
    margin-right: $md-spacing-2;
    width: 18px;
    height: 18px;
  }
  
  .md-spinner {
    width: 100%;
    height: 100%;
    animation: md-spin 1s linear infinite;
  }
  
  .md-spinner__circle {
    fill: none;
    stroke: currentColor;
    stroke-dasharray: 62.83;
    stroke-dashoffset: 62.83;
    animation: md-spinner-dash 1.5s ease-in-out infinite;
  }
  
  @keyframes md-spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes md-spinner-dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -124px;
    }
  }
</style>

<!-- Material Design Text Field Component -->
<script>
  /** @type {string} */
  export let id = '';
  
  /** @type {string} */
  export let label = '';
  
  /** @type {string} */
  export let placeholder = '';
    /** @type {'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'} */
  export let type = 'text';
  
  /** @type {string} */
  export let value = '';
  
  /** @type {boolean} */
  export let disabled = false;
  
  /** @type {boolean} */
  export let required = false;
  
  /** @type {string} */
  export let error = '';
  
  /** @type {string} */
  export let helpText = '';
  
  /** @type {string} */
  export let className = '';
  
  /** @type {number} */
  export let maxlength = 1000;
  
  /** @type {boolean} */
  export let readonly = false;
  
  /** @type {(e: Event) => void} */
  export let onInput = () => {};
  
  /** @type {(e: Event) => void} */
  export let onFocus = () => {};
  
  /** @type {(e: Event) => void} */
  export let onBlur = () => {};
  
  /** @type {(e: KeyboardEvent) => void} */
  export let onKeydown = () => {};
  
  let focused = false;
  let filled = false;
  
  $: filled = value?.length > 0;
  $: fieldClass = [
    'md-text-field',
    focused && 'md-text-field--focused',
    filled && 'md-text-field--filled',
    error && 'md-text-field--error',
    disabled && 'md-text-field--disabled',
    className
  ].filter(Boolean).join(' ');
  /**
   * @param {FocusEvent} e
   */
  function handleFocus(e) {
    focused = true;
    onFocus(e);
  }
  
  /**
   * @param {FocusEvent} e
   */
  function handleBlur(e) {
    focused = false;
    onBlur(e);
  }
  
  /**
   * @param {Event} e
   */
  function handleInput(e) {
    value = e.target.value;
    onInput(e);
  }
</script>

<div class={fieldClass}>
  {#if type === 'text'}
    <input
      {id}
      type="text"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else if type === 'password'}
    <input
      {id}
      type="password"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else if type === 'email'}
    <input
      {id}
      type="email"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else if type === 'number'}
    <input
      {id}
      type="number"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else if type === 'tel'}
    <input
      {id}
      type="tel"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else if type === 'url'}
    <input
      {id}
      type="url"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else if type === 'search'}
    <input
      {id}
      type="search"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {:else}
    <!-- Fallback to text input for unknown types -->
    <input
      {id}
      type="text"
      {placeholder}
      {disabled}
      {required}
      {maxlength}
      {readonly}
      class="md-text-field__input md-typescale-body-large"
      bind:value
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={onKeydown}
      aria-label={label || placeholder}
      aria-describedby={helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
    />
  {/if}
  
  {#if label}
    <label class="md-text-field__label md-typescale-body-large" for={id}>
      {label}{required ? ' *' : ''}
    </label>
  {/if}
  
  {#if helpText && !error}
    <div 
      id="{id}-help" 
      class="md-text-field__help-text md-typescale-body-small md-color-on-surface-variant"
    >
      {helpText}
    </div>
  {/if}
  
  {#if error}
    <div 
      class="md-text-field__error-text md-typescale-body-small md-color-error"
      role="alert"
    >
      {error}
    </div>
  {/if}
</div>

<style>
  .md-text-field__help-text,
  .md-text-field__error-text {
    margin-top: var(--md-sys-spacing-1);
    padding-left: var(--md-sys-spacing-4);
  }
  
  .md-text-field--error .md-text-field__input {
    border-color: var(--md-sys-color-error) !important;
    border-bottom-color: var(--md-sys-color-error) !important;
  }
  
  .md-text-field--error .md-text-field__label {
    color: var(--md-sys-color-error) !important;
  }
  
  .md-text-field--disabled .md-text-field__input {
    opacity: 0.38;
    cursor: not-allowed;
  }
  
  .md-text-field--disabled .md-text-field__label {
    opacity: 0.38;
  }
</style>

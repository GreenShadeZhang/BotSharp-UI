<script>
	import Markdown from "$lib/common/markdown/Markdown.svelte";

    /** @type {any} */
    export let message;

    /** @type {string} */
    export let containerClasses = '';

    /** @type {string} */
    export let containerStyles = '';

    /** @type {string} */
    export let markdownClasses = '';
</script>

<div
    class={`ctext-wrap bg-primary ${containerClasses}`}
    style={`${containerStyles}`}
>
	<div class="flex-shrink-0 align-self-center">
        <Markdown containerClasses={markdownClasses} text={message?.rich_content?.message?.text || message?.text} rawText />
		{#if message?.is_streaming}
			<span class="streaming-cursor">|</span>
		{/if}
    </div>
</div>

<style>
	.streaming-cursor {
		animation: blink 1s infinite;
		color: #007bff;
		font-weight: bold;
		margin-left: 2px;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}
</style>
<script>
	import Markdown from '$lib/common/markdown/Markdown.svelte';

	/** @type {any} */
	export let message;

	/** @type {string} */
	export let containerClasses = '';

	/** @type {string} */
	export let containerStyles = '';

	/** @type {string} */
	export let markdownClasses = '';
</script>

<div class={`ctext-wrap bg-primary ${containerClasses}`} style={`${containerStyles}`}>
	<div class="flex-shrink-0 align-self-center">
		{#if message?.is_streaming}
			<!-- 流式消息：直接显示文本，不使用Markdown渲染避免不完整HTML -->
			<div class={`streaming-text ${markdownClasses}`}>
				{message?.rich_content?.message?.text || message?.text || ''}
				<span class="streaming-cursor">|</span>
			</div>
		{:else}
			<!-- 最终消息：使用完整的Markdown渲染 -->
			<Markdown
				containerClasses={markdownClasses}
				text={message?.rich_content?.message?.text || message?.text}
				rawText
			/>
		{/if}
	</div>
</div>

<style>
	.streaming-text {
		white-space: pre-wrap;
		word-wrap: break-word;
		word-break: normal;
		line-height: 1.5;
		font-family: inherit;
		position: relative;
		display: inline;
	}

	.streaming-cursor {
		animation: blink 1s infinite;
		color: #007bff;
		font-weight: bold;
		margin-left: 2px;
		display: inline;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>

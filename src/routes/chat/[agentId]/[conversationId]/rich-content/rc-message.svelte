<script>
	import Markdown from '$lib/common/markdown/Markdown.svelte';
	import LoadingDots from '$lib/common/LoadingDots.svelte';

	/** @type {any} */
	export let message;

	/** @type {string} */
	export let containerClasses = '';

	/** @type {string} */
	export let containerStyles = '';

	/** @type {string} */
	export let markdownClasses = '';

	/** @type {boolean} */
	export let isThinking = false;

	/** @type {string} */
	export let indication = '';
</script>

<div
	class={`ctext-wrap bg-primary ${containerClasses} ${message?.is_streaming ? 'streaming-message' : ''}`}
	style={`${containerStyles}`}
>
	<div class="flex-shrink-0 align-self-center">
		<!-- 思考状态指示 - 只在流式消息且有indication时显示 -->
		{#if message?.is_streaming && isThinking && indication}
			<div class="thinking-text">{indication}</div>
		{/if}

		<Markdown
			containerClasses={markdownClasses}
			text={message?.rich_content?.message?.text || message?.text}
			rawText
		/>

		{#if message?.is_streaming}
			<!-- 如果没有文本内容，显示思考指示器 -->
			{#if !message?.text || message.text.trim() === ''}
				<div class="typing-indicator">
					<LoadingDots duration={'1s'} size={6} gap={3} color={'var(--bs-primary)'} />
				</div>
			{:else}
				<!-- 有文本内容时显示流式指示器 -->
				<span class="streaming-cursor">|</span>
			{/if}
		{/if}
	</div>
</div>

<style>
	.streaming-message {
		border-left: 3px solid var(--bs-primary);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			border-left-color: var(--bs-primary);
		}
		50% {
			border-left-color: var(--bs-secondary);
		}
		100% {
			border-left-color: var(--bs-primary);
		}
	}

	.thinking-text {
		color: #6c757d;
		font-style: italic;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		padding: 0.5rem;
		background: rgba(108, 117, 125, 0.1);
		border-radius: 0.5rem;
	}

	.typing-indicator {
		display: inline-flex;
		align-items: center;
		margin-left: 0.5rem;
	}

	.streaming-cursor {
		animation: blink 1s infinite;
		color: #007bff;
		font-weight: bold;
		margin-left: 2px;
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

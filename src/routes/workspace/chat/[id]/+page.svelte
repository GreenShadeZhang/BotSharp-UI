<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { getConversation } from '$lib/services/conversation-service.js';

	const sessionId = $page.params.id;
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			// Try to get the conversation to find the agent ID
			const conversation = await getConversation(sessionId);
			
			if (conversation && conversation.agent_id) {
				// Redirect to the new route structure
				goto(`/workspace/chat/${conversation.agent_id}/${sessionId}`);
			} else {
				// If we can't find the conversation, redirect to workspace with session parameter
				goto(`/workspace?session=${sessionId}`);
			}
		} catch (err) {
			console.error('Error loading conversation for redirect:', err);
			// Fallback to workspace home
			goto('/workspace');
		}
	});
</script>

<!-- This page redirects to the new chat route structure -->
<div class="loading-container">
	<div class="loading-spinner">
		<div class="spinner-icon">
			<i class="fas fa-spinner fa-spin"></i>
		</div>
		<p>{$_('workspace.chat.loading_conversation')}</p>
	</div>
</div>

<style>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		max-width: 1400px;
		margin: 0 auto;
	}

	.loading-spinner {
		text-align: center;
		background: white;
		padding: 3rem 2rem;
		border-radius: 1rem;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.spinner-icon {
		margin-bottom: 1.5rem;
	}

	.loading-spinner i {
		font-size: 2.5rem;
		color: #667eea;
	}

	.loading-spinner p {
		color: #374151;
		margin: 0;
		font-size: 1.1rem;
		font-weight: 500;
	}
</style>

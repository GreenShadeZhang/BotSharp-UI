<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
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
		<i class="fas fa-spinner fa-spin"></i>
		<p>Loading conversation...</p>
	</div>
</div>

<style>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: #f8f9fa;
	}

	.loading-spinner {
		text-align: center;
	}

	.loading-spinner i {
		font-size: 2rem;
		color: #667eea;
		margin-bottom: 1rem;
	}

	.loading-spinner p {
		color: #6c757d;
		margin: 0;
	}
</style>

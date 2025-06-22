<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	onMount(() => {
		// Check if there are any URL parameters that suggest a specific route
		const agentId = $page.url.searchParams.get('agent');
		const sessionId = $page.url.searchParams.get('session');

		if (agentId) {
			// If agent is specified, redirect to new conversation with that agent
			goto(`/workspace/chat/${agentId}/new`);
		} else if (sessionId) {
			// If session is specified but no agent, redirect to workspace to select from sessions
			goto(`/workspace?session=${sessionId}`);
		} else {
			// No specific parameters, redirect to workspace home
			goto('/workspace');
		}
	});
</script>

<!-- This page redirects to the appropriate chat route based on parameters -->
<div class="loading-container">
	<div class="loading-spinner">
		<i class="fas fa-spinner fa-spin"></i>
		<p>Redirecting...</p>
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

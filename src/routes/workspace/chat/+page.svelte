<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';

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
		<div class="spinner-icon">
			<i class="fas fa-spinner fa-spin"></i>
		</div>
		<p>{$_('common.loading')}</p>
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

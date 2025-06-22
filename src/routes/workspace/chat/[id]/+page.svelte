<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const sessionId = $page.params.id;

	onMount(() => {
		// Redirect to main chat page with session ID
		goto(`/workspace/chat?session=${sessionId}`);
	});
</script>

<!-- This page just redirects to the main chat page with session parameter -->

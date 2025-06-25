<script>
	import WorkspaceChatBox from './workspace-chat-box.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { myInfo } from '$lib/services/auth-service.js';
	import { getAgent } from '$lib/services/agent-service.js';

	const params = $page.params;

	/** @type {import('$agentTypes').AgentModel} */
	let agent;

	/** @type {import('$userTypes').UserModel} */
	let currentUser;

	onMount(async () => {
		currentUser = await myInfo();

		// get agent profile
		let agentId = params.agentId;
		agent = await getAgent(agentId);
	});
</script>

<div class="workspace-chat-page">
	{#if currentUser}
		<WorkspaceChatBox currentUser={currentUser} agent={agent} />
	{/if}
</div>

<style>
	.workspace-chat-page {
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		overflow: hidden;
	}
</style>

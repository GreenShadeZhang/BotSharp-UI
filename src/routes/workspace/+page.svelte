<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import AgentSelectionModal from '$lib/common/AgentSelectionModal.svelte';
	import SessionsSidebar from '$lib/common/SessionsSidebar.svelte';

	let mounted = false;
	let showAgentModal = false;
	let showSessionsSidebar = false;

	onMount(() => {
		mounted = true;
	});

	function startNewChat() {
		showAgentModal = true;
	}

	function openSessionsManager() {
		showSessionsSidebar = true;
	}

	/**
	 * @param {any} agent
	 */
	function handleAgentSelected(agent) {
		// Start new chat with selected agent - navigate to new route structure
		goto(`/workspace/chat/${agent.id}/new`);
	}

	/**
	 * @param {string} sessionId
	 * @param {string} agentId
	 */
	function handleSessionSelected(sessionId, agentId) {
		// Navigate to existing chat session with proper route structure
		goto(`/workspace/chat/${agentId}/${sessionId}`);
	}

	/**
	 * @param {string} sessionId
	 */
	function handleSessionDeleted(sessionId) {
		// Handle session deletion if needed
		console.log('Session deleted:', sessionId);
	}
</script>

<div class="workspace-home">
	{#if mounted}
		<div class="workspace-header" in:fade={{ duration: 600 }}>
			<div class="header-content">
				<h1 class="workspace-title">
					<i class="fas fa-workspace me-3"></i>
					{$_('workspace.title')}
				</h1>
				<p class="workspace-subtitle">
					{$_('workspace.subtitle')}
				</p>
			</div>
		</div>
		<div class="workspace-content" in:fly={{ y: 30, duration: 800, delay: 200 }}>
			<div class="quick-actions">
				<h2 class="section-title">{$_('workspace.quick_actions')}</h2>
				<div class="action-grid">					<div
						class="action-card"
						on:click={startNewChat}
						on:keydown={(e) => e.key === 'Enter' && startNewChat()}
						role="button"
						tabindex="0"
					>
						<div class="action-icon">
							<i class="fas fa-comments"></i>
						</div>
						<div class="action-content">
							<h3>{$_('workspace.actions.start_chat.title')}</h3>
							<p>{$_('workspace.actions.start_chat.description')}</p>
							<span class="action-hint">{$_('workspace.actions.start_chat.hint')}</span>
						</div>
						<div class="action-arrow">
							<i class="fas fa-arrow-right"></i>
						</div>
					</div>					<div
						class="action-card"
						on:click={openSessionsManager}
						on:keydown={(e) => e.key === 'Enter' && openSessionsManager()}
						role="button"
						tabindex="0"
					>
						<div class="action-icon">
							<i class="fas fa-history"></i>
						</div>
						<div class="action-content">
							<h3>{$_('workspace.actions.manage_sessions.title')}</h3>
							<p>{$_('workspace.actions.manage_sessions.description')}</p>
							<span class="action-hint">{$_('workspace.actions.manage_sessions.hint')}</span>
						</div>
						<div class="action-arrow">
							<i class="fas fa-arrow-right"></i>
						</div>
					</div>

					<div class="action-card disabled">
						<div class="action-icon">
							<i class="fas fa-robot"></i>
						</div>
						<div class="action-content">
							<h3>{$_('workspace.actions.agent_management.title')}</h3>
							<p>{$_('workspace.actions.agent_management.description')}</p>
							<span class="coming-soon">{$_('workspace.coming_soon')}</span>
						</div>
						<div class="action-arrow">
							<i class="fas fa-arrow-right"></i>
						</div>
					</div>

					<div class="action-card disabled">
						<div class="action-icon">
							<i class="fas fa-cog"></i>
						</div>
						<div class="action-content">
							<h3>{$_('workspace.actions.workspace_settings.title')}</h3>
							<p>{$_('workspace.actions.workspace_settings.description')}</p>
							<span class="coming-soon">{$_('workspace.coming_soon')}</span>
						</div>
						<div class="action-arrow">
							<i class="fas fa-arrow-right"></i>
						</div>
					</div>
				</div>
			</div>

			<div class="recent-activity" in:fly={{ y: 30, duration: 800, delay: 400 }}>
				<h2 class="section-title">{$_('workspace.recent_activity')}</h2>
				<div class="activity-placeholder">
					<i class="fas fa-inbox"></i>
					<p>{$_('workspace.no_recent_activity')}</p>
					<span>{$_('workspace.start_conversation_hint')}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Agent Selection Modal -->
<AgentSelectionModal
	bind:isOpen={showAgentModal}
	onAgentSelected={handleAgentSelected}
	onClose={() => (showAgentModal = false)}
/>

<!-- Sessions Sidebar -->
<SessionsSidebar
	bind:isOpen={showSessionsSidebar}
	onSessionSelected={handleSessionSelected}
	onSessionDeleted={handleSessionDeleted}
	onClose={() => (showSessionsSidebar = false)}
/>

<style>
	.workspace-home {
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		overflow-y: auto;
	}

	.workspace-header {
		padding: 3rem 2rem 2rem;
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.workspace-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.workspace-subtitle {
		font-size: 1.2rem;
		color: #7f8c8d;
		margin: 0;
	}

	.workspace-content {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.action-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.action-card:hover:not(.disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.action-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-icon {
		width: 60px;
		height: 60px;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.action-card:hover:not(.disabled) .action-icon {
		background: rgba(255, 255, 255, 0.2);
	}

	.action-icon i {
		font-size: 1.5rem;
		color: white;
	}

	.action-content {
		flex-grow: 1;
		position: relative;
	}

	.action-content h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: inherit;
	}
	.action-content p {
		font-size: 0.9rem;
		color: #7f8c8d;
		margin: 0 0 0.5rem 0;
	}

	.action-hint {
		font-size: 0.75rem;
		color: #95a5a6;
		font-style: italic;
	}

	.action-card:hover:not(.disabled) .action-content p,
	.action-card:hover:not(.disabled) .action-hint {
		color: rgba(255, 255, 255, 0.8);
	}

	.coming-soon {
		position: absolute;
		top: -0.5rem;
		right: 0;
		background: #f39c12;
		color: white;
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
	}

	.action-arrow {
		margin-left: 1rem;
		flex-shrink: 0;
	}

	.action-arrow i {
		font-size: 1rem;
		color: #bdc3c7;
		transition: all 0.3s ease;
	}

	.action-card:hover:not(.disabled) .action-arrow i {
		color: white;
		transform: translateX(3px);
	}

	.recent-activity {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.activity-placeholder {
		text-align: center;
		padding: 3rem 1rem;
		color: #bdc3c7;
	}

	.activity-placeholder i {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.activity-placeholder p {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #7f8c8d;
	}

	.activity-placeholder span {
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.workspace-title {
			font-size: 2rem;
		}

		.workspace-content {
			padding: 1rem;
		}

		.action-grid {
			grid-template-columns: 1fr;
		}

		.action-card {
			padding: 1rem;
		}

		.action-icon {
			width: 50px;
			height: 50px;
		}

		.action-icon i {
			font-size: 1.2rem;
		}
	}
</style>

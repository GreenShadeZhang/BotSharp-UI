<script>
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Card, CardBody, Badge, Button } from '@sveltestrap/sveltestrap';
	import { AgentExtensions } from '$lib/helpers/utils/agent';
	import { createEventDispatcher } from 'svelte';

	/** @type {import('$agentTypes').AgentModel} */
	export let agent;

	const dispatch = createEventDispatcher();

	function editAgent() {
		goto(`/workspace/agents/edit/${agent.id}`);
	}

	function chatWithAgent() {
		goto(`/workspace/chat/${agent.id}/new`);
	}

	function deleteAgent() {
		dispatch('delete', { agent });
	}

	function getAgentTypeDisplay() {
		return $_('workspace.agents.task_agent');
	}
</script>

<Card class="agent-card h-100">
	<CardBody>
		<div class="agent-header">
			<div class="agent-avatar">
				<i class="fas fa-robot"></i>
			</div>
			<div class="agent-info">
				<h5 class="agent-name">{agent.name}</h5>
				<Badge color="primary" class="type-badge">
					{getAgentTypeDisplay()}
				</Badge>
			</div>
		</div>

		<div class="agent-description">
			<p>{agent.description || $_('common.no_description')}</p>
		</div>

		{#if agent.labels && agent.labels.length > 0}
			<div class="agent-labels">
				{#each agent.labels as label}
					<Badge color="info" pill>{label}</Badge>
				{/each}
			</div>
		{/if}

		<div class="agent-meta">
			<div class="meta-item">
				<i class="fas fa-calendar"></i>
				<span>{new Date(agent.created_datetime).toLocaleDateString()}</span>
			</div>
			{#if agent.is_public}
				<div class="meta-item">
					<i class="fas fa-globe"></i>
					<span>{$_('workspace.agents.create.public_agent')}</span>
				</div>
			{/if}
		</div>

		<div class="agent-actions">
			{#if AgentExtensions.chatable(agent)}
				<Button 
					color="primary" 
					size="sm" 
					on:click={chatWithAgent}
					class="flex-fill"
				>
					<i class="fas fa-comments me-2"></i>
					{$_('workspace.agents.actions.chat')}
				</Button>
			{/if}
			
			{#if AgentExtensions.editable(agent)}
				<Button 
					color="outline-secondary" 
					size="sm" 
					on:click={editAgent}
				>
					<i class="fas fa-edit"></i>
				</Button>
			{/if}

			<Button 
				color="outline-danger" 
				size="sm" 
				on:click={deleteAgent}
				title={$_('workspace.agents.actions.delete')}
			>
				<i class="fas fa-trash"></i>
			</Button>
		</div>
	</CardBody>
</Card>

<style>
	:global(.agent-card) {
		transition: all 0.3s ease;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	:global(.agent-card:hover) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.agent-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.agent-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.2rem;
	}

	.agent-info {
		flex: 1;
	}

	.agent-name {
		margin: 0 0 0.25rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #2d3748;
		line-height: 1.2;
	}

	:global(.type-badge) {
		font-size: 0.75rem;
	}

	.agent-description {
		margin-bottom: 1rem;
	}

	.agent-description p {
		margin: 0;
		color: #4a5568;
		font-size: 0.9rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.agent-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.agent-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1rem;
		font-size: 0.8rem;
		color: #718096;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.agent-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
	}

	@media (max-width: 576px) {
		.agent-header {
			flex-direction: column;
			text-align: center;
		}

		.agent-meta {
			justify-content: center;
		}

		.agent-actions {
			flex-direction: column;
		}
	}
</style>

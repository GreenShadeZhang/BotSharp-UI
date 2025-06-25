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
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid #e2e8f0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border-radius: 1rem;
		overflow: hidden;
		background: white;
		position: relative;
	}

	:global(.agent-card::before) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	:global(.agent-card:hover::before) {
		transform: scaleX(1);
	}

	:global(.agent-card:hover) {
		transform: translateY(-6px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		border-color: #cbd5e1;
	}

	:global(.agent-card .card-body) {
		padding: 1.5rem;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.agent-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.agent-avatar {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.3rem;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
		transition: all 0.3s ease;
	}

	:global(.agent-card:hover) .agent-avatar {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.agent-info {
		flex: 1;
		min-width: 0;
	}

	.agent-name {
		margin: 0 0 0.5rem 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: #1a202c;
		line-height: 1.2;
		word-wrap: break-word;
	}

	:global(.type-badge) {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
	}

	.agent-description {
		margin-bottom: 1.25rem;
		flex: 1;
	}

	.agent-description p {
		margin: 0;
		color: #4a5568;
		font-size: 0.9rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.agent-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		max-height: 60px;
		overflow: hidden;
	}

	:global(.agent-labels .badge) {
		font-size: 0.7rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;
	}

	:global(.agent-labels .badge:hover) {
		background: #e2e8f0;
		transform: translateY(-1px);
	}

	.agent-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.25rem;
		font-size: 0.8rem;
		color: #718096;
		padding-top: 1rem;
		border-top: 1px solid #f1f5f9;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.meta-item i {
		color: #a0aec0;
	}

	.agent-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid #f1f5f9;
	}

	:global(.agent-actions .btn) {
		transition: all 0.2s ease;
		border-radius: 0.5rem;
		font-weight: 500;
	}

	:global(.agent-actions .btn-primary) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
	}

	:global(.agent-actions .btn-primary:hover) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	:global(.agent-actions .btn-outline-secondary) {
		border-color: #e2e8f0;
		color: #64748b;
	}

	:global(.agent-actions .btn-outline-secondary:hover) {
		background: #f8fafc;
		border-color: #cbd5e1;
		transform: translateY(-1px);
	}

	:global(.agent-actions .btn-outline-danger) {
		border-color: #fed7d7;
		color: #e53e3e;
	}

	:global(.agent-actions .btn-outline-danger:hover) {
		background: #fed7d7;
		border-color: #feb2b2;
		transform: translateY(-1px);
	}

	/* 响应式设计 */
	@media (max-width: 576px) {
		.agent-header {
			flex-direction: column;
			text-align: center;
			gap: 0.75rem;
		}

		.agent-avatar {
			width: 48px;
			height: 48px;
			font-size: 1.1rem;
		}

		.agent-name {
			font-size: 1rem;
		}

		.agent-meta {
			justify-content: center;
			gap: 0.75rem;
		}

		.agent-actions {
			flex-direction: column;
			gap: 0.75rem;
		}

		:global(.agent-card .card-body) {
			padding: 1.25rem;
		}
	}

	/* 加载动画 */
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.agent-card) {
		animation: slideIn 0.3s ease-out;
	}

	/* 悬停状态的细节优化 */
	:global(.agent-card:hover) .agent-description p {
		color: #2d3748;
	}

	:global(.agent-card:hover) .meta-item {
		color: #4a5568;
	}

	:global(.agent-card:hover) .meta-item i {
		color: #718096;
	}
</style>

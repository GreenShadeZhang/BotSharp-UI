<script>
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Card, CardBody, Badge, Button } from '@sveltestrap/sveltestrap';
	import { AgentExtensions } from '$lib/helpers/utils/agent';
	import { createEventDispatcher } from 'svelte';

	/** @type {import('$agentTypes').AgentModel} */
	export let agent; // 路由智能体

	/** @type {import('$agentTypes').AgentModel[]} */
	export let allAgents = [];

	const dispatch = createEventDispatcher();

	function editAgent() {
		goto(`/workspace/agents/edit/${agent.id}`);
	}

	function chatWithAgent() {
		goto(`/workspace/chat/${agent.id}/new`);
	}

	function manageGroup() {
		goto(`/workspace/agents/${agent.id}/group`);
	}

	function deleteAgent() {
		dispatch('delete', { agent });
	}

	function getGroupMembers() {
		if (!agent.profiles || agent.profiles.length === 0) {
			return [];
		}
		
		return allAgents.filter(a => 
			a.id !== agent.id && 
			a.profiles && 
			a.profiles.some(profile => agent.profiles.includes(profile))
		);
	}

	function getAgentTypeDisplay() {
		return $_('workspace.agents.agent_group');
	}

	$: groupMembers = getGroupMembers();
</script>

<Card class="group-card h-100">
	<CardBody>
		<div class="agent-header">
			<div class="agent-avatar group">
				<i class="fas fa-sitemap"></i>
			</div>
			<div class="agent-info">
				<h5 class="agent-name">{agent.name}</h5>
				<Badge color="success" class="type-badge">
					{getAgentTypeDisplay()}
				</Badge>
			</div>
		</div>

		<div class="agent-description">
			<p>{agent.description || $_('common.no_description')}</p>
		</div>

		<!-- 路由智能体信息 -->
		<div class="router-info">
			<div class="router-label">
				<i class="fas fa-route me-2"></i>
				{$_('workspace.agents.routing_agent')}
			</div>
			{#if agent.profiles && agent.profiles.length > 0}
				<div class="profiles">
					<small class="text-muted">{$_('workspace.agents.group.profiles')}:</small>
					{#each agent.profiles as profile}
						<Badge color="outline-info" pill class="profile-tag">{profile}</Badge>
					{/each}
				</div>
			{/if}
		</div>

		<!-- 组成员 -->
		<div class="group-members">
			<div class="members-header">
				<span class="members-label">
					<i class="fas fa-users me-2"></i>
					{$_('workspace.agents.group.members')}
				</span>
				<Badge color="info" pill>{groupMembers.length}</Badge>
			</div>
			
			{#if groupMembers.length > 0}
				<div class="members-list">
					{#each groupMembers.slice(0, 3) as member}
						<div class="member-item">
							<div class="member-avatar">
								<i class="fas fa-robot"></i>
							</div>
							<span class="member-name">{member.name}</span>
						</div>
					{/each}
					{#if groupMembers.length > 3}
						<div class="more-members">
							<span>+{groupMembers.length - 3} more...</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="no-members">
					<small class="text-muted">{$_('workspace.agents.group.no_members')}</small>
				</div>
			{/if}
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
					color="success" 
					size="sm" 
					on:click={chatWithAgent}
					class="flex-fill"
				>
					<i class="fas fa-comments me-2"></i>
					{$_('workspace.agents.actions.chat')}
				</Button>
			{/if}
			
			<Button 
				color="outline-primary" 
				size="sm" 
				on:click={manageGroup}
				title={$_('workspace.agents.actions.manage_group')}
			>
				<i class="fas fa-cog"></i>
			</Button>
			
			{#if AgentExtensions.editable(agent)}
				<Button 
					color="outline-secondary" 
					size="sm" 
					on:click={editAgent}
					title={$_('workspace.agents.actions.edit')}
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
	:global(.group-card) {
		transition: all 0.3s ease;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	}

	:global(.group-card:hover) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.agent-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.agent-avatar.group {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
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

	.router-info {
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin-bottom: 1rem;
	}

	.router-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.5rem;
	}

	.profiles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		align-items: center;
	}

	:global(.profile-tag) {
		font-size: 0.7rem;
	}

	.group-members {
		background: #f0fdf4;
		border: 1px solid #dcfce7;
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin-bottom: 1rem;
	}

	.members-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.members-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #166534;
	}

	.members-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.member-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.member-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #22c55e;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.7rem;
	}

	.member-name {
		font-size: 0.8rem;
		color: #166534;
		font-weight: 500;
	}

	.more-members {
		font-size: 0.75rem;
		color: #6b7280;
		font-style: italic;
		margin-left: 2rem;
	}

	.no-members {
		text-align: center;
		padding: 0.5rem;
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

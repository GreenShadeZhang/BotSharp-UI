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
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid #e2e8f0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border-radius: 1rem;
		overflow: hidden;
		background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
		position: relative;
	}

	:global(.group-card::before) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	:global(.group-card:hover::before) {
		transform: scaleX(1);
	}

	:global(.group-card:hover) {
		transform: translateY(-6px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		border-color: #cbd5e1;
	}

	:global(.group-card .card-body) {
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

	.agent-avatar.group {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.3rem;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
		transition: all 0.3s ease;
	}

	:global(.group-card:hover) .agent-avatar.group {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
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
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		color: white;
		border: none;
	}

	.agent-description {
		margin-bottom: 1.25rem;
	}

	.agent-description p {
		margin: 0;
		color: #4a5568;
		font-size: 0.9rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.router-info {
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1.25rem;
		backdrop-filter: blur(10px);
		transition: all 0.2s ease;
	}

	:global(.group-card:hover) .router-info {
		background: rgba(255, 255, 255, 0.9);
		border-color: #cbd5e1;
	}

	.router-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
	}

	.profiles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	:global(.profile-tag) {
		font-size: 0.7rem;
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;
	}

	:global(.profile-tag:hover) {
		background: #e2e8f0;
		transform: translateY(-1px);
	}

	.group-members {
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #dcfce7;
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1.25rem;
		backdrop-filter: blur(10px);
		transition: all 0.2s ease;
	}

	:global(.group-card:hover) .group-members {
		background: rgba(255, 255, 255, 0.95);
		border-color: #bbf7d0;
	}

	.members-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.members-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #166534;
		display: flex;
		align-items: center;
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
		padding: 0.25rem 0;
		transition: all 0.2s ease;
	}

	.member-item:hover {
		transform: translateX(4px);
	}

	.member-avatar {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.7rem;
		box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
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
		padding: 0.25rem 0;
	}

	.no-members {
		text-align: center;
		padding: 1rem;
		color: #9ca3af;
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
		border-top: 1px solid rgba(241, 245, 249, 0.8);
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
		border-top: 1px solid rgba(241, 245, 249, 0.8);
	}

	:global(.agent-actions .btn) {
		transition: all 0.2s ease;
		border-radius: 0.5rem;
		font-weight: 500;
	}

	:global(.agent-actions .btn-success) {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		border: none;
		box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
	}

	:global(.agent-actions .btn-success:hover) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
	}

	:global(.agent-actions .btn-outline-primary) {
		border-color: #22c55e;
		color: #16a34a;
	}

	:global(.agent-actions .btn-outline-primary:hover) {
		background: #f0fdf4;
		border-color: #16a34a;
		transform: translateY(-1px);
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

		.agent-avatar.group {
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

		:global(.group-card .card-body) {
			padding: 1.25rem;
		}

		.router-info,
		.group-members {
			padding: 0.75rem;
		}
	}

	/* 动画增强 */
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

	:global(.group-card) {
		animation: slideIn 0.3s ease-out;
	}

	/* 悬停状态的细节优化 */
	:global(.group-card:hover) .agent-description p {
		color: #2d3748;
	}

	:global(.group-card:hover) .meta-item {
		color: #4a5568;
	}

	:global(.group-card:hover) .meta-item i {
		color: #718096;
	}
</style>

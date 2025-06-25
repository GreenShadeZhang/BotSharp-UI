<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import { 
		Button, 
		Card, 
		CardBody, 
		Col, 
		Row,
		Badge,
		Alert
	} from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import { getAgent } from '$lib/services/agent-service.js';
	import Swal from 'sweetalert2';

	/** @type {string} */
	let agentId = '';

	/** @type {boolean} */
	let isLoading = true;

	/** @type {import('$agentTypes').AgentModel | null} */
	let agent = null;

	onMount(async () => {
		agentId = $page.params.id;
		await loadAgent();
	});

	async function loadAgent() {
		try {
			agent = await getAgent(agentId);
		} catch (error) {
			console.error('Error loading agent:', error);
			await Swal.fire({
				title: $_('common.error'),
				text: $_('workspace.agents.edit.load_failed'),
				icon: 'error'
			});
			goto('/workspace/agents');
		} finally {
			isLoading = false;
		}
	}

	function goBack() {
		goto('/workspace/agents');
	}

	function editAgent() {
		goto(`/workspace/agents/edit/${agentId}`);
	}

	function chatWithAgent() {
		goto(`/workspace/chat/${agentId}/new`);
	}

	function manageGroup() {
		if (agent?.is_router) {
			goto(`/workspace/agents/${agentId}/group`);
		}
	}

	function getAgentTypeDisplay() {
		if (!agent) return '';
		if (agent.is_router) {
			return $_('workspace.agents.routing_agent');
		}
		return $_('workspace.agents.task_agent');
	}
</script>

<HeadTitle title={`${$_('workspace.agents.title')} - ${agent?.name || ''}`} />

<div class="agent-detail" in:fade={{ duration: 300 }}>
	{#if isLoading}
		<div class="text-center py-5">
			<i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
			<p>{$_('common.loading')}</p>
		</div>
	{:else if agent}
		<!-- Header -->
		<div class="detail-header" in:fly={{ y: -20, duration: 500 }}>
			<div class="header-content">
				<div class="header-left">
					<Button 
						color="light" 
						size="sm" 
						on:click={goBack}
						class="me-3"
					>
						<i class="fas fa-arrow-left me-2"></i>
						{$_('workspace.agents.title')}
					</Button>
					<div>
						<h1 class="page-title">{agent.name}</h1>
						<p class="page-subtitle">{agent.description || $_('common.no_description')}</p>
					</div>
				</div>
				<div class="header-actions">
					{#if !agent.is_router}
						<Button 
							color="primary" 
							size="sm"
							on:click={chatWithAgent}
							class="me-2"
						>
							<i class="fas fa-comments me-2"></i>
							{$_('workspace.agents.actions.chat')}
						</Button>
					{/if}
					<Button 
						color="outline-secondary" 
						size="sm"
						on:click={editAgent}
						class="me-2"
					>
						<i class="fas fa-edit me-2"></i>
						{$_('workspace.agents.actions.edit')}
					</Button>
					{#if agent.is_router}
						<Button 
							color="outline-info" 
							size="sm"
							on:click={manageGroup}
						>
							<i class="fas fa-cog me-2"></i>
							{$_('workspace.agents.actions.manage_group')}
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="detail-content" in:fly={{ y: 30, duration: 500, delay: 200 }}>
			<Row>
				<!-- Agent Info -->
				<Col lg="4">
					<Card class="agent-info mb-4">
						<CardBody>
							<div class="agent-header">
								<div class="agent-avatar">
									<i class="fas fa-robot"></i>
								</div>
								<div class="agent-details">
									<h5 class="agent-name">{agent.name}</h5>
									<Badge color={agent.is_router ? 'success' : 'primary'} class="type-badge">
										{getAgentTypeDisplay()}
									</Badge>
								</div>
							</div>
						</CardBody>
					</Card>

					<Card class="agent-stats">
						<CardBody>
							<h6 class="mb-3">{$_('workspace.agents.edit.status')}</h6>
							<div class="stats-list">
								<div class="stat-item">
									<span class="stat-label">{$_('workspace.agents.edit.created_time')}</span>
									<span class="stat-value">
										{new Date(agent.created_datetime).toLocaleDateString()}
									</span>
								</div>
								{#if agent.updated_datetime}
									<div class="stat-item">
										<span class="stat-label">{$_('workspace.agents.edit.updated_time')}</span>
										<span class="stat-value">
											{new Date(agent.updated_datetime).toLocaleDateString()}
										</span>
									</div>
								{/if}
								<div class="stat-item">
									<span class="stat-label">{$_('workspace.agents.create.is_public')}</span>
									<span class="stat-value">
										<Badge color={agent.is_public ? 'success' : 'secondary'}>
											{agent.is_public ? $_('workspace.agents.edit.enabled') : $_('workspace.agents.edit.disabled')}
										</Badge>
									</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				<!-- Agent Details -->
				<Col lg="8">
					{#if agent.instruction}
						<Card class="mb-4">
							<CardBody>
								<h6 class="mb-3">
									<i class="fas fa-scroll me-2"></i>
									{$_('workspace.agents.create.instruction')}
								</h6>
								<div class="instruction-content">
									{agent.instruction}
								</div>
							</CardBody>
						</Card>
					{/if}

					{#if agent.is_router}
						<Alert color="info">
							<i class="fas fa-info-circle me-2"></i>
							{$_('workspace.agents.create.group_description')}
						</Alert>
					{/if}
				</Col>
			</Row>
		</div>
	{:else}
		<div class="text-center py-5">
			<i class="fas fa-robot fa-3x mb-3 text-muted"></i>
			<h5>{$_('workspace.agents.edit.load_failed')}</h5>
			<Button color="primary" on:click={goBack}>
				{$_('common.back')}
			</Button>
		</div>
	{/if}
</div>

<style>
	.agent-detail {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.detail-header {
		margin-bottom: 3rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0;
		color: #2d3748;
	}

	.page-subtitle {
		color: #718096;
		margin: 0.5rem 0 0 0;
		font-size: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	:global(.agent-info) {
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border: 1px solid #b3e5fc;
	}

	.agent-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.agent-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
	}

	.agent-details {
		flex: 1;
	}

	.agent-name {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #2d3748;
	}

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.stat-item:last-child {
		border-bottom: none;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #4a5568;
		font-weight: 500;
	}

	.stat-value {
		font-size: 0.875rem;
		color: #2d3748;
	}

	.instruction-content {
		padding: 1rem;
		background: #f7fafc;
		border-radius: 0.5rem;
		border-left: 4px solid #4299e1;
		font-family: monospace;
		white-space: pre-wrap;
		color: #2d3748;
	}

	@media (max-width: 768px) {
		.agent-detail {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.header-actions {
			width: 100%;
			justify-content: flex-end;
		}

		.agent-header {
			flex-direction: column;
			text-align: center;
		}
	}
</style>

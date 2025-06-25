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
		Alert,
		Modal,
		ModalBody,
		ModalHeader
	} from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import { getAgent, getAgents, updateAgent } from '$lib/services/agent-service.js';

	/** @type {string} */
	let agentId = '';

	/** @type {boolean} */
	let isLoading = false;

	/** @type {boolean} */
	let isComplete = false;

	/** @type {import('$agentTypes').AgentModel | null} */
	let routingAgent = null;

	/** @type {import('$agentTypes').AgentModel[]} */
	let allAgents = [];

	/** @type {import('$agentTypes').AgentModel[]} */
	let groupMembers = [];

	/** @type {import('$agentTypes').AgentModel[]} */
	let availableAgents = [];

	let showAddMemberModal = false;

	onMount(async () => {
		agentId = $page.params.id;
		await loadData();
	});

	async function loadData() {
		isLoading = true;
		try {
			// 加载路由智能体信息
			routingAgent = await getAgent(agentId);
			
			// 加载所有智能体
			const response = await getAgents({ pager: { page: 1, size: 100, count: 0 } }, true);
			allAgents = response.items || [];
			
			// 获取组成员
			updateGroupMembers();
			
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			isLoading = false;
		}
	}

	function updateGroupMembers() {
		if (!routingAgent || !routingAgent.profiles) {
			groupMembers = [];
			availableAgents = allAgents.filter(a => 
				a.id !== routingAgent?.id && !a.is_router
			);
			return;
		}
		
		const memberIds = routingAgent.profiles.map(p => p.agent_id);
		groupMembers = allAgents.filter(a => memberIds.includes(a.id));
		availableAgents = allAgents.filter(a => 
			a.id !== routingAgent.id && 
			!a.is_router && 
			!memberIds.includes(a.id)
		);
	}

	async function removeMember(memberId) {
		if (!routingAgent) return;
		
		isLoading = true;
		try {
			// 从profiles中移除成员
			const updatedProfiles = routingAgent.profiles.filter(p => p.agent_id !== memberId);
			
			// 更新智能体
			const updatedAgent = {
				...routingAgent,
				profiles: updatedProfiles
			};
			
			await updateAgent(updatedAgent);
			routingAgent = updatedAgent;
			updateGroupMembers();
			
			isComplete = true;
			setTimeout(() => { isComplete = false; }, 2000);
			
		} catch (error) {
			console.error('Failed to remove member:', error);
		} finally {
			isLoading = false;
		}
	}

	async function addMember(newMemberId) {
		if (!routingAgent) return;
		
		isLoading = true;
		try {
			const newMember = allAgents.find(a => a.id === newMemberId);
			if (!newMember) return;
			
			// 添加到profiles
			const newProfile = {
				agent_id: newMemberId,
				agent_name: newMember.name,
				weight: 1.0
			};
			
			const updatedProfiles = [...(routingAgent.profiles || []), newProfile];
			
			// 更新智能体
			const updatedAgent = {
				...routingAgent,
				profiles: updatedProfiles
			};
			
			await updateAgent(updatedAgent);
			routingAgent = updatedAgent;
			updateGroupMembers();
			
			showAddMemberModal = false;
			isComplete = true;
			setTimeout(() => { isComplete = false; }, 2000);
			
		} catch (error) {
			console.error('Failed to add member:', error);
		} finally {
			isLoading = false;
		}
	}

	function goBack() {
		goto('/workspace/agents');
	}

	function editAgent() {
		goto(`/page/agent/${agentId}`);
	}
</script>

<HeadTitle title={`${$_('workspace.agents.group.members')} - ${routingAgent?.name || ''}`} />

<LoadingToComplete {isLoading} {isComplete} successText={$_('workspace.agents.edit.group_update_success')} />

<div class="group-management" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="group-header" in:fly={{ y: -20, duration: 500 }}>
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
					<h1 class="page-title">
						{$_('workspace.agents.group.members')}
						{#if routingAgent}
							- {routingAgent.name}
						{/if}
					</h1>
					<p class="page-subtitle">{$_('workspace.agents.edit.manage_group_subtitle')}</p>
				</div>
			</div>
			<div class="header-actions">
				<Button 
					color="outline-primary" 
					size="sm"
					on:click={editAgent}
					class="me-2"
				>
					<i class="fas fa-edit me-2"></i>
					{$_('workspace.agents.edit.edit_router_agent')}
				</Button>
				<Button 
					color="primary" 
					on:click={() => showAddMemberModal = true}
					disabled={availableAgents.length === 0}
				>
					<i class="fas fa-plus me-2"></i>
					{$_('workspace.agents.group.add_member')}
				</Button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="group-content" in:fly={{ y: 30, duration: 500, delay: 200 }}>
		<Row>
			<!-- Router Agent Info -->
			<Col lg="4">
				<Card class="router-info">
					<CardBody>
						<h5 class="card-title">
							<i class="fas fa-route me-2"></i>
							{$_('workspace.agents.group.router_info')}
						</h5>
						{#if routingAgent}
							<div class="router-details">
								<div class="router-name">{routingAgent.name}</div>
								<div class="router-description">{routingAgent.description || $_('common.no_description')}</div>
								<div class="router-meta">
									<Badge color="success" class="me-2">
										{$_('workspace.agents.routing_agent')}
									</Badge>
									<Badge color="info">
										{groupMembers.length} 个成员
									</Badge>
								</div>
							</div>
						{/if}
					</CardBody>
				</Card>
			</Col>

			<!-- Group Members -->
			<Col lg="8">
				<Card class="members-list">
					<CardBody>
						<h5 class="card-title">
							<i class="fas fa-users me-2"></i>
							{$_('workspace.agents.edit.group_members')}
						</h5>
						
						{#if groupMembers.length > 0}
							<div class="members-grid">
								{#each groupMembers as member (member.id)}
									<div class="member-item" in:fly={{ x: -20, duration: 300 }}>
										<div class="member-info">
											<div class="member-avatar">
												<i class="fas fa-robot"></i>
											</div>
											<div class="member-details">
												<div class="member-name">{member.name}</div>
												<div class="member-description">{member.description || $_('common.no_description')}</div>
												<Badge color="secondary" class="member-type">
													{$_('workspace.agents.task_agent')}
												</Badge>
											</div>
										</div>
										<div class="member-actions">
											<Button 
												color="outline-danger" 
												size="sm"
												on:click={() => removeMember(member.id)}
											>
												<i class="fas fa-times"></i>
											</Button>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="empty-members">
								<i class="fas fa-users text-muted mb-3" style="font-size: 3rem;"></i>
								<h5 class="text-muted">{$_('workspace.agents.group.no_members')}</h5>
								<p class="text-muted">{$_('workspace.agents.edit.add_agent_to_group')}</p>
								<Button 
									color="primary" 
									on:click={() => showAddMemberModal = true}
									disabled={availableAgents.length === 0}
								>
									<i class="fas fa-plus me-2"></i>
									添加第一个成员
								</Button>
							</div>
						{/if}
					</CardBody>
				</Card>
			</Col>
		</Row>
	</div>
</div>

<!-- Add Member Modal -->
<Modal isOpen={showAddMemberModal} toggle={() => showAddMemberModal = false} size="lg">
	<ModalHeader toggle={() => showAddMemberModal = false}>
		{$_('workspace.agents.group.add_member')}
	</ModalHeader>
	<ModalBody>
		{#if availableAgents.length > 0}
			<div class="available-members">
				{#each availableAgents as agent (agent.id)}
					<div class="member-option">
						<div class="member-info">
							<div class="member-avatar">
								<i class="fas fa-robot"></i>
							</div>
							<div class="member-details">
								<div class="member-name">{agent.name}</div>
								<div class="member-description">{agent.description || $_('common.no_description')}</div>
								<Badge color="secondary" class="member-type">
									{$_('workspace.agents.task_agent')}
								</Badge>
							</div>
						</div>
						<Button 
							color="primary" 
							size="sm"
							on:click={() => addMember(agent.id)}
						>
							<i class="fas fa-plus me-2"></i>
							添加
						</Button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-4">
				<i class="fas fa-info-circle text-muted mb-3" style="font-size: 2rem;"></i>
				<p class="text-muted">{$_('workspace.agents.edit.no_available_agents')}</p>
			</div>
		{/if}
	</ModalBody>
</Modal>

<style>
	.group-management {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.group-header {
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

	:global(.router-info) {
		background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
		border: 1px solid #e1bee7;
	}

	.router-details {
		margin-top: 1rem;
	}

	.router-name {
		font-size: 1.1rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.5rem;
	}

	.router-description {
		color: #4a5568;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.router-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.members-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.member-item, .member-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
	}

	.member-item:hover, .member-option:hover {
		background: #e9ecef;
		border-color: #dee2e6;
	}

	.member-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.member-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1rem;
	}

	.member-details {
		flex: 1;
	}

	.member-name {
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.25rem;
	}

	.member-description {
		font-size: 0.85rem;
		color: #4a5568;
		margin-bottom: 0.5rem;
	}

	.empty-members {
		text-align: center;
		padding: 3rem 1rem;
	}

	.available-members {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 400px;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.group-management {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.header-actions {
			width: 100%;
			justify-content: flex-end;
		}

		.member-item, .member-option {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.member-actions {
			width: 100%;
			display: flex;
			justify-content: flex-end;
		}
	}
</style>

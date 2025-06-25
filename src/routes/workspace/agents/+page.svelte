<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Card, CardBody, Col, Row, Input } from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import { getAgents, deleteAgent } from '$lib/services/agent-service.js';
	import { AgentType } from '$lib/helpers/enums';
	import { myInfo } from '$lib/services/auth-service';
	import AgentCard from './components/AgentCard.svelte';
	import AgentGroupCard from './components/AgentGroupCard.svelte';
	import Swal from 'sweetalert2';

	/** @type {boolean} */
	let isLoading = false;

	/** @type {boolean} */
	let isComplete = false;

	/** @type {import('$userTypes').UserModel} */
	let currentUser;

	/** @type {import('$agentTypes').AgentModel[]} */
	let allAgents = [];

	/** @type {import('$agentTypes').AgentModel[]} */
	let singleAgents = [];

	/** @type {import('$agentTypes').AgentModel[]} */
	let routingAgents = [];

	/** @type {string} */
	let searchQuery = '';

	/** @type {string} */
	let selectedType = 'all';

	const filterOptions = [
		{ value: 'all', label: $_('workspace.agents.list.all_types') },
		{ value: 'single', label: $_('workspace.agents.single_agent') },
		{ value: 'group', label: $_('workspace.agents.agent_group') }
	];

	onMount(async () => {
		currentUser = await myInfo();
		await loadAgents();
	});

	async function loadAgents() {
		isLoading = true;
		try {
			const filter = {
				pager: { page: 1, size: 100, count: 0 },
				types: [AgentType.Task, AgentType.Routing] // 只筛选任务型和路由型智能体
			};
			const response = await getAgents(filter, true);
			allAgents = response.items || [];
			categorizeAgents();
		} catch (error) {
			console.error('Error loading agents:', error);
			allAgents = [];
		} finally {
			isLoading = false;
		}
	}

	function categorizeAgents() {
		singleAgents = allAgents.filter(agent => 
			!agent.is_router
		);
		routingAgents = allAgents.filter(agent => 
			agent.is_router
		);
	}

	function getFilteredAgents() {
		// 如果数据还未加载完成，返回空数组
		if (isLoading || allAgents.length === 0) {
			return [];
		}

		/** @type {import('$agentTypes').AgentModel[]} */
		let filtered = [];
		
		if (selectedType === 'all') {
			filtered = [...singleAgents, ...routingAgents];
		} else if (selectedType === 'single') {
			filtered = singleAgents;
		} else if (selectedType === 'group') {
			filtered = routingAgents;
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(agent => 
				agent.name.toLowerCase().includes(query) ||
				(agent.description && agent.description.toLowerCase().includes(query))
			);
		}

		return filtered;
	}

	function goToCreateAgent() {
		goto('/workspace/agents/create');
	}

	function goBack() {
		goto('/workspace');
	}

	/**
	 * 处理删除智能体事件
	 * @param {CustomEvent} event
	 */
	async function handleDeleteAgent(event) {
		const { agent } = event.detail;
		
		const result = await Swal.fire({
			title: $_('workspace.agents.delete.confirm_title'),
			text: $_('workspace.agents.delete.confirm_message'),
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: $_('common.delete'),
			cancelButtonText: $_('common.cancel'),
			confirmButtonColor: '#dc3545'
		});

		if (result.isConfirmed) {
			isLoading = true;
			try {
				await deleteAgent(agent.id);
				isComplete = true;
				
				// 从本地数组中移除已删除的智能体
				allAgents = allAgents.filter(a => a.id !== agent.id);
				categorizeAgents();
				
				setTimeout(() => {
					isComplete = false;
				}, 2000);
				
			} catch (error) {
				console.error('Failed to delete agent:', error);
				Swal.fire({
					title: $_('workspace.agents.delete.failed_title'),
					text: $_('workspace.agents.delete.failed_message'),
					icon: 'error'
				});
			} finally {
				isLoading = false;
			}
		}
	}

	$: filteredAgents = getFilteredAgents();
	
	// 确保在数据加载完成后重新计算过滤结果
	$: if (allAgents.length > 0 && !isLoading) {
		filteredAgents = getFilteredAgents();
	}
</script>

<HeadTitle title={$_('workspace.agents.title')} />

<LoadingToComplete {isLoading} {isComplete} successText={$_('workspace.agents.delete.success')} />

<div class="agents-management" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="agents-header" in:fly={{ y: -20, duration: 500 }}>
		<div class="header-content">
			<div class="header-left">
				<Button 
					color="light" 
					size="sm" 
					on:click={goBack}
					class="me-3"
				>
					<i class="fas fa-arrow-left me-2"></i>
					{$_('workspace.title')}
				</Button>
				<div>
					<h1 class="page-title">{$_('workspace.agents.title')}</h1>
					<p class="page-subtitle">{$_('workspace.agents.subtitle')}</p>
				</div>
			</div>
			<div class="header-actions">
				<Button 
					color="primary" 
					on:click={goToCreateAgent}
				>
					<i class="fas fa-plus me-2"></i>
					{$_('workspace.agents.create.title')}
				</Button>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="agents-filters" in:fly={{ y: 20, duration: 500, delay: 100 }}>
		<Card>
			<CardBody>
				<Row>
					<Col md="6">
						<div class="search-wrapper">
							<Input
								type="text"
								placeholder={$_('workspace.agents.list.search_placeholder')}
								bind:value={searchQuery}
							/>
							<i class="fas fa-search search-icon"></i>
						</div>
					</Col>
					<Col md="4">
						<Input
							type="select"
							bind:value={selectedType}
						>
							{#each filterOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</Input>
					</Col>
					<Col md="2">
						<div class="stats-info">
							<small class="text-muted">
								{filteredAgents.length} {$_('workspace.agents.list.agents_count')}
							</small>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	</div>

	<!-- Loading -->
	<LoadingToComplete {isLoading} />

	<!-- Content -->
	<div class="agents-content" in:fly={{ y: 30, duration: 500, delay: 200 }}>
		{#if !isLoading}
			{#if filteredAgents.length > 0}
				<div class="agents-grid">
					{#each filteredAgents as agent}
						{#if agent.is_router}
							<AgentGroupCard {agent} {allAgents} on:delete={handleDeleteAgent} />
						{:else}
							<AgentCard {agent} on:delete={handleDeleteAgent} />
						{/if}
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">
						<i class="fas fa-robot"></i>
					</div>
					<h3>{$_('workspace.agents.list.no_agents')}</h3>
					<p>{$_('workspace.agents.list.no_agents_description')}</p>
					<Button 
						color="primary" 
						on:click={goToCreateAgent}
					>
						<i class="fas fa-plus me-2"></i>
						{$_('workspace.agents.create.title')}
					</Button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.agents-management {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.agents-header {
		margin-bottom: 2rem;
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
		font-size: 2rem;
		font-weight: 600;
		margin: 0;
		color: #2d3748;
	}

	.page-subtitle {
		color: #718096;
		margin: 0.5rem 0 0 0;
		font-size: 1rem;
	}

	.agents-filters {
		margin-bottom: 2rem;
	}

	.search-wrapper {
		position: relative;
	}

	.search-icon {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: #6c757d;
		pointer-events: none;
	}

	.stats-info {
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0.375rem 0.75rem;
	}

	.agents-content {
		min-height: 400px;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		font-size: 4rem;
		color: #e2e8f0;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		color: #4a5568;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #718096;
		margin-bottom: 2rem;
	}

	@media (max-width: 768px) {
		.agents-management {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-left {
			flex-direction: column;
			width: 100%;
		}

		.agents-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

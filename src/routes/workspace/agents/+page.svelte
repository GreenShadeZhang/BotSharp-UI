<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Card, CardBody, Col, Row, Input, InputGroup } from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import TablePagination from '$lib/common/TablePagination.svelte';
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
	let filteredAgents = [];

	/** @type {import('$agentTypes').AgentModel[]} */
	let pagedAgents = [];

	/** @type {string} */
	let searchQuery = '';

	/** @type {string} */
	let selectedType = 'all';

	/** @type {string} */
	let sortBy = 'created_desc';

	const pageSize = 12; // 每页显示12个智能体
	let currentPage = 1;
	let totalCount = 0;

	/** @type {import('$commonTypes').Pagination} */
	let pagination = {
		page: 1,
		size: pageSize,
		count: 0
	};

	const filterOptions = [
		{ value: 'all', label: $_('workspace.agents.list.all_types') },
		{ value: 'single', label: $_('workspace.agents.single_agent') },
		{ value: 'group', label: $_('workspace.agents.agent_group') }
	];

	const sortOptions = [
		{ value: 'created_desc', label: $_('workspace.agents.sort.newest_first') },
		{ value: 'created_asc', label: $_('workspace.agents.sort.oldest_first') },
		{ value: 'name_asc', label: $_('workspace.agents.sort.name_asc') },
		{ value: 'name_desc', label: $_('workspace.agents.sort.name_desc') }
	];

	onMount(async () => {
		currentUser = await myInfo();
		await loadAgents();
	});

	async function loadAgents() {
		isLoading = true;
		try {
			const filter = {
				pager: { page: 1, size: 1000, count: 0 }, // 加载所有数据用于前端筛选和分页
				types: [AgentType.Task, AgentType.Routing] // 只筛选任务型和路由型智能体
			};
			const response = await getAgents(filter, true);
			allAgents = response.items || [];
			applyFiltersAndPagination();
		} catch (error) {
			console.error('Error loading agents:', error);
			allAgents = [];
			filteredAgents = [];
			pagedAgents = [];
		} finally {
			isLoading = false;
		}
	}

	function applyFiltersAndPagination() {
		// 应用筛选
		let filtered = [...allAgents];
		
		// 按类型筛选
		if (selectedType === 'single') {
			filtered = filtered.filter(agent => !agent.is_router);
		} else if (selectedType === 'group') {
			filtered = filtered.filter(agent => agent.is_router);
		}

		// 按搜索关键词筛选
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(agent => 
				agent.name.toLowerCase().includes(query) ||
				(agent.description && agent.description.toLowerCase().includes(query)) ||
				(agent.labels && agent.labels.some(label => label.toLowerCase().includes(query)))
			);
		}

		// 排序
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'created_desc':
					return new Date(b.created_datetime) - new Date(a.created_datetime);
				case 'created_asc':
					return new Date(a.created_datetime) - new Date(b.created_datetime);
				case 'name_asc':
					return a.name.localeCompare(b.name);
				case 'name_desc':
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});

		filteredAgents = filtered;
		totalCount = filtered.length;
		
		// 更新分页信息
		pagination = {
			page: currentPage,
			size: pageSize,
			count: totalCount
		};

		// 计算当前页数据
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		pagedAgents = filtered.slice(startIndex, endIndex);
	}

	function handlePageTo(pageNum) {
		currentPage = pageNum;
		applyFiltersAndPagination();
		
		// 滚动到顶部
		document.querySelector('.agents-content')?.scrollIntoView({ 
			behavior: 'smooth', 
			block: 'start' 
		});
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
				applyFiltersAndPagination();
				
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

	// 监听筛选条件变化
	$: if (searchQuery !== undefined || selectedType !== undefined || sortBy !== undefined) {
		currentPage = 1; // 重置到第一页
		applyFiltersAndPagination();
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
		<Card class="filter-card">
			<CardBody>
				<Row class="g-3">
					<Col lg="4" md="6">
						<div class="filter-section">
							<label class="filter-label">
								<i class="fas fa-search me-2"></i>
								{$_('workspace.agents.list.search_label')}
							</label>
							<InputGroup>
								<Input
									type="text"
									placeholder={$_('workspace.agents.list.search_placeholder')}
									bind:value={searchQuery}
									class="search-input"
								/>
								<div class="input-group-text search-icon-wrapper">
									<i class="fas fa-search"></i>
								</div>
							</InputGroup>
						</div>
					</Col>
					<Col lg="3" md="6">
						<div class="filter-section">
							<label class="filter-label">
								<i class="fas fa-filter me-2"></i>
								{$_('workspace.agents.list.type_filter')}
							</label>
							<Input
								type="select"
								bind:value={selectedType}
								class="filter-select"
							>
								{#each filterOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</Input>
						</div>
					</Col>
					<Col lg="3" md="6">
						<div class="filter-section">
							<label class="filter-label">
								<i class="fas fa-sort me-2"></i>
								{$_('workspace.agents.list.sort_by')}
							</label>
							<Input
								type="select"
								bind:value={sortBy}
								class="filter-select"
							>
								{#each sortOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</Input>
						</div>
					</Col>
					<Col lg="2" md="6">
						<div class="filter-section">
							<label class="filter-label">
								<i class="fas fa-chart-bar me-2"></i>
								{$_('workspace.agents.list.results')}
							</label>
							<div class="stats-display">
								<span class="stats-number">{totalCount}</span>
								<span class="stats-text">{$_('workspace.agents.list.agents_count')}</span>
							</div>
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
			{#if pagedAgents.length > 0}
				<div class="agents-grid">
					{#each pagedAgents as agent, index}
						<div 
							class="agent-item"
							in:fly={{ y: 20, duration: 300, delay: index * 50 }}
						>
							{#if agent.is_router}
								<AgentGroupCard {agent} {allAgents} on:delete={handleDeleteAgent} />
							{:else}
								<AgentCard {agent} on:delete={handleDeleteAgent} />
							{/if}
						</div>
					{/each}
				</div>

				<!-- Pagination -->
				{#if totalCount > pageSize}
					<div class="pagination-wrapper" in:fade={{ duration: 300, delay: 400 }}>
						<TablePagination 
							{pagination} 
							pageTo={handlePageTo}
						/>
					</div>
				{/if}
			{:else}
				<div class="empty-state">
					<div class="empty-content">
						<div class="empty-icon">
							<i class="fas fa-robot"></i>
						</div>
						<h3 class="empty-title">
							{#if searchQuery || selectedType !== 'all'}
								{$_('workspace.agents.list.no_results')}
							{:else}
								{$_('workspace.agents.list.no_agents')}
							{/if}
						</h3>
						<p class="empty-description">
							{#if searchQuery || selectedType !== 'all'}
								{$_('workspace.agents.list.no_results_description')}
							{:else}
								{$_('workspace.agents.list.no_agents_description')}
							{/if}
						</p>
						{#if !searchQuery && selectedType === 'all'}
							<Button 
								color="primary" 
								size="lg"
								on:click={goToCreateAgent}
								class="empty-action-btn"
							>
								<i class="fas fa-plus me-2"></i>
								{$_('workspace.agents.create.title')}
							</Button>
						{:else}
							<Button 
								color="outline-primary" 
								size="lg"
								on:click={() => { searchQuery = ''; selectedType = 'all'; }}
								class="empty-action-btn"
							>
								<i class="fas fa-times me-2"></i>
								{$_('workspace.agents.list.clear_filters')}
							</Button>
						{/if}
					</div>
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
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	}

	.agents-header {
		margin-bottom: 2rem;
		padding: 2rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.page-subtitle {
		color: #64748b;
		margin: 0.5rem 0 0 0;
		font-size: 1.1rem;
		font-weight: 400;
	}

	.agents-filters {
		margin-bottom: 2rem;
	}

	:global(.filter-card) {
		border: none;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-radius: 1rem;
	}

	.filter-section {
		height: 100%;
	}

	.filter-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	:global(.search-input) {
		border-right: none;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.search-icon-wrapper {
		background: #f8fafc;
		border-left: none;
		color: #6b7280;
	}

	:global(.filter-select) {
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.stats-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem;
		border-radius: 0.5rem;
		text-align: center;
		height: 100%;
		justify-content: center;
	}

	.stats-number {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
	}

	.stats-text {
		font-size: 0.75rem;
		opacity: 0.9;
		margin-top: 0.25rem;
	}

	.agents-content {
		min-height: 400px;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.agent-item {
		height: 100%;
	}

	.pagination-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 3rem;
		padding: 2rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 500px;
		text-align: center;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		margin: 2rem 0;
	}

	.empty-content {
		max-width: 400px;
		padding: 3rem 2rem;
	}

	.empty-icon {
		font-size: 5rem;
		color: #e5e7eb;
		margin-bottom: 2rem;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.empty-title {
		color: #374151;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-description {
		color: #6b7280;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.empty-action-btn {
		padding: 0.75rem 2rem;
		font-weight: 600;
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.empty-action-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	/* 滚动条样式 */
	:global(.agents-grid::-webkit-scrollbar) {
		width: 8px;
	}

	:global(.agents-grid::-webkit-scrollbar-track) {
		background: #f1f5f9;
		border-radius: 4px;
	}

	:global(.agents-grid::-webkit-scrollbar-thumb) {
		background: #cbd5e1;
		border-radius: 4px;
	}

	:global(.agents-grid::-webkit-scrollbar-thumb:hover) {
		background: #94a3b8;
	}

	/* 响应式设计 */
	@media (max-width: 1200px) {
		.agents-grid {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 1.25rem;
		}
	}

	@media (max-width: 768px) {
		.agents-management {
			padding: 1rem;
		}

		.agents-header {
			padding: 1.5rem;
			margin-bottom: 1.5rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-left {
			flex-direction: column;
			width: 100%;
		}

		.page-title {
			font-size: 2rem;
		}

		.agents-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.empty-content {
			padding: 2rem 1rem;
		}

		.empty-icon {
			font-size: 4rem;
		}

		.pagination-wrapper {
			padding: 1rem;
			margin-top: 2rem;
		}
	}

	@media (max-width: 576px) {
		.stats-display {
			padding: 0.5rem;
		}

		.stats-number {
			font-size: 1.25rem;
		}

		.filter-label {
			font-size: 0.8rem;
		}
	}

	/* 动画增强 */
	:global(.agent-card) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.agent-card:hover) {
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	/* 加载状态样式 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>

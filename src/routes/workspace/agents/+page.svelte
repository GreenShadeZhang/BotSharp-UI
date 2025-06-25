<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Card, CardBody, Col, Row, Input, InputGroup } from '@sveltestrap/sveltestrap';
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

	/** @type {boolean} */
	let isLoadingMore = false;

	/** @type {boolean} */
	let hasMoreData = true;

	/** @type {boolean} */
	let showBackToTop = false;

	/** @type {import('$userTypes').UserModel} */
	let currentUser;

	/** @type {import('$commonTypes').PagedItems<import('$agentTypes').AgentModel>} */
	let agents = { items: [], count: 0 };

	/** @type {string} */
	let searchQuery = '';

	/** @type {string} */
	let selectedType = 'all';

	/** @type {string} */
	let sortBy = 'created_desc';

	const pageSize = 12; // 每页显示12个智能体
	const firstPage = 1;

	/** @type {import('$agentTypes').AgentFilter} */
	const initFilter = {
		pager: { page: firstPage, size: pageSize, count: 0 },
		types: [AgentType.Task, AgentType.Routing] // 只筛选任务型和路由型智能体
	};

	/** @type {import('$agentTypes').AgentFilter} */
	let filter = { ...initFilter };

	/** @type {import('$commonTypes').Pagination} */
	let pagination = filter.pager;

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
			const response = await getAgents(filter, true);
			agents = response;
			hasMoreData = response.items.length === pageSize && response.count > response.items.length;
			refreshPagination();
		} catch (error) {
			console.error('Error loading agents:', error);
			agents = { items: [], count: 0 };
			hasMoreData = false;
		} finally {
			isLoading = false;
		}
	}

	async function loadMoreAgents() {
		if (isLoadingMore || !hasMoreData) return;
		
		isLoadingMore = true;
		try {
			const nextPage = filter.pager.page + 1;
			const nextFilter = {
				...filter,
				pager: { ...filter.pager, page: nextPage }
			};
			
			const response = await getAgents(nextFilter, true);
			
			if (response.items && response.items.length > 0) {
				// 合并新数据到现有数据
				agents = {
					items: [...agents.items, ...response.items],
					count: response.count
				};
				
				// 更新过滤器页码
				filter.pager.page = nextPage;
				
				// 检查是否还有更多数据
				hasMoreData = response.items.length === pageSize && 
							  agents.items.length < response.count;
			} else {
				hasMoreData = false;
			}
			
			refreshPagination();
		} catch (error) {
			console.error('Error loading more agents:', error);
			hasMoreData = false;
		} finally {
			isLoadingMore = false;
		}
	}

	function refreshPagination() {
		pagination = {
			page: filter.pager.page,
			size: filter.pager.size,
			count: agents.count
		};
	}

	function buildFilter() {
		let filterTypes = [AgentType.Task, AgentType.Routing];
		
		// 根据选择的类型进一步筛选
		if (selectedType === 'single') {
			filterTypes = [AgentType.Task];
		} else if (selectedType === 'group') {
			filterTypes = [AgentType.Routing];
		}

		// 构建排序参数 - 注意：这取决于后端API是否支持排序
		// 如果后端不支持排序，可以移除这部分
		let sortParam = {};
		switch (sortBy) {
			case 'created_desc':
				sortParam = { field: 'created_datetime', order: 'desc' };
				break;
			case 'created_asc':
				sortParam = { field: 'created_datetime', order: 'asc' };
				break;
			case 'name_asc':
				sortParam = { field: 'name', order: 'asc' };
				break;
			case 'name_desc':
				sortParam = { field: 'name', order: 'desc' };
				break;
		}

		return {
			pager: filter.pager,
			types: filterTypes,
			similarName: searchQuery.trim() || undefined,
			// sort: sortParam // 如果后端支持排序，取消注释这行
		};
	}

	function applyFilters() {
		filter = {
			...buildFilter(),
			pager: { page: firstPage, size: pageSize, count: 0 }
		};
		hasMoreData = true; // 重置状态
		loadAgents();
	}

	/**
	 * @param {Event} event
	 */
	function handleScroll(event) {
		const container = /** @type {HTMLElement} */ (event.target);
		if (!container) return;
		
		const scrollTop = container.scrollTop;
		const scrollHeight = container.scrollHeight;
		const clientHeight = container.clientHeight;
		
		// 显示/隐藏返回顶部按钮
		showBackToTop = scrollTop > 300;
		
		// 检查是否接近底部 (距离底部50px时开始加载)
		if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreData && !isLoadingMore) {
			loadMoreAgents();
		}
	}

	function scrollToTop() {
		const scrollableContainer = document.querySelector('.agents-grid.scrollable');
		if (scrollableContainer) {
			scrollableContainer.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
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
				
				// 重新加载数据，重置到第一页
				filter.pager.page = firstPage;
				hasMoreData = true;
				await loadAgents();
				
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

	function goToCreateAgent() {
		goto('/workspace/agents/create');
	}

	function goBack() {
		goto('/workspace');
	}

	// 监听筛选条件变化，使用防抖处理
	/** @type {number} */
	let searchTimeout;
	$: if (searchQuery !== undefined || selectedType !== undefined || sortBy !== undefined) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			applyFilters();
		}, 300); // 300ms 防抖延迟
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
							<label class="filter-label" for="search-input">
								<i class="fas fa-search me-2"></i>
								{$_('workspace.agents.list.search_label')}
							</label>
							<InputGroup>
								<Input
									id="search-input"
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
							<label class="filter-label" for="type-filter">
								<i class="fas fa-filter me-2"></i>
								{$_('workspace.agents.list.type_filter')}
							</label>
							<Input
								id="type-filter"
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
							<label class="filter-label" for="sort-select">
								<i class="fas fa-sort me-2"></i>
								{$_('workspace.agents.list.sort_by')}
							</label>
							<Input
								id="sort-select"
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
					<Col lg="2" md="6" sm="12">
						<div class="filter-section">
							<div class="filter-label">
								<i class="fas fa-chart-bar me-2"></i>
								{$_('workspace.agents.list.results')}
							</div>
							<div class="stats-display">
								<span class="stats-number">{agents.count || 0}</span>
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
			{#if agents.items && agents.items.length > 0}
				<div 
					class="agents-grid" 
					class:scrollable={agents.count > pageSize}
					on:scroll={handleScroll}
				>
					{#each agents.items as agent, index}
						<div 
							class="agent-item"
							in:fly={{ y: 20, duration: 300, delay: index * 50 }}
						>
							{#if agent.is_router}
								<AgentGroupCard {agent} allAgents={agents.items} on:delete={handleDeleteAgent} />
							{:else}
								<AgentCard {agent} on:delete={handleDeleteAgent} />
							{/if}
						</div>
					{/each}
					
					<!-- 加载更多指示器 -->
					{#if isLoadingMore}
						<div class="loading-more-indicator">
							<div class="loading-spinner"></div>
							<span>加载更多...</span>
						</div>
					{/if}
					
					<!-- 没有更多数据提示 -->
					{#if !hasMoreData && agents.items.length > pageSize}
						<div class="no-more-data">
							<i class="fas fa-check-circle"></i>
							<span>已显示所有结果</span>
						</div>
					{/if}
				</div>

				<!-- 返回顶部按钮 -->
				{#if showBackToTop}
					<button 
						class="back-to-top" 
						on:click={scrollToTop}
						in:fly={{ y: 20, duration: 300 }}
						out:fly={{ y: 20, duration: 300 }}
					>
						<i class="fas fa-arrow-up"></i>
						<span>返回顶部</span>
					</button>
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
		display: flex;
		flex-direction: column;
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
		padding: 0.5rem;
		border-radius: 0.5rem;
		text-align: center;
		height: auto;
		min-height: 60px;
		justify-content: center;
	}

	.stats-number {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
	}

	.stats-text {
		font-size: 0.7rem;
		opacity: 0.9;
		margin-top: 0.2rem;
	}

	.agents-content {
		min-height: 400px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.agents-grid.scrollable {
		flex: 1;
		max-height: calc(100vh - 400px); /* 动态计算高度，确保底部对齐 */
		overflow-y: auto;
		scroll-behavior: smooth;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		position: relative;
		margin-bottom: 0; /* 移除底部边距，让滚动区域紧贴底部 */
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		align-content: start; /* 确保内容从顶部开始排列 */
	}

	.agents-grid.scrollable::before {
		content: '';
		position: sticky;
		top: -1.5rem;
		left: -1.5rem;
		right: -1.5rem;
		height: 1.5rem;
		background: linear-gradient(to bottom, rgba(248, 250, 252, 1) 0%, rgba(248, 250, 252, 0.8) 70%, rgba(248, 250, 252, 0) 100%);
		z-index: 10;
		pointer-events: none;
		grid-column: 1 / -1;
		margin-bottom: -1.5rem;
	}

	.agents-grid.scrollable::after {
		content: '';
		position: sticky;
		bottom: -1.5rem;
		left: -1.5rem;
		right: -1.5rem;
		height: 1.5rem;
		background: linear-gradient(to top, rgba(248, 250, 252, 1) 0%, rgba(248, 250, 252, 0.8) 70%, rgba(248, 250, 252, 0) 100%);
		z-index: 10;
		pointer-events: none;
		grid-column: 1 / -1;
		margin-top: -1.5rem;
	}

	.agent-item {
		height: 100%;
	}

	.loading-more-indicator {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		border: 1px dashed #cbd5e1;
		border-radius: 0.75rem;
		color: #64748b;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid #e2e8f0;
		border-top: 2px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.no-more-data {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 2rem;
		padding: 1rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.back-to-top {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 50px;
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1000;
		min-width: 60px;
	}

	.back-to-top:hover {
		transform: translateY(-2px) scale(1.05);
		box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
	}

	.back-to-top i {
		font-size: 1rem;
		margin-bottom: 0.1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
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
		transition: background 0.2s ease;
	}

	:global(.agents-grid::-webkit-scrollbar-thumb:hover) {
		background: #94a3b8;
	}

	/* Firefox 滚动条样式 */
	.agents-grid.scrollable {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 #f1f5f9;
	}

	/* 响应式设计 */
	@media (max-width: 1200px) {
		.agents-grid {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 1.25rem;
		}

		.agents-grid.scrollable {
			max-height: calc(100vh - 380px);
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

		.agents-grid.scrollable {
			max-height: calc(100vh - 320px);
			padding: 1rem;
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.back-to-top {
			bottom: 1rem;
			right: 1rem;
			padding: 0.6rem;
			min-width: 50px;
		}

		.back-to-top span {
			font-size: 0.7rem;
		}

		.empty-content {
			padding: 2rem 1rem;
		}

		.empty-icon {
			font-size: 4rem;
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
</style>

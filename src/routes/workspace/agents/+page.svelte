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
	import AgentList from './components/AgentList.svelte';
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

	/** @type {boolean} */
	let initialized = false;

	const pageSize = 12; // 每页显示12个智能体
	const firstPage = 1;

	/** @type {import('$agentTypes').AgentFilter} */
	const initFilter = {
		pager: { page: firstPage, size: pageSize, count: 0 },
		types: [
			AgentType.Task,
			AgentType.Routing
		] // 默认只显示任务型和路由型智能体
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
		initialized = true;
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
				hasMoreData = response.items.length === pageSize && agents.items.length < response.count;
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
		let filterTypes;

		// 根据选择的类型进行筛选
		if (selectedType === 'all') {
			// 只显示任务型和路由型智能体
			filterTypes = [
				AgentType.Task,
				AgentType.Routing
			];
		} else if (selectedType === 'single') {
			filterTypes = [AgentType.Task];
		} else if (selectedType === 'group') {
			filterTypes = [AgentType.Routing];
		} else {
			// 默认情况：只显示任务型和路由型智能体
			filterTypes = [AgentType.Task, AgentType.Routing];
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
			similarName: searchQuery.trim() || undefined
			// sort: sortParam // 如果后端支持排序，取消注释这行
		};
	}

	function applyFilters() {
		// 重置分页到第一页
		filter = {
			...buildFilter(),
			pager: { page: firstPage, size: pageSize, count: 0 }
		};
		hasMoreData = true; // 重置状态
		loadAgents();
	}

	/**
	 * 处理AgentList组件的滚动事件
	 * @param {CustomEvent} event
	 */
	function handleAgentListScroll(event) {
		const { showBackToTop: shouldShow, shouldLoadMore } = event.detail;
		showBackToTop = shouldShow;

		if (shouldLoadMore) {
			loadMoreAgents();
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
			try {
				await deleteAgent(agent.id);
				isComplete = true;

				// 本地删除智能体，避免重新加载
				agents = {
					...agents,
					items: agents.items.filter((a) => a.id !== agent.id),
					count: Math.max(0, agents.count - 1)
				};

				// 如果当前页没有数据了且不是第一页，则加载上一页
				if (agents.items.length === 0 && filter.pager.page > firstPage) {
					filter.pager.page -= 1;
					await loadAgents();
				} else if (agents.items.length < pageSize && hasMoreData) {
					// 如果当前页数据不足且还有更多数据，尝试加载更多
					await loadMoreAgents();
				}

				refreshPagination();

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

	// 用于跟踪上次的筛选条件，以便检测变化
	let lastSearchQuery = '';
	let lastSelectedType = 'all';
	let lastSortBy = 'created_desc';

	$: {
		// 只有在初始化完成后才触发搜索
		if (initialized) {
			// 检测筛选条件是否有变化
			const hasChanged =
				searchQuery !== lastSearchQuery ||
				selectedType !== lastSelectedType ||
				sortBy !== lastSortBy;

			if (hasChanged) {
				// 更新上次的值
				lastSearchQuery = searchQuery;
				lastSelectedType = selectedType;
				lastSortBy = sortBy;

				clearTimeout(searchTimeout);
				searchTimeout = setTimeout(() => {
					applyFilters();
				}, 300);
			}
		}
	}
</script>

<HeadTitle title={$_('workspace.agents.title')} />

<LoadingToComplete {isLoading} {isComplete} successText={$_('workspace.agents.delete.success')} />

<div class="agents-management" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="agents-header" in:fly={{ y: -20, duration: 500 }}>
		<div class="header-content">
			<div class="header-left">
				<Button color="light" size="sm" on:click={goBack} class="me-3">
					<i class="fas fa-arrow-left me-2"></i>
					{$_('workspace.title')}
				</Button>
				<div>
					<h1 class="page-title">{$_('workspace.agents.title')}</h1>
					<p class="page-subtitle">{$_('workspace.agents.subtitle')}</p>
				</div>
			</div>
			<div class="header-actions">
				<Button color="primary" on:click={goToCreateAgent}>
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
					<Col lg="4" md="6">
						<div class="filter-section">
							<label class="filter-label" for="type-filter">
								<i class="fas fa-filter me-2"></i>
								{$_('workspace.agents.list.type_filter')}
							</label>
							<Input id="type-filter" type="select" bind:value={selectedType} class="filter-select">
								{#each filterOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</Input>
						</div>
					</Col>
					<Col lg="4" md="6">
						<div class="filter-section">
							<label class="filter-label" for="sort-select">
								<i class="fas fa-sort me-2"></i>
								{$_('workspace.agents.list.sort_by')}
							</label>
							<Input id="sort-select" type="select" bind:value={sortBy} class="filter-select">
								{#each sortOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</Input>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	</div>

	<!-- Content -->
	<div class="agents-content" in:fly={{ y: 30, duration: 500, delay: 200 }}>
		<AgentList
			agents={agents.items}
			totalCount={agents.count}
			{isLoading}
			{isLoadingMore}
			{hasMoreData}
			{showBackToTop}
			{pageSize}
			on:scroll={handleAgentListScroll}
			on:delete={handleDeleteAgent}
		>
			<svelte:fragment slot="empty-title">
				{#if searchQuery || selectedType !== 'all'}
					{$_('workspace.agents.list.no_results')}
				{:else}
					{$_('workspace.agents.list.no_agents')}
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="empty-description">
				{#if searchQuery || selectedType !== 'all'}
					{$_('workspace.agents.list.no_results_description')}
				{:else}
					{$_('workspace.agents.list.no_agents_description')}
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="empty-action">
				{#if !searchQuery && selectedType === 'all'}
					<Button color="primary" size="lg" on:click={goToCreateAgent} class="empty-action-btn">
						<i class="fas fa-plus me-2"></i>
						{$_('workspace.agents.create.title')}
					</Button>
				{:else}
					<Button
						color="outline-primary"
						size="lg"
						on:click={() => {
							searchQuery = '';
							selectedType = 'all';
							sortBy = 'created_desc';
						}}
						class="empty-action-btn"
					>
						<i class="fas fa-times me-2"></i>
						{$_('workspace.agents.list.clear_filters')}
					</Button>
				{/if}
			</svelte:fragment>
		</AgentList>
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
		box-sizing: border-box;
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

	.agents-content {
		min-height: 400px;
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-bottom: 2rem; /* 增加底部边距 */
	}

	/* 响应式设计 */
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

		.agents-content {
			margin-bottom: 1rem; /* 移动端减少底部边距 */
		}
	}

	@media (max-width: 576px) {
		.filter-label {
			font-size: 0.8rem;
		}

		.agents-management {
			padding: 0.75rem;
		}

		.agents-content {
			margin-bottom: 0.5rem; /* 小屏设备进一步减少底部边距 */
		}
	}
</style>

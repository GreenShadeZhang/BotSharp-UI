<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Card, CardBody, Col, Row, Input, InputGroup } from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import { getAgents } from '$lib/services/agent-service.js';
	import { AgentType } from '$lib/helpers/enums';
	import { myInfo } from '$lib/services/auth-service';

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
		// 只有在首次加载且没有数据时才显示全局加载状态
		if (agents.items.length === 0) {
			isLoading = true;
		}
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

		return {
			pager: filter.pager,
			types: filterTypes,
			similarName: searchQuery.trim() || undefined
		};
	}

	function applyFilters() {
		// 重置分页到第一页
		filter = {
			...buildFilter(),
			pager: { page: firstPage, size: pageSize, count: 0 }
		};
		hasMoreData = true; // 重置状态
		// 清空当前数据以便显示加载状态
		agents = { items: [], count: 0 };
		loadAgents();
	}

	// 防抖搜索
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

				// 清除之前的定时器
				if (searchTimeout) {
					clearTimeout(searchTimeout);
				}

				// 设置新的防抖定时器
				searchTimeout = setTimeout(() => {
					applyFilters();
				}, 300);
			}
		}
	}

	function onStartNewConversation(agentId) {
		goto(`/chat/${agentId}`);
	}

	// 滚动检测
	function handleScroll() {
		if (typeof window !== 'undefined') {
			const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

			// 显示/隐藏回到顶部按钮
			showBackToTop = scrollTop > 300;

			// 检测是否接近底部（距离底部100px时开始加载）
			if (scrollTop + clientHeight >= scrollHeight - 100) {
				loadMoreAgents();
			}
		}
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// 添加滚动监听器
	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', handleScroll);
		}
		
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('scroll', handleScroll);
			}
		};
	});
</script>

<svelte:head>
	<title>{$_('agents.marketplace.title')} - BotSharp</title>
</svelte:head>

<HeadTitle title={$_('agents.marketplace.title')} />

<div class="page-content" in:fade={{ duration: 200 }}>
	<!-- 头部搜索和筛选区域 -->
	<div class="filter-section mb-4">
		<Row class="g-3 align-items-end">
			<!-- 搜索框 -->
			<Col md="4">
				<div class="search-box">
					<InputGroup>
						<Input
							bind:value={searchQuery}
							placeholder={$_('agents.marketplace.search_placeholder')}
							class="border-end-0"
						/>
						<div class="input-group-text bg-white border-start-0">
							<i class="bx bx-search text-muted"></i>
						</div>
					</InputGroup>
				</div>
			</Col>

			<!-- 类型筛选 -->
			<Col md="3">
				<select bind:value={selectedType} class="form-select">
					{#each filterOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</Col>

			<!-- 排序 -->
			<Col md="3">
				<select bind:value={sortBy} class="form-select">
					{#each sortOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</Col>

			<!-- 显示计数 -->
			<Col md="2" class="text-end">
				<div class="text-muted small">
					{$_('agents.marketplace.total_count', { values: { count: agents.count } })}
				</div>
			</Col>
		</Row>
	</div>

	<!-- 智能体列表 -->
	<div class="agents-grid">
		{#if isLoading && agents.items.length === 0}
			<LoadingToComplete loading={isLoading} completed={isComplete} />
		{:else if agents.items.length === 0}
			<!-- 空状态 -->
			<div class="empty-state text-center py-5" in:fade={{ duration: 300 }}>
				<div class="empty-icon mb-3">
					<i class="bx bx-bot display-1 text-muted"></i>
				</div>
				<h5 class="text-muted">{$_('agents.marketplace.no_agents_found')}</h5>
				<p class="text-muted">{$_('agents.marketplace.no_agents_description')}</p>
			</div>
		{:else}
			<!-- 智能体网格 -->
			<Row class="g-4">
				{#each agents.items as agent, index (agent.id)}
					<Col lg="4" md="6" sm="12">
						<div class="agent-card" in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
							<Card class="h-100 shadow-sm hover-shadow">
								<CardBody class="d-flex flex-column">
									<!-- 智能体头部信息 -->
									<div class="agent-header d-flex align-items-start mb-3">
										<div class="agent-avatar me-3">
											{#if agent.iconUrl}
												<img
													src={agent.iconUrl}
													alt={agent.name}
													class="rounded-circle"
													width="48"
													height="48"
												/>
											{:else}
												<div class="avatar-placeholder rounded-circle">
													<i class="bx bx-bot"></i>
												</div>
											{/if}
										</div>
										<div class="agent-info flex-grow-1">
											<h6 class="agent-name mb-1">{agent.name}</h6>
											<div class="agent-meta small text-muted">
												<span class="agent-type badge bg-light text-dark me-2">
													{#if agent.type === AgentType.Task}
														{$_('workspace.agents.single_agent')}
													{:else if agent.type === AgentType.Routing}
														{$_('workspace.agents.agent_group')}
													{:else}
														{agent.type}
													{/if}
												</span>
											</div>
										</div>
									</div>

									<!-- 智能体描述 -->
									<div class="agent-description mb-3 flex-grow-1">
										<p class="text-muted small mb-0 line-clamp-3">
											{agent.description || $_('agents.marketplace.no_description')}
										</p>
									</div>

									<!-- 智能体标签 -->
									{#if agent.profiles && agent.profiles.length > 0}
										<div class="agent-tags mb-3">
											{#each agent.profiles.slice(0, 3) as profile}
												<span class="badge bg-secondary-subtle text-secondary me-1 mb-1">
													{profile.value}
												</span>
											{/each}
											{#if agent.profiles.length > 3}
												<span class="badge bg-light text-muted">
													+{agent.profiles.length - 3}
												</span>
											{/if}
										</div>
									{/if}

									<!-- 操作按钮 -->
									<div class="agent-actions mt-auto">
										<Button
											color="primary"
											size="sm"
											outline
											class="w-100"
											on:click={() => onStartNewConversation(agent.id)}
										>
											<i class="bx bx-message-dots me-1"></i>
											{$_('agents.marketplace.start_chat')}
										</Button>
									</div>
								</CardBody>
							</Card>
						</div>
					</Col>
				{/each}
			</Row>

			<!-- 加载更多指示器 -->
			{#if isLoadingMore}
				<div class="load-more-indicator text-center py-4" in:fade={{ duration: 200 }}>
					<div class="spinner-border spinner-border-sm text-primary me-2" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					<span class="text-muted">{$_('common.loading_more')}</span>
				</div>
			{/if}

			<!-- 无更多数据提示 -->
			{#if !hasMoreData && agents.items.length > 0}
				<div class="no-more-data text-center py-4" in:fade={{ duration: 200 }}>
					<small class="text-muted">{$_('common.no_more_data')}</small>
				</div>
			{/if}
		{/if}
	</div>

	<!-- 回到顶部按钮 -->
	{#if showBackToTop}
		<button
			class="btn-back-to-top btn btn-primary rounded-circle position-fixed"
			on:click={scrollToTop}
			in:fly={{ y: 20, duration: 200 }}
			out:fly={{ y: 20, duration: 200 }}
		>
			<i class="bx bx-chevron-up"></i>
		</button>
	{/if}
</div>

<style>
	.page-content {
		padding: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.filter-section {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.search-box :global(.input-group-text) {
		background-color: white !important;
		border-left: none !important;
	}

	.agents-grid {
		min-height: 400px;
	}

	.agent-card {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.agent-card:hover {
		transform: translateY(-2px);
	}

	.agent-card :global(.hover-shadow:hover) {
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
	}

	.agent-avatar {
		flex-shrink: 0;
	}

	.avatar-placeholder {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
	}

	.agent-name {
		font-weight: 600;
		color: #2d3748;
		line-height: 1.2;
	}

	.agent-description {
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.agent-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.agent-actions {
		border-top: 1px solid #f1f5f9;
		padding-top: 1rem;
		margin-top: 1rem;
	}

	.empty-state {
		background: white;
		border-radius: 0.5rem;
		padding: 3rem 1.5rem;
		margin: 2rem 0;
	}

	.empty-icon {
		font-size: 4rem;
		opacity: 0.5;
	}

	.load-more-indicator,
	.no-more-data {
		margin: 2rem 0;
	}

	.btn-back-to-top {
		bottom: 2rem;
		right: 2rem;
		width: 3rem;
		height: 3rem;
		z-index: 1000;
		border: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.btn-back-to-top:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.page-content {
			padding: 1rem;
		}

		.filter-section {
			padding: 1rem;
		}

		.btn-back-to-top {
			bottom: 1rem;
			right: 1rem;
			width: 2.5rem;
			height: 2.5rem;
		}
	}
</style>

<script>
	import { onMount } from 'svelte';
	import {
		Button,
		Modal,
		ModalBody,
		ModalHeader,
		Input,
		InputGroup,
		Badge
	} from '@sveltestrap/sveltestrap';
	import { getAgentsByUser } from '$lib/services/agent-service.js';
	import { AgentType } from '$lib/helpers/enums';
	import { _ } from 'svelte-i18n';
	import { PUBLIC_SERVICE_URL } from '$env/static/public';

	/** @type {boolean} */
	export let isOpen = false;

	/** @type {(agent: any) => void} */
	export let onAgentSelected = () => {};

	/** @type {() => void} */
	export let onClose = () => {};

	/** @type {import('$commonTypes').PagedItems<import('$agentTypes').AgentModel>} */
	let agents = { items: [], count: 0 };

	/** @type {string} */
	let searchQuery = '';

	/** @type {string} */
	let selectedType = 'all';

	/** @type {string} */
	let sortBy = 'created_desc';

	/** @type {boolean} */
	let isLoading = false;

	/** @type {boolean} */
	let isLoadingMore = false;

	/** @type {boolean} */
	let hasMoreData = true;

	/** @type {boolean} */
	let showBackToTop = false;

	/** @type {boolean} */
	let initialized = false;

	const pageSize = 12;
	const firstPage = 1;

	/** @type {import('$agentTypes').AgentFilter} */
	const initFilter = {
		pager: { page: firstPage, size: pageSize, count: 0 },
		types: [AgentType.Task, AgentType.Routing] // 默认显示任务型和路由型智能体
	};

	/** @type {import('$agentTypes').AgentFilter} */
	let filter = { ...initFilter };

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

	// 监听弹窗打开状态，当打开时加载数据
	$: if (isOpen && !initialized) {
		initializeModal();
	}

	async function initializeModal() {
		initialized = true;
		await loadAgents();
	}

	async function loadAgents() {
		isLoading = true;
		try {
			const response = await getAgentsByUser();
			// 将用户智能体数据转换为分页格式
			let filteredAgents = response || [];
			
			// 应用搜索过滤
			if (searchQuery) {
				filteredAgents = filteredAgents.filter(agent => 
					agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
				);
			}
			
			// 应用类型过滤
			if (selectedType !== 'all') {
				if (selectedType === 'single') {
					filteredAgents = filteredAgents.filter(agent => agent.type === AgentType.Task);
				} else if (selectedType === 'group') {
					filteredAgents = filteredAgents.filter(agent => agent.type === AgentType.Routing);
				}
			} else {
				// 默认只显示任务型和路由型智能体
				filteredAgents = filteredAgents.filter(agent => 
					agent.type === AgentType.Task || agent.type === AgentType.Routing
				);
			}
			
			// 应用排序
			filteredAgents.sort((a, b) => {
				switch (sortBy) {
					case 'created_asc':
						return new Date(a.createdTime) - new Date(b.createdTime);
					case 'created_desc':
						return new Date(b.createdTime) - new Date(a.createdTime);
					case 'name_asc':
						return a.name.localeCompare(b.name);
					case 'name_desc':
						return b.name.localeCompare(a.name);
					default:
						return new Date(b.createdTime) - new Date(a.createdTime);
				}
			});
			
			// 应用分页
			const startIndex = (filter.pager.page - 1) * pageSize;
			const endIndex = startIndex + pageSize;
			const paginatedItems = filteredAgents.slice(startIndex, endIndex);
			
			agents = {
				items: paginatedItems,
				count: filteredAgents.length
			};
			
			hasMoreData = endIndex < filteredAgents.length;
		} catch (error) {
			console.error('Error loading user agents:', error);
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
			// 更新页码
			filter.pager.page = filter.pager.page + 1;
			
			// 重新加载智能体（会自动应用新的分页）
			await loadAgents();
		} catch (error) {
			console.error('Error loading more agents:', error);
			hasMoreData = false;
		} finally {
			isLoadingMore = false;
		}
	}

	function buildFilter() {
		// 现在使用客户端过滤，简化过滤器
		return {
			pager: { page: firstPage, size: pageSize, count: 0 },
			types: [AgentType.Task, AgentType.Routing] // 保持默认类型
		};
	}

	function applyFilters() {
		filter = buildFilter();
		hasMoreData = true;
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

				clearTimeout(searchTimeout);
				searchTimeout = setTimeout(() => {
					applyFilters();
				}, 300);
			}
		}
	}
	/**
	 * @param {any} agent
	 */
	function selectAgent(agent) {
		onAgentSelected(agent);
		handleModalClose();
	}

	function handleModalClose() {
		isOpen = false;
		// 重置状态
		initialized = false;
		agents = { items: [], count: 0 };
		searchQuery = '';
		selectedType = 'all';
		sortBy = 'created_desc';
		filter = { ...initFilter };
		onClose();
	}

	/**
	 * 处理滚动事件
	 * @param {Event} event
	 */
	function handleScroll(event) {
		const container = /** @type {HTMLElement} */ (event.target);
		if (!container) return;

		const scrollTop = container.scrollTop;
		const scrollHeight = container.scrollHeight;
		const clientHeight = container.clientHeight;

		// 增加缓冲区域，提前100px触发加载更多
		const bufferDistance = 100;
		const shouldLoadMore =
			scrollHeight - scrollTop - clientHeight < bufferDistance && hasMoreData && !isLoadingMore;

		// 更新返回顶部按钮状态
		showBackToTop = scrollTop > 300;

		if (shouldLoadMore) {
			loadMoreAgents();
		}
	}

	function scrollToTop() {
		const scrollableContainer = document.querySelector('.modal-agents-grid');
		if (scrollableContainer) {
			scrollableContainer.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}

	/**
	 * @param {any} agent
	 */
	function getAgentTypeDisplay(agent) {
		if (agent.is_router) {
			return $_('workspace.agents.agent_group');
		}
		return $_('workspace.agents.task_agent');
	}
</script>

<Modal {isOpen} toggle={handleModalClose} size="xl" class="agent-selection-modal">
	<ModalHeader toggle={handleModalClose}>
		<i class="fas fa-robot me-2"></i>
		{$_('workspace.select_agent.title')}
	</ModalHeader>
	<ModalBody>
		<!-- 搜索和筛选区域 -->
		<div class="filters-section mb-4">
			<div class="row g-3">
				<div class="col-md-6">
					<InputGroup>
						<Input
							type="text"
							placeholder={$_('workspace.select_agent.search_placeholder')}
							bind:value={searchQuery}
							class="search-input"
						/>
						<Button color="light" outline>
							<i class="fas fa-search"></i>
						</Button>
					</InputGroup>
				</div>
				<div class="col-md-3">
					<select bind:value={selectedType} class="form-select filter-select">
						{#each filterOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
				<div class="col-md-3">
					<select bind:value={sortBy} class="form-select filter-select">
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- 智能体列表区域 -->
		{#if isLoading && agents.items.length === 0}
			<div class="text-center py-5">
				<div class="spinner-border text-primary mb-3" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p class="text-muted">{$_('workspace.select_agent.loading')}</p>
			</div>
		{:else if agents.items.length === 0}
			<div class="text-center py-5">
				<i class="fas fa-robot fa-3x text-muted mb-3"></i>
				<h5 class="text-muted">{$_('workspace.select_agent.no_agents')}</h5>
				<p class="text-muted small">{$_('workspace.agents.list.no_agents_description')}</p>
			</div>
		{:else}
			<!-- 智能体数量显示 -->
			<div class="agents-header-info mb-3">
				<div class="agents-count">
					<i class="fas fa-robot me-2"></i>
					<span class="count-number">{agents.count}</span>
					<span class="count-text">{$_('workspace.agents.list.agents_count')}</span>
				</div>
			</div>

			<div class="modal-agents-grid" on:scroll={handleScroll}>
				<div class="agents-grid-container">
					{#each agents.items as agent (agent.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							class="agent-selection-card"
							on:click={() => selectAgent(agent)}
							role="button"
							tabindex={0}
						>
							<div class="agent-card-header">
								<div class="agent-avatar">
									{#if agent.icon_url}
										<img 
											src={agent.icon_url && !agent.icon_url.startsWith('http') ? `${PUBLIC_SERVICE_URL}/${agent.icon_url}` : agent.icon_url} 
											alt={agent.name} 
											class="agent-image" 
										/>
									{:else}
										<i class="fas fa-robot"></i>
									{/if}
								</div>
								<div class="agent-info">
									<h6 class="agent-name">{agent.name}</h6>
									<Badge color="light" class="type-badge">
										{getAgentTypeDisplay(agent)}
									</Badge>
								</div>
							</div>

							<div class="agent-description">
								<p class="text-muted small">
									{agent.description || $_('workspace.select_agent.no_description')}
								</p>
							</div>

							{#if agent.labels && agent.labels.length > 0}
								<div class="agent-labels">
									{#each agent.labels as label}
										<Badge color="light" pill class="label-badge">{label}</Badge>
									{/each}
								</div>
							{/if}

							<div class="agent-meta">
								<small class="text-muted">
									<i class="fas fa-calendar me-1"></i>
									{new Date(agent.created_datetime).toLocaleDateString()}
								</small>
								{#if agent.is_public}
									<small class="text-muted ms-2">
										<i class="fas fa-globe me-1"></i>
										{$_('workspace.agents.create.public_agent')}
									</small>
								{/if}
							</div>
						</div>
					{/each}

					<!-- 加载更多指示器 -->
					{#if isLoadingMore}
						<div class="loading-more-indicator">
							<div class="spinner-border spinner-border-sm text-primary me-2" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							<span class="text-muted">{$_('workspace.agents.list.loading_more')}</span>
						</div>
					{/if}

					<!-- 没有更多数据提示 -->
					{#if !hasMoreData && agents.items.length >= pageSize}
						<div class="no-more-data">
							<i class="fas fa-check-circle text-success me-2"></i>
							<span class="text-muted small">{$_('workspace.agents.list.all_loaded')}</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- 返回顶部按钮 -->
			{#if showBackToTop}
				<button class="back-to-top-modal" on:click={scrollToTop} title={$_('common.back_to_top')}>
					<i class="fas fa-arrow-up"></i>
				</button>
			{/if}
		{/if}
	</ModalBody>
</Modal>

<style>
	/* 弹窗样式 */
	:global(.agent-selection-modal .modal-content) {
		border-radius: 16px;
		border: none;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
	}

	:global(.agent-selection-modal .modal-header) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 16px 16px 0 0;
		border-bottom: none;
		padding: 1.5rem;
	}

	:global(.agent-selection-modal .modal-body) {
		padding: 1.5rem;
	}

	:global(.agent-selection-modal .modal-dialog) {
		max-width: 1200px;
	}

	/* 筛选区域样式 */
	.filters-section {
		background: #f8f9fa;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e9ecef;
	}

	:global(.search-input) {
		border-radius: 8px;
		border: 2px solid #e9ecef;
		transition: all 0.3s ease;
	}

	:global(.search-input:focus) {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.filter-select {
		border-radius: 8px;
		border: 2px solid #e9ecef;
		transition: all 0.3s ease;
	}

	.filter-select:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	/* 智能体列表区域 */
	.agents-header-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid #e9ecef;
	}

	.agents-count {
		display: flex;
		align-items: center;
		color: #495057;
		font-weight: 500;
	}

	.count-number {
		font-size: 1.25rem;
		font-weight: 600;
		color: #667eea;
		margin: 0 0.5rem;
	}

	.modal-agents-grid {
		max-height: 60vh;
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	.agents-grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		padding: 1rem 0;
	}

	/* 智能体卡片样式 */
	.agent-selection-card {
		border: 2px solid #e9ecef;
		border-radius: 12px;
		padding: 1.5rem;
		background: white;
		transition: all 0.3s ease;
		cursor: pointer;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.agent-selection-card:hover {
		border-color: #667eea;
		transform: translateY(-3px);
		box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
	}

	.agent-card-header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.agent-avatar {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.25rem;
		margin-right: 1rem;
		overflow: hidden;
		flex-shrink: 0;
	}

	.agent-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 12px;
	}

	.agent-info {
		flex: 1;
		min-width: 0;
	}

	.agent-name {
		font-weight: 600;
		color: #2c3e50;
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		line-height: 1.3;
	}

	:global(.type-badge) {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: #e9ecef !important;
		color: #6c757d !important;
		border: none !important;
	}

	.agent-description {
		margin-bottom: 1rem;
		flex: 1;
	}

	.agent-description p {
		margin: 0;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.agent-labels {
		margin-bottom: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	:global(.label-badge) {
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		background: #f8f9fa !important;
		color: #6c757d !important;
		border: 1px solid #e9ecef !important;
	}

	.agent-meta {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid #f8f9fa;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	/* 加载状态样式 */
	.loading-more-indicator {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		color: #6c757d;
	}

	.no-more-data {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		color: #6c757d;
	}

	/* 返回顶部按钮 */
	.back-to-top-modal {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
		transition: all 0.3s ease;
		z-index: 1060;
	}

	.back-to-top-modal:hover {
		background: #5a6fd8;
		transform: translateY(-2px);
		box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		:global(.agent-selection-modal .modal-dialog) {
			margin: 0.5rem;
			max-width: calc(100% - 1rem);
		}

		.agents-grid-container {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.modal-agents-grid {
			max-height: 50vh;
		}

		.filters-section {
			padding: 1rem;
		}

		.filters-section .row {
			--bs-gutter-x: 0.75rem;
		}

		.back-to-top-modal {
			bottom: 1rem;
			right: 1rem;
			width: 45px;
			height: 45px;
		}
	}

	@media (max-width: 576px) {
		.filters-section .col-md-3,
		.filters-section .col-md-6 {
			margin-bottom: 0.75rem;
		}
	}

	/* 滚动条样式 */
	.modal-agents-grid::-webkit-scrollbar {
		width: 8px;
	}

	.modal-agents-grid::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 4px;
	}

	.modal-agents-grid::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 4px;
	}

	.modal-agents-grid::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>

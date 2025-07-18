<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly, slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import Swal from 'sweetalert2';
	// import * as lodash from 'lodash';
	import { Button, Card, CardBody, Col, Input, Row, Table } from '@sveltestrap/sveltestrap';
	import AgentSelectionModal from '$lib/common/AgentSelectionModal.svelte';
	import UserProfileModal from '$lib/common/UserProfileModal.svelte';
	import { getAgentsByUser } from '$lib/services/agent-service';
	import { getConversations, deleteConversation } from '$lib/services/conversation-service.js';
	import { myInfo } from '$lib/services/auth-service';
	import { resetLocalStorage, userStore } from '$lib/helpers/store';
	import { logout as oidcLogout } from '$lib/services/oidc-auth-service.js';
	import { utcToLocal } from '$lib/helpers/datetime';
	import { ConversationChannel } from '$lib/helpers/enums';
	import { PUBLIC_SERVICE_URL } from '$env/static/public';
	import { buildUrl } from '$lib/helpers/utils/common';
	import { browser } from '$app/environment';
	import { ChatAction } from '$lib/helpers/enums';
	import { CHAT_FRAME_ID } from '$lib/helpers/constants';

	const firstPage = 1;
	const pageSize = 15;

	let mounted = false;
	let showAgentModal = false;
	let showLeftSidebar = false; // 默认隐藏侧边栏
	let sidebarDataLoaded = false; // 跟踪侧边栏数据是否已加载
	let isLoadingMore = false; // 滚动加载更多状态
	let isConversationListLoading = false; // 会话列表专用加载状态
	let hasMoreData = true; // 是否还有更多数据
	let showStateSearch = false;
	let showUserProfileModal = false;
	let showUserDropdown = false;

	/** @type {import('$userTypes').UserModel | null} */
	let currentUser = null;

	/** @type {import('$commonTypes').PagedItems<import('$conversationTypes').ConversationModel>} */
	let conversations = { count: 0, items: [] };

	/** @type {import('$conversationTypes').ConversationFilter} */
	const initFilter = {
		pager: { page: firstPage, size: pageSize, count: 0 }
	};

	/** @type {import('$conversationTypes').ConversationFilter} */
	let filter = { ...initFilter };

	/** @type {import('$commonTypes').Pagination} */
	let pager = filter.pager;

	/** @type {import('$commonTypes').IdName[]} */
	let agentOptions = [];

	/** @type {import('$commonTypes').IdName[]} */
	let statusOptions = [
		{ id: 'open', name: 'Active' },
		{ id: 'closed', name: 'Completed' }
	];

	/** @type {import('$commonTypes').IdName[]} */
	let channelOptions = Object.entries(ConversationChannel).map(([k, v]) => ({
		id: k.toLowerCase(),
		name: v
	}));

	/** @type {import('$conversationTypes').ConversationSearchOption} */
	let searchOption = {
		agentId: null,
		channel: null,
		status: null,
		taskId: null,
		states: [],
		tags: []
	};
	onMount(async () => {
		mounted = true;
		// 只加载基础数据，不加载会话列表
		// 移除全局加载状态，避免页面闪烁
		Promise.all([loadAgentOptions(), loadSearchOption(), loadCurrentUser()]);

		// Add click outside listener to close user dropdown
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	/** @param {any} event */
	function handleClickOutside(event) {
		const userSection = event.target.closest('.user-profile-section');
		if (!userSection && showUserDropdown) {
			showUserDropdown = false;
		}
	}

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});
	function loadConversations() {
		return new Promise((resolve, reject) => {
			isConversationListLoading = true;
			getPagedConversations()
				.then((res) => {
					resolve(res);
				})
				.catch((error) => {
					reject(error);
				})
				.finally(() => {
					isConversationListLoading = false;
				});
		});
	}

	async function getPagedConversations() {
		const response = await getConversations(filter);
		conversations = response;
		hasMoreData = response.items.length === pageSize && response.count > response.items.length;
		refresh();
	}

	async function loadMoreConversations() {
		if (isLoadingMore || !hasMoreData) return;

		isLoadingMore = true;
		try {
			const nextPage = filter.pager.page + 1;
			const nextFilter = {
				...filter,
				pager: { ...filter.pager, page: nextPage }
			};

			const response = await getConversations(nextFilter);

			if (response.items && response.items.length > 0) {
				// 合并新数据到现有数据
				conversations = {
					items: [...conversations.items, ...response.items],
					count: response.count
				};

				// 更新过滤器页码
				filter.pager.page = nextPage;

				// 检查是否还有更多数据
				hasMoreData =
					response.items.length === pageSize && conversations.items.length < response.count;
			} else {
				hasMoreData = false;
			}

			refresh();
		} catch (error) {
			console.error('Error loading more conversations:', error);
			hasMoreData = false;
		} finally {
			isLoadingMore = false;
		}
	}

	function loadAgentOptions() {
		return new Promise((resolve, reject) => {
			getAgentsByUser()
				.then((res) => {
					agentOptions =
						res?.map((x) => {
							return {
								id: x.id,
								name: x.name
							};
						}) || [];
					resolve(agentOptions);
				})
				.catch((error) => {
					agentOptions = [];
					reject(error);
				});
		});
	}

	function loadSearchOption() {
		return Promise.resolve();
	}

	function loadCurrentUser() {
		return new Promise((resolve, reject) => {
			myInfo()
				.then((user) => {
					currentUser = user;
					resolve(user);
				})
				.catch((error) => {
					console.error('Failed to load user info:', error);
					currentUser = null;
					reject(error);
				});
		});
	}

	function refresh() {
		refreshConversations();
		refreshPager(conversations.count, filter.pager.page, filter.pager.size);
	}

	function refreshConversations() {
		conversations = {
			items:
				conversations?.items?.map((t) => {
					return { ...t };
				}) || [],
			count: conversations?.count || 0
		};
	}

	/** @param {number} totalItemsCount */
	function refreshPager(totalItemsCount, page = firstPage, pageCount = pageSize) {
		pager = {
			page: page,
			size: pageCount,
			count: totalItemsCount
		};
	}
	/** @param {number} pageNum */
	function pageTo(pageNum) {
		pager = {
			...pager,
			page: pageNum
		};

		filter = {
			...filter,
			pager: pager
		};

		getPagedConversations();
	}
	async function reloadConversations() {
		// 重置分页到第一页
		filter = {
			...filter,
			pager: { ...filter.pager, page: firstPage }
		};
		hasMoreData = true;
		isConversationListLoading = true;
		try {
			conversations = await getConversations(filter);
			hasMoreData =
				conversations.items.length === pageSize && conversations.count > conversations.items.length;
			refreshPager(conversations.count);
		} finally {
			isConversationListLoading = false;
		}
	}
	/** @param {string} conversationId */
	function handleConversationDeletion(conversationId) {
		// 使用局部状态管理，不影响整个页面
		deleteConversation(conversationId)
			.then(async () => {
				// 删除成功后重新加载会话列表
				await reloadConversations();
			})
			.catch((err) => {
				console.error('Failed to delete conversation:', err);
			});
	}
	/** @param {string} conversationId */
	function openDeleteModal(conversationId) {
		// @ts-ignore
		Swal.fire({
			title: $_('workspace.sessions.delete_confirm.title'),
			text: $_('workspace.sessions.delete_confirm.message'),
			icon: 'warning',
			customClass: 'custom-modal',
			showCancelButton: true,
			confirmButtonText: $_('common.confirm'),
			cancelButtonText: $_('common.cancel')
		}).then((result) => {
			if (result.value) {
				handleConversationDeletion(conversationId);
			}
		});
	}
	/** @param {Event} e */
	function searchConversations(e) {
		// 重置到第一页并重新加载
		filter = {
			...filter,
			agentId: searchOption.agentId,
			channel: searchOption.channel,
			status: searchOption.status,
			taskId: searchOption.taskId,
			states: [],
			tags: searchOption.tags,
			pager: { ...filter.pager, page: firstPage }
		};
		hasMoreData = true;
		isConversationListLoading = true;
		getPagedConversations().finally(() => {
			isConversationListLoading = false;
		});
	}

	/**
	 * @param {any} e
	 * @param {string} type
	 */
	function changeOption(e, type) {
		if (type === 'agent') {
			searchOption = {
				...searchOption,
				agentId: e.target.value || null
			};
		} else if (type === 'task') {
			searchOption = {
				...searchOption,
				taskId: e.target.value || null
			};
		} else if (type === 'channel') {
			searchOption = {
				...searchOption,
				channel: e.target.value || null
			};
		} else if (type === 'status') {
			searchOption = {
				...searchOption,
				status: e.target.value || null
			};
		} else if (type === 'tags') {
			searchOption = {
				...searchOption,
				tags: e.target.value?.length > 0 ? [e.target.value] : []
			};
		}
	}
	function startNewChat() {
		showAgentModal = true;
	}
	function openSessionsManager() {
		showLeftSidebar = true;
		// 首次打开侧边栏时加载会话数据
		if (!sidebarDataLoaded) {
			// 使用局部加载状态，不影响整个页面
			loadConversations().finally(() => {
				sidebarDataLoaded = true;
			});
		}
	}

	function toggleSidebar() {
		showLeftSidebar = !showLeftSidebar;
	}

	/**
	 * @param {any} agent
	 */
	function handleAgentSelected(agent) {
		// Start new chat with selected agent - navigate to new route structure
		goto(`/workspace/chat/${agent.id}/new`);
	}

	/**
	 * @param {string} conversationId
	 * @param {string} agentId
	 */
	function handleConversationSelected(conversationId, agentId) {
		// Navigate to existing chat session with proper route structure
		goto(`/workspace/chat/${agentId}/${conversationId}`);
	}

	function logout() {
		if (browser) {
			resetLocalStorage(true);
		}

		const chatFrame = document.getElementById(CHAT_FRAME_ID);
		if (chatFrame) {
			// @ts-ignore
			chatFrame.contentWindow.postMessage({ action: ChatAction.Logout }, '*');
		}

		// After local cleanup, call OIDC logout for complete session cleanup
		oidcLogout();
	}

	function confirmLogout() {
		Swal.fire({
			title: $_('logout_confirm_title'),
			text: $_('logout_confirm_message'),
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: $_('logout_confirm_yes'),
			cancelButtonText: $_('logout_confirm_no')
		}).then((result) => {
			if (result.value) {
				logout();
			}
		});
	}

	function toggleUserDropdown() {
		showUserDropdown = !showUserDropdown;
	}

	function showUserProfile() {
		showUserProfileModal = true;
		showUserDropdown = false;
	}

	/** @param {any} e */
	function handleAvatarLoad(e) {
		e.target.src = '/images/users/user-dummy.jpg';
	}
	function openAgentManagement() {
		goto('/workspace/agents');
	}

	/**
	 * 处理会话列表滚动事件
	 * @param {Event} event
	 */
	function handleConversationScroll(event) {
		const container = /** @type {HTMLElement} */ (event.target);
		if (!container) return;

		const scrollTop = container.scrollTop;
		const scrollHeight = container.scrollHeight;
		const clientHeight = container.clientHeight;

		// 接近底部时加载更多
		if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreData && !isLoadingMore) {
			loadMoreConversations();
		}
	}
</script>

<div class="workspace-layout">
	<!-- Floating Toggle Button (shown when sidebar is closed) -->
	{#if !showLeftSidebar}
		<div class="floating-toggle" transition:fade={{ duration: 300, delay: 100 }}>
			<Button
				color="primary"
				class="floating-btn"
				on:click={openSessionsManager}
				title={$_('workspace.sessions.title')}
			>
				<i class="fas fa-comments"></i>
			</Button>
		</div>
	{/if}
	<!-- Left Sidebar for Conversations -->
	<div class="sidebar-left {showLeftSidebar ? 'sidebar-open' : 'sidebar-closed'}">
		{#if showLeftSidebar}
			<div class="sidebar-header" in:fly={{ x: -100, duration: 300, delay: 100 }}>
				<div class="sidebar-title">
					<i class="fas fa-comments me-2"></i>
					{$_('workspace.sessions.title')}
				</div>
				<div class="sidebar-actions">
					<Button
						size="sm"
						color="primary"
						on:click={startNewChat}
						title={$_('workspace.actions.start_chat.title')}
					>
						<i class="fas fa-plus"></i>
					</Button>
					<Button
						size="sm"
						color="secondary"
						on:click={toggleSidebar}
						title={showLeftSidebar ? $_('common.close') : $_('common.open')}
					>
						<i class="fas fa-times"></i>
					</Button>
				</div>
			</div>
		{/if}
		{#if showLeftSidebar}
			<div class="sidebar-content" in:fly={{ x: -100, duration: 300, delay: 150 }}>
				<!-- Search and Filter Section -->
				<div class="filter-section" in:slide={{ duration: 300, delay: 200 }}>
					<div class="filter-header">
						<span class="filter-title">
							<i class="fas fa-filter me-2"></i>
							{$_('workspace.sessions.filters')}
						</span>
						<Button
							size="sm"
							color={showStateSearch ? 'secondary' : 'outline-primary'}
							on:click={() => (showStateSearch = !showStateSearch)}
							class="filter-toggle-btn"
						>
							{#if showStateSearch}
								<i class="fas fa-chevron-up"></i>
							{:else}
								<i class="fas fa-chevron-down"></i>
							{/if}
						</Button>
					</div>

					{#if showStateSearch}
						<div class="filter-content" transition:slide={{ duration: 300 }}>
							<!-- Agent Filter -->
							<div class="filter-group">
								<div class="filter-label">
									<i class="fas fa-robot me-1"></i>
									{$_('workspace.sessions.agent')}
								</div>
								<select
									class="form-select form-select-sm modern-select"
									value={searchOption.agentId}
									on:change={(e) => changeOption(e, 'agent')}
								>
									<option value={null}>{$_('workspace.sessions.all_agents')}</option>
									{#each agentOptions as op}
										<option value={`${op.id}`} selected={op.id === searchOption.agentId}
											>{$_(`${op.name}`)}</option
										>
									{/each}
								</select>
							</div>

							<!-- Status Filter -->
							<div class="filter-group">
								<div class="filter-label">
									<i class="fas fa-signal me-1"></i>
									{$_('workspace.sessions.status')}
								</div>
								<select
									class="form-select form-select-sm modern-select"
									value={searchOption.status}
									on:change={(e) => changeOption(e, 'status')}
								>
									<option value={null}>{$_('workspace.sessions.all_status')}</option>
									{#each statusOptions as op}
										<option value={`${op.id}`} selected={op.id === searchOption.status}
											>{$_(`${op.name}`)}</option
										>
									{/each}
								</select>
							</div>

							<!-- Channel Filter -->
							<div class="filter-group">
								<div class="filter-label">
									<i class="fas fa-broadcast-tower me-1"></i>
									{$_('workspace.sessions.channel')}
								</div>
								<select
									class="form-select form-select-sm modern-select"
									value={searchOption.channel}
									on:change={(e) => changeOption(e, 'channel')}
								>
									<option value={null}>{$_('workspace.sessions.all_channels')}</option>
									{#each channelOptions as op}
										<option value={`${op.id}`} selected={op.id === searchOption.channel}
											>{$_(`${op.name}`)}</option
										>
									{/each}
								</select>
							</div>

							<!-- Tag Filter -->
							<div class="filter-group">
								<div class="filter-label">
									<i class="fas fa-tag me-1"></i>
									{$_('workspace.sessions.tag')}
								</div>
								<Input
									type="text"
									placeholder={$_('workspace.sessions.tag_placeholder')}
									bsSize="sm"
									class="modern-input"
									maxlength={100}
									on:input={(e) => changeOption(e, 'tags')}
								/>
							</div>

							<!-- Apply Filter Button -->
							<div class="filter-actions">
								<Button
									size="sm"
									color="primary"
									class="w-100 apply-filter-btn"
									on:click={(e) => searchConversations(e)}
								>
									<i class="fas fa-search me-1" />
									{$_('workspace.sessions.apply_filters')}
								</Button>
							</div>
						</div>
					{/if}
				</div>
				<!-- Conversations List -->
				<div class="conversations-list" in:fade={{ duration: 300, delay: 250 }}>
					{#if isConversationListLoading && !sidebarDataLoaded}
						<div class="loading-state">
							<div class="spinner-border spinner-border-sm me-2" role="status"></div>
							<span>{$_('workspace.sessions.loading')}</span>
						</div>
					{:else if conversations.items.length > 0}
						<div class="conversations-header">
							<span class="conversations-count">
								<i class="fas fa-list me-1"></i>
								{conversations.count}
								{$_('workspace.sessions.message_count')}
							</span>
							{#if isConversationListLoading}
								<div class="loading-indicator">
									<div class="spinner-border spinner-border-sm" role="status"></div>
								</div>
							{/if}
						</div>
						<div class="conversations-scrollable" on:scroll={handleConversationScroll}>
							{#each conversations.items as conv}
								<div
									class="conversation-item"
									on:click={() => handleConversationSelected(conv.id, conv.agent_id)}
									on:keydown={(e) =>
										e.key === 'Enter' && handleConversationSelected(conv.id, conv.agent_id)}
									role="button"
									tabindex="0"
								>
									<div class="conversation-header">
										<div class="conversation-title">{conv.title}</div>
										<div class="conversation-actions">
											<button
												class="action-btn chat-btn"
												on:click|stopPropagation={() =>
													window.open(`/workspace/chat/${conv.agent_id}/${conv.id}`)}
												title={$_('workspace.sessions.open_session')}
											>
												<i class="fas fa-comments"></i>
											</button>
											<button
												class="action-btn delete-btn"
												on:click|stopPropagation={() => openDeleteModal(conv.id)}
												title={$_('workspace.sessions.delete')}
											>
												<i class="fas fa-trash-alt"></i>
											</button>
										</div>
									</div>
									<div class="conversation-meta">
										<div class="agent-info">
											<i class="fas fa-robot me-1"></i>
											<span>{conv.agent_name}</span>
										</div>
										<div class="status-badge">
											<span
												class="badge badge-modern bg-{conv.status === 'open'
													? 'success'
													: 'secondary'}"
												>{$_(conv.status === 'open' ? 'Active' : 'Completed')}</span
											>
										</div>
									</div>
									<div class="conversation-footer">
										<div class="user-info">
											<i class="fas fa-user me-1"></i>
											<span>{conv.user.full_name}</span>
										</div>
										<div class="timestamp">
											<i class="fas fa-clock me-1"></i>
											{utcToLocal(conv.updated_time)}
										</div>
									</div>
								</div>
							{/each}

							<!-- 加载更多指示器 -->
							{#if isLoadingMore}
								<div class="loading-more-indicator" in:fly={{ y: 20, duration: 300 }}>
									<div class="loading-spinner"></div>
									<span>{$_('workspace.sessions.loading_more')}</span>
								</div>
							{/if}

							<!-- 没有更多数据提示 -->
							{#if !hasMoreData && conversations.items.length >= pageSize}
								<div class="no-more-data" in:fly={{ y: 20, duration: 300 }}>
									<i class="fas fa-check-circle"></i>
									<span>{$_('workspace.sessions.all_loaded')}</span>
								</div>
							{/if}
						</div>
					{:else}
						<div class="empty-state">
							<div class="empty-icon">
								<i class="fas fa-comments"></i>
							</div>
							<h4 class="empty-title">{$_('workspace.sessions.no_sessions')}</h4>
							<p class="empty-description">
								{$_('workspace.sessions.no_sessions_description')}
							</p>
							<Button color="primary" on:click={startNewChat} class="empty-action-btn">
								<i class="fas fa-plus me-2"></i>
								{$_('workspace.actions.start_chat.title')}
							</Button>
						</div>
					{/if}
				</div>

				<!-- User Profile Section at Bottom -->
				{#if currentUser}
					<div class="user-profile-section" in:fade={{ duration: 300, delay: 300 }}>
						<div class="user-profile-container">
							<div
								class="user-avatar-wrapper"
								on:click={toggleUserDropdown}
								on:keydown={(e) => e.key === 'Enter' && toggleUserDropdown()}
								role="button"
								tabindex="0"
							>
								<img
									src={`${
										currentUser?.avatar && $userStore?.token
											? `${buildUrl(PUBLIC_SERVICE_URL, currentUser?.avatar).href}?access_token=${$userStore?.token}`
											: ''
									}`}
									alt="User Avatar"
									class="user-avatar"
									on:error={(e) => handleAvatarLoad(e)}
								/>
							</div>
							<div
								class="user-info"
								on:click={toggleUserDropdown}
								on:keydown={(e) => e.key === 'Enter' && toggleUserDropdown()}
								role="button"
								tabindex="0"
							>
								<div class="user-name">{currentUser?.full_name || 'User'}</div>
							</div>
							<div class="user-actions">
								<button
									class="action-btn dropdown-btn"
									on:click={toggleUserDropdown}
									title="User Menu"
								>
									<i class="fas fa-chevron-{showUserDropdown ? 'up' : 'down'}"></i>
								</button>
							</div>
						</div>

						<!-- User Dropdown Menu -->
						{#if showUserDropdown}
							<div class="user-dropdown-menu" transition:slide={{ duration: 300 }}>
								<div
									class="dropdown-item"
									on:click={showUserProfile}
									on:keydown={(e) => e.key === 'Enter' && showUserProfile()}
									role="button"
									tabindex="0"
								>
									<i class="fas fa-user me-2"></i>
									{$_('Profile')}
								</div>
								<div class="dropdown-divider"></div>
								<div
									class="dropdown-item logout-item"
									on:click={confirmLogout}
									on:keydown={(e) => e.key === 'Enter' && confirmLogout()}
									role="button"
									tabindex="0"
								>
									<i class="fas fa-sign-out-alt me-2"></i>
									{$_('Logout')}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Main Content Area -->
	<div class="main-content {showLeftSidebar ? 'with-sidebar' : 'full-width'}">
		{#if mounted}
			<div class="workspace-header" in:fade={{ duration: 600 }}>
				<div class="header-content">
					<h1 class="workspace-title">
						<i class="fas fa-workspace me-3"></i>
						{$_('workspace.title')}
					</h1>
					<p class="workspace-subtitle">
						{$_('workspace.subtitle')}
					</p>
				</div>
			</div>
			<div class="workspace-content" in:fly={{ y: 30, duration: 800, delay: 200 }}>
				<div class="quick-actions">
					<h2 class="section-title">{$_('workspace.quick_actions')}</h2>
					<div class="action-grid">
						<div
							class="action-card"
							on:click={startNewChat}
							on:keydown={(e) => e.key === 'Enter' && startNewChat()}
							role="button"
							tabindex="0"
						>
							<div class="action-icon">
								<i class="fas fa-comments"></i>
							</div>
							<div class="action-content">
								<h3>{$_('workspace.actions.start_chat.title')}</h3>
								<p>{$_('workspace.actions.start_chat.description')}</p>
								<span class="action-hint">{$_('workspace.actions.start_chat.hint')}</span>
							</div>
							<div class="action-arrow">
								<i class="fas fa-arrow-right"></i>
							</div>
						</div>

						<div
							class="action-card"
							on:click={openSessionsManager}
							on:keydown={(e) => e.key === 'Enter' && openSessionsManager()}
							role="button"
							tabindex="0"
						>
							<div class="action-icon">
								<i class="fas fa-history"></i>
							</div>
							<div class="action-content">
								<h3>{$_('workspace.actions.manage_sessions.title')}</h3>
								<p>{$_('workspace.actions.manage_sessions.description')}</p>
								<span class="action-hint">{$_('workspace.actions.manage_sessions.hint')}</span>
							</div>
							<div class="action-arrow">
								<i class="fas fa-arrow-right"></i>
							</div>
						</div>

						<div
							class="action-card"
							on:click={openAgentManagement}
							on:keydown={(e) => e.key === 'Enter' && openAgentManagement()}
							role="button"
							tabindex="0"
						>
							<div class="action-icon">
								<i class="fas fa-robot"></i>
							</div>
							<div class="action-content">
								<h3>{$_('workspace.actions.agent_management.title')}</h3>
								<p>{$_('workspace.actions.agent_management.description')}</p>
								<span class="action-hint">{$_('workspace.actions.agent_management.hint')}</span>
							</div>
							<div class="action-arrow">
								<i class="fas fa-arrow-right"></i>
							</div>
						</div>

						<div class="action-card disabled">
							<div class="action-icon">
								<i class="fas fa-cog"></i>
							</div>
							<div class="action-content">
								<h3>{$_('workspace.actions.workspace_settings.title')}</h3>
								<p>{$_('workspace.actions.workspace_settings.description')}</p>
								<span class="coming-soon">{$_('workspace.coming_soon')}</span>
							</div>
							<div class="action-arrow">
								<i class="fas fa-arrow-right"></i>
							</div>
						</div>
					</div>
				</div>

				<div class="recent-activity" in:fly={{ y: 30, duration: 800, delay: 400 }}>
					<h2 class="section-title">{$_('workspace.recent_activity')}</h2>
					<div class="activity-placeholder">
						<i class="fas fa-inbox"></i>
						<p>{$_('workspace.no_recent_activity')}</p>
						<span>{$_('workspace.start_conversation_hint')}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Agent Selection Modal -->
<AgentSelectionModal
	bind:isOpen={showAgentModal}
	onAgentSelected={handleAgentSelected}
	onClose={() => (showAgentModal = false)}
/>

<!-- User Profile Modal -->
<UserProfileModal
	bind:isOpen={showUserProfileModal}
	user={currentUser}
	on:close={() => (showUserProfileModal = false)}
/>

<style>
	.workspace-layout {
		display: flex;
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		position: relative;
	}

	/* Floating Toggle Button */
	.floating-toggle {
		position: fixed;
		top: 20px;
		left: 20px;
		z-index: 1001;
	}

	/* Left Sidebar Styles */
	.sidebar-left {
		width: 320px;
		background: white;
		border-right: 1px solid #e9ecef;
		display: flex;
		flex-direction: column;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 1000;
		overflow: hidden;
	}

	.sidebar-left.sidebar-closed {
		width: 0;
		border-right: none;
		box-shadow: none;
	}
	.sidebar-header {
		padding: 1rem;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		min-width: 320px; /* 确保header不会被压缩 */
		flex-shrink: 0;
	}
	.sidebar-title {
		font-weight: 600;
		font-size: 1rem;
		white-space: nowrap;
		overflow: hidden;
		flex: 1;
	}

	.sidebar-actions {
		display: flex;
		gap: 0.5rem;
	}
	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		min-width: 320px; /* 确保内容不会被压缩 */
		background: white;
	}
	.filter-section {
		padding: 1rem;
		border-bottom: 1px solid #e9ecef;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	}

	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.filter-title {
		font-weight: 600;
		font-size: 0.9rem;
		color: #495057;
		display: flex;
		align-items: center;
	}
	.filter-section :global(.filter-toggle-btn) {
		border-radius: 50%;
		width: 32px;
		height: 32px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-content {
		margin-top: 0.75rem;
	}

	.filter-group {
		margin-bottom: 1rem;
	}
	.filter-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6c757d;
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.filter-section :global(.modern-select),
	.filter-section :global(.modern-input) {
		border-radius: 8px;
		border: 1px solid #dee2e6;
		transition: all 0.2s ease;
	}

	.filter-section :global(.modern-select:focus),
	.filter-section :global(.modern-input:focus) {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.filter-actions {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #dee2e6;
	}
	.filter-actions :global(.apply-filter-btn) {
		border-radius: 8px;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.5px;
		padding: 0.5rem 1rem;
	}
	.conversations-list {
		flex: 1;
		overflow: hidden;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.conversations-scrollable {
		flex: 1;
		overflow-y: auto;
		scroll-behavior: smooth;
	}

	.loading-more-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1rem;
		margin: 0.5rem;
		background: rgba(255, 255, 255, 0.9);
		border: 1px dashed #cbd5e1;
		border-radius: 0.75rem;
		color: #6c757d;
		font-size: 0.85rem;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #e2e8f0;
		border-top: 2px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.no-more-data {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		margin: 0.5rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		border-radius: 0.75rem;
		color: #16a34a;
		font-size: 0.85rem;
		font-weight: 500;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		color: #6c757d;
		font-size: 0.9rem;
	}
	.conversations-header {
		padding: 0.75rem 1rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.conversations-count {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.loading-indicator {
		display: flex;
		align-items: center;
	}

	.loading-indicator .spinner-border {
		width: 1rem;
		height: 1rem;
		color: #667eea;
	}

	.conversation-item {
		background: white;
		border-bottom: 1px solid #e9ecef;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.conversation-item:hover {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-left: 4px solid #667eea;
		padding-left: calc(1rem - 4px);
	}

	.conversation-item:last-child {
		border-bottom: none;
	}

	.conversation-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.conversation-title {
		font-weight: 600;
		font-size: 0.9rem;
		color: #2c3e50;
		flex: 1;
		margin-right: 0.5rem;
		line-height: 1.3;
	}
	.conversation-actions {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.conversation-item:hover .conversation-actions {
		opacity: 1;
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0.4rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #6c757d;
		font-size: 0.8rem;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn:hover {
		background: #f8f9fa;
		color: #495057;
		transform: scale(1.1);
	}

	.chat-btn:hover {
		background: #d4edda;
		color: #155724;
	}

	.delete-btn:hover {
		background: #f8d7da;
		color: #721c24;
	}

	.conversation-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.agent-info {
		font-size: 0.75rem;
		color: #667eea;
		font-weight: 500;
		display: flex;
		align-items: center;
	}

	.status-badge .badge {
		font-size: 0.7rem;
	}

	.badge-modern {
		border-radius: 12px;
		padding: 0.25rem 0.5rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.conversation-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.7rem;
		color: #6c757d;
		margin-top: 0.5rem;
	}

	.user-info,
	.timestamp {
		display: flex;
		align-items: center;
	}

	.timestamp {
		font-size: 0.65rem;
		color: #adb5bd;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		color: #6c757d;
	}

	.empty-icon {
		margin-bottom: 1.5rem;
	}

	.empty-icon i {
		font-size: 3rem;
		color: #dee2e6;
	}

	.empty-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #495057;
	}

	.empty-description {
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
		color: #6c757d;
	}
	.empty-state :global(.empty-action-btn) {
		border-radius: 8px;
		font-weight: 600;
		padding: 0.75rem 1.5rem;
	}

	/* User Profile Section */
	.user-profile-section {
		border-top: 1px solid #e9ecef;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		position: relative;
	}

	.user-profile-container {
		display: flex;
		align-items: center;
		padding: 1rem;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.user-profile-container:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.user-avatar-wrapper {
		flex-shrink: 0;
		cursor: pointer;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #dee2e6;
		transition: all 0.2s ease;
	}

	.user-avatar:hover {
		border-color: #667eea;
		transform: scale(1.05);
	}

	.user-info {
		flex: 1;
		cursor: pointer;
		min-width: 0;
	}

	.user-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-actions {
		flex-shrink: 0;
	}

	.dropdown-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #6c757d;
		font-size: 0.8rem;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dropdown-btn:hover {
		background: #f8f9fa;
		color: #495057;
	}

	.user-dropdown-menu {
		position: absolute;
		bottom: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #e9ecef;
		border-radius: 8px 8px 0 0;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		overflow: hidden;
	}

	.dropdown-item {
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		color: #495057;
	}

	.dropdown-item:hover {
		background: #f8f9fa;
		color: #2c3e50;
	}

	.dropdown-item.logout-item {
		color: #dc3545;
	}

	.dropdown-item.logout-item:hover {
		background: #f8d7da;
		color: #721c24;
	}

	.dropdown-divider {
		height: 1px;
		background: #e9ecef;
		margin: 0;
	}
	/* Main Content Styles */
	.main-content {
		flex: 1;
		overflow-y: auto;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.main-content.with-sidebar {
		margin-left: 0;
	}

	.main-content.full-width {
		margin-left: 0;
	}

	.workspace-header {
		padding: 3rem 2rem 2rem;
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.workspace-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.workspace-subtitle {
		font-size: 1.2rem;
		color: #7f8c8d;
		margin: 0;
	}

	.workspace-content {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.action-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.action-card:hover:not(.disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.action-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-icon {
		width: 60px;
		height: 60px;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.action-card:hover:not(.disabled) .action-icon {
		background: rgba(255, 255, 255, 0.2);
	}

	.action-icon i {
		font-size: 1.5rem;
		color: white;
	}

	.action-content {
		flex-grow: 1;
		position: relative;
	}

	.action-content h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	.action-content p {
		font-size: 0.9rem;
		color: #7f8c8d;
		margin: 0 0 0.5rem 0;
	}

	.action-hint {
		font-size: 0.75rem;
		color: #95a5a6;
		font-style: italic;
	}

	.action-card:hover:not(.disabled) .action-content p,
	.action-card:hover:not(.disabled) .action-hint {
		color: rgba(255, 255, 255, 0.8);
	}

	.coming-soon {
		position: absolute;
		top: -0.5rem;
		right: 0;
		background: #f39c12;
		color: white;
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
	}

	.action-arrow {
		margin-left: 1rem;
		flex-shrink: 0;
	}

	.action-arrow i {
		font-size: 1rem;
		color: #bdc3c7;
		transition: all 0.3s ease;
	}

	.action-card:hover:not(.disabled) .action-arrow i {
		color: white;
		transform: translateX(3px);
	}

	.recent-activity {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.activity-placeholder {
		text-align: center;
		padding: 3rem 1rem;
		color: #bdc3c7;
	}

	.activity-placeholder i {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.activity-placeholder p {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #7f8c8d;
	}

	.activity-placeholder span {
		font-size: 0.9rem;
	} /* Responsive Design */
	@media (max-width: 1024px) {
		.sidebar-left {
			width: 280px;
		}

		.sidebar-header,
		.sidebar-content {
			min-width: 280px;
		}
	}

	@media (max-width: 768px) {
		.floating-toggle {
			top: 15px;
			left: 15px;
		}
		.floating-toggle :global(.floating-btn) {
			width: 45px;
			height: 45px;
		}

		.floating-toggle :global(.floating-btn i) {
			font-size: 1.1rem;
		}

		.sidebar-left {
			position: fixed;
			top: 0;
			left: 0;
			height: 100vh;
			z-index: 1002;
			width: 100vw; /* 移动端全屏 */
			max-width: none; /* 移除最大宽度限制 */
		}

		.sidebar-left.sidebar-open {
			transform: translateX(0);
		}

		.sidebar-left.sidebar-closed {
			transform: translateX(-100%);
			width: 100vw;
		}

		.sidebar-header,
		.sidebar-content {
			min-width: 100vw; /* 确保内容铺满屏幕 */
		}

		.main-content {
			width: 100%;
		}

		.workspace-title {
			font-size: 2rem;
		}

		.workspace-content {
			padding: 1rem;
		}

		.action-grid {
			grid-template-columns: 1fr;
		}

		.action-card {
			padding: 1rem;
		}

		.action-icon {
			width: 50px;
			height: 50px;
		}

		.action-icon i {
			font-size: 1.2rem;
		}

		.user-profile-container {
			padding: 0.75rem;
		}

		.user-avatar {
			width: 36px;
			height: 36px;
		}

		.user-name {
			font-size: 0.85rem;
		}

		.conversations-scrollable {
			/* 在移动端优化滚动性能 */
			-webkit-overflow-scrolling: touch;
		}
	}
	/* Custom scrollbar for conversations list */
	.conversations-scrollable::-webkit-scrollbar {
		width: 6px;
	}

	.conversations-scrollable::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}

	.conversations-scrollable::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3px;
	}

	.conversations-scrollable::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>

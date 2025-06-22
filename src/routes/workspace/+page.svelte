<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly, slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import Swal from 'sweetalert2';
	// import * as lodash from 'lodash';
	import { Button, Card, CardBody, Col, Input, Row, Table } from '@sveltestrap/sveltestrap';
	import StateSearch from '$lib/common/StateSearch.svelte';
	import TablePagination from '$lib/common/TablePagination.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import AgentSelectionModal from '$lib/common/AgentSelectionModal.svelte';
	import { getAgentOptions } from '$lib/services/agent-service';
	import {
		getConversations,
		deleteConversation,
		getConversationStateSearchKeys
	} from '$lib/services/conversation-service.js';
	import { utcToLocal } from '$lib/helpers/datetime';
	import { ConversationChannel } from '$lib/helpers/enums';

	const duration = 3000;
	const firstPage = 1;
	const pageSize = 15;
	let mounted = false;
	let showAgentModal = false;
	let showLeftSidebar = false; // 默认隐藏侧边栏
	let isLoading = false;
	let isComplete = false;
	let showStateSearch = false;

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

	/** @type {string[]} */
	let searchStateStrs = [];

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

	/** @type {{key: string, value: string | null}[]} */
	let states = [{ key: '', value: '' }];

	onMount(async () => {
		mounted = true;
		isLoading = true;
		Promise.all([loadAgentOptions(), loadSearchOption(), loadConversations()]).finally(() => {
			isLoading = false;
		});
	});

	function loadConversations() {
		return new Promise((resolve, reject) => {
			getPagedConversations()
				.then((res) => {
					resolve(res);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	async function getPagedConversations() {
		conversations = await getConversations(filter);
		refresh();
	}

	function loadAgentOptions() {
		return new Promise((resolve, reject) => {
			getAgentOptions()
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
		conversations = await getConversations({ ...filter });
		refreshPager(conversations.count);
	}

	/** @param {string} conversationId */
	function handleConversationDeletion(conversationId) {
		isLoading = true;
		deleteConversation(conversationId)
			.then(async () => {
				isLoading = false;
				isComplete = true;
				setTimeout(() => {
					isComplete = false;
				}, duration);
				await reloadConversations();
			})
			.catch((err) => {
				isLoading = false;
				isComplete = false;
			});
	}

	/** @param {string} conversationId */
	function openDeleteModal(conversationId) {
		// @ts-ignore
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			customClass: 'custom-modal',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.value) {
				handleConversationDeletion(conversationId);
			}
		});
	}
	/** @param {any} e */
	function searchConversations(e) {
		const searchStates = getSearchStates();
		handleSearchStates();
		filter = {
			...filter,
			agentId: searchOption.agentId,
			channel: searchOption.channel,
			status: searchOption.status,
			taskId: searchOption.taskId,
			states: searchStates,
			tags: searchOption.tags,
			pager: { ...filter.pager, page: firstPage }
		};
		getPagedConversations();
	}
	function getSearchStates() {
		searchOption.states =
			states
				?.filter((x) => !!x.key?.trim())
				?.map((x) => ({
					key: { data: x.key.trim(), isValid: true },
					value: { data: x.value?.trim() || '', isValid: true },
					active_rounds: { data: -1, isValid: true }
				})) || [];
		return searchOption.states.map((x) => ({ key: x.key.data, value: x.value.data }));
	}

	function handleSearchStates() {
		sortSearchStates();
		buldSearchStateString();
	}

	function sortSearchStates() {
		searchOption.states =
			searchOption.states
				?.map((x) => {
					if (!!x.key) x.key.data = x.key.data.trim();
					if (!!x.value) x.value.data = x.value.data.trim();
					return x;
				})
				?.sort((a, b) => {
					const stra = `${!!a.key?.data ? a.key.data : ''} ${!!a.value?.data ? b.value.data : ''}`;
					const strb = `${!!b.key?.data ? b.key.data : ''} ${!!b.value?.data ? b.value.data : ''}`;
					if (stra.length != strb.length) {
						return stra.length - strb.length;
					}
					const keya = a.key?.data?.toLowerCase() || '';
					const keyb = b.key?.data?.toLowerCase() || '';
					return keya < keyb ? -1 : keya == keyb ? 0 : 1;
				}) || [];
	}

	function buldSearchStateString() {
		searchStateStrs = searchOption.states.map((x) => {
			let s = '';
			if (x.key?.data?.length > 0) {
				s += x.key.data;
			}
			if (x.value?.data?.length > 0) {
				s += '=' + x.value.data;
			}
			return s;
		});
	}

	/** @param {string | number} index */
	function handleCloseLabel(index) {
		searchOption.states = searchOption.states.filter((x, idx) => idx != index);
		buldSearchStateString();
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

	/** @param {string} query */
	function handleStateSearch(query) {
		return new Promise((resolve) => {
			getConversationStateSearchKeys({
				query: query,
				keyLimit: 20,
				agentIds: searchOption.agentId ? [searchOption.agentId] : null
			})
				.then((res) => {
					resolve(res || []);
				})
				.catch(() => resolve([]));
		});
	}
	function startNewChat() {
		showAgentModal = true;
	}

	function openSessionsManager() {
		showLeftSidebar = true;
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
</script>

<LoadingToComplete {isLoading} {isComplete} successText={'Delete completed!'} />

<div class="workspace-layout">
	<!-- Left Sidebar for Conversations -->
	<div class="sidebar-left {showLeftSidebar ? 'sidebar-open' : 'sidebar-closed'}">
		<div class="sidebar-header">
			<div class="sidebar-title">
				<i class="fas fa-comments me-2"></i>
				{$_('Conversations')}
			</div>
			<div class="sidebar-actions">
				<Button size="sm" color="primary" on:click={startNewChat} title="Start New Chat">
					<i class="fas fa-plus"></i>
				</Button>
				<Button
					size="sm"
					color="secondary"
					on:click={toggleSidebar}
					title={showLeftSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
				>
					<i class="fas {showLeftSidebar ? 'fa-chevron-left' : 'fa-chevron-right'}"></i>
				</Button>
			</div>
		</div>
		{#if showLeftSidebar}
			<div class="sidebar-content">
				<!-- Search and Filter Section -->
				<div class="filter-section">
					<div class="filter-header">
						<span class="filter-title">
							<i class="fas fa-filter me-2"></i>
							{$_('Filters')}
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
							<!-- State Search -->
							<div class="filter-group">
								<div class="filter-label">
									<i class="fas fa-code me-1"></i>
									{$_('State Search')}
								</div>
								<StateSearch bind:states onSearch={(q) => handleStateSearch(q)} />
							</div>

							<!-- Agent Filter -->
							<div class="filter-group">
								<div class="filter-label">
									<i class="fas fa-robot me-1"></i>
									{$_('Agent')}
								</div>
								<select
									class="form-select form-select-sm modern-select"
									value={searchOption.agentId}
									on:change={(e) => changeOption(e, 'agent')}
								>
									<option value={null}>{$_('All Agents')}</option>
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
									{$_('Status')}
								</div>
								<select
									class="form-select form-select-sm modern-select"
									value={searchOption.status}
									on:change={(e) => changeOption(e, 'status')}
								>
									<option value={null}>{$_('All Status')}</option>
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
									{$_('Channel')}
								</div>
								<select
									class="form-select form-select-sm modern-select"
									value={searchOption.channel}
									on:change={(e) => changeOption(e, 'channel')}
								>
									<option value={null}>{$_('All Channels')}</option>
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
									{$_('Tag')}
								</div>
								<Input
									type="text"
									placeholder={$_('Enter tag...')}
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
									{$_('Apply Filters')}
								</Button>
							</div>
						</div>
					{/if}
				</div>
				<!-- Conversations List -->
				<div class="conversations-list">
					{#if conversations.items.length > 0}
						<div class="conversations-header">
							<span class="conversations-count">
								<i class="fas fa-list me-1"></i>
								{conversations.count}
								{$_('conversations')}
							</span>
						</div>
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
												window.open(`chat/${conv.agent_id}/${conv.id}`)}
											title="Open Chat"
										>
											<i class="fas fa-comments"></i>
										</button>
										<button
											class="action-btn delete-btn"
											on:click|stopPropagation={() => openDeleteModal(conv.id)}
											title="Delete"
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
												: 'secondary'}">{conv.status}</span
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
						<!-- Pagination -->
						{#if pager.count > pageSize}
							<div class="sidebar-pagination">
								<div class="pagination-wrapper">
									<div class="pagination-info">
										<span class="pagination-text">
											{$_('Page')}
											{pager.page}
											{$_('of')}
											{Math.ceil(pager.count / pager.size)}
										</span>
									</div>
									<TablePagination pagination={pager} pageTo={(pn) => pageTo(pn)} />
								</div>
							</div>
						{/if}
					{:else}
						<div class="empty-state">
							<div class="empty-icon">
								<i class="fas fa-comments"></i>
							</div>
							<h4 class="empty-title">{$_('No conversations found')}</h4>
							<p class="empty-description">
								{$_('Start a new conversation or adjust your filters')}
							</p>
							<Button color="primary" on:click={startNewChat} class="empty-action-btn">
								<i class="fas fa-plus me-2"></i>
								{$_('Start New Chat')}
							</Button>
						</div>
					{/if}
				</div>
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

						<div class="action-card disabled">
							<div class="action-icon">
								<i class="fas fa-robot"></i>
							</div>
							<div class="action-content">
								<h3>{$_('workspace.actions.agent_management.title')}</h3>
								<p>{$_('workspace.actions.agent_management.description')}</p>
								<span class="coming-soon">{$_('workspace.coming_soon')}</span>
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

<style>
	.workspace-layout {
		display: flex;
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	/* Left Sidebar Styles */
	.sidebar-left {
		width: 320px;
		background: white;
		border-right: 1px solid #e9ecef;
		display: flex;
		flex-direction: column;
		transition: all 0.3s ease;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
	}

	.sidebar-left.sidebar-closed {
		width: 50px;
	}

	.sidebar-header {
		padding: 1rem;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.sidebar-title {
		font-weight: 600;
		font-size: 1rem;
		white-space: nowrap;
		overflow: hidden;
	}

	.sidebar-closed .sidebar-title {
		display: none;
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

	.filter-toggle-btn {
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

	.modern-select,
	.modern-input {
		border-radius: 8px;
		border: 1px solid #dee2e6;
		transition: all 0.2s ease;
	}

	.modern-select:focus,
	.modern-input:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.filter-actions {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #dee2e6;
	}

	.apply-filter-btn {
		border-radius: 8px;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.5px;
		padding: 0.5rem 1rem;
	}
	.conversations-list {
		flex: 1;
		overflow-y: auto;
		padding: 0;
	}

	.conversations-header {
		padding: 0.75rem 1rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.conversations-count {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
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

	.empty-action-btn {
		border-radius: 8px;
		font-weight: 600;
		padding: 0.75rem 1.5rem;
	}
	.sidebar-pagination {
		padding: 1rem;
		border-top: 1px solid #e9ecef;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		position: sticky;
		bottom: 0;
	}

	.pagination-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.pagination-info {
		text-align: center;
	}

	.pagination-text {
		font-size: 0.75rem;
		color: #6c757d;
		font-weight: 500;
	}

	/* Main Content Styles */
	.main-content {
		flex: 1;
		overflow-y: auto;
		transition: all 0.3s ease;
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
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.sidebar-left {
			width: 280px;
		}
	}

	@media (max-width: 768px) {
		.workspace-layout {
			flex-direction: column;
		}

		.sidebar-left {
			width: 100%;
			height: auto;
			max-height: 40vh;
		}

		.sidebar-left.sidebar-closed {
			height: 60px;
			width: 100%;
		}

		.main-content {
			flex: 1;
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
	}

	/* Custom scrollbar for conversations list */
	.conversations-list::-webkit-scrollbar {
		width: 6px;
	}

	.conversations-list::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}

	.conversations-list::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3px;
	}

	.conversations-list::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>

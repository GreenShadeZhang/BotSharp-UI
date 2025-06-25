<script>
	import { createEventDispatcher } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';
	import AgentCard from './AgentCard.svelte';
	import AgentGroupCard from './AgentGroupCard.svelte';

	const dispatch = createEventDispatcher();

	/** @type {Array<import('$agentTypes').AgentModel>} */
	export let agents = [];

	/** @type {number} */
	export let totalCount = 0;

	/** @type {boolean} */
	export let isLoading = false;

	/** @type {boolean} */
	export let isLoadingMore = false;

	/** @type {boolean} */
	export let hasMoreData = true;

	/** @type {boolean} */
	export let showBackToTop = false;

	/** @type {number} */
	export let pageSize = 12;

	/**
	 * @param {Event} event
	 */
	function handleScroll(event) {
		const container = /** @type {HTMLElement} */ (event.target);
		if (!container) return;
		
		const scrollTop = container.scrollTop;
		const scrollHeight = container.scrollHeight;
		const clientHeight = container.clientHeight;
		
		// 通知父组件更新返回顶部按钮状态
		dispatch('scroll', {
			showBackToTop: scrollTop > 300,
			shouldLoadMore: scrollHeight - scrollTop - clientHeight < 50 && hasMoreData && !isLoadingMore
		});
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
	function handleDeleteAgent(event) {
		dispatch('delete', event.detail);
	}
</script>

{#if isLoading && agents.length === 0}
	<!-- 初始加载指示器 -->
	<div class="agents-loading">
		<div class="loading-spinner-large"></div>
		<p class="loading-text">{$_('workspace.agents.list.loading')}</p>
	</div>
{:else if agents && agents.length > 0}
	<!-- 智能体数量显示 -->
	<div class="agents-header-info">
		<div class="agents-count">
			<i class="fas fa-robot me-2"></i>
			<span class="count-number">{totalCount}</span>
			<span class="count-text">{$_('workspace.agents.list.agents_count')}</span>
		</div>
	</div>
	
	<div 
		class="agents-grid" 
		class:scrollable={totalCount > pageSize}
		on:scroll={handleScroll}
	>
		{#each agents as agent, index (agent.id)}
			<div 
				class="agent-item"
				in:fly={{ y: 20, duration: 300, delay: Math.min(index * 30, 300) }}
			>
				{#if agent.is_router}
					<AgentGroupCard {agent} allAgents={agents} on:delete={handleDeleteAgent} />
				{:else}
					<AgentCard {agent} on:delete={handleDeleteAgent} />
				{/if}
			</div>
		{/each}
		
		<!-- 加载更多指示器 -->
		{#if isLoadingMore}
			<div class="loading-more-indicator" in:fly={{ y: 20, duration: 300 }}>
				<div class="loading-spinner"></div>
				<span>{$_('workspace.agents.list.loading_more')}</span>
			</div>
		{/if}
		
		<!-- 没有更多数据提示 -->
		{#if !hasMoreData && agents.length > pageSize}
			<div class="no-more-data" in:fly={{ y: 20, duration: 300 }}>
				<i class="fas fa-check-circle"></i>
				<span>{$_('workspace.agents.list.all_loaded')}</span>
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
			<span>{$_('common.back_to_top')}</span>
		</button>
	{/if}
{:else}
	<div class="empty-state">
		<div class="empty-content">
			<div class="empty-icon">
				<i class="fas fa-robot"></i>
			</div>
			<h3 class="empty-title">
				<slot name="empty-title">{$_('workspace.agents.list.no_agents')}</slot>
			</h3>
			<p class="empty-description">
				<slot name="empty-description">{$_('workspace.agents.list.no_agents_description')}</slot>
			</p>
			<slot name="empty-action"></slot>
		</div>
	</div>
{/if}

<style>
	/* 智能体数量显示样式 */
	.agents-header-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.agents-count {
		display: flex;
		align-items: center;
		font-weight: 600;
	}

	.count-number {
		font-size: 1.25rem;
		font-weight: 700;
		margin-right: 0.25rem;
	}

	.count-text {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	/* 加载指示器样式 */
	.agents-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.loading-spinner-large {
		width: 48px;
		height: 48px;
		border: 4px solid #e5e7eb;
		border-left-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	.loading-text {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.agents-grid.scrollable {
		flex: 1;
		max-height: calc(100vh - 400px);
		overflow-y: auto;
		scroll-behavior: smooth;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		position: relative;
		margin-bottom: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		align-content: start;
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

	/* 智能体数量显示样式 */
	.agents-header-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.agents-count {
		display: flex;
		align-items: center;
		font-weight: 600;
	}

	.count-number {
		font-size: 1.25rem;
		font-weight: 700;
		margin-right: 0.25rem;
	}

	.count-text {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	/* 加载指示器样式 */
	.agents-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

	/* 动画增强 */
	:global(.agent-card) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.agent-card:hover) {
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}
</style>

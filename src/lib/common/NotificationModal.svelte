<script>
	import { createEventDispatcher } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { Modal, ModalBody, ModalHeader, Button, Badge } from '@sveltestrap/sveltestrap';
	import { notificationStore, notificationService } from '$lib/services/notification-service.js';
	import "overlayscrollbars/overlayscrollbars.css";
	import { OverlayScrollbars } from "overlayscrollbars";
	import { onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	/** @type {boolean} */
	export let isOpen = false;

	/** @type {import('$lib/services/notification-service.js').NotificationState} */
	let notificationState = { items: [], unreadCount: 0 };

	/** @type {string} */
	let filterType = 'all'; // all, unread, read

	/** @type {string} */
	let sortBy = 'newest'; // newest, oldest

	/** @type {import('$lib/services/notification-service.js').NotificationItem[]} */
	let filteredNotifications = [];

	/** @type {import('svelte/store').Unsubscriber} */
	let unsubscriber;

	const scrollbarOptions = {
		scrollbars: {
			visibility: "auto",
			autoHide: "move",
			autoHideDelay: 100,
			dragScroll: true,
			clickScroll: false,
			theme: "os-theme-light",
			pointers: ["mouse", "touch", "pen"],
		},
	};

	onMount(() => {
		// 订阅通知状态
		unsubscriber = notificationStore.subscribe(state => {
			notificationState = state;
			updateFilteredNotifications();
		});

		return () => {
			if (unsubscriber) {
				unsubscriber();
			}
		};
	});
	$: if (isOpen) {
		setTimeout(() => {
			const modalElement = document.querySelector("#modal-notification-list");
			if (modalElement) {
				// @ts-ignore
				OverlayScrollbars(modalElement, scrollbarOptions);
			}
		}, 100);
	}

	/**
	 * 更新过滤后的通知列表
	 */
	function updateFilteredNotifications() {
		let filtered = [...notificationState.items];

		// 按类型过滤
		if (filterType === 'unread') {
			filtered = filtered.filter(item => !item.read);
		} else if (filterType === 'read') {
			filtered = filtered.filter(item => item.read);
		}

		// 排序
		filtered.sort((a, b) => {
			const timeA = new Date(a.timestamp).getTime();
			const timeB = new Date(b.timestamp).getTime();
			return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
		});

		filteredNotifications = filtered;
	}

	/**
	 * 处理通知点击
	 * @param {import('$lib/services/notification-service.js').NotificationItem} notification
	 */
	function handleNotificationClick(notification) {
		// 标记为已读
		notificationService.markAsRead(notification.id);
		
		// 如果有关联的会话，跳转到对应页面
		if (notification.conversationId && notification.agentId) {
			// 关闭模态框
			toggle();
			// 跳转到对应页面
			window.location.href = `/chat/${notification.agentId}/${notification.conversationId}`;
		}
	}

	/**
	 * 删除通知
	 * @param {import('$lib/services/notification-service.js').NotificationItem} notification
	 * @param {Event} event
	 */
	function deleteNotification(notification, event) {
		event.stopPropagation();
		notificationService.remove(notification.id);
	}

	/**
	 * 标记所有为已读
	 */
	function markAllAsRead() {
		notificationService.markAllAsRead();
	}
	/**
	 * 清空所有通知
	 */
	function clearAllNotifications() {
		// 使用更好的确认对话框
		const confirmed = confirm($_('Are you sure you want to clear all notifications? This action cannot be undone.') || '确定要清空所有通知吗？此操作无法撤销。');
		if (confirmed) {
			notificationService.clear();
		}
	}

	/**
	 * 处理过滤器变化
	 * @param {string} type
	 */
	function handleFilterChange(type) {
		filterType = type;
		updateFilteredNotifications();
	}

	/**
	 * 处理排序变化
	 * @param {string} sort
	 */
	function handleSortChange(sort) {
		sortBy = sort;
		updateFilteredNotifications();
	}

	/**
	 * 切换模态框
	 */
	function toggle() {
		isOpen = !isOpen;
		dispatch('toggle', isOpen);
	}

	$: updateFilteredNotifications(), filterType, sortBy;
</script>

<Modal {isOpen} {toggle} size="lg" centered>	<ModalHeader {toggle}>
		<div class="modal-title-container">
			<i class="bx bx-bell me-2 text-primary modal-title-icon"></i>
			<span class="modal-title-text">{$_('Notifications')}</span>
			{#if notificationState.unreadCount > 0}
				<Badge color="danger" class="ms-2 modal-title-badge">
					{notificationState.unreadCount}
				</Badge>
			{/if}
		</div>
	</ModalHeader>
	<ModalBody class="p-0">
		<!-- 操作栏 -->
		<div class="notification-modal-header p-3 bg-light border-bottom">
			<div class="d-flex justify-content-between align-items-center mb-3">
				<div class="d-flex gap-2">
					{#if notificationState.unreadCount > 0}
						<Button color="outline-primary" size="sm" on:click={markAllAsRead}>
							<i class="bx bx-check-double me-1"></i>
							{$_('Mark all read')}
						</Button>
					{/if}
					{#if notificationState.items.length > 0}
						<Button color="outline-danger" size="sm" on:click={clearAllNotifications}>
							<i class="bx bx-trash me-1"></i>
							{$_('Clear all')}
						</Button>
					{/if}
				</div>
			</div>			<!-- 过滤和排序控件 -->
			<div class="filter-sort-container">
				<div class="filter-buttons">
					<Button 
						color={filterType === 'all' ? 'primary' : 'outline-primary'} 
						size="sm"
						on:click={() => handleFilterChange('all')}
						class="filter-btn"
					>
						全部 ({notificationState.items.length})
					</Button>
					<Button 
						color={filterType === 'unread' ? 'primary' : 'outline-primary'} 
						size="sm"
						on:click={() => handleFilterChange('unread')}
						class="filter-btn"
					>
						未读 ({notificationState.unreadCount})
					</Button>
					<Button 
						color={filterType === 'read' ? 'primary' : 'outline-primary'} 
						size="sm"
						on:click={() => handleFilterChange('read')}
						class="filter-btn"
					>
						已读 ({notificationState.items.length - notificationState.unreadCount})
					</Button>
				</div>
				<div class="sort-buttons">
					<Button 
						color={sortBy === 'newest' ? 'success' : 'outline-success'} 
						size="sm"
						on:click={() => handleSortChange('newest')}
						class="sort-btn"
					>
						<i class="bx bx-sort-down me-1"></i>
						最新优先
					</Button>
					<Button 
						color={sortBy === 'oldest' ? 'success' : 'outline-success'} 
						size="sm"
						on:click={() => handleSortChange('oldest')}
						class="sort-btn"
					>
						<i class="bx bx-sort-up me-1"></i>
						最旧优先
					</Button>
				</div>
			</div>
		</div>
		<!-- 通知列表 -->
		<div class="notification-modal-list" id="modal-notification-list" style="max-height: 500px; overflow-y: auto;">
			{#if filteredNotifications.length === 0}
				<div class="empty-notifications-modal">
					<div class="empty-content-modal">
						<i class="bx bx-bell-off"></i>
						<h5>
							{#if filterType === 'unread'}
								{$_('No unread notifications')}
							{:else if filterType === 'read'}
								{$_('No read notifications')}
							{:else}
								{$_('No notifications')}
							{/if}
						</h5>
						<p>
							{#if filterType === 'unread'}
								您没有未读通知
							{:else if filterType === 'read'}
								您没有已读通知
							{:else}
								您还没有收到任何通知
							{/if}
						</p>
					</div>
				</div>
			{:else}
				<div class="notification-list p-2">
					{#each filteredNotifications as notification (notification.id)}						<div 
							class="notification-modal-item {notification.read ? 'read' : 'unread'}" 
							on:click={() => handleNotificationClick(notification)}
							on:keydown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
							role="button"
							tabindex="0"
						>
							<div class="d-flex">
								<div class="notification-icon me-3">
									<span class="avatar-title bg-{notificationService.getTypeColor(notification.type)} rounded-circle">
										<i class="{notification.icon}"></i>
									</span>
								</div>
								<div class="flex-grow-1">
									<div class="d-flex justify-content-between align-items-start mb-1">
										<h6 class="notification-title mb-0">
											{notification.title}
											{#if !notification.read}
												<span class="unread-dot ms-2"></span>
											{/if}
										</h6>
										<div class="d-flex align-items-center gap-2">
											<small class="text-muted">
												{notificationService.formatTime(notification.timestamp)}
											</small>
											<button 
												class="btn btn-sm btn-outline-danger notification-delete"
												on:click={(e) => deleteNotification(notification, e)}
												title="{$_('Delete notification')}"
											>
												<i class="bx bx-x font-size-12"></i>
											</button>
										</div>
									</div>
									<p class="notification-message text-muted mb-0">
										{notification.message}
									</p>
									{#if notification.type}
										<div class="mt-2">
											<Badge color="{notificationService.getTypeColor(notification.type)}" class="badge-soft">
												{notification.type}
											</Badge>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</ModalBody>
</Modal>

<style>	.notification-modal-header {
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	/* 过滤和排序控件布局 */
	.filter-sort-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.filter-buttons,
	.sort-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	/* 确保按钮在切换时保持一致的尺寸和对齐 */
	:global(.filter-btn),
	:global(.sort-btn) {
		min-width: auto !important;
		white-space: nowrap !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		text-align: center !important;
		transition: all 0.2s ease !important;
	}
	/* 确保图标和文本在按钮中居中 */
	:global(.sort-btn i) {
		display: inline-flex !important;
		align-items: center !important;
		vertical-align: middle !important;
	}

	/* 模态框标题样式 */
	.modal-title-container {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
	}

	.modal-title-icon {
		font-size: 1.25rem;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.modal-title-text {
		font-size: 1.1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		line-height: 1;
	}

	:global(.modal-title-badge) {
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		min-width: 24px !important;
		height: 20px !important;
		font-size: 0.75rem !important;
		line-height: 1 !important;
		border-radius: 10px !important;
	}

	.notification-modal-list {
		background: #f8f9fa;
	}

	.notification-modal-item {
		padding: 1.25rem;
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		margin-bottom: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		background: #fff;
	}

	.notification-modal-item:hover {
		border-color: rgba(102, 126, 234, 0.3);
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
		transform: translateY(-2px);
	}

	.notification-modal-item.unread {
		background-color: rgba(102, 126, 234, 0.02);
		border-left: 4px solid #667eea;
	}

	.notification-modal-item.read {
		opacity: 0.8;
	}

	.notification-icon .avatar-title {
		width: 45px;
		height: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
	}

	.notification-title {
		font-weight: 600;
		color: #2d3748;
		font-size: 1rem;
	}
	.notification-message {
		font-size: 0.9rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.unread-dot {
		width: 8px;
		height: 8px;
		background-color: #f56565;
		border-radius: 50%;
		display: inline-block;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.7);
		}
		70% {
			transform: scale(1);
			box-shadow: 0 0 0 4px rgba(245, 101, 101, 0);
		}
		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(245, 101, 101, 0);
		}
	}

	.notification-delete {
		opacity: 0;
		transition: opacity 0.2s ease;
		border: none !important;
		padding: 0.25rem 0.5rem !important;
	}

	.notification-modal-item:hover .notification-delete {
		opacity: 1;
	}

	:global(.badge-soft) {
		background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
		color: var(--bs-primary) !important;
		border: 1px solid rgba(var(--bs-primary-rgb), 0.2) !important;
	}

	/* 滚动条样式 */
	:global(#modal-notification-list .os-scrollbar) {
		width: 6px !important;
	}

	:global(#modal-notification-list .os-scrollbar-track) {
		background: rgba(0, 0, 0, 0.05) !important;
	}

	:global(#modal-notification-list .os-scrollbar-handle) {
		background: rgba(102, 126, 234, 0.3) !important;
		border-radius: 3px !important;
	}

	:global(#modal-notification-list .os-scrollbar-handle:hover) {
		background: rgba(102, 126, 234, 0.5) !important;
	}
	@media (max-width: 768px) {
		.notification-modal-item {
			padding: 1rem;
		}

		.filter-sort-container {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.filter-buttons,
		.sort-buttons {
			justify-content: center;
			flex-wrap: wrap;
		}

		/* 确保小屏幕下按钮文本不会被截断 */
		:global(.filter-btn),
		:global(.sort-btn) {
			font-size: 0.8rem !important;
			padding: 0.375rem 0.75rem !important;
		}
	}
	/* 模态框空状态样式 */
	.empty-notifications-modal {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		padding: 3rem 2rem;
		width: 100%;
	}

	.empty-content-modal {
		text-align: center;
		color: #a0aec0;
		max-width: 300px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-content-modal i {
		font-size: 4rem;
		color: #cbd5e0;
		margin-bottom: 1.5rem;
		display: block;
		opacity: 0.7;
		line-height: 1;
	}

	.empty-content-modal h5 {
		margin-bottom: 1rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: #4a5568;
		text-align: center;
		width: 100%;
	}

	.empty-content-modal p {
		margin: 0;
		font-size: 0.95rem;
		color: #718096;
		line-height: 1.5;
		text-align: center;
		width: 100%;
	}
</style>

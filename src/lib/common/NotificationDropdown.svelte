<script lang="ts">
	import Link from 'svelte-link/src/Link.svelte';
	import { Dropdown, DropdownToggle, DropdownMenu } from '@sveltestrap/sveltestrap';
	import "overlayscrollbars/overlayscrollbars.css";
	import { OverlayScrollbars } from "overlayscrollbars";
	import { _ } from 'svelte-i18n';
	import { onMount, onDestroy } from 'svelte';
	import { notificationStore, notificationService } from '$lib/services/notification-service.js';

	const options = {
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

	/** @type {import('svelte/store').Unsubscriber} */
	let unsubscriber;
	
	/** @type {import('$lib/services/notification-service.js').NotificationState} */
	let notificationState = { items: [], unreadCount: 0 };

	/** @type {boolean} */
	let isOpen = false;

	onMount(() => {
		const menuElement = document.querySelector("#notification");
		if (menuElement) {
			OverlayScrollbars(menuElement, options);
		}

		// 订阅通知状态
		unsubscriber = notificationStore.subscribe(state => {
			notificationState = state;
		});

		// 请求浏览器通知权限
		notificationService.requestPermission();
	});

	onDestroy(() => {
		if (unsubscriber) {
			unsubscriber();
		}
	});

	/**
	 * 处理通知点击
	 * @param {import('$lib/services/notification-service.js').NotificationItem} notification
	 */
	function handleNotificationClick(notification) {
		// 标记为已读
		notificationService.markAsRead(notification.id);
		
		// 如果有关联的会话，跳转到对应页面
		if (notification.conversationId && notification.agentId) {
			window.location.href = `/chat/${notification.agentId}/${notification.conversationId}`;
		}
		
		// 关闭下拉菜单
		isOpen = false;
	}

	/**
	 * 标记所有为已读
	 */
	function markAllAsRead() {
		notificationService.markAllAsRead();
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
	 * 清空所有通知
	 */
	function clearAllNotifications() {
		notificationService.clear();
	}

	/**
	 * 切换下拉菜单
	 */
	function toggleDropdown() {
		isOpen = !isOpen;
	}
</script>

<Dropdown class="d-none d-lg-inline-block" {isOpen} toggle={toggleDropdown}>
	<DropdownToggle type="button" color="" tag="a" class="btn header-item noti-icon waves-effect">
		<i class="bx bx-bell bx-tada" />
		{#if notificationState.unreadCount > 0}
			<span class="badge bg-danger rounded-pill">
				{notificationState.unreadCount > 99 ? '99+' : notificationState.unreadCount}
			</span>
		{/if}
	</DropdownToggle>
	<DropdownMenu class="dropdown-menu-lg" end>
		<div class="p-3">
			<div class="row align-items-center">
				<div class="col">
					<h6 class="m-0">
						{$_('Notifications')} 
						{#if notificationState.unreadCount > 0}
							<span class="badge bg-soft-danger text-danger ms-1">{notificationState.unreadCount}</span>
						{/if}
					</h6>
				</div>
				<div class="col-auto">
					{#if notificationState.items.length > 0}
						<div class="d-flex gap-2">
							{#if notificationState.unreadCount > 0}
								<Link class="small text-decoration-underline" on:click={markAllAsRead}>
									{$_('Mark all read')}
								</Link>
							{/if}
							<Link class="small text-muted" on:click={clearAllNotifications}>
								{$_('Clear all')}
							</Link>
						</div>
					{:else}
						<Link class="small" disabled>{$_('View All')}</Link>
					{/if}
				</div>
			</div>
		</div>
		
		<div style="max-height: 350px;" id="notification">
			{#if notificationState.items.length === 0}
				<div class="text-center py-4">
					<div class="text-muted">
						<i class="bx bx-bell-off font-size-24 d-block mb-2"></i>
						<p class="mb-0">{$_('No notifications')}</p>
					</div>
				</div>
			{:else}
				{#each notificationState.items as notification (notification.id)}
					<div 
						class="notification-item {notification.read ? 'read' : 'unread'}" 
						on:click={() => handleNotificationClick(notification)}
						role="button"
						tabindex="0"
					>
						<div class="d-flex">
							<div class="avatar-xs me-3">
								<span class="avatar-title bg-{notificationService.getTypeColor(notification.type)} rounded-circle font-size-16">
									<i class="{notification.icon}" />
								</span>
							</div>
							<div class="flex-grow-1">
								<h6 class="mb-1 notification-title">
									{notification.title}
									{#if !notification.read}
										<span class="unread-dot"></span>
									{/if}
								</h6>
								<div class="font-size-12 text-muted">
									<p class="mb-1 notification-message">{notification.message}</p>
									<p class="mb-0 d-flex justify-content-between align-items-center">
										<span>
											<i class="mdi mdi-clock-outline" /> 
											<span>{notificationService.formatTime(notification.timestamp)}</span>
										</span>
										<button 
											class="btn btn-sm btn-outline-danger notification-delete"
											on:click={(e) => deleteNotification(notification, e)}
											title="{$_('Delete notification')}"
										>
											<i class="bx bx-x font-size-12"></i>
										</button>
									</p>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
		
		{#if notificationState.items.length > 0}
			<div class="p-2 border-top d-grid">				<Link class="btn btn-sm btn-link text-center" href="/notifications">
					<i class="mdi mdi-arrow-right-circle me-1"></i>
					{$_('View all notifications')}
				</Link>
			</div>
		{/if}
	</DropdownMenu>
</Dropdown>

<style>	/* 通知下拉菜单样式 */
	:global(.dropdown-menu-lg) {
		min-width: 380px !important;
		max-width: 420px !important;
		border: none !important;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
		border-radius: 12px !important;
		overflow: hidden !important;
		padding: 0 !important;
		background: #fff !important;
	}

	/* 头部区域 */
	:global(.dropdown-menu-lg .p-3) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		margin: 0;
	}

	:global(.dropdown-menu-lg .p-3 h6) {
		color: white !important;
		font-weight: 600;
	}

	:global(.dropdown-menu-lg .p-3 .badge) {
		background: rgba(255, 255, 255, 0.2) !important;
		color: white !important;
	}

	:global(.dropdown-menu-lg .p-3 a) {
		color: rgba(255, 255, 255, 0.9) !important;
		text-decoration: none !important;
	}

	:global(.dropdown-menu-lg .p-3 a:hover) {
		color: white !important;
		text-decoration: underline !important;
	}

	/* 通知项样式 */
	.notification-item {
		padding: 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		display: block;
		text-decoration: none;
		color: inherit;
		background: #fff;
	}

	.notification-item:hover {
		background-color: rgba(102, 126, 234, 0.04);
		text-decoration: none;
		color: inherit;
		transform: translateX(2px);
	}

	.notification-item.unread {
		background-color: rgba(102, 126, 234, 0.02);
		border-left: 3px solid #667eea;
	}

	.notification-item.read {
		opacity: 0.85;
	}

	.notification-item:last-child {
		border-bottom: none;
	}

	/* 通知标题 */
	.notification-title {
		font-weight: 600;
		font-size: 0.875rem;
		color: #2d3748;
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	/* 未读标记点 */
	.unread-dot {
		width: 6px;
		height: 6px;
		background-color: #f56565;
		border-radius: 50%;
		display: inline-block;
		animation: pulse 2s infinite;
		flex-shrink: 0;
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

	/* 通知消息 */
	.notification-message {
		color: #718096;
		font-size: 0.8rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 0;
	}

	/* 删除按钮 */
	.notification-delete {
		opacity: 0;
		transition: all 0.2s ease;
		border: none !important;
		padding: 0.25rem 0.5rem !important;
		font-size: 0.75rem !important;
		background: rgba(245, 101, 101, 0.1) !important;
		color: #f56565 !important;
		border-radius: 4px !important;
	}

	.notification-delete:hover {
		background: rgba(245, 101, 101, 0.2) !important;
		color: #e53e3e !important;
	}

	.notification-item:hover .notification-delete {
		opacity: 1;
	}

	/* 空状态样式 */
	.text-center .bx-bell-off {
		color: #cbd5e0;
	}

	/* 徽章样式优化 */
	:global(.badge.bg-danger) {
		background-color: #f56565 !important;
		font-size: 0.7rem;
		min-width: 18px;
		height: 18px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: -8px;
		right: -8px;
		animation: bounce 2s infinite;
		font-weight: 600;
	}

	@keyframes bounce {
		0%, 20%, 53%, 80%, 100% {
			transform: translate3d(0, 0, 0);
		}
		40%, 43% {
			transform: translate3d(0, -8px, 0);
		}
		70% {
			transform: translate3d(0, -4px, 0);
		}
		90% {
			transform: translate3d(0, -2px, 0);
		}
	}

	/* 头部通知图标 */
	:global(.noti-icon) {
		position: relative;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex !important;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(.noti-icon:hover) {
		background-color: rgba(102, 126, 234, 0.1) !important;
		border-color: rgba(102, 126, 234, 0.2) !important;
		transform: scale(1.05);
	}

	:global(.noti-icon .bx-bell) {
		font-size: 1.25rem;
		color: #4a5568;
	}

	/* 软背景色 */
	:global(.bg-soft-danger) {
		background-color: rgba(245, 101, 101, 0.1) !important;
	}

	/* 底部链接区域 */
	:global(.dropdown-menu-lg .border-top) {
		background: #f8f9fa;
		border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
	}

	:global(.dropdown-menu-lg .border-top .btn-link) {
		color: #667eea !important;
		text-decoration: none !important;
		font-weight: 500 !important;
		padding: 0.75rem !important;
	}

	:global(.dropdown-menu-lg .border-top .btn-link:hover) {
		color: #764ba2 !important;
		background: rgba(102, 126, 234, 0.05) !important;
	}

	/* 滚动条样式 */
	:global(#notification .os-scrollbar) {
		width: 4px !important;
	}

	:global(#notification .os-scrollbar-track) {
		background: rgba(0, 0, 0, 0.05) !important;
	}

	:global(#notification .os-scrollbar-handle) {
		background: rgba(102, 126, 234, 0.3) !important;
		border-radius: 2px !important;
	}

	:global(#notification .os-scrollbar-handle:hover) {
		background: rgba(102, 126, 234, 0.5) !important;
	}

	/* 头部操作按钮 */
	:global(.dropdown-menu-lg .d-flex.gap-2 a) {
		font-size: 0.8rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.2);
		transition: all 0.2s ease;
	}

	:global(.dropdown-menu-lg .d-flex.gap-2 a:hover) {
		background: rgba(255, 255, 255, 0.3);
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		:global(.dropdown-menu-lg) {
			min-width: 320px !important;
			max-width: 350px !important;
			left: -200px !important;
		}
		
		.notification-item {
			padding: 0.75rem;
		}

		.notification-title {
			font-size: 0.8rem;
		}

		.notification-message {
			font-size: 0.75rem;
		}
	}
</style>

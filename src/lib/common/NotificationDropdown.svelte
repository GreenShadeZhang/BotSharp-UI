<script>
	import { Dropdown, DropdownToggle, DropdownMenu } from '@sveltestrap/sveltestrap';
	import { _ } from 'svelte-i18n';
	import { onMount, onDestroy } from 'svelte';
	import { notificationStore, notificationService } from '$lib/services/notification-service.js';
	import NotificationModal from './NotificationModal.svelte';
	let unsubscriber = null;

	// 使用reactive statements来订阅notificationStore
	$: notificationState = $notificationStore || { items: [], unreadCount: 0 };

	/** @type {boolean} */
	let isOpen = false;

	/** @type {boolean} */
	let isModalOpen = false;

	onMount(() => {
		// 请求浏览器通知权限
		notificationService.requestPermission();
	});
	onDestroy(() => {
		// 清理工作已通过reactive statements自动处理
	}); /**
	 * 处理通知点击
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
	} /**
	 * 删除通知
	 */
	function deleteNotification(notification, event) {
		event.stopPropagation();
		notificationService.remove(notification.id);
	}
	/**
	 * 清空所有通知
	 */
	function clearAllNotifications() {
		const confirmed = confirm(
			$_('Are you sure you want to clear all notifications? This action cannot be undone.') ||
				'确定要清空所有通知吗？此操作无法撤销。'
		);
		if (confirmed) {
			notificationService.clear();
		}
	}

	/**
	 * 切换下拉菜单
	 */
	function toggleDropdown() {
		isOpen = !isOpen;
	}

	/**
	 * 打开查看全部通知的模态框
	 */
	function openViewAllModal() {
		isOpen = false; // 关闭下拉菜单
		isModalOpen = true; // 打开模态框
	} /**
	 * 处理模态框切换
	 */
	function handleModalToggle(event) {
		isModalOpen = event.detail;
	}
</script>

<Dropdown class="d-none d-lg-inline-block" {isOpen} toggle={toggleDropdown}>	<DropdownToggle type="button" color="" tag="a" class="btn header-item noti-icon waves-effect">
		<i class="bx bx-bell {notificationState.unreadCount > 0 ? 'bx-tada' : ''}" />
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
							<span class="badge bg-soft-danger text-danger ms-1"
								>{notificationState.unreadCount}</span
							>
						{/if}
					</h6>
				</div>
				<div class="col-auto">
					<div class="d-flex gap-2">
						{#if notificationState.items.length > 0}
							{#if notificationState.unreadCount > 0}
								<button
									type="button"
									class="btn btn-link small text-decoration-underline p-0 header-action-btn"
									on:click={markAllAsRead}
								>
									{$_('Mark all read')}
								</button>
							{/if}
							<button
								type="button"
								class="btn btn-link small text-muted p-0 header-action-btn"
								on:click={clearAllNotifications}
							>
								{$_('Clear all')}
							</button>
						{:else}
							<span class="small text-muted">
								{$_('No notifications')}
							</span>
						{/if}
					</div>
				</div>
			</div>		</div>
		<div class="notification-scrollable-container">
			{#if notificationState.items.length === 0}
				<div class="empty-notifications">
					<div class="empty-content">
						<i class="bx bx-bell-off"></i>
						<p>{$_('No notifications')}</p>
					</div>
				</div>
			{:else}
				{#each notificationState.items as notification (notification.id)}
					<div
						class="notification-item {notification.read ? 'read' : 'unread'}"
						on:click={() => handleNotificationClick(notification)}
						on:keydown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
						role="button"
						tabindex="0"
					>
						<div class="d-flex align-items-start">
							<div class="avatar-xs me-3">
								<span
									class="avatar-title bg-{notificationService.getTypeColor(
										notification.type
									)} rounded-circle"
								>
									<i class={notification.icon} />
								</span>
							</div>
							<div class="notification-content flex-grow-1">
								<div class="text-truncate">
									{notification.title}
									{#if !notification.read}
										<span class="unread-dot"></span>
									{/if}
								</div>
								<div class="small mb-2">
									{notification.message}
								</div>
								<div class="d-flex justify-content-between align-items-center">
									<span class="text-muted">
										<i class="mdi mdi-clock-outline me-1" />
										{notificationService.formatTime(notification.timestamp)}
									</span>
									<button
										class="btn btn-sm btn-outline-danger notification-delete"
										on:click={(e) => deleteNotification(notification, e)}
										title={$_('Delete notification')}
									>
										<i class="bx bx-x"></i>
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		{#if notificationState.items.length > 0}
			<div class="p-2 border-top d-grid">
				<button class="btn btn-sm btn-link text-center" on:click={openViewAllModal} type="button">
					<i class="mdi mdi-arrow-right-circle me-1"></i>
					{$_('View all notifications')}
				</button>
			</div>
		{/if}
	</DropdownMenu>
</Dropdown>

<!-- 通知模态框 -->
<NotificationModal bind:isOpen={isModalOpen} on:toggle={handleModalToggle} />

<style>
	/* 通知下拉菜单样式 - 增大尺寸 */
	:global(.dropdown-menu-lg) {
		min-width: 420px !important;
		max-width: 480px !important;
		border: none !important;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
		border-radius: 12px !important;
		overflow: hidden !important;
		padding: 0 !important;
		background: #fff !important;
		max-height: 70vh !important;
	}

	/* 头部区域 */
	:global(.dropdown-menu-lg .p-3) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		margin: 0;
		padding: 1.25rem !important;
	}

	:global(.dropdown-menu-lg .p-3 h6) {
		color: white !important;
		font-weight: 600;
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.4;
	}

	:global(.dropdown-menu-lg .p-3 .badge) {
		background: rgba(255, 255, 255, 0.2) !important;
		color: white !important;
		font-size: 0.8rem;
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		font-weight: 600;
	}

	:global(.dropdown-menu-lg .p-3 a) {
		color: rgba(255, 255, 255, 0.9) !important;
		text-decoration: none !important;
		font-size: 0.85rem;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		margin: -0.3rem -0.6rem;
		display: inline-block;
		transition: all 0.2s ease;
	}

	:global(.dropdown-menu-lg .p-3 a:hover) {
		color: white !important;
		background: rgba(255, 255, 255, 0.1) !important;
		text-decoration: none !important;
	} /* 通知项样式 */
	.notification-item {
		padding: 1.125rem 1.25rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		display: block;
		text-decoration: none;
		color: inherit;
		background: #fff;
		width: 100%;
		box-sizing: border-box;
	}

	/* 确保下拉菜单中的flex布局正确 */
	.notification-item .d-flex {
		display: flex !important;
		width: 100% !important;
		align-items: flex-start !important;
	}

	.notification-item .flex-grow-1 {
		flex: 1 !important;
		min-width: 0 !important;
	}

	.notification-item:hover {
		background: rgba(102, 126, 234, 0.03);
		border-left: 3px solid #667eea;
		padding-left: 1.125rem; /* 调整左边距以配合边框 */
	}

	.notification-item:last-child {
		border-bottom: none;
	}
	.notification-item.unread {
		background: linear-gradient(90deg, rgba(102, 126, 234, 0.02) 0%, rgba(255, 255, 255, 1) 100%);
		border-left: 3px solid #667eea;
		padding-left: 1.125rem;
		/* 确保布局不受影响 */
		width: 100% !important;
		display: block !important;
		box-sizing: border-box !important;
	}

	.notification-item.read {
		opacity: 0.8;
		/* 确保已读状态不影响布局 */
		width: 100% !important;
		display: block !important;
		box-sizing: border-box !important;
	}

	.notification-item .avatar-xs {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}

	.notification-item .avatar-title {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		font-size: 1rem;
	}

	.notification-item .notification-content {
		flex: 1;
		min-width: 0; /* 防止内容溢出 */
	}

	.notification-item .notification-content .text-truncate {
		font-weight: 600;
		color: #334155;
		font-size: 0.9rem;
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	.notification-item .notification-content .small {
		color: #64748b;
		font-size: 0.8rem;
		line-height: 1.3;
		margin-bottom: 0.5rem;
	}
	.notification-item .notification-content .text-muted {
		color: #94a3b8 !important;
		font-size: 0.75rem;
		font-weight: 500;
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
		font-size: 0.9rem;
		color: #2d3748;
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
		line-height: 1.3;
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
	} /* 通知消息 */
	.notification-message {
		color: #718096;
		font-size: 0.825rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
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
	} /* 空状态样式 - 强化居中显示 */
	.empty-notifications {
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		min-height: 200px !important;
		padding: 2rem !important;
		width: 100% !important;
		box-sizing: border-box !important;
		position: relative !important;
	}

	.empty-content {
		text-align: center !important;
		color: #a0aec0 !important;
		width: 100% !important;
		display: flex !important;
		flex-direction: column !important;
		align-items: center !important;
		justify-content: center !important;
		margin: 0 auto !important;
	}

	.empty-content i {
		font-size: 3rem;
		color: #cbd5e0;
		margin-bottom: 1rem;
		display: block;
		opacity: 0.7;
	}

	.empty-content p {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 500;
		color: #718096;
	} /* 徽章样式优化 - 红点位置修复 */
	:global(.badge.bg-danger) {
		background-color: #f56565 !important;
		font-size: 0.7rem;
		min-width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: -10px;
		right: -10px;
		animation: bounce 2s infinite;
		font-weight: 600;
		border: 2px solid #fff;
		box-shadow: 0 2px 8px rgba(245, 101, 101, 0.4);
		z-index: 1001 !important; /* 确保在最顶层 */
		pointer-events: none; /* 防止干扰点击 */
	}

	@keyframes bounce {
		0%,
		20%,
		53%,
		80%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		40%,
		43% {
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
		/* 确保红点不被遮挡 */
		overflow: visible !important;
		z-index: 1;
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
	/* 头部操作按钮 */
	:global(.header-action-btn) {
		font-size: 0.8rem !important;
		padding: 0.25rem 0.5rem !important;
		border-radius: 4px !important;
		background: rgba(255, 255, 255, 0.2) !important;
		transition: all 0.2s ease !important;
		border: none !important;
		text-decoration: none !important;
	}

	:global(.header-action-btn:hover) {
		background: rgba(255, 255, 255, 0.3) !important;
		text-decoration: none !important;
	}

	:global(.header-action-btn:focus) {
		outline: none !important;
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
	}
	/* 通知容器样式 - 使用原生滚动 */
	.notification-scrollable-container {
		max-height: 400px !important;
		overflow-y: auto !important;
		overflow-x: hidden !important;
		width: 100% !important;
		position: relative !important;
		display: flex !important;
		flex-direction: column !important;
	}

	/* 原生滚动条样式优化 */
	.notification-scrollable-container::-webkit-scrollbar {
		width: 6px;
	}

	.notification-scrollable-container::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 3px;
	}

	.notification-scrollable-container::-webkit-scrollbar-thumb {
		background: rgba(102, 126, 234, 0.3);
		border-radius: 3px;
	}

	.notification-scrollable-container::-webkit-scrollbar-thumb:hover {
		background: rgba(102, 126, 234, 0.5);
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		:global(.dropdown-menu-lg) {
			min-width: 350px !important;
			max-width: 90vw !important;
			left: -250px !important;
			max-height: 60vh !important;
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

	@media (max-width: 480px) {
		:global(.dropdown-menu-lg) {
			min-width: 320px !important;
			left: -280px !important;
		}
	}
</style>

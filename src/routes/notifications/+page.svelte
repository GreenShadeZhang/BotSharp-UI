<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { Button, Card, CardBody, CardHeader, Badge, Row, Col } from '@sveltestrap/sveltestrap';
	import { notificationStore, notificationService } from '$lib/services/notification-service.js';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import Breadcrumb from '$lib/common/Breadcrumb.svelte';

	/** @type {import('$lib/services/notification-service.js').NotificationState} */
	let notificationState = { items: [], unreadCount: 0 };

	/** @type {string} */
	let filterType = 'all'; // all, unread, read

	/** @type {string} */
	let sortBy = 'newest'; // newest, oldest

	/** @type {import('$lib/services/notification-service.js').NotificationItem[]} */
	let filteredNotifications = [];

	onMount(() => {
		const unsubscriber = notificationStore.subscribe(state => {
			notificationState = state;
			updateFilteredNotifications();
		});

		return () => {
			unsubscriber();
		};
	});

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
		if (confirm('确定要清空所有通知吗？此操作无法撤销。')) {
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

	$: updateFilteredNotifications(), filterType, sortBy;
</script>

<HeadTitle title="{$_('Notifications')}" />

<div class="page-content">
	<div class="container-fluid">
		<!-- 面包屑导航 -->
		<Breadcrumb title="{$_('Notifications')}" pageTitle="通知管理" />

		<Row>
			<Col xl="12">
				<Card>
					<CardHeader>
						<div class="d-flex justify-content-between align-items-center">
							<h4 class="card-title mb-0">
								{$_('Notifications')}
								{#if notificationState.unreadCount > 0}
									<Badge color="danger" class="ms-2">
										{notificationState.unreadCount}
									</Badge>
								{/if}
							</h4>
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
						</div>
					</CardHeader>
					<CardBody>
						<!-- 过滤和排序控件 -->
						<div class="d-flex justify-content-between align-items-center mb-4">
							<div class="d-flex gap-2">
								<Button 
									color={filterType === 'all' ? 'primary' : 'outline-primary'} 
									size="sm"
									on:click={() => handleFilterChange('all')}
								>
									全部 ({notificationState.items.length})
								</Button>
								<Button 
									color={filterType === 'unread' ? 'primary' : 'outline-primary'} 
									size="sm"
									on:click={() => handleFilterChange('unread')}
								>
									未读 ({notificationState.unreadCount})
								</Button>
								<Button 
									color={filterType === 'read' ? 'primary' : 'outline-primary'} 
									size="sm"
									on:click={() => handleFilterChange('read')}
								>
									已读 ({notificationState.items.length - notificationState.unreadCount})
								</Button>
							</div>
							<div class="d-flex gap-2">
								<Button 
									color={sortBy === 'newest' ? 'success' : 'outline-success'} 
									size="sm"
									on:click={() => handleSortChange('newest')}
								>
									<i class="bx bx-sort-down me-1"></i>
									最新优先
								</Button>
								<Button 
									color={sortBy === 'oldest' ? 'success' : 'outline-success'} 
									size="sm"
									on:click={() => handleSortChange('oldest')}
								>
									<i class="bx bx-sort-up me-1"></i>
									最旧优先
								</Button>
							</div>
						</div>

						<!-- 通知列表 -->
						{#if filteredNotifications.length === 0}
							<div class="text-center py-5">
								<div class="text-muted">
									<i class="bx bx-bell-off display-4 d-block mb-3 text-muted"></i>
									<h5>暂无通知</h5>
									<p class="mb-0">
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
							<div class="notification-list">
								{#each filteredNotifications as notification (notification.id)}
									<div 
										class="notification-card {notification.read ? 'read' : 'unread'}" 
										on:click={() => handleNotificationClick(notification)}
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
					</CardBody>
				</Card>
			</Col>
		</Row>
	</div>
</div>

<style>
	.notification-list {
		max-height: none;
	}

	.notification-card {
		padding: 1.25rem;
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		margin-bottom: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		background: #fff;
	}

	.notification-card:hover {
		border-color: rgba(102, 126, 234, 0.3);
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
		transform: translateY(-2px);
	}

	.notification-card.unread {
		background-color: rgba(102, 126, 234, 0.02);
		border-left: 4px solid #667eea;
	}

	.notification-card.read {
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

	.notification-card:hover .notification-delete {
		opacity: 1;
	}

	:global(.badge-soft) {
		background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
		color: var(--bs-primary) !important;
		border: 1px solid rgba(var(--bs-primary-rgb), 0.2) !important;
	}

	@media (max-width: 768px) {
		.notification-card {
			padding: 1rem;
		}

		.d-flex.justify-content-between {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>

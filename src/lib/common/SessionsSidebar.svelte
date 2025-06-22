<script>
	import { onMount } from 'svelte';
	import { Button } from '@sveltestrap/sveltestrap';
	import { slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	/** @type {boolean} */
	export let isOpen = false;
	/** @type {(sessionId: string, agentId: string) => void} */
	export let onSessionSelected = () => {};

	/** @type {(sessionId: string) => void} */
	export let onSessionDeleted = () => {};

	/** @type {() => void} */
	export let onClose = () => {};
	/** @type {any[]} */
	let sessions = [];
	let isLoading = true;
	let showDeleteConfirm = false;
	/** @type {string | null} */
	let sessionToDelete = null;

	onMount(async () => {
		await loadSessions();
	});
	async function loadSessions() {
		try {
			isLoading = true;
			// Mock data - replace with actual API call
			sessions = [
				{
					id: '1',
					title: 'Code Review Assistant',
					agent: 'GPT-4 Developer',
					agentId: 'gpt4-dev',
					lastMessage: 'Can you help me review this JavaScript function?',
					timestamp: new Date('2025-06-22T10:30:00'),
					messageCount: 15
				},
				{
					id: '2',
					title: 'Marketing Strategy Discussion',
					agent: 'Business Advisor',
					agentId: 'business-advisor',
					lastMessage: 'What are the best practices for social media marketing?',
					timestamp: new Date('2025-06-21T16:45:00'),
					messageCount: 8
				},
				{
					id: '3',
					title: 'Technical Documentation',
					agent: 'Technical Writer',
					agentId: 'tech-writer',
					lastMessage: 'How should I structure the API documentation?',
					timestamp: new Date('2025-06-20T14:20:00'),
					messageCount: 23
				},
				{
					id: '4',
					title: 'UI/UX Design Consultation',
					agent: 'Design Expert',
					agentId: 'design-expert',
					lastMessage: 'Could you help me improve the user interface?',
					timestamp: new Date('2025-06-19T09:15:00'),
					messageCount: 12
				},
				{
					id: '5',
					title: 'Database Optimization',
					agent: 'Database Specialist',
					agentId: 'db-specialist',
					lastMessage: 'How can I optimize these SQL queries?',
					timestamp: new Date('2025-06-18T14:30:00'),
					messageCount: 7
				}
			];
		} catch (error) {
			console.error('Failed to load sessions:', error);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * @param {Date} timestamp
	 */
	function formatTimestamp(timestamp) {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 60) {
			return `${minutes} ${$_('time.minutes_ago')}`;
		} else if (hours < 24) {
			return `${hours} ${$_('time.hours_ago')}`;
		} else {
			return `${days} ${$_('time.days_ago')}`;
		}
	}
	/**
	 * @param {string} sessionId
	 * @param {string} agentId
	 */
	function selectSession(sessionId, agentId) {
		onSessionSelected(sessionId, agentId);
		closeSidebar();
	}

	/**
	 * @param {string} sessionId
	 */
	function deleteSession(sessionId) {
		sessionToDelete = sessionId;
		showDeleteConfirm = true;
	}

	function confirmDelete() {
		if (sessionToDelete) {
			sessions = sessions.filter(s => s.id !== sessionToDelete);
			onSessionDeleted(sessionToDelete);
			sessionToDelete = null;
		}
		showDeleteConfirm = false;
	}

	function cancelDelete() {
		sessionToDelete = null;
		showDeleteConfirm = false;
	}

	function closeSidebar() {
		isOpen = false;
		onClose();
	}

	/**
	 * @param {Event} e
	 */
	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) {
			closeSidebar();
		}
	}
</script>

<!-- Backdrop -->
{#if isOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="sidebar-backdrop" on:click={handleBackdropClick} transition:slide={{ duration: 300 }}>
		<!-- Sidebar -->
		<div class="sessions-sidebar" transition:slide={{ duration: 300, axis: 'x' }}>
			<div class="sidebar-header">
				<h5 class="sidebar-title">
					<i class="fas fa-history me-2"></i>
					{$_('workspace.sessions.title')}
				</h5>
				<button class="close-btn" on:click={closeSidebar}>
					<i class="fas fa-times"></i>
				</button>
			</div>

			<div class="sidebar-content">
				{#if isLoading}
					<div class="loading-container">
						<div class="spinner-border text-primary" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
						<p class="mt-2 text-muted">{$_('workspace.sessions.loading')}</p>
					</div>
				{:else if sessions.length === 0}
					<div class="empty-state">
						<i class="fas fa-comments fa-3x text-muted mb-3"></i>
						<p class="text-muted">{$_('workspace.sessions.no_sessions')}</p>
					</div>
				{:else}
					<div class="sessions-list">
						{#each sessions as session (session.id)}
							<div class="session-item">
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<div class="session-content" on:click={() => selectSession(session.id, session.agentId)}>
									<div class="session-header">
										<h6 class="session-title">{session.title}</h6>
										<span class="session-time">{formatTimestamp(session.timestamp)}</span>
									</div>
									<div class="session-agent">
										<i class="fas fa-robot me-1"></i>
										<small class="text-muted">{session.agent}</small>
									</div>
									<p class="session-preview">{session.lastMessage}</p>
									<div class="session-meta">
										<small class="text-muted">
											<i class="fas fa-comment-dots me-1"></i>
											{session.messageCount} {$_('workspace.sessions.messages')}
										</small>
									</div>
								</div>
								<div class="session-actions">
									<button 
										class="action-btn delete-btn" 
										on:click|stopPropagation={() => deleteSession(session.id)}
										title={$_('workspace.sessions.delete')}
									>
										<i class="fas fa-trash"></i>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div class="delete-modal-backdrop">
		<div class="delete-modal">
			<div class="modal-header">
				<h6>{$_('workspace.sessions.delete_confirm.title')}</h6>
			</div>
			<div class="modal-body">
				<p>{$_('workspace.sessions.delete_confirm.message')}</p>
			</div>
			<div class="modal-footer">
				<Button color="secondary" size="sm" on:click={cancelDelete}>
					{$_('common.cancel')}
				</Button>
				<Button color="danger" size="sm" on:click={confirmDelete}>
					{$_('common.delete')}
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.sidebar-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		justify-content: flex-end;
	}

	.sessions-sidebar {
		width: 400px;
		height: 100%;
		background: white;
		box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		max-width: 90vw;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.sidebar-title {
		margin: 0;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		color: white;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.loading-container, .empty-state {
		text-align: center;
		padding: 3rem 1rem;
	}

	.sessions-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.session-item {
		border: 1px solid #e9ecef;
		border-radius: 8px;
		background: white;
		transition: all 0.2s ease;
		display: flex;
		align-items: stretch;
	}

	.session-item:hover {
		border-color: #667eea;
		box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
	}

	.session-content {
		flex: 1;
		padding: 1rem;
		cursor: pointer;
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.session-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #2c3e50;
		margin: 0;
		flex: 1;
		margin-right: 0.5rem;
	}

	.session-time {
		font-size: 0.75rem;
		color: #6c757d;
		white-space: nowrap;
	}

	.session-agent {
		margin-bottom: 0.5rem;
	}

	.session-preview {
		font-size: 0.8rem;
		color: #6c757d;
		margin: 0 0 0.5rem 0;		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.session-meta {
		margin-top: auto;
	}

	.session-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0.5rem;
		border-left: 1px solid #e9ecef;
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #6c757d;
	}

	.delete-btn:hover {
		background: #dc3545;
		color: white;
	}

	.delete-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1100;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.delete-modal {
		background: white;
		border-radius: 8px;
		min-width: 300px;
		max-width: 90vw;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.modal-header, .modal-body, .modal-footer {
		padding: 1rem 1.5rem;
	}

	.modal-header {
		border-bottom: 1px solid #e9ecef;
	}

	.modal-header h6 {
		margin: 0;
		font-weight: 600;
	}

	.modal-footer {
		border-top: 1px solid #e9ecef;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.sessions-sidebar {
			width: 100%;
		}
	}
</style>

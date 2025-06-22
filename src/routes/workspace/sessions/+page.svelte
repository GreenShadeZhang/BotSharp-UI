<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';

	// Mock data for sessions
	let sessions = [
		{
			id: '1',
			title: 'Code Review Assistant',
			agent: 'GPT-4 Developer',
			lastMessage: 'Can you help me review this JavaScript function?',
			timestamp: new Date('2025-06-22T10:30:00'),
			messageCount: 15
		},
		{
			id: '2',
			title: 'Marketing Strategy Discussion',
			agent: 'Business Advisor',
			lastMessage: 'What are the best practices for social media marketing?',
			timestamp: new Date('2025-06-21T16:45:00'),
			messageCount: 8
		},
		{
			id: '3',
			title: 'Technical Documentation',
			agent: 'Technical Writer',
			lastMessage: 'How should I structure the API documentation?',
			timestamp: new Date('2025-06-20T14:20:00'),
			messageCount: 23
		}
	];

	let mounted = false;
	let showDeleteModal = false;
	let sessionToDelete = null;

	onMount(() => {
		mounted = true;
	});

	function formatTimestamp(timestamp) {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 60) {
			return `${minutes} minutes ago`;
		} else if (hours < 24) {
			return `${hours} hours ago`;
		} else {
			return `${days} days ago`;
		}
	}

	function openSession(sessionId) {
		goto(`/workspace/chat/${sessionId}`);
	}

	function confirmDelete(session) {
		sessionToDelete = session;
		showDeleteModal = true;
	}

	function deleteSession() {
		if (sessionToDelete) {
			sessions = sessions.filter((s) => s.id !== sessionToDelete.id);
			sessionToDelete = null;
		}
		showDeleteModal = false;
	}

	function createNewSession() {
		goto('/workspace/chat');
	}

	function goBack() {
		goto('/workspace');
	}
</script>

<div class="sessions-page">
	{#if mounted}
		<div class="sessions-header" in:fade={{ duration: 600 }}>
			<div class="header-content">
				<div class="header-navigation">
					<button class="back-btn" on:click={goBack}>
						<i class="fas fa-arrow-left"></i>
						Back to Workspace
					</button>
				</div>
				<h1 class="page-title">
					<i class="fas fa-history me-3"></i>
					Session Management
				</h1>
				<p class="page-subtitle">Manage your conversation history and continue previous chats</p>
				<button class="new-session-btn" on:click={createNewSession}>
					<i class="fas fa-plus me-2"></i>
					New Session
				</button>
			</div>
		</div>

		<div class="sessions-content" in:fly={{ y: 30, duration: 800, delay: 200 }}>
			{#if sessions.length > 0}
				<div class="sessions-grid">
					{#each sessions as session, index}
						<div
							class="session-card"
							in:fly={{ y: 30, duration: 600, delay: 100 * index }}
							on:click={() => openSession(session.id)}
							on:keydown={(e) => e.key === 'Enter' && openSession(session.id)}
							role="button"
							tabindex="0"
						>
							<div class="session-header">
								<div class="session-info">
									<h3 class="session-title">{session.title}</h3>
									<span class="session-agent">
										<i class="fas fa-robot me-1"></i>
										{session.agent}
									</span>
								</div>
								<div
									class="session-actions"
									on:click|stopPropagation
									on:keydown|stopPropagation
									role="button"
									tabindex="0"
								>
									<button
										class="action-btn delete-btn"
										on:click={() => confirmDelete(session)}
										title="Delete Session"
									>
										<i class="fas fa-trash"></i>
									</button>
								</div>
							</div>
							<div class="session-content">
								<p class="last-message">"{session.lastMessage}"</p>
								<div class="session-meta">
									<span class="message-count">
										<i class="fas fa-comments me-1"></i>
										{session.messageCount} messages
									</span>
									<span class="timestamp">
										<i class="fas fa-clock me-1"></i>
										{formatTimestamp(session.timestamp)}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<i class="fas fa-inbox"></i>
					<h3>No Sessions Yet</h3>
					<p>Start your first conversation to see sessions here</p>
					<button class="create-first-btn" on:click={createNewSession}>
						<i class="fas fa-plus me-2"></i>
						Create First Session
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div
		class="modal-backdrop"
		on:click={() => (showDeleteModal = false)}
		on:keydown={() => (showDeleteModal = false)}
		role="button"
		tabindex="0"
	>
		<div
			class="modal-content"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			tabindex="0"
		>
			<div class="modal-header">
				<h3>Delete Session</h3>
				<button class="close-btn" on:click={() => (showDeleteModal = false)}>
					<i class="fas fa-times"></i>
				</button>
			</div>
			<div class="modal-body">
				<p>
					Are you sure you want to delete the session <strong>"{sessionToDelete?.title}"</strong>?
				</p>
				<p class="warning-text">This action cannot be undone.</p>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" on:click={() => (showDeleteModal = false)}> Cancel </button>
				<button class="btn-delete" on:click={deleteSession}>
					<i class="fas fa-trash me-2"></i>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.sessions-page {
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		overflow-y: auto;
	}

	.sessions-header {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
		position: relative;
	}

	.header-navigation {
		position: absolute;
		left: 0;
		top: 0;
	}

	.back-btn {
		background: none;
		border: none;
		color: #667eea;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		transition: all 0.3s ease;
	}

	.back-btn:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.page-title {
		font-size: 2.2rem;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.page-subtitle {
		font-size: 1.1rem;
		color: #7f8c8d;
		margin-bottom: 2rem;
	}

	.new-session-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
	}

	.new-session-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
	}

	.sessions-content {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.sessions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.session-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.session-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.session-info {
		flex-grow: 1;
	}

	.session-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 0.5rem;
		line-height: 1.3;
	}

	.session-agent {
		font-size: 0.9rem;
		color: #667eea;
		font-weight: 500;
	}

	.session-actions {
		margin-left: 1rem;
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.delete-btn {
		color: #e74c3c;
	}

	.delete-btn:hover {
		background: rgba(231, 76, 60, 0.1);
	}

	.session-content {
		border-top: 1px solid #ecf0f1;
		padding-top: 1rem;
	}

	.last-message {
		font-size: 0.95rem;
		color: #7f8c8d;
		font-style: italic;
		margin-bottom: 1rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	.session-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
		color: #bdc3c7;
	}

	.message-count,
	.timestamp {
		display: flex;
		align-items: center;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: #bdc3c7;
	}

	.empty-state i {
		font-size: 4rem;
		margin-bottom: 1.5rem;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #7f8c8d;
	}

	.empty-state p {
		font-size: 1rem;
		margin-bottom: 2rem;
	}

	.create-first-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
	}

	.create-first-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
	}

	/* Modal Styles */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		max-width: 400px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		padding: 1.5rem 1.5rem 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h3 {
		margin: 0;
		color: #2c3e50;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		color: #bdc3c7;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.close-btn:hover {
		color: #7f8c8d;
		background: #ecf0f1;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-body p {
		margin-bottom: 1rem;
		color: #2c3e50;
	}

	.warning-text {
		color: #e74c3c;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.modal-footer {
		padding: 0 1.5rem 1.5rem;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.btn-cancel,
	.btn-delete {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		border: none;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
	}

	.btn-cancel {
		background: #ecf0f1;
		color: #7f8c8d;
	}

	.btn-cancel:hover {
		background: #d5dbdb;
	}

	.btn-delete {
		background: #e74c3c;
		color: white;
	}

	.btn-delete:hover {
		background: #c0392b;
	}

	@media (max-width: 768px) {
		.sessions-grid {
			grid-template-columns: 1fr;
		}

		.header-navigation {
			position: static;
			margin-bottom: 1rem;
		}

		.page-title {
			font-size: 1.8rem;
		}

		.sessions-content {
			padding: 1rem;
		}
	}
</style>

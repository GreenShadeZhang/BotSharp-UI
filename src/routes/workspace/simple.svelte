<script>
	import { goto } from '$app/navigation';
	console.log('Simple workspace page loaded');
</script>

<div class="workspace-container">
	<div class="workspace-header">
		<h1>🚀 Personal Workspace</h1>
		<p>Welcome to your AI workspace</p>
	</div>

	<div class="workspace-content">
		<div class="action-grid">
			<button class="action-card" on:click={() => goto('/workspace/chat')}>
				<div class="action-icon">💬</div>
				<div class="action-content">
					<h3>Start New Chat</h3>
					<p>Begin a conversation with an AI agent</p>
				</div>
			</button>

			<button class="action-card" on:click={() => goto('/workspace/sessions')}>
				<div class="action-icon">📋</div>
				<div class="action-content">
					<h3>Manage Sessions</h3>
					<p>View and organize your conversations</p>
				</div>
			</button>
		</div>
	</div>
</div>

<style>
	.workspace-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 2rem;
	}

	.workspace-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.workspace-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.workspace-header p {
		font-size: 1.2rem;
		color: #7f8c8d;
	}

	.workspace-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.action-card {
		background: white;
		border: none;
		border-radius: 12px;
		padding: 2rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: left;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.action-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.action-icon {
		font-size: 3rem;
		flex-shrink: 0;
	}

	.action-content h3 {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	.action-content p {
		font-size: 0.9rem;
		color: #7f8c8d;
		margin: 0;
	}

	.action-card:hover .action-content p {
		color: rgba(255, 255, 255, 0.8);
	}

	@media (max-width: 768px) {
		.workspace-container {
			padding: 1rem;
		}

		.workspace-header h1 {
			font-size: 2rem;
		}

		.action-grid {
			grid-template-columns: 1fr;
		}

		.action-card {
			padding: 1.5rem;
		}
	}
</style>

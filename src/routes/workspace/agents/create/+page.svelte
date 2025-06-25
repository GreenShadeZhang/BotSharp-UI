<script>
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Card, CardBody, Col, Row } from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';

	function goBack() {
		goto('/workspace/agents');
	}

	function createSingleAgent() {
		goto('/workspace/agents/create/single');
	}

	function createAgentGroup() {
		goto('/workspace/agents/create/group');
	}
</script>

<HeadTitle title={$_('workspace.agents.create.title')} />

<div class="create-agent" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="create-header" in:fly={{ y: -20, duration: 500 }}>
		<div class="header-content">
			<Button 
				color="light" 
				size="sm" 
				on:click={goBack}
				class="me-3"
			>
				<i class="fas fa-arrow-left me-2"></i>
				{$_('workspace.agents.title')}
			</Button>
			<div>
				<h1 class="page-title">{$_('workspace.agents.create.title')}</h1>
				<p class="page-subtitle">{$_('workspace.agents.create.choose_type')}</p>
			</div>
		</div>
	</div>

	<!-- Selection Cards -->
	<div class="selection-container" in:fly={{ y: 30, duration: 500, delay: 200 }}>
		<Row class="g-4 justify-content-center">
			<!-- Single Agent Option -->
			<Col lg="5" md="6">
				<Card 
					class="selection-card h-100"
					on:click={createSingleAgent}
					role="button"
					tabindex={0}
				>
					<CardBody class="text-center p-4">
						<div class="selection-icon single">
							<i class="fas fa-robot"></i>
						</div>
						<h3 class="selection-title">{$_('workspace.agents.create.single')}</h3>
						<p class="selection-description">
							{$_('workspace.agents.create.single_description')}
						</p>
						<div class="selection-features">
							<div class="feature-item">
								<i class="fas fa-check text-success me-2"></i>
								<span>{$_('workspace.agents.create.single_features.direct_chat')}</span>
							</div>
							<div class="feature-item">
								<i class="fas fa-check text-success me-2"></i>
								<span>{$_('workspace.agents.create.single_features.tool_calling')}</span>
							</div>
							<div class="feature-item">
								<i class="fas fa-check text-success me-2"></i>
								<span>{$_('workspace.agents.create.single_features.simple_config')}</span>
							</div>
						</div>
						<Button color="primary" class="mt-3 w-100">
							<i class="fas fa-plus me-2"></i>
							{$_('workspace.agents.create.create_single_button')}
						</Button>
					</CardBody>
				</Card>
			</Col>

			<!-- Agent Group Option -->
			<Col lg="5" md="6">
				<Card 
					class="selection-card h-100"
					on:click={createAgentGroup}
					role="button"
					tabindex={0}
				>
					<CardBody class="text-center p-4">
						<div class="selection-icon group">
							<i class="fas fa-sitemap"></i>
						</div>
						<h3 class="selection-title">{$_('workspace.agents.create.group')}</h3>
						<p class="selection-description">
							{$_('workspace.agents.create.group_description')}
						</p>
						<div class="selection-features">
							<div class="feature-item">
								<i class="fas fa-check text-success me-2"></i>
								<span>{$_('workspace.agents.create.group_features.intelligent_routing')}</span>
							</div>
							<div class="feature-item">
								<i class="fas fa-check text-success me-2"></i>
								<span>{$_('workspace.agents.create.group_features.multi_agent')}</span>
							</div>
							<div class="feature-item">
								<i class="fas fa-check text-success me-2"></i>
								<span>{$_('workspace.agents.create.group_features.complex_tasks')}</span>
							</div>
						</div>
						<Button color="success" class="mt-3 w-100">
							<i class="fas fa-plus me-2"></i>
							{$_('workspace.agents.create.create_group_button')}
						</Button>
					</CardBody>
				</Card>
			</Col>
		</Row>
	</div>

	<!-- Help Section -->
	<div class="help-section" in:fly={{ y: 30, duration: 500, delay: 400 }}>
		<Card class="help-info">
			<CardBody>
				<div class="help-content">
					<div class="help-icon">
						<i class="fas fa-question-circle"></i>
					</div>
					<div class="help-text">
						<h5>{$_('workspace.agents.create.help.title')}</h5>
						<p>
							{$_('workspace.agents.create.help.description')}
						</p>
					</div>
				</div>
			</CardBody>
		</Card>
	</div>
</div>

<style>
	.create-agent {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.create-header {
		margin-bottom: 3rem;
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 600;
		margin: 0;
		color: #2d3748;
	}

	.page-subtitle {
		color: #718096;
		margin: 0.5rem 0 0 0;
		font-size: 1rem;
	}

	.selection-container {
		margin-bottom: 3rem;
	}

	:global(.selection-card) {
		transition: all 0.3s ease;
		border: 2px solid #e2e8f0;
		cursor: pointer;
	}

	:global(.selection-card:hover) {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		border-color: #cbd5e0;
	}

	.selection-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		color: white;
		margin: 0 auto 1.5rem auto;
	}

	.selection-icon.single {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.selection-icon.group {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
	}

	.selection-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.selection-description {
		color: #4a5568;
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.selection-features {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.feature-item {
		display: flex;
		align-items: center;
		font-size: 0.9rem;
		color: #4a5568;
	}

	.selection-btn {
		width: 100%;
		padding: 0.75rem 1.5rem;
		font-weight: 600;
	}

	.help-section {
		max-width: 800px;
		margin: 0 auto;
	}

	:global(.help-info) {
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border: 1px solid #e2e8f0;
	}

	.help-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.help-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #3182ce;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.2rem;
		flex-shrink: 0;
	}

	.help-text h5 {
		margin: 0 0 0.5rem 0;
		color: #2d3748;
		font-weight: 600;
	}

	.help-text p {
		margin: 0;
		color: #4a5568;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.create-agent {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.help-content {
			flex-direction: column;
			text-align: center;
		}

		.selection-features {
			align-items: center;
		}
	}
</style>

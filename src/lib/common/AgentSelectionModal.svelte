<script>
	import { onMount } from 'svelte';
	import { Button, Modal, ModalBody, ModalHeader, Input, Row, Col, Card, CardBody } from '@sveltestrap/sveltestrap';
	import { getAgents } from '$lib/services/agent-service.js';
	import { _ } from 'svelte-i18n';

	/** @type {boolean} */
	export let isOpen = false;

	/** @type {(agent: any) => void} */
	export let onAgentSelected = () => {};

	/** @type {() => void} */
	export let onClose = () => {};
	/** @type {any[]} */
	let agents = [];
	/** @type {any[]} */
	let filteredAgents = [];
	let searchTerm = '';
	let isLoading = true;

	$: if (searchTerm) {
		filteredAgents = agents.filter((agent) => 
			agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
		);
	} else {
		filteredAgents = agents;
	}

	onMount(async () => {
		await loadAgents();
	});

	async function loadAgents() {
		try {
			isLoading = true;
			const filter = {
				pager: { page: 1, size: 50, count: 0 }
			};
			const response = await getAgents(filter, true);
			agents = response?.items?.map((t) => ({ ...t })) || [];
			filteredAgents = agents;
		} catch (error) {
			console.error('Failed to load agents:', error);
		} finally {
			isLoading = false;
		}
	}
	/**
	 * @param {any} agent
	 */
	function selectAgent(agent) {
		onAgentSelected(agent);
		toggleModal();
	}

	function toggleModal() {
		isOpen = !isOpen;
		if (!isOpen) {
			onClose();
		}
	}

	function handleModalClose() {
		isOpen = false;
		onClose();
	}
</script>

<Modal {isOpen} toggle={handleModalClose} size="lg" class="agent-selection-modal">
	<ModalHeader toggle={handleModalClose}>
		<i class="fas fa-robot me-2"></i>
		{$_('workspace.select_agent.title')}
	</ModalHeader>
	<ModalBody>
		<div class="mb-3">			<Input
				type="text"
				placeholder={$_('workspace.select_agent.search_placeholder')}
				bind:value={searchTerm}
				class="search-input"
			/>
		</div>

		{#if isLoading}
			<div class="text-center py-4">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p class="mt-2 text-muted">{$_('workspace.select_agent.loading')}</p>
			</div>
		{:else if filteredAgents.length === 0}
			<div class="text-center py-4">
				<i class="fas fa-robot fa-3x text-muted mb-3"></i>
				<p class="text-muted">{$_('workspace.select_agent.no_agents')}</p>
			</div>
		{:else}
			<Row>				{#each filteredAgents as agent (agent.id)}
					<Col md="6" class="mb-3">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div 
							class="agent-card h-100" 
							on:click={() => selectAgent(agent)}
							role="button"
							tabindex={0}
						>
							<div class="card-body d-flex flex-column">
								<div class="agent-icon mb-3">
									<i class="fas fa-robot"></i>
								</div>
								<h6 class="agent-name">{agent.name}</h6>
								<p class="agent-description text-muted small flex-grow-1">
									{agent.description || $_('workspace.select_agent.no_description')}
								</p>
								<div class="agent-meta">
									<small class="text-muted">
										<i class="fas fa-tag me-1"></i>
										{agent.type || 'General'}
									</small>
								</div>
							</div>
						</div>
					</Col>
				{/each}
			</Row>
		{/if}
	</ModalBody>
</Modal>

<style>
	:global(.agent-selection-modal .modal-content) {
		border-radius: 12px;
		border: none;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
	}

	:global(.agent-selection-modal .modal-header) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px 12px 0 0;
		border-bottom: none;
	}

	:global(.agent-selection-modal .modal-body) {
		max-height: 70vh;
		overflow-y: auto;
	}

	:global(.search-input) {
		border-radius: 8px;
		border: 2px solid #e9ecef;
		transition: all 0.3s ease;
	}

	:global(.search-input:focus) {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.agent-card {
		border: 2px solid #e9ecef;
		border-radius: 10px;
		transition: all 0.3s ease;
		cursor: pointer;
		height: 100%;
	}

	.agent-card:hover {
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
	}

	.agent-icon {
		width: 50px;
		height: 50px;
		border-radius: 10px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
	}

	.agent-name {
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.agent-description {
		line-height: 1.4;
		margin-bottom: 1rem;
	}

	.agent-meta {
		margin-top: auto;
	}

	@media (max-width: 768px) {
		:global(.agent-selection-modal .modal-dialog) {
			margin: 1rem;
		}
	}
</style>

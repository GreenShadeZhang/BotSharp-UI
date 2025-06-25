<script>
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { 
		Button, 
		Card, 
		CardBody, 
		Col, 
		Row, 
		Form, 
		FormGroup, 
		Label, 
		Input, 
		Badge,
		Alert,
		Modal,
		ModalBody,
		ModalHeader
	} from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import { onMount } from 'svelte';

	/** @type {{ name: string; description: string; profiles: any[]; routingStrategy: string; isPublic: boolean; }} */
	let groupForm = {
		name: '',
		description: '',
		profiles: [],
		routingStrategy: 'sequential', // sequential, priority, conditional
		isPublic: false
	};

	/** @type {Array<{id: string; name: string; type: string; description: string}>} */
	let availableAgents = []; // 可选的智能体列表
	/** @type {Array<{id: string; name: string; type: string; description: string; priority: number}>} */
	let selectedAgents = []; // 已选择的智能体
	let showAgentSelector = false;
	let loading = false;
	/** @type {{[key: string]: string}} */
	let errors = {};

	// 路由策略选项
	const routingStrategies = [
		{ value: 'sequential', label: 'Sequential', description: 'Execute agents in order' },
		{ value: 'priority', label: 'Priority', description: 'Execute by priority level' },
		{ value: 'conditional', label: 'Conditional', description: 'Execute based on conditions' }
	];

	onMount(async () => {
		await loadAvailableAgents();
	});

	async function loadAvailableAgents() {
		try {
			// 模拟获取可用智能体列表
			// 实际应该从API获取
			availableAgents = [
				{ id: '1', name: 'Customer Service Agent', type: 'Task', description: 'Handle customer inquiries' },
				{ id: '2', name: 'Sales Assistant', type: 'Task', description: 'Assist with sales processes' },
				{ id: '3', name: 'Technical Support', type: 'Task', description: 'Provide technical assistance' },
				{ id: '4', name: 'Data Analyst', type: 'Task', description: 'Analyze data and generate reports' }
			];
		} catch (error) {
			console.error('Failed to load available agents:', error);
		}
	}

	function goBack() {
		goto('/workspace/agents/create');
	}

	function openAgentSelector() {
		showAgentSelector = true;
	}

	/**
	 * @param {{id: string; name: string; type: string; description: string}} agent
	 */
	function selectAgent(agent) {
		if (!selectedAgents.find(a => a.id === agent.id)) {
			selectedAgents = [...selectedAgents, { ...agent, priority: selectedAgents.length + 1 }];
			updateProfiles();
		}
	}

	/**
	 * @param {string} agentId
	 */
	function removeAgent(agentId) {
		selectedAgents = selectedAgents.filter(a => a.id !== agentId);
		// 重新调整优先级
		selectedAgents = selectedAgents.map((agent, index) => ({
			...agent,
			priority: index + 1
		}));
		updateProfiles();
	}

	function updateProfiles() {
		groupForm.profiles = selectedAgents.map(agent => ({
			agentId: agent.id,
			name: agent.name,
			priority: agent.priority,
			conditions: []
		}));
	}

	function validateForm() {
		errors = {};
		
		if (!groupForm.name.trim()) {
			errors.name = $_('workspace.agents.create.errors.name_required');
		}
		
		if (selectedAgents.length < 2) {
			errors.agents = $_('workspace.agents.create.errors.min_agents');
		}

		return Object.keys(errors).length === 0;
	}

	async function createGroup() {
		if (!validateForm()) {
			return;
		}

		loading = true;
		
		try {
			// 构建智能体组数据
			const groupData = {
				name: groupForm.name,
				description: groupForm.description,
				type: 'Routing',
				profiles: groupForm.profiles,
				routingStrategy: groupForm.routingStrategy,
				isPublic: groupForm.isPublic,
				createdAt: new Date().toISOString()
			};

			console.log('Creating agent group:', groupData);
			
			// 这里应该调用实际的API
			// await agentService.createAgentGroup(groupData);
			
			// 模拟API调用
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// 创建成功，跳转到智能体管理页面
			goto('/workspace/agents');
			
		} catch (error) {
			console.error('Failed to create agent group:', error);
			errors.submit = $_('workspace.agents.create.errors.create_failed');
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {Event} e
	 */
	function handleSubmit(e) {
		e.preventDefault();
		createGroup();
	}
</script>

<HeadTitle title={$_('workspace.agents.create.group')} />

<div class="create-group-agent" in:fade={{ duration: 300 }}>
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
				{$_('workspace.agents.create.title')}
			</Button>
			<div>
				<h1 class="page-title">{$_('workspace.agents.create.group')}</h1>
				<p class="page-subtitle">{$_('workspace.agents.create.group_description')}</p>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="content-container" in:fly={{ y: 30, duration: 500, delay: 200 }}>
		<Row class="justify-content-center">
			<Col lg="10" xl="8">
				{#if errors.submit}
					<Alert color="danger" class="mb-4">
						{errors.submit}
					</Alert>
				{/if}

				<Card>
					<CardBody class="p-4">
						<form on:submit={handleSubmit}>
							<!-- Basic Information -->
							<div class="section-header mb-4">
								<h4 class="section-title">
									<i class="fas fa-info-circle me-2"></i>
									{$_('workspace.agents.create.basic_info')}
								</h4>
							</div>

							<Row>
								<Col md="6">
									<FormGroup>
										<Label for="groupName">{$_('workspace.agents.create.name')}</Label>
										<Input
											id="groupName"
											bind:value={groupForm.name}
											placeholder={$_('workspace.agents.create.name_placeholder_group')}
											invalid={!!errors.name}
										/>
										{#if errors.name}
											<div class="invalid-feedback d-block">{errors.name}</div>
										{/if}
									</FormGroup>
								</Col>
								<Col md="6">
									<FormGroup>
										<Label for="routingStrategy">{$_('workspace.agents.create.routing_strategy')}</Label>
										<Input
											type="select"
											id="routingStrategy"
											bind:value={groupForm.routingStrategy}
										>
											{#each routingStrategies as strategy}
												<option value={strategy.value}>
													{$_(strategy.label)} - {$_(strategy.description)}
												</option>
											{/each}
										</Input>
									</FormGroup>
								</Col>
							</Row>

							<FormGroup>
								<Label for="groupDescription">{$_('workspace.agents.create.description')}</Label>
								<Input
									type="textarea"
									id="groupDescription"
									bind:value={groupForm.description}
									placeholder={$_('workspace.agents.create.description_placeholder_group')}
									rows={3}
								/>
							</FormGroup>

							<FormGroup check>
								<Input
									type="checkbox"
									id="isPublic"
									bind:checked={groupForm.isPublic}
								/>
								<Label check for="isPublic">{$_('workspace.agents.create.public_group')}</Label>
							</FormGroup>

							<!-- Agent Selection -->
							<div class="section-header mt-5 mb-4">
								<h4 class="section-title">
									<i class="fas fa-users me-2"></i>
									{$_('workspace.agents.create.select_members')}
								</h4>
								<p class="text-muted">{$_('workspace.agents.create.select_members_desc')}</p>
							</div>

							{#if errors.agents}
								<Alert color="warning" class="mb-3">
									{errors.agents}
								</Alert>
							{/if}

							<div class="agent-selection-area">
								<Button
									color="primary"
									outline
									size="sm"
									on:click={openAgentSelector}
									class="mb-3"
								>
									<i class="fas fa-plus me-2"></i>
									{$_('workspace.agents.create.add_agent')}
								</Button>

								{#if selectedAgents.length > 0}
									<div class="selected-agents">
										{#each selectedAgents as agent (agent.id)}
											<div class="agent-item" in:fly={{ x: -20, duration: 300 }}>
												<div class="agent-info">
													<div class="agent-name">{agent.name}</div>
													<div class="agent-meta">
														<Badge color="secondary" class="me-2">Priority: {agent.priority}</Badge>
														<span class="text-muted">{agent.description}</span>
													</div>
												</div>
												<Button
													color="danger"
													size="sm"
													outline
													on:click={() => removeAgent(agent.id)}
												>
													<i class="fas fa-times"></i>
												</Button>
											</div>
										{/each}
									</div>
								{:else}
									<div class="empty-state text-center py-4">
										<i class="fas fa-robot text-muted mb-2" style="font-size: 2rem;"></i>
										<p class="text-muted">{$_('workspace.agents.create.no_agents_selected')}</p>
									</div>
								{/if}
							</div>

							<!-- Actions -->
							<div class="form-actions mt-5 pt-4 border-top">
								<Row>
									<Col class="text-end">
										<Button
											color="secondary"
											outline
											class="me-3"
											on:click={goBack}
											disabled={loading}
										>
											{$_('common.cancel')}
										</Button>
										<Button
											color="primary"
											type="submit"
											disabled={loading || selectedAgents.length < 2}
										>
											{#if loading}
												<i class="fas fa-spinner fa-spin me-2"></i>
											{:else}
												<i class="fas fa-save me-2"></i>
											{/if}
											{$_('workspace.agents.create.create_group')}
										</Button>
									</Col>
								</Row>
							</div>
						</form>
					</CardBody>
				</Card>
			</Col>
		</Row>
	</div>
</div>

<!-- Agent Selection Modal -->
<Modal isOpen={showAgentSelector} toggle={() => showAgentSelector = false} size="lg">
	<ModalHeader toggle={() => showAgentSelector = false}>
		{$_('workspace.agents.create.select_agent')}
	</ModalHeader>
	<ModalBody>
		<div class="available-agents">
			{#each availableAgents as agent (agent.id)}
				{@const isSelected = !!selectedAgents.find(a => a.id === agent.id)}
				<div class="agent-option" class:selected={isSelected}>
					<div class="agent-info">
						<div class="agent-name">{agent.name}</div>
						<div class="agent-meta">
							<Badge color="info" class="me-2">{agent.type}</Badge>
							<span class="text-muted">{agent.description}</span>
						</div>
					</div>
					<Button
						color={isSelected ? "success" : "primary"}
						size="sm"
						outline={!isSelected}
						disabled={isSelected}
						on:click={() => selectAgent(agent)}
					>
						{#if isSelected}
							<i class="fas fa-check me-2"></i>
							{$_('common.selected')}
						{:else}
							<i class="fas fa-plus me-2"></i>
							{$_('common.select')}
						{/if}
					</Button>
				</div>
			{/each}
		</div>
	</ModalBody>
</Modal>

<style>
	.create-group-agent {
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

	.content-container {
		min-height: 400px;
	}

	.section-header {
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.75rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.agent-selection-area {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.selected-agents {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.agent-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.agent-info {
		flex: 1;
	}

	.agent-name {
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.25rem;
	}

	.agent-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.empty-state {
		background: white;
		border: 2px dashed #d1d5db;
		border-radius: 0.75rem;
		margin: 1rem 0;
	}

	.form-actions {
		background: #f9fafb;
		margin: 0 -1.5rem -1.5rem -1.5rem;
		padding: 1.5rem;
		border-radius: 0 0 0.75rem 0.75rem;
	}

	.available-agents {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.agent-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.agent-option:hover {
		border-color: #3b82f6;
		background: #f8fafc;
	}

	.agent-option.selected {
		background: #f0f9ff;
		border-color: #3b82f6;
	}

	@media (max-width: 768px) {
		.create-group-agent {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.agent-item, .agent-option {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}
	}
</style>

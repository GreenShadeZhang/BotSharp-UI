<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import { 
		Button, 
		Card, 
		CardBody, 
		Col, 
		Row, 
		Input, 
		FormGroup, 
		Label,
		Badge,
		Alert
	} from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import FileDropZone from '$lib/common/FileDropZone.svelte';
	import { getAgent, saveAgent, uploadAgentIcon } from '$lib/services/agent-service.js';
	import { PUBLIC_SERVICE_URL } from '$env/static/public';
	import { buildUrl } from '$lib/helpers/utils/common';
	import Swal from 'sweetalert2';

	/** @type {string} */
	let agentId = '';

	/** @type {boolean} */
	let isLoading = false;

	/** @type {boolean} */
	let isComplete = false;

	/** @type {import('$agentTypes').AgentModel | null} */
	let agent = null;

	/** @type {string} */
	let agentName = '';

	/** @type {string} */
	let agentDescription = '';

	/** @type {string} */
	let agentInstruction = '';

	/** @type {boolean} */
	let isPublic = false;

	/** @type {boolean} */
	let isEnabled = true;

	/** @type {number} */
	let temperature = 0.7;

	/** @type {number | null} */
	let maxTokens = 1024;

	/** @type {number} */
	let maxRecursionDepth = 10;

	/** @type {string} */
	let agentIconUrl = '';

	/** @type {import('$fileTypes').FileModel | null} */
	let selectedIconFile = null;

	const fileMaxSize = 10 * 1024 * 1024;

	let hasChanges = false;

	onMount(async () => {
		agentId = $page.params.id;
		if (!agentId) {
			await Swal.fire({
				title: $_('common.error'),
				text: 'Invalid agent ID',
				icon: 'error'
			});
			goto('/workspace/agents');
			return;
		}
		await loadAgent();
	});

	async function loadAgent() {
		isLoading = true;
		try {
			agent = await getAgent(agentId);
			
			if (agent) {
				agentName = agent.name || '';
				agentDescription = agent.description || '';
				agentInstruction = agent.instruction || '';
				isPublic = agent.is_public || false;
				isEnabled = !agent.disabled; // disabled 字段的逆向映射
				agentIconUrl = agent.icon_url || '';
				
				// 安全地访问 llm_config 属性
				if (agent.llm_config) {
					temperature = agent.llm_config.temperature || 0.7;
					// 如果后端返回 null 或 undefined，则设置为 null（可以清空状态）
					// 否则使用实际值，如果没有值则使用默认值 1024
					maxTokens = agent.llm_config.max_output_tokens ?? 1024;
					maxRecursionDepth = agent.llm_config.max_recursion_depth || 10;
				} else {
					temperature = 0.7;
					maxTokens = 1024;
					maxRecursionDepth = 10;
				}
			} else {
				throw new Error('Agent not found');
			}
		} catch (error) {
			console.error('Failed to load agent:', error);
			await Swal.fire({
				title: $_('common.error'),
				text: $_('workspace.agents.edit.load_failed'),
				icon: 'error'
			});
			goto('/workspace/agents');
		} finally {
			isLoading = false;
		}
	}

	function goBack() {
		if (hasChanges) {
			Swal.fire({
				title: $_('workspace.agents.edit.unsaved_changes'),
				text: $_('workspace.agents.edit.unsaved_changes_warning'),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: $_('workspace.agents.edit.leave'),
				cancelButtonText: $_('common.cancel')
			}).then((result) => {
				if (result.isConfirmed) {
					goto('/workspace/agents');
				}
			});
		} else {
			goto('/workspace/agents');
		}
	}

	/** @param {any} e */
	async function handleIconDrop(e) {
		const { acceptedFiles } = e.detail;
		const fileModel = acceptedFiles[0];
		if (!fileModel) return;

		// 保存选择的文件并预览图片
		selectedIconFile = fileModel;
		agentIconUrl = fileModel.file_data;
		hasChanges = true;
	}

	/** @param {any} e */
	function handleIconLoad(e) {
		e.target.src = 'images/bot.png';
	}

	/**
	 * Build icon URL with proper prefix
	 * @param {string} iconUrl
	 * @returns {string}
	 */
	function buildIconUrl(iconUrl) {
		if (!iconUrl) return 'images/bot.png';
		if (iconUrl.startsWith('http')) return iconUrl;
		if (iconUrl.startsWith('data:')) return iconUrl; // Base64 预览图片
		return buildUrl(PUBLIC_SERVICE_URL, iconUrl).href;
	}

	async function handleSaveAgent() {
		if (!agentName.trim()) {
			Swal.fire({
				title: $_('common.error'),
				text: $_('workspace.agents.create.name_required_error'),
				icon: 'error'
			});
			return;
		}

		isLoading = true;
		try {
			// 如果有选择的图标文件，先上传图标
			let finalIconUrl = agentIconUrl;
			if (selectedIconFile) {
				try {
					const uploadedIconUrl = await uploadAgentIcon(agentId, selectedIconFile);
					if (uploadedIconUrl) {
						finalIconUrl = uploadedIconUrl;
					}
				} catch (iconError) {
					console.error('Error uploading agent icon:', iconError);
					await Swal.fire({
						title: $_('common.warning'),
						text: 'Icon upload failed, but agent will be updated without new icon.',
						icon: 'warning'
					});
				}
			}

			const updatedAgent = {
				...agent,
				id: agent?.id || agentId,
				name: agentName.trim(),
				description: agentDescription.trim(),
				instruction: agentInstruction.trim(),
				is_public: isPublic,
				disabled: !isEnabled, // enabled 映射到 disabled 字段
				icon_url: finalIconUrl,
				llm_config: {
					is_inherit: agent?.llm_config?.is_inherit || false,
					provider: agent?.llm_config?.provider || null,
					model: agent?.llm_config?.model || null,
					temperature: temperature,
					max_output_tokens: maxTokens === null ? null : maxTokens,
					max_recursion_depth: maxRecursionDepth
				}
			};

			await saveAgent(/** @type {import('$agentTypes').AgentModel} */ (updatedAgent));
			
			// 更新当前agent数据和图标URL
			agentIconUrl = finalIconUrl;
			selectedIconFile = null;
			
			hasChanges = false;
			isComplete = true;
			setTimeout(() => { isComplete = false; }, 2000);
			
		} catch (error) {
			console.error('Failed to update agent:', error);
			await Swal.fire({
				title: $_('workspace.agents.create.create_error_title'),
				text: $_('workspace.agents.edit.update_failed'),
				icon: 'error'
			});
		} finally {
			isLoading = false;
		}
	}

	function handleInputChange() {
		hasChanges = true;
	}

	/**
	 * @param {Event} event
	 */
	function handleMaxTokensChange(event) {
		const target = /** @type {HTMLInputElement} */ (event.target);
		if (!target) return;
		
		const value = target.value;
		if (value === '' || value === null || value === undefined) {
			maxTokens = null;
		} else {
			const numValue = parseInt(value);
			if (!isNaN(numValue) && numValue > 0 && numValue <= 4096) {
				maxTokens = numValue;
			} else if (!isNaN(numValue) && numValue > 4096) {
				maxTokens = 4096;
				target.value = '4096';
			} else {
				// 如果输入无效值，重置为 null
				maxTokens = null;
				target.value = '';
			}
		}
		hasChanges = true;
	}

	function getAgentTypeDisplay() {
		if (!agent) return '';
		if (agent.is_router) {
			return $_('workspace.agents.routing_agent');
		}
		return $_('workspace.agents.task_agent');
	}

	function chatWithAgent() {
		goto(`/workspace/chat/${agentId}/new`);
	}

	function manageGroup() {
		if (agent?.is_router) {
			goto(`/workspace/agents/${agentId}/group`);
		}
	}
</script>

<HeadTitle title={`${$_('workspace.agents.actions.edit')} - ${agent?.name || ''}`} />

<LoadingToComplete {isLoading} {isComplete} successText={$_('workspace.agents.edit.update_success')} />

<div class="edit-agent" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="edit-header" in:fly={{ y: -20, duration: 500 }}>
		<div class="header-content">
			<div class="header-left">
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
					<h1 class="page-title">
						{$_('workspace.agents.actions.edit')}
						{#if agent}
							- {agent.name}
						{/if}
					</h1>
					<p class="page-subtitle">{$_('workspace.agents.edit.subtitle')}</p>
				</div>
			</div>
			<div class="header-actions">
				{#if agent && !agent.is_router}
					<Button 
						color="outline-primary" 
						size="sm"
						on:click={chatWithAgent}
						class="me-2"
					>
						<i class="fas fa-comments me-2"></i>
						{$_('workspace.agents.actions.chat')}
					</Button>
				{/if}
				{#if agent?.is_router}
					<Button 
						color="outline-info" 
						size="sm"
						on:click={manageGroup}
						class="me-2"
					>
						<i class="fas fa-cog me-2"></i>
						{$_('workspace.agents.actions.manage_group')}
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Content -->
	{#if agent}
		<div class="edit-content" in:fly={{ y: 30, duration: 500, delay: 200 }}>
			<Row>
				<!-- Agent Info -->
				<Col lg="4">
					<Card class="agent-info">
						<CardBody>
							<div class="agent-header">
								<div class="agent-avatar">
									<FileDropZone
										accept="image/*"
										disableDefaultStyles
										containerStyles={'width: 100%; height: 100%;'}
										noDrag
										multiple={false}
										fileLimit={1}
										maxSize={fileMaxSize}
										on:drop={(e) => handleIconDrop(e)}
									>
										<div class="avatar-content">
											<img
												src={buildIconUrl(agentIconUrl)}
												alt="Agent Icon"
												class="agent-icon-image"
												on:error={(e) => handleIconLoad(e)}
											/>
											<div class="icon-overlay">
												<i class="fas fa-camera"></i>
											</div>
										</div>
									</FileDropZone>
								</div>
								<div class="agent-details">
									<h5 class="agent-name">{agent.name}</h5>
									<Badge color={agent.is_router ? 'success' : 'primary'} class="type-badge">
										{getAgentTypeDisplay()}
									</Badge>
									<small class="text-muted icon-upload-hint">
										<i class="fas fa-info-circle me-1"></i>
										Click to upload new icon
									</small>
								</div>
							</div>
							
							<div class="agent-stats">
								<div class="stat-item">
									<span class="stat-label">{$_('workspace.agents.edit.created_time')}</span>
									<span class="stat-value">
										{new Date(agent.created_datetime).toLocaleDateString()}
									</span>
								</div>
								{#if agent.updated_datetime}
									<div class="stat-item">
										<span class="stat-label">{$_('workspace.agents.edit.updated_time')}</span>
										<span class="stat-value">
											{new Date(agent.updated_datetime).toLocaleDateString()}
										</span>
									</div>
								{/if}
								<div class="stat-item">
									<span class="stat-label">{$_('workspace.agents.edit.status')}</span>
									<span class="stat-value">
										<Badge color={isEnabled ? 'success' : 'secondary'}>
											{isEnabled ? $_('workspace.agents.edit.enabled') : $_('workspace.agents.edit.disabled')}
										</Badge>
									</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				<!-- Edit Form -->
				<Col lg="8">
					<Card class="edit-form">
						<CardBody>
							{#if hasChanges}
								<Alert color="warning" class="mb-4">
									<i class="fas fa-exclamation-triangle me-2"></i>
									{$_('workspace.agents.edit.unsaved_changes')}
								</Alert>
							{/if}

							<form on:submit|preventDefault={handleSaveAgent}>
								<!-- Basic Information -->
								<div class="section-header mb-4">
									<h5 class="section-title">
										<i class="fas fa-info-circle me-2"></i>
										{$_('workspace.agents.create.basic_info')}
									</h5>
								</div>

								<Row>
									<Col md="6">
										<FormGroup class="mb-3">
											<Label for="agentName" class="fw-bold">
												{$_('workspace.agents.create.name')} <span class="text-danger">*</span>
											</Label>
											<Input
												type="text"
												id="agentName"
												bind:value={agentName}
												placeholder={$_('workspace.agents.create.name_placeholder')}
												required
												maxlength={50}
												on:input={handleInputChange}
											/>
										</FormGroup>
									</Col>
									<Col md="6">
										<FormGroup class="mb-3">
											<Label class="fw-bold">{$_('workspace.agents.edit.status')}</Label>
											<div class="form-check form-switch">
												<Input
													type="switch"
													id="isEnabled"
													bind:checked={isEnabled}
													on:change={handleInputChange}
												/>
												<Label for="isEnabled" class="form-check-label">
													{isEnabled ? $_('workspace.agents.edit.enabled') : $_('workspace.agents.edit.disabled')}
												</Label>
											</div>
										</FormGroup>
									</Col>
								</Row>

								<FormGroup class="mb-3">
									<Label for="agentDescription" class="fw-bold">
										{$_('workspace.agents.create.description')}
									</Label>
									<Input
										type="textarea"
										id="agentDescription"
										bind:value={agentDescription}
										placeholder={$_('workspace.agents.create.description_placeholder')}
										rows={3}
										maxlength={200}
										on:input={handleInputChange}
									/>
								</FormGroup>

								<FormGroup class="mb-4">
									<Label for="agentInstruction" class="fw-bold">
										{$_('workspace.agents.create.instruction')}
									</Label>
									<Input
										type="textarea"
										id="agentInstruction"
										bind:value={agentInstruction}
										placeholder={$_('workspace.agents.create.instruction_placeholder')}
										rows={4}
										maxlength={500}
										on:input={handleInputChange}
									/>
								</FormGroup>

								<!-- Advanced Settings -->
								<div class="section-header mb-4 mt-5">
									<h5 class="section-title">
										<i class="fas fa-cogs me-2"></i>
										{$_('workspace.agents.create.advanced')}
									</h5>
								</div>

								<Row>
									<Col md="4">
										<FormGroup class="mb-3">
											<Label for="temperature" class="fw-bold">
												{$_('workspace.agents.create.temperature')}
											</Label>
											<Input
												type="range"
												id="temperature"
												bind:value={temperature}
												min="0"
												max="2"
												step="0.1"
												on:input={handleInputChange}
											/>
											<div class="range-value">
												{temperature}
											</div>
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup class="mb-3">
											<Label for="maxTokens" class="fw-bold">
												{$_('workspace.agents.create.max_tokens')}
											</Label>
											<Input
												type="number"
												id="maxTokens"
												bind:value={maxTokens}
												placeholder="1024"
												min="1"
												max="4096"
												on:input={handleMaxTokensChange}
												on:blur={handleMaxTokensChange}
											/>
											<div class="field-hint">
												{$_('workspace.agents.create.max_tokens_hint')} (1-4096, {$_('workspace.agents.create.optional')})
											</div>
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup class="mb-3">
											<Label for="maxRecursionDepth" class="fw-bold">
												{$_('workspace.agents.create.max_recursion_depth')}
											</Label>
											<Input
												type="number"
												id="maxRecursionDepth"
												bind:value={maxRecursionDepth}
												min="1"
												max="50"
												step="1"
												on:input={handleInputChange}
											/>
										</FormGroup>
									</Col>
								</Row>

								<FormGroup class="mb-4">
									<div class="form-check">
										<Input
											type="checkbox"
											id="isPublic"
											bind:checked={isPublic}
											on:change={handleInputChange}
										/>
										<Label for="isPublic" class="form-check-label">
											{$_('workspace.agents.create.public_agent')}
										</Label>
									</div>
								</FormGroup>

								<!-- Actions -->
								<div class="form-actions">
									<Button
										type="button"
										color="light"
										on:click={goBack}
										disabled={isLoading}
										class="me-2"
									>
										{$_('common.cancel')}
									</Button>
									<Button
										type="submit"
										color="primary"
										disabled={isLoading || !agentName.trim() || !hasChanges}
									>
										{#if isLoading}
											<i class="fas fa-spinner fa-spin me-2"></i>
											{$_('workspace.agents.edit.saving')}
										{:else}
											<i class="fas fa-save me-2"></i>
											{$_('common.save')}
										{/if}
									</Button>
								</div>
							</form>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</div>
	{/if}
</div>

<style>
	.edit-agent {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.edit-header {
		margin-bottom: 3rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0;
		color: #2d3748;
	}

	.page-subtitle {
		color: #718096;
		margin: 0.5rem 0 0 0;
		font-size: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	:global(.agent-info) {
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border: 1px solid #b3e5fc;
	}

	.agent-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.agent-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.agent-avatar:hover {
		transform: scale(1.05);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
	}

	.avatar-content {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.agent-icon-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.icon-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: 50%;
		font-size: 1rem;
		color: white;
	}

	.agent-avatar:hover .icon-overlay {
		opacity: 1;
	}

	.icon-upload-hint {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.75rem;
	}

	.agent-details {
		flex: 1;
	}

	.agent-name {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #2d3748;
	}

	.agent-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.stat-item:last-child {
		border-bottom: none;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #4a5568;
		font-weight: 500;
	}

	.stat-value {
		font-size: 0.875rem;
		color: #2d3748;
	}

	.section-header {
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.75rem;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.range-value {
		text-align: center;
		font-size: 0.875rem;
		color: #4a5568;
		margin-top: 0.25rem;
	}

	.field-hint {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	@media (max-width: 768px) {
		.edit-agent {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.header-actions {
			width: 100%;
			justify-content: flex-end;
		}

		.agent-header {
			flex-direction: column;
			text-align: center;
		}

		.form-actions {
			flex-direction: column-reverse;
		}
	}
</style>

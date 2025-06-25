<script>
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Card, CardBody, Col, Row, Input, FormGroup, Label } from '@sveltestrap/sveltestrap';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import { createAgent } from '$lib/services/agent-service.js';
	import { AgentType } from '$lib/helpers/enums';
	import Swal from 'sweetalert2';

	/** @type {boolean} */
	let isLoading = false;

	/** @type {boolean} */
	let isComplete = false;

	/** @type {string} */
	let agentName = '';

	/** @type {string} */
	let agentDescription = '';

	/** @type {string} */
	let agentInstruction = '';

	/** @type {boolean} */
	let isPublic = false;

	function goBack() {
		goto('/workspace/agents/create');
	}

	async function handleCreateAgent() {
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
			const newAgent = {
				name: agentName.trim(),
				description: agentDescription.trim() || $_('workspace.agents.create.single_description'),
				instruction: agentInstruction.trim() || $_('workspace.agents.create.instruction_placeholder'),
				isPublic: isPublic
			};

			// @ts-ignore
			const createdAgent = await createAgent(newAgent);
			
			// 先停止加载状态
			isLoading = false;
			
			// 设置完成状态，显示成功动画
			isComplete = true;
			
			// 等待一小段时间让用户看到成功动画
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// 重置完成状态
			isComplete = false;
			
			// 显示成功弹窗
			await Swal.fire({
				title: $_('workspace.agents.create.create_success_title'),
				text: $_('workspace.agents.create.create_success_message'),
				icon: 'success'
			});

			// 跳转到智能体列表页
			goto(`/workspace/agents`);
		} catch (error) {
			console.error('Error creating agent:', error);
			isLoading = false;
			isComplete = false;
			await Swal.fire({
				title: $_('workspace.agents.create.create_error_title'),
				text: $_('workspace.agents.create.create_error_message'),
				icon: 'error'
			});
		}
	}
</script>

<HeadTitle title={$_('workspace.agents.create.single')} />

<div class="create-single-agent" in:fade={{ duration: 300 }}>
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
				<h1 class="page-title">{$_('workspace.agents.create.single')}</h1>
				<p class="page-subtitle">{$_('workspace.agents.create.single_description')}</p>
			</div>
		</div>
	</div>

	<!-- Loading -->
	<LoadingToComplete {isLoading} {isComplete} successText={$_('workspace.agents.create.create_success_message')} />

	<!-- Form -->
	<div class="form-container" in:fly={{ y: 30, duration: 500, delay: 200 }}>
		<Row class="justify-content-center">
			<Col lg="8" xl="6">
				<Card>
					<CardBody class="p-4">
						<div class="form-icon">
							<div class="icon-wrapper">
								<i class="fas fa-robot"></i>
							</div>
							<h4 class="text-center mb-4">{$_('workspace.agents.create.single')}</h4>
						</div>

						<form on:submit|preventDefault={handleCreateAgent}>
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
								/>
								<small class="text-muted">{$_('workspace.agents.create.name_hint')}</small>
							</FormGroup>

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
								/>
								<small class="text-muted">{$_('workspace.agents.create.description_hint')}</small>
							</FormGroup>

							<FormGroup class="mb-3">
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
								/>
								<small class="text-muted">{$_('workspace.agents.create.instruction_description')}</small>
							</FormGroup>

							<FormGroup class="mb-4">
								<div class="form-check">
									<Input
										type="checkbox"
										id="isPublic"
										bind:checked={isPublic}
										class="form-check-input"
									/>
									<Label for="isPublic" class="form-check-label">
										{$_('workspace.agents.create.public_agent')}
									</Label>
								</div>
								<small class="text-muted">{$_('workspace.agents.create.public_agent_hint')}</small>
							</FormGroup>

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
									disabled={isLoading || !agentName.trim()}
								>
									{#if isLoading}
										<i class="fas fa-spinner fa-spin me-2"></i>
										{$_('workspace.agents.create.creating')}
									{:else}
										<i class="fas fa-plus me-2"></i>
										{$_('workspace.agents.create.create_agent')}
									{/if}
								</Button>
							</div>
						</form>
					</CardBody>
				</Card>
			</Col>
		</Row>
	</div>
</div>

<style>
	.create-single-agent {
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

	.form-container {
		min-height: 400px;
	}

	.form-icon {
		text-align: center;
		margin-bottom: 2rem;
	}

	.icon-wrapper {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		color: white;
		margin: 0 auto 1rem auto;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
	}

	@media (max-width: 768px) {
		.create-single-agent {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.form-actions {
			flex-direction: column-reverse;
		}
	}
</style>

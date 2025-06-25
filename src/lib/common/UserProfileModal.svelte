<script>
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Modal, ModalBody, ModalHeader, Button, Row, Col } from '@sveltestrap/sveltestrap';
	import { _ } from 'svelte-i18n';
	import { userStore } from '$lib/helpers/store';
	import { PUBLIC_SERVICE_URL, PUBLIC_BRAND_NAME } from '$env/static/public';
	import { buildUrl } from '$lib/helpers/utils/common';

	export let isOpen = false;
	/** @type {import('$userTypes').UserModel | null} */
	export let user = null;

	const dispatch = createEventDispatcher();

	function close() {
		isOpen = false;
		dispatch('close');
	}

	/** @param {any} e */
	function handleAvatarLoad(e) {
		e.target.src = '/images/users/user-dummy.jpg';
	}
</script>

<Modal {isOpen} toggle={close} size="lg" class="user-profile-modal">
	<ModalHeader toggle={close} class="modal-header-gradient">
		<div class="modal-title-content">
			<i class="fas fa-user-circle me-2"></i>
			{$_('User Profile')}
		</div>
	</ModalHeader>
	<ModalBody class="p-0">
		{#if user}
			<div class="profile-modal-content" in:fade={{ duration: 300 }}>
				<!-- Profile Header -->
				<div class="profile-header-section">
					<div class="profile-gradient-bg">
						<div class="profile-info-container">
							<div class="avatar-section">
								<div class="avatar-wrapper-large">
									<img
										src={`${
											user?.avatar && $userStore?.token
												? `${buildUrl(PUBLIC_SERVICE_URL, user?.avatar).href}?access_token=${$userStore?.token}`
												: ''
										}`}
										alt="User Avatar"
										class="user-avatar-large"
										on:error={(e) => handleAvatarLoad(e)}
									/>
								</div>
							</div>
							<div class="user-info-section">
								<h3 class="user-name">{user?.full_name || 'N/A'}</h3>
								<p class="user-role">
									<i class="fas fa-user-tag me-1"></i>
									{user?.role || 'Member'}
								</p>
								<div class="brand-info">
									<small class="text-white-50">{PUBLIC_BRAND_NAME}</small>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Profile Details -->
				<div class="profile-details-section p-4">
					<Row>
						<Col md={6} class="mb-3">
							<div class="detail-item">
								<div class="detail-icon">
									<i class="fas fa-envelope text-primary"></i>
								</div>
								<div class="detail-content">
									<div class="detail-label">{$_('Email')}</div>
									<div class="detail-value">{user?.email || 'N/A'}</div>
								</div>
							</div>
						</Col>
						<Col md={6} class="mb-3">
							<div class="detail-item">
								<div class="detail-icon">
									<i class="fas fa-calendar-plus text-success"></i>
								</div>
								<div class="detail-content">
									<div class="detail-label">{$_('Member since')}</div>
									<div class="detail-value">
										{user?.create_date ? new Date(user?.create_date).toLocaleDateString() : 'N/A'}
									</div>
								</div>
							</div>
						</Col>
						<Col md={6} class="mb-3">
							<div class="detail-item">
								<div class="detail-icon">
									<i class="fas fa-edit text-warning"></i>
								</div>
								<div class="detail-content">
									<div class="detail-label">{$_('Last Updated')}</div>
									<div class="detail-value">
										{user?.update_date ? new Date(user?.update_date).toLocaleDateString() : 'N/A'}
									</div>
								</div>
							</div>
						</Col>
						<Col md={6} class="mb-3">
							<div class="detail-item">
								<div class="detail-icon">
									<i class="fas fa-id-card text-info"></i>
								</div>
								<div class="detail-content">
									<div class="detail-label">{$_('User ID')}</div>
									<div class="detail-value">{user?.id || 'N/A'}</div>
								</div>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		{/if}
	</ModalBody>
</Modal>

<style>
	:global(.user-profile-modal .modal-content) {
		border: none;
		border-radius: 12px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	:global(.user-profile-modal .modal-header-gradient) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		color: white;
		padding: 1.5rem;
	}

	:global(.user-profile-modal .modal-header-gradient .btn-close) {
		filter: invert(1);
		opacity: 0.8;
	}

	.modal-title-content {
		font-size: 1.2rem;
		font-weight: 600;
		display: flex;
		align-items: center;
	}

	.profile-modal-content {
		background: white;
	}

	.profile-header-section {
		position: relative;
		overflow: hidden;
	}

	.profile-gradient-bg {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem 2rem 3rem;
	}

	.profile-info-container {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.avatar-section {
		flex-shrink: 0;
	}

	.avatar-wrapper-large {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		overflow: hidden;
		border: 4px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
	}

	.user-avatar-large {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-info-section {
		flex: 1;
		color: white;
	}

	.user-name {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: white;
	}

	.user-role {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.5rem;
		display: flex;
		align-items: center;
	}

	.brand-info {
		margin-top: 0.5rem;
	}

	.profile-details-section {
		background: #f8f9fa;
	}

	.detail-item {
		display: flex;
		align-items: center;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		border: 1px solid #e9ecef;
		transition: all 0.2s ease;
	}

	.detail-item:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.detail-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.detail-icon i {
		font-size: 1.2rem;
	}

	.detail-content {
		flex: 1;
	}

	.detail-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}

	.detail-value {
		font-size: 0.95rem;
		font-weight: 500;
		color: #2c3e50;
	}
</style>

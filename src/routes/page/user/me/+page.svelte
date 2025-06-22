<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { PUBLIC_BRAND_NAME } from '$env/static/public';
	import {
		Row,
		Col,
		Card,
		CardBody,
		CardTitle,
		Table,
		Button,
		Badge
	} from '@sveltestrap/sveltestrap';
	import Breadcrumb from '$lib/common/Breadcrumb.svelte';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import FileDropZone from '$lib/common/FileDropZone.svelte';
	import { myInfo, uploadUserAvatar } from '$lib/services/auth-service';
	import { _ } from 'svelte-i18n';
	import { userStore } from '$lib/helpers/store';
	import { PUBLIC_SERVICE_URL } from '$env/static/public';
	import { buildUrl } from '$lib/helpers/utils/common';

	/** @type {import('$userTypes').UserModel} */
	let currentUser;
	let isLoading = false;
	let mounted = false;

	const fileMaxSize = 10 * 1024 * 1024;
	onMount(async () => {
		mounted = true;
		isLoading = true;
		await myInfo()
			.then((data) => {
				currentUser = data;
			})
			.finally(() => {
				isLoading = false;
			});
	});

	/** @param {any} e */
	async function handleFileDrop(e) {
		const { acceptedFiles } = e.detail;
		const file = acceptedFiles[0];
		if (!!!file) return;

		await uploadUserAvatar(file);
		window.location.reload();
	}

	/** @param {any} e */
	function handleAvatarLoad(e) {
		e.target.src = 'images/users/user-dummy.jpg';
	}
</script>

<HeadTitle title={$_('My Profile')} />

<!-- Modern Profile Background -->
<div class="profile-background">
	<div class="profile-particles"></div>
</div>

<div class="profile-container">
	{#if mounted}
		<div in:fade={{ duration: 600 }}>
			<Breadcrumb title={$_('Home')} pagetitle={$_('My Profile')} />
		</div>
	{/if}	<Row class="profile-main-row">
		<Col xl={12} lg={12} md={12} class="profile-unified-col">
			{#if mounted}
				<div in:fly={{ y: 50, duration: 800, delay: 200 }} class="unified-card-container">
					<!-- Unified Profile Card -->
					<Card class="overflow-hidden modern-unified-card">
						<!-- Header with gradient background -->
						<div class="profile-card-gradient">
							<div class="gradient-content">
								<div class="profile-header-left">
									<div class="profile-badge">
										<i class="fas fa-user-circle me-2"></i>
										{$_('My Profile')}
									</div>
									<h5 class="text-white mb-2 profile-title">{$_('Welcome Back !')}</h5>
									<p class="profile-brand">{PUBLIC_BRAND_NAME}</p>
								</div>
								<div class="profile-header-right">
									<div class="profile-decoration">
										<i class="fas fa-user-edit profile-icon"></i>
									</div>
								</div>
							</div>
						</div>

						<CardBody class="pt-4 pb-4">
							<!-- Profile Section -->
							<Row class="align-items-center mb-4">
								<Col md={3} sm={4} class="text-center">
									<div class="avatar-container mb-3">
										<FileDropZone
											accept="image/*"
											disableDefaultStyles
											containerStyles={'width: 100%; height: 100%;'}
											noDrag
											multiple={false}
											fileLimit={1}
											maxSize={fileMaxSize}
											on:drop={(e) => handleFileDrop(e)}
										>
											<div class="avatar-wrapper">
												<img
													src={`${
														currentUser?.avatar && $userStore?.token
															? `${buildUrl(PUBLIC_SERVICE_URL, currentUser?.avatar).href}?access_token=${$userStore?.token}`
															: ''
													}`}
													alt=""
													class="img-thumbnail rounded-circle avatar-image"
													on:error={(e) => handleAvatarLoad(e)}
												/>
												<div class="avatar-overlay">
													<i class="fas fa-camera"></i>
												</div>
											</div>
										</FileDropZone>
									</div>
									<div class="avatar-upload-hint">
										<small class="text-muted">
											<i class="fas fa-info-circle me-1"></i>
											{$_('Click to upload new avatar')}
										</small>
									</div>
								</Col>
								<Col md={9} sm={8}>
									<div class="profile-info">
										<h4 class="profile-name mb-3">{currentUser?.full_name || 'N/A'}</h4>
										<Row class="profile-stats">
											<Col sm={6} class="mb-3">
												<div class="stat-item">
													<div class="stat-icon">
														<i class="fas fa-user-tag text-primary"></i>
													</div>
													<div class="stat-content">
														<div class="stat-label">{$_('Role')}</div>
														<div class="stat-value">{currentUser?.role || 'Member'}</div>
													</div>
												</div>
											</Col>
											<Col sm={6} class="mb-3">
												<div class="stat-item">
													<div class="stat-icon">
														<i class="fas fa-envelope text-success"></i>
													</div>
													<div class="stat-content">
														<div class="stat-label">{$_('Email')}</div>
														<div class="stat-value">{currentUser?.email || 'N/A'}</div>
													</div>
												</div>
											</Col>
											<Col sm={6} class="mb-3">
												<div class="stat-item">
													<div class="stat-icon">
														<i class="fas fa-calendar-plus text-info"></i>
													</div>
													<div class="stat-content">
														<div class="stat-label">{$_('Member since')}</div>
														<div class="stat-value">
															{currentUser?.create_date
																? new Date(currentUser?.create_date).toLocaleDateString()
																: 'N/A'}
														</div>
													</div>
												</div>
											</Col>
											<Col sm={6} class="mb-3">
												<div class="stat-item">
													<div class="stat-icon">
														<i class="fas fa-edit text-warning"></i>
													</div>
													<div class="stat-content">
														<div class="stat-label">{$_('Last Updated')}</div>
														<div class="stat-value">
															{currentUser?.update_date
																? new Date(currentUser?.update_date).toLocaleDateString()
																: 'N/A'}
														</div>
													</div>
												</div>
											</Col>
										</Row>
									</div>
								</Col>
							</Row>

							<!-- Divider -->
							<hr class="profile-divider" />

							<!-- Detailed Information Section -->
							<div class="detailed-info-section">
								<div class="section-header mb-4">
									<div class="section-title-wrapper">
										<div class="section-icon">
											<i class="fas fa-id-card text-primary"></i>
										</div>
										<div class="section-content">
											<h5 class="section-title mb-1">{$_('Detailed Information')}</h5>
											<p class="text-muted mb-0 section-subtitle">
												{$_('Your complete account details and information')}
											</p>
										</div>
									</div>
								</div>

								<Row class="info-details-grid">
									<Col lg={6} class="mb-3">
										<div class="detail-item">
											<div class="detail-label">
												<i class="fas fa-user text-info me-2"></i>
												{$_('First Name')}
											</div>
											<div class="detail-value">
												{currentUser?.first_name || 'N/A'}
											</div>
										</div>
									</Col>

									<Col lg={6} class="mb-3">
										<div class="detail-item">
											<div class="detail-label">
												<i class="fas fa-user text-info me-2"></i>
												{$_('Last Name')}
											</div>
											<div class="detail-value">
												{currentUser?.last_name || 'N/A'}
											</div>
										</div>
									</Col>

									<Col lg={6} class="mb-3">
										<div class="detail-item">
											<div class="detail-label">
												<i class="fas fa-envelope text-success me-2"></i>
												{$_('Email Address')}
											</div>
											<div class="detail-value">
												{currentUser?.email || 'N/A'}
											</div>
										</div>
									</Col>

									<Col lg={6} class="mb-3">
										<div class="detail-item">
											<div class="detail-label">
												<i class="fas fa-link text-primary me-2"></i>
												{$_('Account Origin')}
											</div>
											<div class="detail-value">
												<Badge color="primary" class="origin-badge">
													<i class="fas fa-external-link-alt me-1"></i>
													{currentUser?.source || 'Local'}
													{#if currentUser?.external_id}
														<span class="badge-separator">•</span>
														<span class="external-id">{currentUser.external_id}</span>
													{/if}
												</Badge>
											</div>
										</div>
									</Col>

									<Col lg={6} class="mb-3">
										<div class="detail-item">
											<div class="detail-label">
												<i class="fas fa-calendar-plus text-success me-2"></i>
												{$_('Account Created')}
											</div>
											<div class="detail-value">
												{currentUser?.create_date
													? new Date(currentUser?.create_date).toLocaleString()
													: 'N/A'}
											</div>
										</div>
									</Col>

									<Col lg={6} class="mb-3">
										<div class="detail-item">
											<div class="detail-label">
												<i class="fas fa-edit text-warning me-2"></i>
												{$_('Last Updated')}
											</div>
											<div class="detail-value">
												{currentUser?.update_date
													? new Date(currentUser?.update_date).toLocaleString()
													: 'N/A'}
											</div>
										</div>
									</Col>
								</Row>
							</div>
						</CardBody>
					</Card>
				</div>
			{/if}
		</Col>
	</Row>
</div>

<style>
	/* Profile Background */
	.profile-background {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		z-index: -2;
	}

	.profile-particles {
		position: absolute;
		width: 100%;
		height: 100%;
		background-image: radial-gradient(2px 2px at 20px 30px, rgba(102, 126, 234, 0.1), transparent),
			radial-gradient(2px 2px at 40px 70px, rgba(118, 75, 162, 0.1), transparent),
			radial-gradient(1px 1px at 90px 40px, rgba(102, 126, 234, 0.15), transparent),
			radial-gradient(1px 1px at 130px 80px, rgba(118, 75, 162, 0.1), transparent);
		background-repeat: repeat;
		background-size: 150px 100px;
		animation: float 20s linear infinite;
	}

	@keyframes float {
		0% {
			transform: translate(0px, 0px);
		}
		33% {
			transform: translate(30px, -30px);
		}
		66% {
			transform: translate(-20px, 20px);
		}
		100% {
			transform: translate(0px, 0px);
		}
	}

	.profile-container {
		position: relative;
		z-index: 1;
		padding: 20px 0;
		min-height: calc(100vh - 200px);
	}

	/* Layout Structure */
	.profile-main-row {
		margin: 0 -15px;
	}

	.profile-left-col,
	.profile-right-col {
		padding: 0 15px;
		margin-bottom: 25px;
	}

	.card-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	/* Modern Profile Card */
	.modern-profile-card {
		border: none;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(20px);
		background: rgba(255, 255, 255, 0.95);
		margin-bottom: 25px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.modern-profile-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	}
	.profile-card-gradient {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
		overflow: hidden;
		min-height: 140px;
		padding: 25px 30px;
	}

	.profile-card-gradient::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
	}

	.gradient-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		z-index: 1;
		height: 100%;
	}

	.profile-header-left {
		flex: 1;
		max-width: calc(100% - 120px);
	}

	.profile-header-right {
		flex-shrink: 0;
		width: 100px;
		text-align: center;
	}

	.profile-text-col,
	.profile-image-col {
		display: flex;
		align-items: center;
		position: relative;
		z-index: 1;
	}

	.profile-badge {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		padding: 6px 14px;
		border-radius: 15px;
		font-size: 0.8rem;
		font-weight: 500;
		display: inline-block;
		margin-bottom: 10px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		white-space: nowrap;
	}

	.profile-title {
		font-size: 1.2rem;
		line-height: 1.3;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.profile-brand {
		opacity: 0.9;
		font-size: 0.9rem;
		margin-bottom: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.profile-decoration {
		text-align: center;
		padding: 15px;
	}

	.profile-icon {
		font-size: 2.5rem;
		color: rgba(255, 255, 255, 0.8);
		opacity: 0.7;
		transition: all 0.3s ease;
	}

	.profile-icon:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	/* Avatar Section */
	.avatar-container {
		position: relative;
		width: 120px;
		height: 120px;
		margin: 0 auto;
	}

	.avatar-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.avatar-wrapper:hover {
		transform: scale(1.05);
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border: 4px solid rgba(102, 126, 234, 0.2) !important;
		transition: all 0.3s ease;
	}

	.avatar-overlay {
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
		transition: all 0.3s ease;
		border-radius: 50%;
	}

	.avatar-wrapper:hover .avatar-overlay {
		opacity: 1;
	}

	.avatar-overlay i {
		color: white;
		font-size: 1.5rem;
	}

	.avatar-upload-hint {
		text-align: center;
		margin-top: 8px;
	}

	/* Profile Info */
	.profile-info {
		padding-left: 20px;
	}

	.profile-name {
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 8px;
		background: linear-gradient(45deg, #667eea, #764ba2);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.role-badge {
		font-size: 0.8rem;
		padding: 6px 12px;
		border-radius: 15px;
		font-weight: 500;
	}

	.profile-meta {
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		padding-top: 15px;
	}

	.meta-item {
		display: flex;
		align-items: center;
		font-size: 0.9rem;
	}

	/* Modern Info Card */
	.modern-info-card {
		border: none;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(20px);
		background: rgba(255, 255, 255, 0.95);
		transition: all 0.3s ease;
	}

	.modern-info-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	}

	.card-header-custom {
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding-bottom: 15px;
	}

	.card-title-wrapper {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.title-icon {
		width: 50px;
		height: 50px;
		border-radius: 15px;
		background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.card-title-modern {
		font-size: 1.3rem;
		font-weight: 600;
		color: #333;
	}

	.card-subtitle {
		font-size: 0.9rem;
	}

	/* Info Grid */
	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 20px;
		background: rgba(102, 126, 234, 0.05);
		border-radius: 12px;
		border-left: 4px solid transparent;
		transition: all 0.3s ease;
	}

	.info-row:hover {
		background: rgba(102, 126, 234, 0.1);
		border-left-color: #667eea;
		transform: translateX(5px);
	}

	.info-label {
		font-weight: 600;
		color: #555;
		display: flex;
		align-items: center;
		flex: 1;
	}

	.info-value {
		font-weight: 500;
		color: #333;
		text-align: right;
		flex: 1;
	}

	.source-badge {
		font-size: 0.8rem;
		padding: 4px 8px;
		border-radius: 8px;
	}
	/* Updated Layout Structure for Unified Design */
	.profile-unified-col {
		padding: 0 0;
		margin-bottom: 25px;
	}

	.unified-card-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 0 20px;
	}

	/* Modern Unified Card */
	.modern-unified-card {
		border: none;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(20px);
		background: rgba(255, 255, 255, 0.95);
		overflow: hidden;
		transition: all 0.3s ease;
		margin-bottom: 25px;
		width: 100%;
		max-width: none;
	}

	.modern-unified-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	}

	/* Profile Stats Section */
	.profile-stats {
		margin: 0 -10px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 15px;
		background: rgba(102, 126, 234, 0.05);
		border-radius: 12px;
		border-left: 4px solid transparent;
		transition: all 0.3s ease;
		height: 100%;
	}

	.stat-item:hover {
		background: rgba(102, 126, 234, 0.1);
		border-left-color: #667eea;
		transform: translateY(-2px);
	}

	.stat-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		flex-shrink: 0;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.8rem;
		color: #666;
		font-weight: 500;
		margin-bottom: 2px;
	}

	.stat-value {
		font-size: 0.9rem;
		font-weight: 600;
		color: #333;
		word-break: break-word;
	}

	/* Profile Divider */
	.profile-divider {
		border: none;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
		margin: 30px 0;
	}

	/* Detailed Information Section */
	.detailed-info-section {
		margin-top: 20px;
	}

	.section-header {
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding-bottom: 15px;
	}

	.section-title-wrapper {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.section-icon {
		width: 50px;
		height: 50px;
		border-radius: 15px;
		background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.section-title {
		font-size: 1.3rem;
		font-weight: 600;
		color: #333;
	}

	.section-subtitle {
		font-size: 0.9rem;
	}

	/* Info Details Grid */
	.info-details-grid {
		margin: 0 -10px;
	}

	.detail-item {
		padding: 15px 20px;
		background: rgba(102, 126, 234, 0.05);
		border-radius: 12px;
		border-left: 4px solid transparent;
		transition: all 0.3s ease;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.detail-item:hover {
		background: rgba(102, 126, 234, 0.1);
		border-left-color: #667eea;
		transform: translateY(-2px);
	}

	.detail-label {
		font-weight: 600;
		color: #555;
		display: flex;
		align-items: center;
		font-size: 0.9rem;
	}

	.detail-value {
		font-weight: 500;
		color: #333;
		font-size: 0.95rem;
		word-break: break-word;
	}

	/* Enhanced Origin Badge */
	.origin-badge {
		font-size: 0.85rem;
		padding: 8px 12px;
		border-radius: 10px;
		font-weight: 500;
		background: linear-gradient(45deg, #667eea, #764ba2) !important;
		border: none !important;
		color: white !important;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.badge-separator {
		opacity: 0.7;
		margin: 0 4px;
	}

	.external-id {
		opacity: 0.9;
		font-size: 0.8rem;
	}

	/* Profile Name Enhancement */
	.profile-name {
		font-size: 1.6rem;
		font-weight: 700;
		background: linear-gradient(45deg, #667eea, #764ba2);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Responsive Improvements */
	@media (max-width: 991px) {
		.profile-stats .col-sm-6 {
			margin-bottom: 15px;
		}

		.stat-item {
			padding: 12px;
		}

		.detail-item {
			padding: 12px 15px;
		}
	}

	@media (max-width: 767px) and (min-width: 576px) {
		.profile-title {
			font-size: 1.1rem;
		}
		
		.unified-card-container {
			padding: 0 15px;
		}
	}

	@media (max-width: 575px) {
		.profile-card-gradient {
			padding: 20px 15px;
			min-height: 120px;
		}
		
		.profile-header-right {
			width: 80px;
		}
		
		.profile-header-left {
			max-width: calc(100% - 90px);
		}
		
		.profile-title {
			font-size: 1rem;
		}
		
		.profile-brand {
			font-size: 0.8rem;
		}
		
		.profile-badge {
			font-size: 0.7rem;
			padding: 4px 10px;
		}
		
		.profile-icon {
			font-size: 2rem;
		}
		
		.unified-card-container {
			padding: 0 10px;
		}
	}

	/* Loading States */
	.card-container.loading {
		opacity: 0.7;
		pointer-events: none;
	}

	/* Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.modern-unified-card {
		animation: fadeInUp 0.6s ease-out;
	}
</style>

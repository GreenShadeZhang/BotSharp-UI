<!-- OIDC Authentication Callback Page -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { handleCallback } from '$lib/services/oidc-auth-service.js';
	import Loader from '$lib/common/Loader.svelte';
	import { _ } from 'svelte-i18n';

	let loading = true;
	/** @type {string | null} */
	let error = null;
	let message = '';
	let showContent = false;
	let progress = 0;

	// 延迟显示内容，避免闪烁
	setTimeout(() => {
		showContent = true;
	}, 200);

	// 模拟进度条
	function updateProgress() {
		const interval = setInterval(() => {
			if (progress < 90 && loading && !error) {
				progress += Math.random() * 15;
			} else {
				clearInterval(interval);
			}
		}, 300);
	}

	onMount(async () => {
		// 初始化消息和进度
		message = $_('auth.callback.processing');
		updateProgress();

		try {
			// Get code and state from URL parameters
			const urlParams = $page.url.searchParams;
			const code = urlParams.get('code');
			const state = urlParams.get('state');
			const errorParam = urlParams.get('error');
			const errorDescription = urlParams.get('error_description');

			if (errorParam) {
				throw new Error(errorDescription || errorParam);
			}

			if (!code || !state) {
				throw new Error($_('auth.callback.missing_params'));
			}

			message = $_('auth.callback.exchanging_tokens');
			progress = 50;
			
			// Handle the callback
			const success = await handleCallback(code, state);
			
			if (success) {
				message = $_('auth.callback.success');
				progress = 100;
				setTimeout(() => {
					goto('/', { replaceState: true });
				}, 1500);
			} else {
				throw new Error($_('auth.callback.failed_complete'));
			}
		} catch (err) {
			console.error('Authentication callback error:', err);
			error = err instanceof Error ? err.message : 'Unknown error occurred';
			loading = false;
			progress = 0;
		}
	});
</script>

<svelte:head>
	<title>{$_('auth.callback.title')} - BotSharp</title>
</svelte:head>

{#if showContent}
	<div class="auth-callback">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-md-6 col-lg-5 col-xl-4">
					<div class="auth-card">
						<!-- Logo和标题 -->
						<div class="auth-header text-center mb-4">
							<div class="logo-container">
								<img src="/images/logo.png" alt="BotSharp" class="logo" />
								<div class="logo-glow"></div>
							</div>
							<h4 class="auth-title mt-3">{$_('auth.callback.title')}</h4>
						</div>

						<!-- 加载状态 -->
						{#if loading && !error}
							<div class="loading-container text-center">
								<div class="loader-wrapper">
									<Loader />
									<div class="loader-overlay"></div>
								</div>
								
								<!-- 进度条 -->
								<div class="progress-container mt-4">
									<div class="progress">
										<div 
											class="progress-bar" 
											style="width: {progress}%"
											role="progressbar"
											aria-valuenow={progress}
											aria-valuemin="0"
											aria-valuemax="100"
										></div>
									</div>
								</div>

								<!-- 状态消息 -->
								<div class="status-message">
									<p class="message mt-3">{message}</p>
									<div class="dots">
										<span class="dot"></span>
										<span class="dot"></span>
										<span class="dot"></span>
									</div>
								</div>
							</div>
						{/if}

						<!-- 错误状态 -->
						{#if error}
							<div class="error-container">
								<div class="alert alert-danger">
									<div class="error-icon">
										<i class="fas fa-exclamation-triangle"></i>
									</div>
									<div class="error-content">
										<strong>{$_('auth.callback.failed')}</strong>
										<p class="mb-0 mt-2">{error}</p>
									</div>
								</div>
								<div class="text-center mt-4">
									<a href="/" class="btn btn-primary btn-lg">
										<i class="fas fa-home me-2"></i>
										{$_('auth.callback.return_home')}
									</a>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- 背景装饰 -->
		<div class="background-decoration">
			<div class="floating-shape shape-1"></div>
			<div class="floating-shape shape-2"></div>
			<div class="floating-shape shape-3"></div>
		</div>
	</div>
{/if}

<style>
	.auth-callback {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem 0;
		position: relative;
		overflow: hidden;
	}

	.auth-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 20px;
		padding: 3rem 2.5rem;
		box-shadow: 
			0 20px 60px rgba(0, 0, 0, 0.15),
			0 8px 32px rgba(102, 126, 234, 0.1);
		max-width: 440px;
		margin: 0 auto;
		position: relative;
		animation: slideUp 0.6s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.auth-header {
		position: relative;
	}

	.logo-container {
		position: relative;
		display: inline-block;
	}

	.logo {
		height: 72px;
		width: auto;
		position: relative;
		z-index: 2;
		transition: transform 0.3s ease;
	}

	.logo-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100px;
		height: 100px;
		background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.7;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.1);
			opacity: 1;
		}
	}

	.auth-title {
		color: #2d3748;
		font-weight: 600;
		font-size: 1.5rem;
		margin: 0;
	}

	.loading-container {
		position: relative;
	}

	.loader-wrapper {
		position: relative;
		display: inline-block;
		padding: 1rem;
	}

	.loader-overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80px;
		height: 80px;
		border: 3px solid rgba(102, 126, 234, 0.1);
		border-radius: 50%;
		border-top-color: #667eea;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}

	.progress-container {
		margin: 1.5rem 0;
	}

	.progress {
		height: 8px;
		background-color: rgba(102, 126, 234, 0.1);
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 4px;
		transition: width 0.3s ease;
		position: relative;
	}

	.progress-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.4),
			transparent
		);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.status-message {
		position: relative;
	}

	.message {
		color: #4a5568;
		font-size: 0.95rem;
		font-weight: 500;
		margin: 0;
		line-height: 1.5;
	}

	.dots {
		display: inline-flex;
		gap: 4px;
		margin-left: 8px;
	}

	.dot {
		width: 6px;
		height: 6px;
		background-color: #667eea;
		border-radius: 50%;
		animation: bounce 1.4s ease-in-out infinite both;
	}

	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }

	@keyframes bounce {
		0%, 80%, 100% {
			transform: scale(0);
		} 
		40% {
			transform: scale(1);
		}
	}

	.error-container {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.alert {
		border: none;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background-color: #fed7d7;
		border-left: 4px solid #e53e3e;
	}

	.error-icon {
		flex-shrink: 0;
	}

	.error-icon i {
		font-size: 1.25rem;
		color: #e53e3e;
	}

	.error-content {
		flex: 1;
	}

	.error-content strong {
		color: #c53030;
		font-weight: 600;
	}

	.error-content p {
		color: #744210;
		margin: 0.5rem 0 0 0;
	}

	.btn {
		border-radius: 12px;
		padding: 0.875rem 2rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		border: none;
		font-size: 0.95rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
	}

	.btn:active {
		transform: translateY(0);
	}

	/* 背景装饰 */
	.background-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.floating-shape {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		animation: float 6s ease-in-out infinite;
	}

	.shape-1 {
		width: 100px;
		height: 100px;
		top: 20%;
		left: 10%;
		animation-delay: 0s;
	}

	.shape-2 {
		width: 60px;
		height: 60px;
		top: 60%;
		right: 15%;
		animation-delay: 2s;
	}

	.shape-3 {
		width: 80px;
		height: 80px;
		bottom: 20%;
		left: 20%;
		animation-delay: 4s;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.auth-callback {
			padding: 1.5rem;
		}
		
		.auth-card {
			padding: 2rem 1.5rem;
			margin: 0 1rem;
			border-radius: 16px;
		}

		.auth-title {
			font-size: 1.25rem;
		}

		.logo {
			height: 60px;
		}

		.logo-glow {
			width: 80px;
			height: 80px;
		}
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 1.5rem 1rem;
		}

		.btn {
			padding: 0.75rem 1.5rem;
			font-size: 0.9rem;
		}
	}
</style>

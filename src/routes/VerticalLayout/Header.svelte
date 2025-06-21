<script>
	import { browser } from '$app/environment';
	import { _ } from 'svelte-i18n';
	import { Input } from '@sveltestrap/sveltestrap';
	import LanguageDropdown from '$lib/common/LanguageDropdown.svelte';
	import FullScreenDropdown from '$lib/common/FullScreenDropdown.svelte';
	import NotificationDropdown from '$lib/common/NotificationDropdown.svelte';
	import ProfileDropdown from '$lib/common/ProfileDropdown.svelte';
	import { OverlayScrollbars } from 'overlayscrollbars';
	import { PUBLIC_LOGO_URL, PUBLIC_BRAND_NAME } from '$env/static/public';
	import { globalEventStore } from '$lib/helpers/store';
	import { GlobalEvent } from '$lib/helpers/enums';	import { onMount } from 'svelte';
	import { globalNotificationManager } from '$lib/services/global-notification-manager.js';
	
	// 在开发环境下导入测试工具
	let notificationTester;
	if (import.meta.env.DEV) {
		import('$lib/services/notification-tester.js').then(module => {
			notificationTester = module.notificationTester;
		});
	}

	/** @type {any} */
	export let user;
	/** @type {() => void} */
	// Used by parent component to toggle right sidebar
	export let toggleRightBar;
	/** @type {string} */
	let searchText = '';

	onMount(() => {
		// 初始化全局通知管理器
		globalNotificationManager.initialize();
	});

	const toggleSideBar = () => {
		if (browser) {
			document.body.classList.toggle('sidebar-enable');
			document.body.classList.toggle('vertical-collpsed');
			if (document.body.classList.contains('vertical-collpsed')) {
				const menuElement = document.querySelector('#vertical-menu');
				if (menuElement) {
					// @ts-ignore
					const Instance = OverlayScrollbars(menuElement);
					if (Instance) {
						Instance.destroy();
					}
				}
			} else {
				const menuElement = document.querySelector('#vertical-menu');
				if (menuElement) {
					// @ts-ignore
					OverlayScrollbars(menuElement);
				}
			}
		}
	};

	/** @param {any} e */
	const search = (e) => {
		if (e.key !== 'Enter') return;

		globalEventStore.set({ name: GlobalEvent.Search, payload: searchText });
	};
</script>

<header id="page-topbar" class="modern-header">
	<div class="navbar-header">
		<div class="d-flex align-items-center header-left">
			<!-- Modern Brand Section -->
			<div class="modern-brand-box">
				<a href="page/dashboard" class="modern-brand-link">
					<div class="brand-logo-container">
						<img src={PUBLIC_LOGO_URL} alt="logo" class="brand-logo" />
					</div>
					<span class="brand-name">{PUBLIC_BRAND_NAME || 'BotSharp'}</span>
				</a>
			</div>

			<!-- Modern Menu Toggle -->
			<button
				type="button"
				class="modern-menu-toggle"
				id="vertical-menu-btn"
				on:click={() => toggleSideBar()}
				title="Toggle Menu"
			>
				<div class="hamburger-lines">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</button>

			<!-- Modern Search -->
			<form class="modern-search d-none d-lg-block">
				<div class="search-container">
					<i class="search-icon bx bx-search"></i>
					<Input
						type="text"
						class="modern-search-input"
						placeholder="{$_('Search')}..."
						maxlength={100}
						bind:value={searchText}
						on:keydown={(e) => search(e)}
					/>
				</div>
			</form>
		</div>

		<div class="d-flex align-items-center header-actions">
			<div class="action-item">
				<LanguageDropdown />
			</div>
			<div class="action-item">
				<FullScreenDropdown />
			</div>
			<div class="action-item">
				<NotificationDropdown />
			</div>
			<div class="action-item profile-action">
				<ProfileDropdown {user} />
			</div>
		</div>
	</div>
</header>

<style>
	/* Modern Header Styles */
	.modern-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		transition: all 0.3s ease;
	}

	.modern-header:hover {
		background: rgba(255, 255, 255, 0.98);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
	}

	.navbar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
		height: 70px;
		max-width: 100%;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex: 1;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* Modern Brand Section */
	.modern-brand-box {
		min-width: 250px;
		display: flex;
		align-items: center;
	}

	.modern-brand-link {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
		padding: 0.5rem;
		border-radius: 12px;
	}

	.modern-brand-link:hover {
		text-decoration: none;
		color: inherit;
		transform: scale(1.02);
		background: rgba(102, 126, 234, 0.05);
	}

	.brand-logo-container {
		position: relative;
		margin-right: 12px;
	}

	.brand-logo {
		height: 36px;
		width: auto;
		transition: all 0.3s ease;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
	}

	.brand-name {
		font-size: 1.4rem;
		font-weight: 700;
		background: linear-gradient(45deg, #667eea, #764ba2);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		letter-spacing: -0.02em;
	}

	/* Modern Menu Toggle */
	.modern-menu-toggle {
		background: rgba(102, 126, 234, 0.1);
		border: 1px solid rgba(102, 126, 234, 0.2);
		border-radius: 12px;
		padding: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
	}

	.modern-menu-toggle:hover {
		background: rgba(102, 126, 234, 0.15);
		border-color: rgba(102, 126, 234, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
	}

	.hamburger-lines {
		position: relative;
		width: 20px;
		height: 16px;
	}

	.hamburger-lines span {
		display: block;
		width: 100%;
		height: 2px;
		background: linear-gradient(45deg, #667eea, #764ba2);
		border-radius: 2px;
		position: absolute;
		transition: all 0.3s ease;
	}

	.hamburger-lines span:nth-child(1) {
		top: 0;
	}
	.hamburger-lines span:nth-child(2) {
		top: 7px;
	}
	.hamburger-lines span:nth-child(3) {
		top: 14px;
	}

	.modern-menu-toggle:hover .hamburger-lines span {
		background: linear-gradient(45deg, #764ba2, #667eea);
	}

	/* Modern Search */
	.modern-search {
		flex: 1;
		max-width: 400px;
		margin: 0 2rem;
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 16px;
		z-index: 2;
		color: #667eea;
		font-size: 18px;
		transition: all 0.3s ease;
	}

	:global(.modern-search-input) {
		background: rgba(102, 126, 234, 0.08) !important;
		border: 1px solid rgba(102, 126, 234, 0.2) !important;
		border-radius: 25px !important;
		padding: 12px 20px 12px 50px !important;
		font-size: 14px !important;
		font-weight: 500 !important;
		color: #333 !important;
		transition: all 0.3s ease !important;
		box-shadow: 0 2px 10px rgba(102, 126, 234, 0.08) !important;
	}

	:global(.modern-search-input:focus) {
		background: rgba(255, 255, 255, 0.9) !important;
		border-color: #667eea !important;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15) !important;
		outline: none !important;
	}

	:global(.modern-search-input::placeholder) {
		color: #667eea !important;
		opacity: 0.7 !important;
	}

	/* Action Items */
	.action-item {
		position: relative;
	}

	.action-item:not(.profile-action) {
		opacity: 0.8;
		transition: all 0.3s ease;
	}

	.action-item:hover {
		opacity: 1;
		transform: translateY(-1px);
	}

	.profile-action {
		margin-left: 0.5rem;
		padding-left: 0.75rem;
		border-left: 1px solid rgba(0, 0, 0, 0.1);
	}

	/* Enhanced Action Items */
	.action-item :global(.dropdown-toggle),
	.action-item :global(.btn) {
		background: rgba(102, 126, 234, 0.08) !important;
		border: 1px solid rgba(102, 126, 234, 0.15) !important;
		border-radius: 10px !important;
		padding: 8px !important;
		color: #667eea !important;
		font-weight: 500 !important;
		transition: all 0.3s ease !important;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.06) !important;
		min-width: 36px !important;
		height: 36px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	.action-item :global(.dropdown-toggle:hover),
	.action-item :global(.btn:hover) {
		background: rgba(102, 126, 234, 0.12) !important;
		border-color: rgba(102, 126, 234, 0.25) !important;
		transform: translateY(-1px) !important;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15) !important;
	}

	/* Icon styling for action items */
	.action-item :global(.dropdown-toggle i),
	.action-item :global(.btn i) {
		font-size: 16px !important;
		line-height: 1 !important;
	}

	/* Profile action specific styling */
	.profile-action :global(.dropdown-toggle) {
		min-width: auto !important;
		padding: 6px 10px !important;
		border-radius: 8px !important;
	}

	/* Language Dropdown specific styling */
	.action-item :global(.language-switch) {
		background: rgba(255, 255, 255, 0.95) !important;
		backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(102, 126, 234, 0.15) !important;
		border-radius: 12px !important;
		box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15) !important;
		margin-top: 8px !important;
	}

	.action-item :global(.language-switch .dropdown-item) {
		padding: 8px 16px !important;
		transition: all 0.2s ease !important;
		border-radius: 8px !important;
		margin: 2px 4px !important;
	}

	.action-item :global(.language-switch .dropdown-item:hover) {
		background: rgba(102, 126, 234, 0.1) !important;
		color: #667eea !important;
	}

	.action-item :global(.language-switch .dropdown-item.active) {
		background: linear-gradient(
			45deg,
			rgba(102, 126, 234, 0.15),
			rgba(118, 75, 162, 0.15)
		) !important;
		color: #667eea !important;
		font-weight: 600 !important;
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.modern-search {
			max-width: 300px;
			margin: 0 1rem;
		}

		.modern-brand-box {
			min-width: 200px;
		}

		.brand-name {
			font-size: 1.2rem;
		}
	}

	@media (max-width: 992px) {
		.navbar-header {
			padding: 0 1rem;
			height: 65px;
		}

		.header-left {
			gap: 1rem;
		}

		.header-actions {
			gap: 0.5rem;
		}

		.modern-brand-box {
			min-width: auto;
		}

		.brand-name {
			font-size: 1.1rem;
		}

		.brand-logo {
			height: 32px;
		}

		.action-item :global(.dropdown-toggle),
		.action-item :global(.btn) {
			min-width: 34px !important;
			height: 34px !important;
			padding: 7px !important;
		}

		.action-item :global(.dropdown-toggle i),
		.action-item :global(.btn i) {
			font-size: 15px !important;
		}
	}

	@media (max-width: 768px) {
		.navbar-header {
			padding: 0 0.75rem;
			height: 60px;
		}

		.modern-search {
			display: none !important;
		}

		.header-actions {
			gap: 0.25rem;
		}

		.action-item :global(.dropdown-toggle),
		.action-item :global(.btn) {
			min-width: 32px !important;
			height: 32px !important;
			padding: 6px !important;
			border-radius: 8px !important;
		}

		.action-item :global(.dropdown-toggle i),
		.action-item :global(.btn i) {
			font-size: 14px !important;
		}

		.profile-action :global(.dropdown-toggle) {
			padding: 5px 8px !important;
		}

		.modern-menu-toggle {
			width: 42px;
			height: 42px;
			padding: 10px;
		}

		.hamburger-lines {
			width: 18px;
			height: 14px;
		}
	}

	/* Sidebar Integration */
	:global(body.sidebar-enable) .modern-brand-box {
		width: 250px;
	}

	/* Collapsed state - align header with 70px sidebar */
	:global(body.vertical-collpsed) .navbar-header {
		padding-left: 0 !important;
	}

	:global(body.vertical-collpsed) .header-left {
		margin-left: 0 !important;
	}

	:global(body.vertical-collpsed) .modern-brand-box {
		width: 70px !important;
		min-width: 70px !important;
		margin: 0 !important;
		padding: 0 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	:global(body.vertical-collpsed) .modern-brand-link {
		width: 70px !important;
		height: 70px !important;
		padding: 0 !important;
		margin: 0 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		border-radius: 0 !important;
	}

	:global(body.vertical-collpsed) .modern-brand-link:hover {
		background: transparent !important;
		transform: none !important;
	}

	:global(body.vertical-collpsed) .brand-logo-container {
		margin: 0 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	:global(body.vertical-collpsed) .brand-logo {
		height: 32px !important;
		width: auto !important;
	}

	:global(body.vertical-collpsed) .brand-name {
		display: none !important;
	}

	:global(body.vertical-collpsed) .modern-menu-toggle {
		margin-left: 1rem !important;
	}

	/* Animation Effects */
	.modern-header {
		animation: slideDown 0.5s ease-out;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Focus States for Accessibility */
	.modern-menu-toggle:focus,
	.modern-brand-link:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
	}

	/* Dark Mode Support */
	@media (prefers-color-scheme: dark) {
		.modern-header {
			background: rgba(15, 15, 20, 0.95);
			border-bottom-color: rgba(255, 255, 255, 0.1);
		}

		.modern-header:hover {
			background: rgba(15, 15, 20, 0.98);
		}

		.modern-menu-toggle {
			background: rgba(102, 126, 234, 0.2);
			border-color: rgba(102, 126, 234, 0.3);
		}

		:global(.modern-search_input) {
			background: rgba(255, 255, 255, 0.1) !important;
			color: #fff !important;
			border-color: rgba(255, 255, 255, 0.2) !important;
		}

		:global(.modern-search-input::placeholder) {
			color: rgba(255, 255, 255, 0.7) !important;
		}
	}

	/* High Performance Animations */
	.modern-brand-link,
	.modern-menu-toggle,
	.action-item,
	:global(.modern-search-input) {
		will-change: transform;
	}
</style>

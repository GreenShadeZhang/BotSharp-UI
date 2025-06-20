<script>
// @ts-nocheck

	import { onMount, afterUpdate } from 'svelte';
	import 'overlayscrollbars/overlayscrollbars.css';
	import { OverlayScrollbars } from 'overlayscrollbars';
	import Link from 'svelte-link';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { _ } from 'svelte-i18n';
	import { globalEventStore } from '$lib/helpers/store';

	/** @type {import('$pluginTypes').PluginMenuDefModel[]} */
	export let menu;

	// after routing complete call afterUpdate function
	afterUpdate(() => {
		removeActiveDropdown();		const curUrl = getPathUrl();
		if (curUrl) {
			let item = document.querySelector(".modern-sidebar a[href='" + curUrl + "']");
			if (item) {
				item.classList.add('mm-active');
				const parent1 = item.parentElement;
				if (parent1) {
					parent1.classList.add('mm-active');
					const parent2 = parent1.parentElement;
					if (parent2) {
						parent2.classList.add('mm-show');
						parent2.classList.remove('mm-collapse');
						if (parent2.previousElementSibling) {
							parent2.previousElementSibling.classList.add('mm-active');
							if (!parent2.previousElementSibling.classList.contains('revert-arrow')) {
								parent2.previousElementSibling.classList.add('revert-arrow');
							}
						}
						const parent3 = parent2.parentElement?.parentElement;
						if (parent3) {
							parent3.classList.add('mm-show');
							parent3.classList.remove('mm-collapse');
							if (parent3.previousElementSibling) {
								parent3.previousElementSibling.classList.add('mm-active');
							}
						}
					}
				}
			}
		}
	});

	const options = {
		scrollbars: {
			visibility: 'auto', // You can adjust the visibility ('auto', 'hidden', 'visible')
			autoHide: 'move', // You can adjust the auto-hide behavior ('move', 'scroll', false)
			autoHideDelay: 100,
			dragScroll: true,
			clickScroll: false,
			theme: 'os-theme-light',
			pointers: ['mouse', 'touch', 'pen']
		}
	};

	onMount(async () => {
		const menuElement = document.querySelector('#vertical-menu');
		OverlayScrollbars(menuElement, options);
		activeMenu();
		const curUrl = getPathUrl();
		if (curUrl) {
			let item = document.querySelector(".modern-sidebar a[href='" + curUrl + "']");
			if (item) {
				item.classList.add('mm-active');
				item.scrollIntoView({ behavior: 'smooth', block: 'center' });
				const parent1 = item.parentElement;
				if (parent1) {
					parent1.classList.add('mm-active');
					const parent2 = parent1.parentElement;
					if (parent2) {
						parent2.classList.add('mm-show');
						parent2.classList.remove('mm-collapse');
						if (parent2.previousElementSibling) {
							parent2.previousElementSibling.classList.add('mm-active');
							if (!parent2.previousElementSibling.classList.contains('revert-arrow')) {
								parent2.previousElementSibling.classList.add('revert-arrow');
							}
						}
						const parent3 = parent2.parentElement?.parentElement;
						if (parent3) {
							parent3.classList.add('mm-show');
							parent3.classList.remove('mm-collapse');
							if (parent3.previousElementSibling) {
								parent3.previousElementSibling.classList.add('mm-active');
							}
						}
					}
				}
			}
		}

		// menuItemScroll()
	});
	const activeMenu = () => {
		if (browser) {
			document.querySelectorAll('.modern-sidebar .has-arrow').forEach((menu) => {
				menu.addEventListener('click', () => {
					if (menu.nextElementSibling) {
						let activeLinks = 0;
						const links = menu.nextElementSibling.querySelectorAll('li a');
						links.forEach((x) => (activeLinks += Number(x.classList.contains('mm-active'))));
						if (activeLinks > 0) {
							menu.classList.add('mm-active');
						}

						if (menu.nextElementSibling.classList.contains('mm-collapse')) {
							menu.nextElementSibling.classList.remove('mm-collapse');
							menu.nextElementSibling.classList.add('mm-show');
							menu.classList.add('revert-arrow');
						} else {
							menu.nextElementSibling.classList.add('mm-collapse');
							menu.nextElementSibling.classList.remove('mm-show');
							menu.classList.remove('revert-arrow');
						}
					}
				});
			});

			
			document.querySelectorAll('.modern-submenu a').forEach((submenu) => {
				submenu.addEventListener('click', () => {
					removeActiveDropdown();
					submenu.classList.add('mm-active');
					if (submenu.nextElementSibling) {
						submenu.nextElementSibling.classList.add('mm-show');
					}
					if (submenu.parentElement) {
						submenu.parentElement.classList.add('mm-active');
						const parent1 = submenu.parentElement.parentElement;
						if (parent1) {
							parent1.classList.add('mm-show');
							if (parent1.previousElementSibling) {
								parent1.previousElementSibling.classList.add('mm-active');
							}

							const parent2 = parent1.parentElement?.parentElement;
							if (parent2) {
								parent2.classList.add('mm-show');
								if (parent2.previousElementSibling) {
									parent2.previousElementSibling.classList.add('mm-active');
								}
							}
						}
					}
				});
			});
		}
	};
	const removeActiveDropdown = () => {
		document.querySelectorAll('.modern-sidebar .has-arrow').forEach((menu) => {
			if (menu.nextElementSibling) {
				if (!menu.nextElementSibling.classList.contains('mm-collapse')) {
					menu.nextElementSibling.classList.add('mm-collapse');
				}
				menu.nextElementSibling.classList.remove('mm-show');
				menu.classList.remove('mm-active');
				menu.classList.remove('revert-arrow');
			}
		});

		document.querySelectorAll('.modern-submenu a').forEach((submenu) => {
			submenu.classList.remove('mm-active');
			if (submenu.parentElement) {
				submenu.parentElement.classList.remove('mm-active');
			}
		});

		document.querySelectorAll('.modern-sidebar .mm-active').forEach((menu) => {
			menu.querySelectorAll('.mm-active').forEach((child) => child.classList.remove('mm-active'));
			menu.classList.remove('mm-active');
		});
	};
	const menuItemScroll = () => {
		if (browser) {
			const curUrl = getPathUrl();
			let item = document.querySelector(".modern-sidebar a[href='" + curUrl + "']")?.offsetTop;
			if (item && item > 300) {
				item = item - 300;
				const menuElement = document.getElementById('vertical-menu');
				menuElement?.scrollTo({
					top: item,
					behavior: 'smooth'
				});
			}
		}
	};

	const getPathUrl = () => {
		const path = $page.url.pathname;
		return path?.startsWith('/') ? path.substring(1) : path;
	};

	const goToPage = () => {
		globalEventStore.reset();
	}
</script>

<div class="vertical-menu modern-sidebar">
	<div class="sidebar-gradient-overlay"></div>
	<div class="h-100" id="vertical-menu">
		<!--- Sidemenu -->
		<div id="sidebar-menu" class="modern-sidebar-menu">
			<!-- Left Menu Start -->
			<ul class="metismenu list-unstyled modern-menu-list" id="side-menu">
				{#each menu as item}
					{#if item.isHeader}
						<li class="menu-title modern-menu-title" key="t-menu">
							<span class="title-text">{$_(item.label)}</span>
							<div class="title-divider"></div>
						</li>
					{:else if item.subMenu}
						<li class="modern-menu-item">
							<Link href={null} class="has-arrow waves-effect modern-menu-link">
								<div class="menu-icon-container">
									<i class={item.icon} />
								</div>
								<span class="menu-text">{$_(item.label)}</span>
								<div class="menu-arrow">
									<i class="fas fa-chevron-right"></i>
								</div>
							</Link>
							<ul class="sub-menu mm-collapse modern-submenu">
								{#each item.subMenu as subMenu}
									{#if subMenu.isChildItem}
										<li class="modern-submenu-item">
											<Link href="#" class="has-arrow waves-effect modern-submenu-link">
												<span class="submenu-text">{$_(subMenu.label)}</span>
												<div class="submenu-arrow">
													<i class="fas fa-chevron-right"></i>
												</div>
											</Link>
											<ul class="sub-menu mm-collapse modern-submenu-nested">
												{#each subMenu.childItems as childItem}
													<li class="modern-submenu-nested-item">
														<Link href={childItem.link} on:click={() => goToPage()} class="modern-submenu-nested-link">
															<div class="nested-indicator"></div>
															<span class="nested-text">{$_(childItem.label)}</span>
														</Link>
													</li>
												{/each}
											</ul>
										</li>									{:else}
										<li class="modern-submenu-item">
											<Link href={subMenu.link} on:click={() => goToPage()} class="modern-submenu-link">
												{#if subMenu.icon}
													<div class="submenu-icon-container">
														<i class={subMenu.icon} />
													</div>
												{:else}
													<div class="submenu-indicator"></div>
												{/if}
												<span class="submenu-text">{$_(subMenu.label)}</span>
											</Link>
										</li>
									{/if}
								{/each}
							</ul>
						</li>
					{:else}
						<li class="modern-menu-item">
							<Link class="waves-effect modern-menu-link" href={item.link} on:click={() => goToPage()}>
								<div class="menu-icon-container">
									<i class={item.icon} />
								</div>
								<span class="menu-text">{$_(item.label)}</span>
							</Link>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</div>

<style>
/* ==========================================
   Modern Professional Sidebar Styles
   Inspired by premium admin dashboards
   ========================================== */

/* Override existing styles to ensure proper layout */
:global(.modern-sidebar #sidebar-menu ul li a) {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
}

:global(.modern-sidebar #sidebar-menu ul li a i) {
	display: inline-block !important;
	margin-right: 0 !important;
	min-width: auto !important;
	/* 保持图标字体的正常属性 */
	font-family: inherit !important;
	font-style: normal !important;
}

/* Strong override for menu links to ensure horizontal layout */
:global(.vertical-menu.modern-sidebar .modern-menu-link) {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	justify-content: flex-start !important;
}

:global(.vertical-menu.modern-sidebar .menu-icon-container) {
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	flex-shrink: 0 !important;
}

:global(.vertical-menu.modern-sidebar .menu-text) {
	flex: 1 !important;
	display: inline-block !important;
}

/* Main Sidebar Container */
.modern-sidebar {
	background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
	border-right: 1px solid rgba(255, 255, 255, 0.08);
	position: relative;
	overflow: hidden;
	width: 250px;
	z-index: 1001;
	bottom: 0;
	margin-top: 0;
	position: fixed;
	top: 70px;
	box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
}

/* Sidebar Gradient Overlay */
.sidebar-gradient-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 120px;
	background: linear-gradient(145deg, rgba(67, 56, 202, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%);
	pointer-events: none;
	z-index: 1;
}

/* Modern Sidebar Menu */
.modern-sidebar-menu {
	position: relative;
	z-index: 2;
	padding: 16px 0 30px 0;
	height: 100%;
}

/* Modern Menu List */
.modern-menu-list {
	margin: 0;
	padding: 0;
	list-style: none;
}

/* Menu Title Styling */
.modern-menu-title {
	padding: 16px 16px 8px 16px !important;
	margin-bottom: 6px;
	position: relative;
	letter-spacing: .05em;
	pointer-events: none;
	cursor: default;
}

.title-text {
	color: rgba(148, 163, 184, 0.9);
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 1.2px;
	display: block;
	margin-bottom: 8px;
}

.title-divider {
	height: 1px;
	background: linear-gradient(to right, rgba(148, 163, 184, 0.2), transparent);
	width: 60%;
}

/* Modern Menu Item */
.modern-menu-item {
	margin: 2px 6px;
	border-radius: 12px;
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: block;
	width: auto;
}

.modern-menu-item:hover {
	transform: translateX(4px);
}

/* Modern Menu Link */
.modern-menu-link {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	justify-content: flex-start !important;
	padding: 12px 12px !important;
	color: rgba(226, 232, 240, 0.8) !important;
	text-decoration: none !important;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	border: 1px solid transparent;
	background: transparent;
	font-size: 13px;
	width: 100%;
	box-sizing: border-box;
}

.modern-menu-link::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
	opacity: 0;
	transition: opacity 0.3s ease;
	border-radius: 12px;
}

.modern-menu-link:hover {
	color: rgba(255, 255, 255, 0.95) !important;
	background: linear-gradient(145deg, rgba(67, 56, 202, 0.15), rgba(29, 78, 216, 0.1));
	border-color: rgba(67, 56, 202, 0.2);
	box-shadow: 0 4px 16px rgba(67, 56, 202, 0.1);
}

.modern-menu-link:hover::before {
	opacity: 1;
}

/* Active Menu Item */
:global(.modern-menu-item.mm-active) .modern-menu-link,
.modern-menu-link:global(.mm-active) {
	color: rgba(255, 255, 255, 0.95) !important;
	background: linear-gradient(145deg, rgba(67, 56, 202, 0.2), rgba(29, 78, 216, 0.15)) !important;
	border-color: rgba(67, 56, 202, 0.3) !important;
	box-shadow: 0 8px 32px rgba(67, 56, 202, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

:global(.modern-menu-item.mm-active) .menu-icon-container i,
:global(.mm-active) .menu-icon-container i {
	color: rgba(147, 197, 253, 0.9) !important;
}

/* Menu Icon Container */
.menu-icon-container {
	width: 40px !important;
	height: 40px !important;
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	border-radius: 10px;
	background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
	margin-right: 10px !important;
	margin-left: 0 !important;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0 !important;
	flex-grow: 0 !important;
	position: relative;
}

.menu-icon-container i {
	font-size: 16px !important;
	color: rgba(148, 163, 184, 0.8) !important;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	margin: 0 !important;
	padding: 0 !important;
	/* 保持FontAwesome等图标字体的核心样式 */
	display: inline-block !important;
	line-height: 1 !important;
	text-align: center !important;
	vertical-align: middle !important;
	font-family: inherit !important;
}

/* 确保图标字体的伪元素内容不被破坏 */
:global(.modern-sidebar) i[class*="fa-"]:before,
:global(.modern-sidebar) i[class*="fas"]:before,
:global(.modern-sidebar) i[class*="far"]:before,
:global(.modern-sidebar) i[class*="fab"]:before {
	display: inline-block !important;
	text-rendering: auto !important;
	-webkit-font-smoothing: antialiased !important;
}

/* 通用图标样式 - 确保所有图标都能正常显示 */
:global(.modern-sidebar .menu-icon-container) i {
	/* 保持图标字体的基本样式 */
	overflow: visible !important;
	white-space: nowrap !important;
}

:global(.modern-menu-link:hover) .menu-icon-container {
	background: linear-gradient(145deg, rgba(67, 56, 202, 0.2), rgba(29, 78, 216, 0.1));
	box-shadow: 0 4px 12px rgba(67, 56, 202, 0.15);
}

:global(.modern-menu-link:hover) .menu-icon-container i {
	color: rgba(147, 197, 253, 0.9);
	transform: scale(1.1) !important;
}

/* Icon Font Compatibility - 保持图标字体正常工作 */
:global(.modern-sidebar) i[class*="fa-"],
:global(.modern-sidebar) i[class*="fas"],
:global(.modern-sidebar) i[class*="far"],
:global(.modern-sidebar) i[class*="fab"],
:global(.modern-sidebar) i[class*="mdi"],
:global(.modern-sidebar) i[class*="bx"],
:global(.modern-sidebar) i[class*="icon"] {
	font-style: normal !important;
	font-variant: normal !important;
	text-rendering: auto !important;
	-webkit-font-smoothing: antialiased !important;
	-moz-osx-font-smoothing: grayscale !important;
	display: inline-block !important;
	line-height: 1 !important;
}

/* Menu Text */
.menu-text {
	font-size: 14px !important;
	font-weight: 500 !important;
	flex: 1 !important;
	flex-grow: 1 !important;
	margin-right: 12px !important;
	letter-spacing: 0.25px;
	display: inline-block !important;
	line-height: 1.4 !important;
}

/* Menu Arrow */
.menu-arrow {
	opacity: 0.6;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-arrow i {
	font-size: 12px;
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.modern-menu-link:hover) .menu-arrow {
	opacity: 1;
}

:global(.revert-arrow) .menu-arrow i,
:global(.mm-active) .menu-arrow i {
	transform: rotate(90deg);
}

/* Arrow compatibility with existing system */
:global(.has-arrow) .menu-arrow {
	display: block;
	float: right;
}

/* Modern Submenu */
.modern-submenu {
	background: rgba(15, 23, 42, 0.8);
	border-radius: 8px;
	margin: 8px 12px 0 12px;
	padding: 8px 0;
	border: 1px solid rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(10px);
}

.modern-submenu:global(.mm-show) {
	animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-submenu:global(.mm-collapse):not(:global(.mm-show)) {
	display: none;
}

.modern-submenu:global(.mm-collapse):global(.mm-show) {
	display: block;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Submenu Item */
.modern-submenu-item {
	margin: 2px 8px;
	display: block;
	width: auto;
}

/* Submenu Link */
.modern-submenu-link {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	justify-content: flex-start !important;
	padding: 10px 16px !important;
	color: rgba(203, 213, 225, 0.7) !important;
	text-decoration: none !important;
	border-radius: 8px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 13px;
	font-weight: 400;
	border: 1px solid transparent;
	position: relative;
}

.modern-submenu-link:hover {
	color: rgba(255, 255, 255, 0.9) !important;
	background: rgba(67, 56, 202, 0.1);
	border-color: rgba(67, 56, 202, 0.15);
	transform: translateX(4px);
}

/* Active Submenu Item */
:global(.modern-submenu-item.mm-active) .modern-submenu-link,
.modern-submenu-link:global(.mm-active) {
	color: rgba(255, 255, 255, 0.95) !important;
	background: linear-gradient(145deg, rgba(67, 56, 202, 0.15), rgba(29, 78, 216, 0.1)) !important;
	border-color: rgba(67, 56, 202, 0.2) !important;
}

/* Submenu Indicator */
.submenu-indicator {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: rgba(148, 163, 184, 0.5);
	margin-right: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
}

/* Submenu Icon Container */
.submenu-icon-container {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.05);
	margin-right: 10px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
}

.submenu-icon-container i {
	font-size: 12px;
	color: rgba(148, 163, 184, 0.7);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: inline-block;
	line-height: 1;
}

:global(.modern-submenu-link:hover) .submenu-indicator {
	background: rgba(147, 197, 253, 0.8);
	box-shadow: 0 0 8px rgba(147, 197, 253, 0.4);
}

:global(.modern-submenu-link:hover) .submenu-icon-container {
	background: rgba(67, 56, 202, 0.15);
}

:global(.modern-submenu-link:hover) .submenu-icon-container i {
	color: rgba(147, 197, 253, 0.9);
	transform: scale(1.1);
}

:global(.mm-active) .submenu-indicator {
	background: rgba(147, 197, 253, 0.9);
	box-shadow: 0 0 12px rgba(147, 197, 253, 0.6);
}

:global(.mm-active) .submenu-icon-container {
	background: rgba(67, 56, 202, 0.2);
}

:global(.mm-active) .submenu-icon-container i {
	color: rgba(147, 197, 253, 0.95);
}

/* Submenu Text */
.submenu-text {
	flex: 1;
	margin-right: 8px;
}

/* Submenu Arrow */
.submenu-arrow {
	opacity: 0.5;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-arrow i {
	font-size: 10px;
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.modern-submenu-link:hover) .submenu-arrow {
	opacity: 0.8;
}

:global(.revert-arrow) .submenu-arrow i {
	transform: rotate(90deg);
}

/* Nested Submenu */
.modern-submenu-nested {
	background: rgba(15, 23, 42, 0.9);
	border-radius: 6px;
	margin: 4px 8px;
	padding: 4px 0;
	border: 1px solid rgba(255, 255, 255, 0.03);
}

.modern-submenu-nested:global(.mm-collapse):not(:global(.mm-show)) {
	display: none;
}

.modern-submenu-nested:global(.mm-collapse):global(.mm-show) {
	display: block;
}

/* Nested Submenu Item */
.modern-submenu-nested-item {
	margin: 1px 4px;
	display: block;
	width: auto;
}

/* Nested Submenu Link */
.modern-submenu-nested-link {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	justify-content: flex-start !important;
	padding: 8px 12px !important;
	color: rgba(203, 213, 225, 0.6) !important;
	text-decoration: none !important;
	border-radius: 6px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 12px;
	font-weight: 400;
	position: relative;
}

.modern-submenu-nested-link:hover {
	color: rgba(255, 255, 255, 0.85) !important;
	background: rgba(67, 56, 202, 0.08);
	transform: translateX(2px);
}

/* Active Nested Item */
.modern-submenu-nested-link:global(.mm-active) {
	color: rgba(255, 255, 255, 0.95) !important;
	background: rgba(67, 56, 202, 0.12) !important;
}

/* Nested Indicator */
.nested-indicator {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: rgba(148, 163, 184, 0.4);
	margin-right: 10px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
}

:global(.modern-submenu-nested-link:hover) .nested-indicator {
	background: rgba(147, 197, 253, 0.7);
}

:global(.mm-active) .nested-indicator {
	background: rgba(147, 197, 253, 0.9);
}

/* Nested Text */
.nested-text {
	flex: 1;
}

/* Badge Support */
.modern-menu-link :global(.badge),
.modern-submenu-link :global(.badge) {
	margin-top: 0;
	margin-left: auto;
}

/* Scrollbar Styling */
.modern-sidebar :global(.os-scrollbar-vertical) {
	width: 6px;
	background: transparent;
}

.modern-sidebar :global(.os-scrollbar-handle) {
	background: rgba(148, 163, 184, 0.3);
	border-radius: 3px;
	transition: background 0.3s ease;
}

.modern-sidebar :global(.os-scrollbar-handle:hover) {
	background: rgba(148, 163, 184, 0.5);
}

/* Metismenu Collapsing Animation */
.modern-sidebar :global(.mm-collapsing) {
	position: relative;
	height: 0;
	overflow: hidden;
	transition-timing-function: ease;
	transition-duration: .35s;
	transition-property: height, visibility;
}

/* Responsive Design */
@media (max-width: 992px) {
	.modern-sidebar {
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: none;
	}	
	:global(body.sidebar-enable) .modern-sidebar {
		display: block;
		transform: translateX(0);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
	}
}

@media (max-width: 768px) {
	.modern-menu-link {
		padding: 10px 8px !important;
	}
	
	.menu-icon-container {
		width: 36px !important;
		height: 36px !important;
		margin-right: 8px !important;
	}
		.menu-icon-container i {
		font-size: 14px !important;
	}
	
	.menu-text {
		font-size: 13px !important;
	}
	
	.modern-sidebar {
		width: 250px;
	}
	
	.modern-menu-item {
		margin: 2px 4px;
	}
	
	.modern-menu-title {
		padding: 12px 12px 6px 12px !important;
	}
}

/* Main Content Margin Adjustment */
:global(.main-content) {
	margin-left: 250px;
}

@media (max-width: 992px) {
	:global(.main-content) {
		margin-left: 0 !important;
	}
}

/* Dark Mode Enhancements */
@media (prefers-color-scheme: dark) {
	.modern-sidebar {
		background: linear-gradient(145deg, #0c0a1a 0%, #0f0715 100%);
		border-right-color: rgba(255, 255, 255, 0.06);
	}
}

/* Focus States for Accessibility */
.modern-menu-link:focus,
.modern-submenu-link:focus,
.modern-submenu-nested-link:focus {
	outline: none;
	box-shadow: 0 0 0 2px rgba(67, 56, 202, 0.4);
}

/* Animation for menu items */
.modern-menu-item {
	animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.modern-menu-item:nth-child(1) { animation-delay: 0.1s; }
.modern-menu-item:nth-child(2) { animation-delay: 0.15s; }
.modern-menu-item:nth-child(3) { animation-delay: 0.2s; }
.modern-menu-item:nth-child(4) { animation-delay: 0.25s; }
.modern-menu-item:nth-child(5) { animation-delay: 0.3s; }
.modern-menu-item:nth-child(6) { animation-delay: 0.35s; }
.modern-menu-item:nth-child(7) { animation-delay: 0.4s; }
.modern-menu-item:nth-child(8) { animation-delay: 0.45s; }

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Professional hover effects */
.modern-menu-link {
	position: relative;
	overflow: hidden;
}

.modern-menu-link::after {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
	transition: left 0.6s ease;
}

.modern-menu-link:hover::after {
	left: 100%;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
	.modern-menu-link {
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	
	.modern-menu-link:hover,
	.modern-menu-link.mm-active {
		border-color: rgba(255, 255, 255, 0.4);
	}
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
	.modern-menu-item,
	.modern-menu-link,
	.modern-submenu-link,
	.modern-submenu,
	.menu-icon-container,
	.menu-arrow i,
	.submenu-arrow i {
		animation: none !important;
		transition: none !important;
	}
}
</style>

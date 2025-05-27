<script>
	import { browser } from '$app/environment';
	import { _ } from 'svelte-i18n';
	import { Input } from '@sveltestrap/sveltestrap';
	import LanguageDropdown from '$lib/common/LanguageDropdown.svelte';
	import FullScreenDropdown from '$lib/common/FullScreenDropdown.svelte';
	import NotificationDropdown from '$lib/common/NotificationDropdown.svelte';
	import ProfileDropdown from '$lib/common/ProfileDropdown.svelte';
	import { OverlayScrollbars } from 'overlayscrollbars';
	import { PUBLIC_LOGO_URL } from '$env/static/public';
	import { globalEventStore } from '$lib/helpers/store';
	import { GlobalEvent } from '$lib/helpers/enums';

	/** @type {any} */
	export let user;

	/** @type {() => void} */
	export let toggleRightBar = () => {};

	/** @type {string} */
	let searchText = '';

	const toggleSideBar = () => {
		if (browser) {
			document.body.classList.toggle('sidebar-enable');
			document.body.classList.toggle('vertical-collpsed');

			if (document.body.classList.contains('vertical-collpsed')) {
				const Instance = OverlayScrollbars(document.querySelector('#vertical-menu'));
				if (Instance) {
					Instance.destroy();
				}
			} else {
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
				const menuElement = document.querySelector('#vertical-menu');
				OverlayScrollbars(menuElement, options);
			}
		}
	};

	/** @param {any} e */
	const search = (e) => {
		if (e.key !== 'Enter') return;

		globalEventStore.set({ name: GlobalEvent.Search, payload: searchText });
	}
</script>

<header id="page-topbar" class="md-top-app-bar">
	<div class="navbar-header">
		<div class="d-flex">
			<!-- LOGO -->
			<div class="navbar-brand-box">
				<a href="page/dashboard" class="logo logo-dark">
					<span class="logo-sm">
						<img src={PUBLIC_LOGO_URL} alt="" height="28" class="md-shape-small" />
					</span>
					<span class="logo-lg">
						<img src={PUBLIC_LOGO_URL} alt="" height="32" class="md-shape-small" />
					</span>
				</a>

				<a href="page/dashboard" class="logo logo-light">
					<span class="logo-sm">
						<img src={PUBLIC_LOGO_URL} alt="" height="28" class="md-shape-small" />
					</span>
					<span class="logo-lg">
						<img src={PUBLIC_LOGO_URL} alt="" height="32" class="md-shape-small" />
					</span>
				</a>
			</div>

			<button
				type="button"
				class="md-icon-button"
				id="vertical-menu-btn"
				on:click={() => toggleSideBar()}
			>
				<i class="fa fa-fw fa-bars" />
			</button>

			<!-- App Search with Material Design -->
			<form class="app-search d-none d-lg-block">
				<div class="md-text-field position-relative">
					<input
						type="text"
						class="md-text-field__input"
						placeholder="{$_('Search')}..."
						maxlength={100}
						bind:value={searchText}
						on:keydown={e => search(e)}
					/>
					<span class="md-search-icon">
						<i class="bx bx-search-alt" />
					</span>
				</div>
			</form>
					/>
					<span class="bx bx-search-alt" />
				</div>
			</form>
		</div>
		<div class="d-flex">
			<LanguageDropdown />
			<FullScreenDropdown />
			<NotificationDropdown />
			<ProfileDropdown user={user}/>
		</div>
	</div>
</header>

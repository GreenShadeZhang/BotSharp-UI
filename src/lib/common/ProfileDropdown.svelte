<script>
	import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from '@sveltestrap/sveltestrap';
	import Swal from 'sweetalert2';
	import { resetLocalStorage } from '$lib/helpers/store';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { userStore } from '$lib/helpers/store';
	import { PUBLIC_SERVICE_URL } from '$env/static/public';
	import { _ } from 'svelte-i18n';
	import { buildUrl } from '$lib/helpers/utils/common';
	import { ChatAction } from '$lib/helpers/enums';
	import { CHAT_FRAME_ID } from '$lib/helpers/constants';
	import { logout as oidcLogout } from '$lib/services/oidc-auth-service.js';

	/** @type {any} */
	export let user;
	function logout() {
		if (browser) {
			resetLocalStorage(true);
		}

		const chatFrame = document.getElementById(CHAT_FRAME_ID);
		if (chatFrame) {
			// @ts-ignore
			chatFrame.contentWindow.postMessage({ action: ChatAction.Logout }, '*');
		}

		// After local cleanup, call OIDC logout for complete session cleanup
		oidcLogout();
	}
	function confirmLogout() {
		Swal.fire({
			title: $_('logout_confirm_title'),
			text: $_('logout_confirm_message'),
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: $_('logout_confirm_yes'),
			cancelButtonText: $_('logout_confirm_no')
		}).then((result) => {
			if (result.value) {
				logout();
			}
		});
	}

	/** @param {any} e */
	function handleLogoutClick(e) {
		e.preventDefault();
		e.stopPropagation();
		confirmLogout();
	}

	/** @param {any} e */
	function handleAvatarLoad(e) {
		e.target.src = 'images/users/user-dummy.jpg';
	}
</script>

<Dropdown class="d-inline-block">
	<DropdownToggle
		tag="a"
		color=""
		class="btn header-item waves-effect"
		id="page-header-user-dropdown"
	>
		<img
			class="rounded-circle header-profile-user"
			src={`${
				user?.avatar && $userStore?.token
					? `${buildUrl(PUBLIC_SERVICE_URL, user?.avatar)}?access_token=${$userStore?.token}`
					: ''
			}`}
			alt=""
			on:error={(e) => handleAvatarLoad(e)}
		/>
		<span class="d-none d-xl-inline-block ms-1" key="t-fullname">{user?.full_name}</span>
		<i class="mdi mdi-chevron-down d-none d-xl-inline-block" />
	</DropdownToggle>
	<DropdownMenu end>
		<!-- item-->
		<DropdownItem href="page/user/me">
			<i class="bx bx-user font-size-16 align-middle me-1" />
			<span>{$_('Profile')}</span>
		</DropdownItem>
		<DropdownItem href="#" disabled>
			<span class="badge bg-success float-end">11</span>
			<i class="bx bx-wrench font-size-16 align-middle me-1" />
			<span key="t-settings">{$_('Settings')}</span>
		</DropdownItem>
		<DropdownItem divider />
		<DropdownItem>
			<div role="button" tabindex="0" on:keydown={() => {}} on:click={handleLogoutClick}>
				<i class="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
				<span>{$_('Logout')}</span>
			</div>
		</DropdownItem>
	</DropdownMenu>
</Dropdown>

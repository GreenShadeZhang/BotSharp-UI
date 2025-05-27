<script>
	import { onMount } from 'svelte';
	import { PUBLIC_BRAND_NAME } from '$env/static/public';
	import Breadcrumb from '$lib/common/Breadcrumb.svelte';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import FileDropZone from '$lib/common/FileDropZone.svelte';
	import MaterialCard from '$lib/common/MaterialCard.svelte';
	import { myInfo, uploadUserAvatar } from '$lib/services/auth-service';
	import { _ } from 'svelte-i18n';
	import { userStore } from '$lib/helpers/store';
	import { PUBLIC_SERVICE_URL } from '$env/static/public';
	import { buildUrl } from '$lib/helpers/utils/common';
	
	/** @type {import('$userTypes').UserModel} */
	let currentUser;
	let isLoading = false;

	const fileMaxSize = 10 * 1024 * 1024;

	onMount(async () => {
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

<HeadTitle title="{$_('My Profile')}" />
<Breadcrumb title="{$_('Home')}" pagetitle="{$_('My Profile')}" />

<div class="material-profile-container">
	<div class="material-profile-grid">
		<div class="material-profile-main">
			<MaterialCard variant="outlined" className="material-profile-card">
				<div class="material-profile-header">
					<div class="material-profile-header-content">
						<div class="material-welcome-section">
							<h5 class="material-heading text-primary">{$_('Welcome Back !')}</h5>
							<p class="material-body-medium">{PUBLIC_BRAND_NAME}</p>
						</div>
					</div>
				</div>
				<div class="material-profile-body">
					<div class="material-profile-info">
						<div class="material-avatar-section">
							<div class="material-avatar-wrapper">
								<FileDropZone
									accept="image/*"
									disableDefaultStyles
									containerStyles={'width: 100%; height: 100%;'}
									noDrag
									multiple={false}
									fileLimit={1}
									maxSize={fileMaxSize}
									on:drop={e => handleFileDrop(e)}
								>
									<img
										src={`${buildUrl(PUBLIC_SERVICE_URL, currentUser?.avatar || '').href}?access_token=${$userStore?.token}`}
										alt=""
										class="material-avatar-image"
										on:error={e => handleAvatarLoad(e)}
									/>
								</FileDropZone>
							</div>
							<div class="material-profile-details">
								<h5 class="material-heading-medium">{currentUser?.full_name}</h5>
								<p class="material-body-small text-outline">{currentUser?.role ?? 'Role: N/A'}</p>
							</div>
						</div>
					</div>
				</div>
			</MaterialCard>
			
			<MaterialCard variant="outlined" className="material-personal-info-card">
				<div class="material-card-content">
					<h6 class="material-heading">{$_('Personal Information')}</h6>
					<div class="material-info-table">						<div class="material-info-row">
							<div class="material-info-label">{$_('First Name')}:</div>
							<div class="material-info-value">{currentUser?.first_name ?? 'N/A'}</div>
						</div>
						<div class="material-info-row">
							<div class="material-info-label">{$_('Last Name')}:</div>
							<div class="material-info-value">{currentUser?.last_name ?? 'N/A'}</div>
						</div>
						<div class="material-info-row">
							<div class="material-info-label">{$_('Email')}:</div>
							<div class="material-info-value">{currentUser?.email ?? 'N/A'}</div>
						</div>
						<div class="material-info-row">
							<div class="material-info-label">{$_('Account Origin')}:</div>
							<div class="material-info-value">{currentUser?.source} {currentUser?.external_id ?? 'N/A'}</div>
						</div>
						<div class="material-info-row">
							<div class="material-info-label">{$_('Update Date')}:</div>
							<div class="material-info-value">
								{currentUser?.update_date
									? new Date(currentUser?.update_date).toLocaleString()
									: 'N/A'}
							</div>
						</div>
						<div class="material-info-row">
							<div class="material-info-label">{$_('Create Date')}:</div>
							<div class="material-info-value">
								{currentUser?.create_date
									? new Date(currentUser?.create_date).toLocaleString()
									: 'N/A'}
							</div>
						</div>
					</div>
				</div>
			</MaterialCard>
		</div>
	</div>
</div>

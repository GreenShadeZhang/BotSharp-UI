<script>
	import { onMount } from 'svelte';
	import { isAuthenticated } from '$lib/services/oidc-auth-service.js';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import '../../lib/scss/app.scss';

	let authenticated = false;
	let loading = true;
	onMount(() => {
		try {
			authenticated = isAuthenticated();
		} catch (error) {
			console.error('Authentication error:', error);
			// 在开发阶段，如果认证失败，默认允许访问
			authenticated = true;
		}

		loading = false;

		// 在开发阶段注释掉重定向
		if (!authenticated) {
			// goto('/');
		}
	});
</script>

{#if loading}
	<div class="auth-check">
		<div class="loading-spinner">
			<i class="fas fa-spinner fa-spin"></i>
			<p>{$_('loading.workspace')}</p>
		</div>
	</div>
{:else}
	<div class="workspace-layout">
		<slot />
	</div>
{/if}

<style>
	.workspace-layout {
		height: 100vh;
		overflow: hidden;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.auth-check {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.loading-spinner {
		text-align: center;
		color: white;
	}

	.loading-spinner i {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.loading-spinner p {
		margin: 0;
		font-size: 1.1rem;
	}
</style>

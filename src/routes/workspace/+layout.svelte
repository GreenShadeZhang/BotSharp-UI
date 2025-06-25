<script>
	import { onMount } from 'svelte';
	import { isAuthenticated } from '$lib/services/oidc-auth-service.js';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import '../../lib/scss/app.scss';

	let authenticated = false;

	onMount(() => {
		try {
			authenticated = isAuthenticated();
		} catch (error) {
			console.error('Authentication error:', error);
			// 在开发阶段，如果认证失败，默认允许访问
			authenticated = true;
		}

		// 在开发阶段注释掉重定向
		if (!authenticated) {
			// goto('/');
		}
	});
</script>

<div class="workspace-layout">
	<slot />
</div>

<style>
	.workspace-layout {
		height: 100vh;
		overflow: hidden;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}
</style>

<script>
	import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';
	import en from '$lib/langs/en.json';
	import zh from '$lib/langs/zh.json';
	import '$lib/helpers/http';
	import { onDestroy, onMount } from 'svelte';
	import { globalErrorStore, loaderStore } from '$lib/helpers/store';
	import Loader from '$lib/common/Loader.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import { initializeAuth } from '$lib/services/oidc-auth-service.js';

	addMessages('zh', zh);
	addMessages('en', en);

	init({
		fallbackLocale: 'zh',
		initialLocale: getLocaleFromNavigator()
	});

	/** @type {boolean} */
	let isLoading = false;
	let hasError = false;

	/** @type {any} */
	let loaderUnsubscriber;
	/** @type {any} */
	let errorUnsubscriber;

	onMount(() => {
		window?.speechSynthesis?.cancel();

		// Initialize authentication state
		initializeAuth();

		loaderUnsubscriber = loaderStore.subscribe((value) => {
			isLoading = value;
			console.log('Loader state changed:', isLoading);
		});

		errorUnsubscriber = globalErrorStore.subscribe((value) => {
			hasError = value;
			console.log('Error state changed:', hasError);
		});
	});

	onDestroy(() => {
		loaderUnsubscriber?.();
		errorUnsubscriber?.();
	});
</script>

{#if isLoading}
	<Loader size={50} />
{/if}

<LoadingToComplete isError={hasError} />

<slot />

<style lang="scss">
	@import '$lib/scss/bootstrap.scss';
	@import '$lib/scss/app.scss';
	@import '$lib/scss/icons.scss';
</style>

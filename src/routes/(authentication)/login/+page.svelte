<script>
	import Link from 'svelte-link';
	import { _ } from 'svelte-i18n'
	import {
		Row,
		Col,
		CardBody,
		Card,
		Container,
		Form,
		Label,
		Input,
		Button,
		Alert
	} from '@sveltestrap/sveltestrap';
	import Headtitle from '$lib/common/HeadTitle.svelte';
	import MaterialTextField from '$lib/common/MaterialTextField.svelte';
	import MaterialButton from '$lib/common/MaterialButton.svelte';
	import { getToken } from '$lib/services/auth-service.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		PUBLIC_SERVICE_URL,
		PUBLIC_LIVECHAT_HOST,
		PUBLIC_LOGO_URL,
		PUBLIC_LOGIN_IMAGE,
		PUBLIC_BRAND_NAME,
		PUBLIC_ADMIN_USERNAME,
		PUBLIC_ADMIN_PASSWORD,
		PUBLIC_COMPANY_NAME,
		PUBLIC_ALLOW_SIGNUP,
		PUBLIC_AUTH_ENABLE_SSO,
		PUBLIC_AUTH_ENABLE_FIND_PWD,
	} from '$env/static/public';
	import { onMount } from 'svelte';
	import { resetLocalStorage } from '$lib/helpers/store';

	let username = PUBLIC_ADMIN_USERNAME;
	let password = PUBLIC_ADMIN_PASSWORD;
	let isOpen = false;
	let msg = '';
	let status = '';
	let isSubmitting = false;
	let isRememberMe = false;

	onMount(() => {
		const userName = localStorage.getItem('user_name');
		isRememberMe = userName !== null;
		if(isRememberMe){
			username = userName;
		}
	});
	function handleRememberMe(){
		if(isRememberMe){
			localStorage.setItem("user_name", username);
		}
		else {
			localStorage.removeItem("user_name");
		}
	}
	async function onSubmit(e) {
		isSubmitting = true;
		handleRememberMe();
		e.preventDefault();
		await getToken(username, password, () => {
			isOpen = true;
			msg = 'Authentication success';
			status = 'success';
			const redirectUrl = $page.url.searchParams.get('redirect');
			isSubmitting = false;
			resetLocalStorage();
			if (redirectUrl) {
				window.location.href = decodeURIComponent(redirectUrl);
			} else {
				goto('page/dashboard');
			}
		}, () => {
			isSubmitting = false;
			isOpen = true;
			status = 'danger';
			msg = 'Incorrect user name or password.'
			setTimeout(() => {
				isOpen = false;
				status = '';
				msg = '';
			}, 3000);
		});
		isSubmitting = false;
	}

	function onPasswordToggle() {
		var x = document.getElementById('user-password');
		if (!x) return;

		if (x.type === 'password') {
			x.type = 'text';
			var icon = document.getElementById('password-eye-icon');
			icon.className = 'mdi mdi-eye-off-outline';
		} else {
			x.type = 'password';
			var icon = document.getElementById('password-eye-icon');
			icon.className = 'mdi mdi-eye-outline';
		}
	}
</script>

<Headtitle title="Login" />
<div class="material-auth-page">
	<Container>
		<Row class="justify-content-center min-vh-100 align-items-center">
			<Col md={8} lg={6} xl={5}>
				<div class="material-auth-card">
					<div class="material-auth-header">
						<div class="material-auth-brand">
							<img src={PUBLIC_LOGO_URL} alt="Logo" class="material-auth-logo" />
							<h1 class="material-auth-title">{$_('Welcome Back!')}</h1>
							<p class="material-auth-subtitle">Sign in to continue to {PUBLIC_BRAND_NAME}</p>
						</div>
					</div>
					<div class="material-auth-content">
						{#if isOpen}
							<div class="material-alert material-alert--{status}" role="alert">
								{msg}
							</div>
						{/if}
						<Form class="material-auth-form" on:submit={onSubmit}>
							<MaterialTextField
								label="Username"
								type="text"
								id="username"
								placeholder="Enter username"
								disabled={isSubmitting}
								bind:value={username}
								required
							/>

							<MaterialTextField
								label="Password"
								type="password"
								id="user-password"
								placeholder="Enter password"
								disabled={isSubmitting}
								bind:value={password}
								required
								showPasswordToggle={true}
							/>

							<div class="material-checkbox">
								<input
									class="material-checkbox-input"
									type="checkbox"
									id="remember-check"
									disabled={isSubmitting}
									bind:checked={isRememberMe}
								/>
								<label class="material-checkbox-label" for="remember-check">
									<span class="material-checkbox-checkmark"></span>
									Remember me
								</label>
							</div>

							<MaterialButton
								variant="filled"								size="large"
								className="material-login-button"
								disabled={isSubmitting}
								type="submit"
								class="material-auth-submit"
							>
								{!isSubmitting ? 'Log In' : 'Logging in...'}
							</MaterialButton>
							
							{#if PUBLIC_AUTH_ENABLE_SSO == 'true'}
								<div class="material-auth-divider">
									<span>or continue with</span>
								</div>

								<div class="material-auth-social">
									<Link
										class="material-social-button material-social-button--github"
										href="{PUBLIC_SERVICE_URL}/sso/GitHub?redirectUrl={PUBLIC_LIVECHAT_HOST}page/user/me"
										disabled={isSubmitting}
									>
										<i class="mdi mdi-github"></i>
										GitHub
									</Link>
									<Link
										class="material-social-button material-social-button--keycloak"
										href="{PUBLIC_SERVICE_URL}/sso/Keycloak?redirectUrl={PUBLIC_LIVECHAT_HOST}page/user/me"
										disabled={isSubmitting}
									>
										<i class="mdi mdi-cloud"></i>
										Keycloak
									</Link>
									<Link
										class="material-social-button material-social-button--google"
										href="{PUBLIC_SERVICE_URL}/sso/Google?redirectUrl={PUBLIC_LIVECHAT_HOST}page/user/me"
										disabled={isSubmitting}
									>
										<i class="mdi mdi-google"></i>
										Google
									</Link>
								</div>
							{/if}
							
							{#if PUBLIC_AUTH_ENABLE_FIND_PWD == 'true'}
								<div class="material-auth-links">
									<Link href="recoverpw" class="material-text-button" disabled={isSubmitting}>
										Forgot your password?
									</Link>
								</div>
							{/if}
						</Form>
					</div>
				</div>
				
				<div class="material-auth-footer">
					<p hidden={!(PUBLIC_ALLOW_SIGNUP === 'true')}>
						Don't have an account?
						<Link href="register" class="material-link" disabled={isSubmitting}>Sign up</Link>
					</p>
					<p class="material-copyright">
						© {new Date().getFullYear()} {PUBLIC_COMPANY_NAME}. 
						Crafted with <i class="mdi mdi-heart text-secondary"></i> by open source community
					</p>
				</div>
			</Col>
		</Row>
	</Container>
</div>

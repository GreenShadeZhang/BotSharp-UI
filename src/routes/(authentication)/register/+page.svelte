<script>
	import Link from 'svelte-link';
	import { Row, Col, CardBody, Card, Container, Form, Label, Input, Button, Alert } from '@sveltestrap/sveltestrap';
	import Headtitle from '$lib/common/HeadTitle.svelte';
	import MaterialTextField from '$lib/common/MaterialTextField.svelte';
	import MaterialButton from '$lib/common/MaterialButton.svelte';
	import { goto } from '$app/navigation';
	import { PUBLIC_LOGO_URL, PUBLIC_COMPANY_NAME } from '$env/static/public';

	let username = '';
	let emailid = '';
	let password = '';
	let isOpen = false;
	let msg = '';
	let status = '';
	async function onSubmit(e) {
		e.preventDefault();
		try {
			if(username.trim() == "" || emailid.trim()=="" || password.trim() == ""){
				isOpen = true;
				msg = 'All Fields are required';
				status = 'danger';
				return false;
			}
			
			const response = await fetch('https://api-node.themesbrand.website/auth/signup', {
				method: 'POST',
				body: JSON.stringify({ email: emailid, password: password,username: username}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();

			if (response.ok && data.message === 'success') {
				localStorage.setItem('authUser', JSON.stringify(data));
				isOpen = true;
				msg = 'Registration success. Redirecting...';
				status = 'success';
				setTimeout(function() {
					goto("login");
				},1500)
			} else {
				isOpen = true;
				msg = 'error';
				status = 'danger';
				const error = data.data || 'An error occurred';
				msg = error;
				return error;
			}
		} catch (error) {
			console.error('Error:', error);
			return 'An error occurred';
		}
	}
</script>

<Headtitle title="Register" />

<div class="material-auth-page">
	<Container>
		<Row class="justify-content-center min-vh-100 align-items-center">
			<Col md={8} lg={6} xl={5}>
				<div class="material-auth-card">
					<div class="material-auth-header">
						<div class="material-auth-brand">
							<img src={PUBLIC_LOGO_URL} alt="Logo" class="material-auth-logo" />
							<h1 class="material-auth-title">Create Account</h1>
							<p class="material-auth-subtitle">Get your free account now</p>
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
								label="Email"
								type="email"
								id="useremail"
								placeholder="Enter email"
								bind:value={emailid}
								required
							/>

							<MaterialTextField
								label="Username"
								type="text"
								id="username"
								placeholder="Enter username"
								bind:value={username}
								required
							/>

							<MaterialTextField
								label="Password"
								type="password"
								id="userpassword"
								placeholder="Enter password"
								bind:value={password}
								required
								showPasswordToggle={true}
							/>

							<MaterialButton
								variant="filled"								size="large"
								className="material-register-button"
								type="submit"
								class="material-auth-submit"
							>
								Create Account
							</MaterialButton>

							<div class="material-auth-divider">
								<span>or sign up with</span>
							</div>

							<div class="material-auth-social">
								<Link href="#" class="material-social-button material-social-button--facebook">
									<i class="mdi mdi-facebook"></i>
									Facebook
								</Link>
								<Link href="#" class="material-social-button material-social-button--twitter">
									<i class="mdi mdi-twitter"></i>
									Twitter
								</Link>
								<Link href="#" class="material-social-button material-social-button--google">
									<i class="mdi mdi-google"></i>
									Google
								</Link>
							</div>

							<div class="material-auth-terms">
								<p>
									By registering you agree to our 
									<Link href="#" class="material-link">Terms of Use</Link>
								</p>
							</div>
						</Form>
					</div>
				</div>
				
				<div class="material-auth-footer">
					<p>
						Already have an account?
						<Link href="login" class="material-link">Sign in</Link>
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

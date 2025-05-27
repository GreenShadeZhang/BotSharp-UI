<script>
	import Link from 'svelte-link';
	import { Row, Col, CardBody, Card, Container, Form, Label, Input, Button, Alert } from '@sveltestrap/sveltestrap';
	import Headtitle from '$lib/common/HeadTitle.svelte';
	import MaterialTextField from '$lib/common/MaterialTextField.svelte';
	import MaterialButton from '$lib/common/MaterialButton.svelte';
	import { PUBLIC_LOGO_URL, PUBLIC_COMPANY_NAME } from '$env/static/public';
</script>

<Headtitle title="Recover Password" />

<div class="material-auth-page">
	<Container>
		<Row class="justify-content-center min-vh-100 align-items-center">
			<Col md={8} lg={6} xl={5}>
				<div class="material-auth-card">
					<div class="material-auth-header">
						<div class="material-auth-brand">
							<img src={PUBLIC_LOGO_URL} alt="Logo" class="material-auth-logo" />
							<h1 class="material-auth-title">Reset Password</h1>
							<p class="material-auth-subtitle">Enter your email and we'll send you instructions</p>
						</div>
					</div>
					<div class="material-auth-content">
						<div class="material-alert material-alert--info" role="alert">
							<i class="mdi mdi-information"></i>
							We'll send reset instructions to your email address
						</div>
						
						<Form class="material-auth-form" action="page/dashboard">
							<MaterialTextField
								label="Email"
								type="email"
								id="useremail"
								placeholder="Enter your email address"
								required
							/>

							<MaterialButton
								variant="filled"								size="large"
								className="material-recovery-button"
								type="submit"
								class="material-auth-submit"
							>
								Send Reset Instructions
							</MaterialButton>
						</Form>
					</div>
				</div>
				
				<div class="material-auth-footer">
					<p>
						Remember your password?
						<Link href="login" class="material-link">Sign in here</Link>
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

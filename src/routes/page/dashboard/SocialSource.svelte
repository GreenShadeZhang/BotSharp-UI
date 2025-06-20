<script>
	import Link from 'svelte-link/src/Link.svelte';
	import { Card, CardBody, CardTitle, Col, Row } from '@sveltestrap/sveltestrap';
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
</script>

<Col xl={4}>
	{#if mounted}
		<div in:fly={{ y: 30, duration: 800, delay: 200 }}>
			<Card class="modern-social-card">
				<CardBody>
					<CardTitle class="modern-card-title">{$_('Channel Stats')}</CardTitle>
					<div class="text-center featured-channel">
						<div class="featured-icon">
							<i class="mdi mdi-facebook"></i>
						</div>
						<h5 class="channel-name">
							<Link class="channel-link">Facebook</Link>
						</h5>
						<div class="channel-stats">
							<span class="stat-number">125</span>
							<span class="stat-label">Conversations</span>
						</div>
						<p class="channel-description">
							{$_('Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus tincidunt.')}
						</p>
						<Link class="learn-more-link">
							{$_('Learn more')} <i class="mdi mdi-chevron-right" />
						</Link>
					</div>
					<Row class="mt-4 social-channels">
						<Col xs={4}>
							<div class="social-source-item">
								<div class="social-icon facebook">
									<i class="mdi mdi-facebook"></i>
								</div>
								<h6 class="social-platform">Facebook</h6>
								<p class="social-count">125 {$_('sales')}</p>
							</div>
						</Col>
						<Col xs={4}>
							<div class="social-source-item">
								<div class="social-icon twitter">
									<i class="mdi mdi-twitter"></i>
								</div>
								<h6 class="social-platform">Twitter</h6>
								<p class="social-count">112 {$_('sales')}</p>
							</div>
						</Col>
						<Col xs={4}>
							<div class="social-source-item">
								<div class="social-icon instagram">
									<i class="mdi mdi-instagram"></i>
								</div>
								<h6 class="social-platform">Instagram</h6>
								<p class="social-count">104 {$_('sales')}</p>
							</div>
						</Col>
					</Row>
				</CardBody>
			</Card>
		</div>
	{/if}
</Col>

<style>
.modern-social-card {
	border: none;
	border-radius: 20px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20px);
	background: rgba(255, 255, 255, 0.9);
	transition: all 0.3s ease;
}

.modern-social-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modern-card-title {
	font-size: 20px;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 25px;
}

.featured-channel {
	padding: 20px 0;
	border-bottom: 1px solid rgba(102, 126, 234, 0.1);
	margin-bottom: 20px;
}

.featured-icon {
	width: 80px;
	height: 80px;
	background: linear-gradient(45deg, #667eea, #764ba2);
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20px;
	box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.featured-icon i {
	font-size: 36px;
	color: white;
}

.channel-name {
	margin-bottom: 15px;
}

.channel-link {
	color: #2c3e50;
	text-decoration: none;
	font-size: 24px;
	font-weight: 600;
	transition: all 0.3s ease;
}

.channel-link:hover {
	color: #667eea;
	text-decoration: none;
}

.channel-stats {
	margin-bottom: 20px;
}

.stat-number {
	font-size: 32px;
	font-weight: 700;
	color: #667eea;
	display: block;
}

.stat-label {
	font-size: 14px;
	color: #6c757d;
	font-weight: 500;
}

.channel-description {
	color: #6c757d;
	font-size: 14px;
	line-height: 1.6;
	margin-bottom: 20px;
}

.learn-more-link {
	color: #667eea;
	font-weight: 600;
	text-decoration: none;
	font-size: 16px;
	transition: all 0.3s ease;
}

.learn-more-link:hover {
	color: #764ba2;
	text-decoration: none;
}

.social-channels {
	margin-top: 25px;
}

.social-source-item {
	text-align: center;
	padding: 15px 10px;
	background: rgba(102, 126, 234, 0.05);
	border-radius: 15px;
	transition: all 0.3s ease;
	margin-bottom: 10px;
}

.social-source-item:hover {
	background: rgba(102, 126, 234, 0.1);
	transform: translateY(-3px);
}

.social-icon {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 10px;
}

.social-icon.facebook {
	background: linear-gradient(45deg, #4267B2, #6196F3);
}

.social-icon.twitter {
	background: linear-gradient(45deg, #1DA1F2, #63B3ED);
}

.social-icon.instagram {
	background: linear-gradient(45deg, #E1306C, #F093FB);
}

.social-icon i {
	font-size: 18px;
	color: white;
}

.social-platform {
	font-size: 14px;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 5px;
}

.social-count {
	font-size: 12px;
	color: #6c757d;
	margin: 0;
	font-weight: 500;
}

@media (max-width: 768px) {
	.featured-icon {
		width: 60px;
		height: 60px;
	}
	
	.featured-icon i {
		font-size: 28px;
	}
	
	.stat-number {
		font-size: 28px;
	}
	
	.channel-link {
		font-size: 20px;
	}
}
</style>

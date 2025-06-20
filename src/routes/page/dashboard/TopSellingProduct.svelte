<script>
	import { Card, CardBody, CardTitle, Col, Progress, Table } from '@sveltestrap/sveltestrap';
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
	
	const clientData = [
		{
			city: 'San Francisco',
			count: 1456,
			percentage: 94,
			color: 'primary',
			icon: 'bx-building',
			gradient: 'linear-gradient(45deg, #667eea, #764ba2)'
		},
		{
			city: 'Los Angeles', 
			count: 1123,
			percentage: 82,
			color: 'success',
			icon: 'bx-buildings',
			gradient: 'linear-gradient(45deg, #28a745, #20c997)'
		},
		{
			city: 'San Diego',
			count: 1026,
			percentage: 70,
			color: 'warning',
			icon: 'bx-home-circle',
			gradient: 'linear-gradient(45deg, #ffc107, #fd7e14)'
		}
	];
</script>

<Col xl={4}>
	{#if mounted}
		<div in:fly={{ y: 30, duration: 800, delay: 600 }}>
			<Card class="modern-client-usage-card">
				<CardBody>
					<CardTitle class="modern-card-title">{$_('Top Client Usage')}</CardTitle>
					
					<div class="featured-location">
						<div class="location-icon">
							<i class="bx bx-map-pin"></i>
						</div>
						<h3 class="location-count">1,456</h3>
						<p class="location-name">San Francisco</p>
						<div class="location-badge">
							<i class="bx bx-trending-up"></i>
							Top Performer
						</div>
					</div>
					
					<div class="client-usage-list">
						{#each clientData as client, index}
							<div class="usage-item" in:fly={{ x: -20, duration: 500, delay: 800 + index * 100 }}>
								<div class="usage-info">
									<div class="city-icon" style="background: {client.gradient}">
										<i class="bx {client.icon}"></i>
									</div>
									<div class="city-details">
										<h6 class="city-name">{client.city}</h6>
										<span class="city-count">{client.count.toLocaleString()}</span>
									</div>
								</div>
								<div class="usage-progress">
									<div class="progress-info">
										<span class="progress-percentage">{client.percentage}%</span>
									</div>
									<div class="modern-progress">
										<div class="progress-bar" style="width: {client.percentage}%; background: {client.gradient}"></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</CardBody>
			</Card>
		</div>
	{/if}
</Col>

<style>
.modern-client-usage-card {
	border: none;
	border-radius: 20px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20px);
	background: rgba(255, 255, 255, 0.9);
	transition: all 0.3s ease;
}

.modern-client-usage-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modern-card-title {
	font-size: 20px;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 25px;
}

.featured-location {
	text-align: center;
	padding: 25px 0;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
	border-radius: 15px;
	margin-bottom: 30px;
	position: relative;
	overflow: hidden;
}

.featured-location::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
}

.location-icon {
	width: 80px;
	height: 80px;
	background: linear-gradient(45deg, #667eea, #764ba2);
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20px;
	box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
	position: relative;
	z-index: 2;
}

.location-icon i {
	font-size: 36px;
	color: white;
}

.location-count {
	font-size: 36px;
	font-weight: 700;
	color: #2c3e50;
	margin-bottom: 8px;
	position: relative;
	z-index: 2;
}

.location-name {
	font-size: 18px;
	font-weight: 600;
	color: #6c757d;
	margin-bottom: 15px;
	position: relative;
	z-index: 2;
}

.location-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: rgba(40, 167, 69, 0.1);
	color: #28a745;
	padding: 6px 15px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
	border: 1px solid rgba(40, 167, 69, 0.2);
	position: relative;
	z-index: 2;
}

.client-usage-list {
	margin-top: 25px;
}

.usage-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 0;
	border-bottom: 1px solid rgba(102, 126, 234, 0.1);
	transition: all 0.3s ease;
}

.usage-item:last-child {
	border-bottom: none;
}

.usage-item:hover {
	background: rgba(102, 126, 234, 0.02);
	padding-left: 10px;
	padding-right: 10px;
	border-radius: 10px;
}

.usage-info {
	display: flex;
	align-items: center;
	gap: 15px;
	flex: 1;
}

.city-icon {
	width: 45px;
	height: 45px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.city-icon i {
	font-size: 20px;
	color: white;
}

.city-details {
	flex: 1;
}

.city-name {
	font-size: 16px;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 4px;
}

.city-count {
	font-size: 14px;
	color: #6c757d;
	font-weight: 500;
}

.usage-progress {
	flex: 0 0 120px;
	text-align: right;
}

.progress-info {
	margin-bottom: 8px;
}

.progress-percentage {
	font-size: 14px;
	font-weight: 600;
	color: #2c3e50;
}

.modern-progress {
	width: 100%;
	height: 6px;
	background: rgba(102, 126, 234, 0.1);
	border-radius: 3px;
	overflow: hidden;
	position: relative;
}

.progress-bar {
	height: 100%;
	border-radius: 3px;
	transition: width 0.8s ease;
	position: relative;
}

.progress-bar::after {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
	animation: shimmer 2s infinite;
}

@keyframes shimmer {
	0% { left: -100%; }
	100% { left: 100%; }
}

@media (max-width: 768px) {
	.location-icon {
		width: 60px;
		height: 60px;
	}
	
	.location-icon i {
		font-size: 28px;
	}
	
	.location-count {
		font-size: 28px;
	}
	
	.location-name {
		font-size: 16px;
	}
	
	.usage-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}
	
	.usage-progress {
		width: 100%;
		text-align: left;
	}
	
	.city-icon {
		width: 40px;
		height: 40px;
	}
	
	.city-icon i {
		font-size: 18px;
	}
}
</style>

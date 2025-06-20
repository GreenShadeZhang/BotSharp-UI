<script>
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import Breadcrumb from '$lib/common/Breadcrumb.svelte';
	import { _ } from 'svelte-i18n'
	import {
		Card,
		Col,
		Row,
		Image,
		CardBody,
		CardTitle,
		Nav,
		NavItem,
		Input,
		Button
	} from '@sveltestrap/sveltestrap';
	import { fade, fly } from 'svelte/transition';

	import Link from 'svelte-link/src/Link.svelte';
	import RadialBarChart from './RadialBarChart.svelte';
	import StackedColumnChart from './StackedColumnChart.svelte';
	import SocialSource from './SocialSource.svelte';
	import Activity from './Activity.svelte';
	import TopSellingProduct from './TopSellingProduct.svelte';
	import { 
		PUBLIC_LOGIN_IMAGE,
		PUBLIC_BRAND_NAME
	} from '$env/static/public';
	import { onMount } from 'svelte';
	import { getUserStore, userStore } from '$lib/helpers/store';
	import Conversation from './Conversation.svelte';
	import { getDashboardSettings } from '$lib/services/dashboard-service';	
	let subscribemodal = false;
	let user = {full_name: "", id: ""};
	let mounted = false;

	/**
	 * @type {import("../../../lib/helpers/types/userTypes").DashboardModel}
	 */
	let dashboard_model ;
	const togglesubscribemodal = (() => {
		subscribemodal = !subscribemodal;
	})

	onMount(() => {
		mounted = true;
		const userModelSubscribe = userStore.subscribe((/** @type {{ full_name: string; id: string }} */ value) => {
			user = value;
		})
		user = getUserStore();
		loadDashboardComponents(user.id);
		setTimeout(() => {
			subscribemodal = true;
		}, 1000);
	})

	/**
	 * @param {string} userId The user input
	 */
	async function loadDashboardComponents(userId) {
		getDashboardSettings()
		.then(
			response => {
				dashboard_model = response
			}
		)
		.catch();
	}
</script>

<HeadTitle title={$_('Dashboard')} />

<!-- Modern Dashboard Background -->
<div class="dashboard-background">
	<div class="dashboard-particles"></div>
</div>

<div class="dashboard-container">
	{#if mounted}
		<div in:fade={{ duration: 600 }}>
			<Breadcrumb title="{$_('Home')}" pagetitle="{$_('Dashboard')}" />
		</div>
	{/if}
	<Row class="dashboard-main-row">
		<Col xl={4} lg={5} md={12} class="dashboard-left-col">
			{#if mounted}
				<div in:fly={{ x: -50, duration: 800, delay: 200 }} class="card-container">
					<Card class="overflow-hidden modern-welcome-card">
						<div class="welcome-card-gradient">
							<Row class="row align-items-center">
								<Col xs={8} sm={7} class="welcome-text-col">
									<div class="text-white p-3 p-md-4">
										<div class="welcome-badge">
											<i class="fas fa-sparkles me-2"></i>
											{$_('Welcome Back !')}
										</div>
										<h5 class="text-white mb-2 welcome-title">{$_('Welcome Back !')}</h5>
										<p class="welcome-brand">{PUBLIC_BRAND_NAME}</p>
									</div>
								</Col>
								<Col xs={4} sm={5} class="align-self-end welcome-image-col">
									<div class="welcome-image-container">
										<Image src={PUBLIC_LOGIN_IMAGE} alt="" class="img-fluid welcome-image" />
									</div>
								</Col>
							</Row>
						</div>
						<CardBody class="pt-0 modern-card-body">
							<Row class="profile-stats-row">
								<Col lg={12} xl={4} class="profile-col order-1 order-xl-1">
									<div class="profile-section">
										<div class="avatar-container">
											<Image src='images/users/user-dummy.jpg' alt="" class="profile-avatar" />
											<div class="avatar-status"></div>
										</div>
										<h5 class="profile-name">{user?.full_name}</h5>
										<p class="profile-role">{$_('Agent Manager')}</p>
									</div>
								</Col>
								<Col lg={12} xl={8} class="stats-col order-2 order-xl-2">
									<div class="stats-section">
										<Row class="stats-row">
											<Col xs={6} class="stat-col">
												<div class="stat-card">
													<h5 class="stat-number">125</h5>
													<p class="stat-label">Conversations</p>
												</div>
											</Col>
											<Col xs={6} class="stat-col">
												<div class="stat-card">
													<h5 class="stat-number">$1245</h5>
													<p class="stat-label">{$_('Token Cost')}</p>
												</div>
											</Col>
										</Row>
										<div class="profile-action">
											<Link href="page/user/me" class="modern-btn-primary">
												{$_('View Profile')} <i class="mdi mdi-arrow-right ms-1" />
											</Link>
										</div>
									</div>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</div>
			{/if}			{#if mounted}
				<div in:fly={{ x: -50, duration: 800, delay: 400 }} class="card-container">
					<Card class="modern-stats-card">
						<CardBody>
							<CardTitle class="modern-card-title">{$_('Monthly Cost')}</CardTitle>
							<Row class="cost-chart-row">
								<Col lg={6} class="cost-info-col">
									<div class="cost-info">
										<p class="cost-period">{$_('This month')}</p>
										<h3 class="cost-amount">$34,252</h3>
										<p class="cost-change">
											<span class="trend-positive"> 
												<i class="mdi mdi-trending-up" /> 12%
											</span> 
											{$_('From previous period')}
										</p>
										<div class="cost-action">
											<Link class="modern-btn-secondary">
												{$_('View More')} <i class="mdi mdi-arrow-right ms-1" />
											</Link>
										</div>
									</div>
								</Col>
								<Col lg={6} class="chart-col">
									<div class="chart-container">
										<RadialBarChart chartColor={['--bs-primary']} />
									</div>
								</Col>
							</Row>
							<p class="card-description">{$_('We craft digital, graphic and dimensional thinking.')}</p>
						</CardBody>
					</Card>
				</div>
			{/if}
		</Col>
		<Col xl={8} lg={7} md={12} class="dashboard-right-col">
			<Row class="mini-stats-row">{#if mounted}
				{#each [
					{ icon: 'bx-copy-alt', label: 'Conversations', value: '1,235', delay: 200 },
					{ icon: 'bx-archive-in', label: $_('Total Cost'), value: '$35,723', delay: 300 },
					{ icon: 'bx-purchase-tag-alt', label: $_('Average Cost'), value: '$16.2', delay: 400 }
				] as stat, index}
					<Col xl={4} lg={4} md={6} sm={6} class="mini-stat-col">
						<div in:fly={{ y: 30, duration: 600, delay: stat.delay }} class="card-container">
							<Card class="modern-mini-stats">
								<CardBody>
									<div class="mini-stats-content">
										<div class="stats-info">
											<p class="stats-label">{stat.label}</p>
											<h4 class="stats-value">{stat.value}</h4>
										</div>
										<div class="stats-icon">
											<div class="icon-container">
												<i class="bx {stat.icon}"></i>
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</Col>				{/each}
			{/if}
			</Row>

			{#if mounted}
				<div in:fly={{ y: 30, duration: 800, delay: 600 }} class="card-container">
					<Card class="modern-chart-card">
						<CardBody>
							<div class="chart-header">
								<CardTitle class="modern-card-title">{$_('Token Spent')}</CardTitle>
								<div class="chart-nav">
									<Nav pills class="modern-nav-pills">
										<NavItem>
											<Link href="#" class="nav-link">{$_('Week')}</Link>
										</NavItem>
										<NavItem>
											<Link href="#" class="nav-link">{$_('Month')}</Link>
										</NavItem>
										<NavItem>
											<Link href="#" class="nav-link active">{$_('Year')}</Link>
										</NavItem>
									</Nav>
								</div>
							</div>
							<div class="chart-wrapper">
								<StackedColumnChart chartColor={['--bs-primary', '--bs-warning', '--bs-success']} />
							</div>
						</CardBody>
					</Card>
				</div>
			{/if}
		</Col>
	</Row>

	<Row class="conversations-row">
		{#each dashboard_model?.conversation_list || [] as conv, index (conv.conversation_id)}
			{#if conv?.conversation_id}
				{#if mounted}
					<Col xl={6} lg={6} md={12} class="conversation-col">
						<div in:fly={{ y: 30, duration: 600, delay: 800 + index * 100 }} class="card-container">
							<Conversation conversationId={conv.conversation_id} instruction={conv.instruction} userId={user.id}/>
						</div>
					</Col>
				{/if}
			{/if}
		{/each}
	</Row>

	{#if mounted}
		<div in:fade={{ duration: 800, delay: 1000 }}>
			<Row>
				<SocialSource />
				<Activity />
				<TopSellingProduct />
			</Row>
		</div>
	{/if}
</div>

<style>
/* Dashboard Background */
.dashboard-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    z-index: -2;
}

.dashboard-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(2px 2px at 20px 30px, rgba(102, 126, 234, 0.1), transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(118, 75, 162, 0.1), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(102, 126, 234, 0.15), transparent),
        radial-gradient(1px 1px at 130px 80px, rgba(118, 75, 162, 0.1), transparent);
    background-repeat: repeat;
    background-size: 150px 100px;
    animation: float 20s linear infinite;
}

@keyframes float {
    0% { transform: translate(0px, 0px); }
    33% { transform: translate(30px, -30px); }
    66% { transform: translate(-20px, 20px); }
    100% { transform: translate(0px, 0px); }
}

.dashboard-container {
    position: relative;
    z-index: 1;
    padding: 20px 0;
    min-height: calc(100vh - 200px);
}

/* Layout Structure */
.dashboard-main-row {
    margin: 0 -15px;
}

.dashboard-left-col,
.dashboard-right-col {
    padding: 0 15px;
}

.card-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-container .card {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-container .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Mini Stats Row */
.mini-stats-row {
    margin: 0 -10px;
}

.mini-stat-col {
    padding: 0 10px;
    margin-bottom: 20px;
}

.conversations-row {
    margin: 25px -15px 0;
}

.conversation-col {
    padding: 0 15px;
    margin-bottom: 25px;
}

/* Modern Welcome Card */
.modern-welcome-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.9);
    margin-bottom: 25px;
    overflow: hidden;
    height: 100%;
    min-height: 400px;
}

.welcome-card-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
    min-height: 140px;
    display: flex;
    align-items: center;
}

.welcome-card-gradient::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.welcome-text-col,
.welcome-image-col {
    display: flex;
    align-items: center;
}

.welcome-title {
    font-size: 1.1rem;
    line-height: 1.3;
}

@media (max-width: 575px) {
    .welcome-title {
        font-size: 1rem;
    }
}

.welcome-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 15px;
    color: rgba(255, 255, 255, 0.9);
}

.welcome-brand {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 500;
}

.welcome-image-container {
    position: relative;
    height: 120px;
    overflow: hidden;
}

.welcome-image {
    max-height: 100%;
    width: auto;
    object-fit: contain;
}

.modern-card-body {
    padding: 25px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.profile-stats-row {
    flex: 1;
    margin: 0;
    align-items: stretch;
}

.profile-col,
.stats-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 15px;
}

/* Profile Section */
.profile-section {
    text-align: center;
    padding: 10px 0;
}

.avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 15px;
}

.profile-avatar {
    width: 70px;
    height: 70px;
    border-radius: 18px;
    object-fit: cover;
    border: 3px solid #fff;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.avatar-status {
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 14px;
    height: 14px;
    background: #28a745;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 5px;
    line-height: 1.2;
}

.profile-role {
    color: #6c757d;
    font-size: 13px;
    font-weight: 500;
    margin: 0;
}

/* Stats Section */
.stats-section {
    padding: 10px 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.stats-row {
    margin: 0 -5px;
    flex: 1;
    align-items: stretch;
}

.stat-col {
    padding: 0 5px;
    display: flex;
}

.stat-card {
    text-align: center;
    padding: 15px 10px;
    background: linear-gradient(45deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
    border-radius: 12px;
    border: 1px solid rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.stat-number {
    font-size: 20px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 5px;
    line-height: 1.2;
}

.stat-label {
    font-size: 12px;
    color: #6c757d;
    margin: 0;
    font-weight: 500;
    line-height: 1.2;
}

.profile-action {
    margin-top: 15px;
    text-align: center;
}

/* Modern Stats Card */
.modern-stats-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.9);
    height: 100%;
    min-height: 400px;
}

.modern-stats-card .card-body {
    padding: 25px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.cost-chart-row {
    flex: 1;
    margin: 0;
    align-items: center;
}

.cost-info-col,
.chart-col {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
}

.modern-card-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 25px;
}

.cost-info {
    text-align: center;
    width: 100%;
}

.cost-period {
    color: #6c757d;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}

.cost-amount {
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 15px;
    line-height: 1.2;
}

.cost-change {
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 20px;
}

.trend-positive {
    color: #28a745;
    font-weight: 600;
}

.trend-positive i {
    margin-right: 4px;
}

.cost-action {
    margin-top: 15px;
}

.chart-container {
    padding: 15px 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.card-description {
    color: #6c757d;
    font-size: 14px;
    margin: 20px 0 0;
    font-style: italic;
    text-align: center;
}

/* Modern Mini Stats */
.modern-mini-stats {
    border: none;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    height: 100%;
    min-height: 120px;
}

.modern-mini-stats:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.modern-mini-stats .card-body {
    padding: 20px;
    display: flex;
    align-items: center;
    height: 100%;
}

.mini-stats-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.stats-info {
    flex: 1;
    min-width: 0;
}

.stats-label {
    color: #6c757d;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
    line-height: 1.2;
}

.stats-value {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    line-height: 1.2;
}

.stats-icon {
    flex-shrink: 0;
    margin-left: 15px;
}

.icon-container {
    width: 50px;
    height: 50px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.icon-container i {
    font-size: 20px;
    color: white;
}

/* Modern Chart Card */
.modern-chart-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.9);
    margin-top: 25px;
}

.modern-chart-card .card-body {
    padding: 25px;
}

.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 25px;
    gap: 15px;
}

.chart-nav {
    flex-shrink: 0;
}

.modern-nav-pills {
    background: rgba(102, 126, 234, 0.1);
    border-radius: 25px;
    padding: 5px;
    display: flex;
    flex-wrap: nowrap;
}

.modern-nav-pills .nav-link {
    border-radius: 20px;
    padding: 8px 16px;
    font-weight: 500;
    font-size: 13px;
    color: #667eea;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.modern-nav-pills .nav-link.active {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modern-nav-pills .nav-link:hover:not(.active) {
    background: rgba(102, 126, 234, 0.15);
    color: #667eea;
}

.chart-wrapper {
    padding: 10px 0;
    min-height: 300px;
}

/* Modern Buttons */
.modern-btn-primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: none;
    border-radius: 25px;
    padding: 10px 20px;
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.modern-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: none;
}

.modern-btn-secondary {
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 25px;
    padding: 10px 20px;
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.modern-btn-secondary:hover {
    background: rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
    color: #667eea;
    text-decoration: none;
}

/* Enhanced Breadcrumb Styling */
:global(.breadcrumb) {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 15px 20px;
    margin-bottom: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 1200px) {
    .dashboard-container {
        padding: 15px 0;
    }
    
    .modern-card-title {
        font-size: 18px;
    }
    
    .cost-amount {
        font-size: 28px;
    }
    
    .stats-value {
        font-size: 22px;
    }
    
    .icon-container {
        width: 45px;
        height: 45px;
    }
    
    .icon-container i {
        font-size: 18px;
    }
}

@media (max-width: 992px) {
    .dashboard-left-col {
        margin-bottom: 25px;
    }
    
    .profile-stats-row {
        flex-direction: column;
    }
    
    .profile-col {
        order: 1;
        margin-bottom: 20px;
    }
    
    .stats-col {
        order: 2;
    }
    
    .cost-chart-row {
        flex-direction: column;
        text-align: center;
    }
    
    .cost-info-col {
        margin-bottom: 20px;
    }
    
    .modern-welcome-card,
    .modern-stats-card {
        min-height: auto;
    }
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 10px 0;
    }
    
    .modern-card-title {
        font-size: 17px;
    }
    
    .cost-amount {
        font-size: 26px;
    }
    
    .stats-value {
        font-size: 20px;
    }
    
    .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .chart-nav {
        width: 100%;
    }
    
    .modern-nav-pills {
        width: 100%;
        justify-content: center;
    }
    
    .welcome-card-gradient {
        min-height: 120px;
    }
    
    .modern-card-body {
        padding: 20px;
    }
    
    .mini-stats-row {
        margin: 0 -5px;
    }
    
    .mini-stat-col {
        padding: 0 5px;
        margin-bottom: 15px;
    }
    
    .modern-mini-stats {
        min-height: 100px;
    }
    
    .modern-mini-stats .card-body {
        padding: 15px;
    }
}

@media (max-width: 576px) {
    .dashboard-main-row,
    .conversations-row {
        margin: 0 -10px;
    }
    
    .dashboard-left-col,
    .dashboard-right-col,
    .conversation-col {
        padding: 0 10px;
    }
    
    .stats-section {
        text-align: center;
    }
    
    .stats-row {
        margin: 0 -3px;
    }
    
    .stat-col {
        padding: 0 3px;
    }
    
    .stat-card {
        padding: 12px 8px;
        min-height: 70px;
    }
    
    .stat-number {
        font-size: 18px;
    }
    
    .stat-label {
        font-size: 11px;
    }
    
    .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: 15px;
    }
    
    .avatar-status {
        width: 12px;
        height: 12px;
        bottom: 2px;
        right: 2px;
    }
    
    .profile-name {
        font-size: 15px;
    }
    
    .profile-role {
        font-size: 12px;
    }
    
    .icon-container {
        width: 40px;
        height: 40px;
    }
    
    .icon-container i {
        font-size: 16px;
    }
    
    .stats-value {
        font-size: 18px;
    }
    
    .stats-label {
        font-size: 12px;
    }
    
    .cost-amount {
        font-size: 24px;
    }
    
    .modern-nav-pills .nav-link {
        padding: 6px 12px;
        font-size: 12px;
    }
    
    .welcome-title {
        font-size: 0.95rem;
    }
    
    .welcome-badge {
        font-size: 11px;
        padding: 4px 10px;
    }
}

@media (max-width: 480px) {
    .mini-stats-content {
        flex-direction: column;
        text-align: center;
        gap: 10px;
    }
    
    .stats-icon {
        margin-left: 0;
    }
    
    .chart-wrapper {
        min-height: 250px;
    }
    
    .modern-mini-stats {
        min-height: 120px;
    }
}

/* Animation for loading states */
@keyframes shimmer {
    0% {
        background-position: -468px 0;
    }
    100% {
        background-position: 468px 0;
    }
}

.loading-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
    background-size: 800px 104px;
}

/* Smooth transitions for all cards */
.modern-welcome-card,
.modern-stats-card,
.modern-mini-stats,
.modern-chart-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
.modern-btn-primary:focus,
.modern-btn-secondary:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}
</style>
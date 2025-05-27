<script>
	import HeadTitle from '$lib/common/HeadTitle.svelte';
	import Breadcrumb from '$lib/common/Breadcrumb.svelte';
	import MaterialCard from '$lib/common/MaterialCard.svelte';
	import MaterialButton from '$lib/common/MaterialButton.svelte';
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

	/**
	 * @type {import("../../../lib/helpers/types/userTypes").DashboardModel}
	 */
	let dashboard_model ;
	const togglesubscribemodal = (() => {
		subscribemodal = !subscribemodal;
	})

	onMount(() => {
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

<Breadcrumb title="{$_('Home')}" pagetitle="{$_('Dashboard')}" />

<div class="material-dashboard">
	<Row class="g-4">
		<Col xl={4}>
			<MaterialCard variant="elevated" class="material-welcome-card">
				<div class="material-welcome-header">
					<div class="material-welcome-content">
						<h2 class="material-welcome-title">{$_('Welcome Back!')}</h2>
						<p class="material-welcome-subtitle">{PUBLIC_BRAND_NAME}</p>
					</div>
					<div class="material-welcome-illustration">
						<Image src={PUBLIC_LOGIN_IMAGE} alt="Welcome" class="material-welcome-image" />
					</div>
				</div>
				<div class="material-profile-section">
					<div class="material-profile-info">
						<div class="material-avatar">
							<Image src='images/users/user-dummy.jpg' alt="Profile" class="material-avatar-image" />
						</div>
						<div class="material-profile-details">
							<h3 class="material-profile-name">{user?.full_name}</h3>
							<p class="material-profile-role">{$_('Agent Manager')}</p>
						</div>
					</div>
					<div class="material-profile-stats">
						<div class="material-stat-item">
							<span class="material-stat-value">125</span>
							<span class="material-stat-label">Conversations</span>
						</div>
						<div class="material-stat-item">
							<span class="material-stat-value">$1,245</span>
							<span class="material-stat-label">{$_('Token Cost')}</span>
						</div>
					</div>
					<div class="material-profile-actions">
						<MaterialButton 
							variant="filled" 
							href="page/user/me"
							class="material-profile-button"
						>
							{$_('View Profile')}
							<i class="mdi mdi-arrow-right"></i>
						</MaterialButton>
					</div>
				</div>
			</MaterialCard>
			
			<MaterialCard variant="elevated" class="material-cost-card">
				<div class="material-card-header">
					<h3 class="material-card-title">{$_('Monthly Cost')}</h3>
				</div>
				<div class="material-cost-content">
					<div class="material-cost-info">
						<p class="material-cost-period">{$_('This month')}</p>
						<h2 class="material-cost-amount">$34,252</h2>
						<div class="material-cost-change">
							<span class="material-cost-percentage material-cost-percentage--positive">
								<i class="mdi mdi-trending-up"></i>
								12%
							</span>
							<span class="material-cost-description">{$_('From previous period')}</span>
						</div>
						<MaterialButton 
							variant="filled" 
							size="small"
							class="material-cost-button"
						>
							{$_('View More')}
							<i class="mdi mdi-arrow-right"></i>
						</MaterialButton>
					</div>
					<div class="material-cost-chart">
						<RadialBarChart chartColor={['--md-sys-color-primary']} />
					</div>
				</div>
				<p class="material-cost-note">{$_('We craft digital, graphic and dimensional thinking.')}</p>
			</MaterialCard>
		</Col>
		
		<Col xl={8}>
			<Row class="g-4">
				<Col md={4}>
					<MaterialCard variant="filled" class="material-stats-card">
						<div class="material-stats-content">
							<div class="material-stats-info">
								<p class="material-stats-label">Conversations</p>
								<h3 class="material-stats-value">1,235</h3>
							</div>
							<div class="material-stats-icon">
								<i class="mdi mdi-chat-outline"></i>
							</div>
						</div>
					</MaterialCard>
				</Col>
				<Col md={4}>
					<MaterialCard variant="filled" class="material-stats-card">
						<div class="material-stats-content">
							<div class="material-stats-info">
								<p class="material-stats-label">{$_('Total Cost')}</p>
								<h3 class="material-stats-value">$35,723</h3>
							</div>
							<div class="material-stats-icon">
								<i class="mdi mdi-currency-usd"></i>
							</div>
						</div>
					</MaterialCard>
				</Col>
				<Col md={4}>
					<MaterialCard variant="filled" class="material-stats-card">
						<div class="material-stats-content">
							<div class="material-stats-info">
								<p class="material-stats-label">{$_('Average Cost')}</p>
								<h3 class="material-stats-value">$16.2</h3>
							</div>
							<div class="material-stats-icon">
								<i class="mdi mdi-chart-line"></i>
							</div>
						</div>
					</MaterialCard>
				</Col>
			</Row>
			
			<MaterialCard variant="elevated" class="material-chart-card">
				<div class="material-chart-header">
					<h3 class="material-chart-title">{$_('Token Spent')}</h3>
					<div class="material-chart-tabs">
						<div class="material-tab-group">
							<button class="material-tab">{$_('Week')}</button>
							<button class="material-tab">{$_('Month')}</button>
							<button class="material-tab material-tab--active">{$_('Year')}</button>
						</div>
					</div>
				</div>
				<div class="material-chart-content">
					<StackedColumnChart chartColor={['--md-sys-color-primary', '--md-sys-color-secondary', '--md-sys-color-tertiary']} />
				</div>
			</MaterialCard>
		</Col>
	</Row>

	<Row class="g-4">
		{#each dashboard_model?.conversation_list || [] as conv, index (conv.conversation_id)}
			{#if conv?.conversation_id}
				<Conversation conversationId={conv.conversation_id} instruction={conv.instruction} userId={user.id}/>
			{/if}
		{/each}
	</Row>

	<Row class="g-4">
		<SocialSource />
		<Activity />
		<TopSellingProduct />
	</Row>
</div>
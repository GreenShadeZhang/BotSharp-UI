<script>
	import { Row, Col, Breadcrumb, BreadcrumbItem } from '@sveltestrap/sveltestrap';
	import Link from 'svelte-link';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	 export let title = '';
	export let pagetitle = '';
</script>

<Row>
	<Col xs="12">		<div class="modern-page-title-box" in:fly={{ x: -30, duration: 600 }}>
			<div class="page-title-content">
				<h4 class="modern-page-title">{$_(pagetitle)}</h4>
				<div class="modern-breadcrumb">
					<ol class="breadcrumb-list">
						<BreadcrumbItem>
							<Link class="breadcrumb-link" disabled>
								<i class="bx bx-home-alt"></i>
								{$_(title)}
							</Link>
						</BreadcrumbItem>
						<BreadcrumbItem class="breadcrumb-separator">
							<i class="bx bx-chevron-right"></i>
						</BreadcrumbItem>
						<BreadcrumbItem class="breadcrumb-active">
							{$_(pagetitle)}
						</BreadcrumbItem>
					</ol>
				</div>
			</div>
		</div>
	</Col>
</Row>

<style>
.modern-page-title-box {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-radius: 15px;
	padding: 20px 25px;
	margin-bottom: 25px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
	position: relative;
	overflow: hidden;
}

.modern-page-title-box::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
	background: linear-gradient(45deg, #667eea, #764ba2);
}

.page-title-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
}

.modern-page-title {
	font-size: 24px;
	font-weight: 600;
	color: #2c3e50;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 10px;
}

.modern-page-title::before {
	content: '';
	width: 4px;
	height: 24px;
	background: linear-gradient(45deg, #667eea, #764ba2);
	border-radius: 2px;
}

.modern-breadcrumb {
	display: flex;
	align-items: center;
}

.breadcrumb-list {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 0;
	padding: 0;
	list-style: none;
	background: rgba(102, 126, 234, 0.05);
	border-radius: 20px;
	padding: 8px 16px;
}

:global(.breadcrumb-list .breadcrumb-item) {
	margin: 0;
}

.breadcrumb-link {
	color: #667eea;
	text-decoration: none;
	font-weight: 500;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 6px;
	transition: all 0.3s ease;
	padding: 4px 8px;
	border-radius: 10px;
}

.breadcrumb-link:hover {
	color: #764ba2;
	background: rgba(102, 126, 234, 0.1);
	text-decoration: none;
}

.breadcrumb-link i {
	font-size: 16px;
}

:global(.breadcrumb-separator) {
	color: rgba(102, 126, 234, 0.5);
	font-size: 12px;
	margin: 0 4px;
}

:global(.breadcrumb-active) {
	color: #2c3e50;
	font-weight: 600;
	font-size: 14px;
	background: rgba(102, 126, 234, 0.1);
	padding: 4px 12px;
	border-radius: 10px;
}

@media (max-width: 768px) {
	.page-title-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}
	
	.modern-page-title {
		font-size: 20px;
	}
	
	.modern-breadcrumb {
		width: 100%;
	}
	
	.breadcrumb-list {
		flex-wrap: wrap;
		width: 100%;
		justify-content: flex-start;
	}
}

@media (max-width: 576px) {
	.modern-page-title-box {
		padding: 15px 20px;
		margin-bottom: 20px;
	}
	
	.modern-page-title {
		font-size: 18px;
	}
	
	.breadcrumb-link {
		font-size: 13px;
	}
	
	:global(.breadcrumb-active) {
		font-size: 13px;
	}
}
</style>

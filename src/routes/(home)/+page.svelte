<script>
    import Link from "svelte-link";
    import { fade, fly } from 'svelte/transition';
    import { Container, Row, Col, Button, Card, CardBody } from '@sveltestrap/sveltestrap';
    import HeadTitle from "$lib/common/HeadTitle.svelte";
    import LanguageDropdown from "$lib/common/LanguageDropdown.svelte";
    import { _ } from 'svelte-i18n';
    import { 
        PUBLIC_LOGO_URL, 
        PUBLIC_BRAND_NAME, 
        PUBLIC_COMPANY_WEBSITE,
        PUBLIC_HOME_SLOGAN, 
        PUBLIC_HOME_IMAGE 
    } from '$env/static/public';
    import { onMount, onDestroy } from 'svelte';
    import { initiateLogin, isAuthenticated } from '$lib/services/oidc-auth-service.js';
    
    let mounted = false;
    let userAuthenticated = false;
    /** @type {(() => void) | undefined} */
    let cleanup;
    	onMount(async () => {
        mounted = true;
        
        // Check authentication status
        userAuthenticated = isAuthenticated();
        
        // Add scroll effect to navigation
        if (typeof window !== 'undefined') {
            const nav = document.querySelector('.top-nav');
            const handleScroll = () => {
                if (window.scrollY > 100) {
                    nav?.classList.add('scrolled');
                } else {
                    nav?.classList.remove('scrolled');
                }
            };
            
            window.addEventListener('scroll', handleScroll);
            
            cleanup = () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
	});
	
	onDestroy(() => {
        cleanup?.();
    });

    const features = [
        {
            icon: "fas fa-robot",
            titleKey: "homepage.features.smart_agents.title",
            descKey: "homepage.features.smart_agents.description"
        },
        {
            icon: "fas fa-network-wired", 
            titleKey: "homepage.features.iot_integration.title",
            descKey: "homepage.features.iot_integration.description"
        },
        {
            icon: "fas fa-chart-line",
            titleKey: "homepage.features.real_time_analytics.title",
            descKey: "homepage.features.real_time_analytics.description"
        }
    ];

    const stats = [
        { number: "1M+", labelKey: "homepage.stats.devices" },
        { number: "50K+", labelKey: "homepage.stats.agents" },
        { number: "99.9%", labelKey: "homepage.stats.uptime" },
        { number: "24/7", labelKey: "homepage.stats.support" }
    ];

    /**
     * Handle login button click
     */
    function handleLogin() {
        if (userAuthenticated) {
            // User is already authenticated, redirect to chat
            window.location.href = '/page/dashboard';
        } else {
            // Initiate OIDC login flow
            initiateLogin();
        }
    }
</script>  
<HeadTitle title="{PUBLIC_BRAND_NAME} - AI Agent IoT Platform" />

<!-- Top Navigation Bar -->
<nav class="top-nav">
    <Container>
        <div class="nav-content">
            <!-- Brand Logo -->
            <div class="brand">
                <a href={PUBLIC_COMPANY_WEBSITE} class="brand-link">
                    <img src={PUBLIC_LOGO_URL} alt="logo" class="brand-logo" />
                    <span class="brand-name">{PUBLIC_BRAND_NAME}</span>
                </a>
            </div>
            
            <!-- Navigation Actions -->
            <div class="nav-actions">                <!-- Custom Language Selector -->
                <div class="language-selector" title="Select Language / 选择语言">
                    <LanguageDropdown />
                </div>                <!-- Login Button -->
                <Button 
                    on:click={handleLogin} 
                    color="primary" 
                    class="login-btn" 
                    title={userAuthenticated ? "Go to Dashboard" : "Login to Dashboard"}
                >
                    <i class="fas fa-user-circle me-2"></i>
                    {userAuthenticated ? ($_('Dashboard') || 'Dashboard') : ($_('Login') || 'Login')}
                </Button>
            </div>
        </div>
    </Container>
</nav>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-background">
        <div class="hero-particles"></div>
    </div>
    
    <Container class="hero-container">
        <Row class="align-items-center min-vh-100">
            <Col lg="6" class="hero-content">
                {#if mounted}
                    <div in:fly={{ x: -50, duration: 800, delay: 200 }}>
                        <div class="hero-badge">
                            <i class="fas fa-sparkles me-2"></i>
                            {$_('homepage.badge')}
                        </div>                        <h1 class="hero-title">
                            {#if $_('homepage.title').includes($_('homepage.title_highlight'))}
                                {$_('homepage.title').split($_('homepage.title_highlight'))[0]}<span class="gradient-text">{$_('homepage.title_highlight')}</span>{$_('homepage.title').split($_('homepage.title_highlight'))[1]}
                            {:else}
                                {$_('homepage.title')}
                            {/if}
                        </h1>
                        <p class="hero-description">
                            {$_('homepage.description')}
                        </p>                        <div class="hero-actions">
                            <Button 
                                on:click={handleLogin} 
                                color="primary" 
                                size="lg" 
                                class="me-3 hero-btn-primary"
                            >
                                <i class="fas fa-rocket me-2"></i>
                                {$_('homepage.get_started')}
                            </Button>
                            <Button href="/docs" outline color="light" size="lg" class="hero-btn-secondary">
                                <i class="fas fa-book me-2"></i>
                                {$_('homepage.documentation')}
                            </Button>
                        </div>
                    </div>
                {/if}
            </Col>
            <Col lg="6" class="text-center">
                {#if mounted}
                    <div in:fly={{ x: 50, duration: 800, delay: 400 }} class="hero-visual">
                        <div class="floating-cards">
                            <div class="floating-card card-1">
                                <i class="fas fa-microchip"></i>
                                <span>{$_('homepage.floating_cards.iot_device')}</span>
                            </div>
                            <div class="floating-card card-2">
                                <i class="fas fa-brain"></i>
                                <span>{$_('homepage.floating_cards.ai_agent')}</span>
                            </div>
                            <div class="floating-card card-3">
                                <i class="fas fa-cloud"></i>
                                <span>{$_('homepage.floating_cards.cloud')}</span>
                            </div>
                        </div>
                        <div class="hero-main-visual">
                            <i class="fas fa-robot"></i>
                        </div>
                    </div>
                {/if}
            </Col>
        </Row>
    </Container>
</section>

<!-- Stats Section -->
<section class="stats-section">
    <Container>
        <Row>
            {#each stats as stat, i}
                <Col lg="3" md="6" class="mb-4">
                    {#if mounted}
                        <div in:fly={{ y: 30, duration: 600, delay: 600 + i * 100 }} class="stat-item">
                            <h3 class="stat-number">{stat.number}</h3>
                            <p class="stat-label">{$_(stat.labelKey)}</p>
                        </div>
                    {/if}
                </Col>
            {/each}
        </Row>
    </Container>
</section>

<!-- Features Section -->
<section class="features-section">
    <Container>
        <Row class="justify-content-center mb-5">
            <Col lg="8" class="text-center">
                {#if mounted}                    <div transition:fade={{ duration: 800, delay: 1000 }}>
                        <h2 class="section-title">{$_('homepage.features.why_choose')}</h2>
                        <p class="section-subtitle">
                            {$_('homepage.features.subtitle')}
                        </p>
                    </div>
                {/if}
            </Col>
        </Row>
        <Row>
            {#each features as feature, i}                <Col lg="4" md="6" class="mb-4">
                    {#if mounted}
                        <div in:fly={{ y: 30, duration: 600, delay: 1200 + i * 150 }}>
                            <Card class="feature-card h-100">
                                <CardBody class="text-center p-4">
                                    <div class="feature-icon">
                                        <i class={feature.icon}></i>
                                    </div>                                    <h5 class="feature-title">{$_(feature.titleKey)}</h5>
                                    <p class="feature-description">{$_(feature.descKey)}</p>
                                </CardBody>
                            </Card>
                        </div>
                    {/if}
                </Col>
            {/each}
        </Row>
    </Container>
</section>

<!-- CTA Section -->
<section class="cta-section">
    <Container>
        <Row class="justify-content-center">
            <Col lg="8" class="text-center">
                {#if mounted}                    <div transition:fade={{ duration: 800, delay: 1800 }}>
                        <h2 class="cta-title">{$_('homepage.cta.title')}</h2>
                        <p class="cta-description">
                            {$_('homepage.cta.description')}
                        </p>                        <div class="cta-actions">
                            <Button 
                                on:click={handleLogin} 
                                color="primary" 
                                size="lg" 
                                class="me-3"
                            >
                                {$_('homepage.cta.action')}
                                <i class="fas fa-arrow-right ms-2"></i>
                            </Button>
                        </div>
                    </div>
                {/if}
            </Col>
        </Row>
    </Container>
</section>

<style>
/* Top Navigation */
.top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.5rem 0;
    transition: all 0.3s ease;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
}

.top-nav.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    padding: 0.4rem 0;
}

.nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    display: flex;
    align-items: center;
}

.brand-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
}

.brand-link:hover {
    text-decoration: none;
    color: inherit;
    transform: scale(1.05);
}

.brand-logo {
    height: 32px;
    width: auto;
    margin-right: 10px;
}

.brand-name {
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Enhanced Language Selector */
.language-selector {
    position: relative;
}

.language-selector :global(.dropdown-toggle) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 25px;
    padding: 6px 14px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.language-selector :global(.dropdown-toggle:hover) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.language-selector :global(.dropdown-toggle::after) {
    border-top-color: #667eea;
    margin-left: 8px;
}

.language-selector :global(.dropdown-menu) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    margin-top: 8px;
    overflow: hidden;
}

.language-selector :global(.dropdown-item) {
    padding: 12px 20px;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
}

.language-selector :global(.dropdown-item:hover) {
    background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    color: #667eea;
}

/* Enhanced Login Button */
.login-btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: none;
    border-radius: 25px;
    padding: 8px 18px;
    font-weight: 600;
    font-size: 14px;
    color: white;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.25);
    position: relative;
    overflow: hidden;
}

.login-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.35);
    color: white;
    text-decoration: none;
}

.login-btn:hover::before {
    left: 100%;
}

.login-btn:active {
    transform: translateY(-1px);
}

/* Hero Section */
.hero-section {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
    padding-top: 60px;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%);
}

.hero-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.2), transparent);
    background-repeat: repeat;
    background-size: 150px 100px;
    animation: sparkle 15s linear infinite;
}

@keyframes sparkle {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-100px); }
}

.hero-container {
    position: relative;
    z-index: 2;
}

.hero-content {
    color: white;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.9);
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;
}

.gradient-text {
    background: linear-gradient(45deg, #fff, #a8edea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-description {
    font-size: 1.25rem;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    color: rgba(255, 255, 255, 0.8);
}

.hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.hero-btn-primary {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    border: none;
    border-radius: 50px;
    padding: 12px 30px;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
    transition: all 0.3s ease;
}

.hero-btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
}

.hero-btn-secondary {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    padding: 10px 28px;
    font-weight: 600;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.hero-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
}

/* Hero Visual */
.hero-visual {
    position: relative;
    height: 400px;
}

.hero-main-visual {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.hero-main-visual i {
    font-size: 60px;
    color: white;
}

.floating-cards {
    position: relative;
    height: 100%;
}

.floating-card {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 15px 20px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.floating-card i {
    font-size: 20px;
}

.floating-card.card-1 {
    top: 20%;
    left: 10%;
    animation: float1 6s ease-in-out infinite;
}

.floating-card.card-2 {
    top: 15%;
    right: 5%;
    animation: float2 8s ease-in-out infinite;
}

.floating-card.card-3 {
    bottom: 25%;
    left: 5%;
    animation: float3 7s ease-in-out infinite;
}

@keyframes float1 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

@keyframes float2 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
}

@keyframes float3 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-25px); }
}

/* Stats Section */
.stats-section {
    padding: 80px 0;
    background: #f8f9fa;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 3rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
}

/* Features Section */
.features-section {
    padding: 100px 0;
    background: white;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
}

.section-subtitle {
    font-size: 1.2rem;
    color: #6c757d;
    line-height: 1.6;
}

.feature-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.feature-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
}

.feature-icon i {
    font-size: 30px;
    color: white;
}

.feature-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
}

.feature-description {
    color: #6c757d;
    line-height: 1.6;
    margin: 0;
}

/* CTA Section */
.cta-section {
    padding: 100px 0;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    color: white;
}

.cta-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.cta-description {
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
    color: rgba(255, 255, 255, 0.8);
}

.cta-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 992px) {
    .hero-title {
        font-size: 3rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .cta-title {
        font-size: 2rem;
    }
}

@media (max-width: 768px) {    .top-nav {
        padding: 0.4rem 0;
    }
    
    .nav-content {
        flex-wrap: wrap;
        gap: 1rem;
    }
      .brand-name {
        font-size: 1.1rem;
    }
      .brand-logo {
        height: 28px;
        margin-right: 6px;
    }
    
    .nav-actions {
        gap: 0.75rem;
    }
    
    .language-selector :global(.dropdown-toggle) {
        padding: 6px 12px;
        font-size: 14px;
    }
    
    .login-btn {
        padding: 8px 16px;
        font-size: 14px;
    }
      .hero-section {
        padding-top: 80px;
    }
}

@media (max-width: 576px) {
    .nav-content {
        justify-content: center;
        text-align: center;
    }
    
    .brand {
        margin-bottom: 0.5rem;
    }
    
    .nav-actions {
        justify-content: center;
        width: 100%;
    }
      .hero-section {
        padding-top: 100px;
    }
}

/* Enhanced hover effects */
.top-nav:hover {
    background: rgba(255, 255, 255, 0.98);    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* Add subtle animation to navigation */
.top-nav {
    animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Language flag icons enhancement */
.language-selector :global(.dropdown-toggle::before) {
    content: '🌐';
    margin-right: 6px;
    font-size: 16px;
}

/* Enhanced button interactions */
.login-btn, 
.language-selector :global(.dropdown-toggle) {
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.login-btn:focus,
.language-selector :global(.dropdown-toggle:focus) {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}
</style>


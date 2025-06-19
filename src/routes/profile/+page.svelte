<!-- User Profile Component -->
<script>
    import { onMount } from 'svelte';
    import { Button, Card, CardBody, Row, Col, Badge } from '@sveltestrap/sveltestrap';
    import { getUserInfo, logout } from '$lib/services/oidc-auth-service.js';
    import { _ } from 'svelte-i18n';
    
    /** @type {import('$lib/services/oidc-auth-service.js').UserInfo | null} */
    let userInfo = null;
    let loading = true;

    onMount(async () => {
        try {
            userInfo = getUserInfo();
            loading = false;
        } catch (error) {
            console.error('Failed to load user info:', error);
            loading = false;
        }
    });

    async function handleLogout() {
        if (confirm($_('profile.logout_confirm') || 'Are you sure you want to logout?')) {
            await logout();
        }
    }
</script>

<svelte:head>
    <title>User Profile - BotSharp</title>
</svelte:head>

<div class="profile-page">
    <div class="container py-4">
        <Row class="justify-content-center">
            <Col lg="8" xl="6">
                <Card class="profile-card shadow-sm border-0">`
                    <CardBody class="p-4">
                        <div class="text-center mb-4">
                            <div class="profile-avatar">
                                <i class="fas fa-user-circle fa-5x text-primary"></i>
                            </div>
                            <h3 class="mt-3 mb-1">
                                {#if loading}
                                    <span class="placeholder-glow">
                                        <span class="placeholder col-6"></span>
                                    </span>
                                {:else if userInfo}
                                    {userInfo.name || userInfo.preferred_username || 'User'}
                                {:else}
                                    Unknown User
                                {/if}
                            </h3>
                            <Badge color="success" pill class="mb-3">
                                <i class="fas fa-check-circle me-1"></i>
                                Authenticated via OIDC
                            </Badge>
                        </div>

                        {#if !loading && userInfo}
                            <div class="profile-details">
                                <h5 class="section-title">
                                    <i class="fas fa-user me-2"></i>
                                    {$_('profile.personal_info') || 'Personal Information'}
                                </h5>
                                
                                <div class="info-grid">                                    <div class="info-item">
                                        <div class="info-label">
                                            <i class="fas fa-id-badge me-1"></i>
                                            {$_('profile.full_name') || 'Full Name'}
                                        </div>
                                        <div class="info-value">
                                            {userInfo.name || 'Not provided'}
                                        </div>
                                    </div>

                                    <div class="info-item">
                                        <div class="info-label">
                                            <i class="fas fa-user me-1"></i>
                                            {$_('profile.username') || 'Username'}
                                        </div>
                                        <div class="info-value">
                                            {userInfo.preferred_username || 'Not provided'}
                                        </div>
                                    </div>

                                    <div class="info-item">
                                        <div class="info-label">
                                            <i class="fas fa-envelope me-1"></i>
                                            {$_('profile.email') || 'Email'}
                                        </div>
                                        <div class="info-value">
                                            {userInfo.email || 'Not provided'}
                                            {#if userInfo.email_verified}
                                                <Badge color="success" class="ms-2">
                                                    <i class="fas fa-check me-1"></i>
                                                    Verified
                                                </Badge>
                                            {/if}
                                        </div>
                                    </div>

                                    <div class="info-item">
                                        <div class="info-label">
                                            <i class="fas fa-fingerprint me-1"></i>
                                            {$_('profile.user_id') || 'User ID'}
                                        </div>
                                        <div class="info-value font-monospace">
                                            {userInfo.sub}
                                        </div>
                                    </div>
                                </div>

                                <hr class="my-4">

                                <h5 class="section-title">
                                    <i class="fas fa-shield-alt me-2"></i>
                                    {$_('profile.security') || 'Security & Authentication'}
                                </h5>
                                
                                <div class="security-info">
                                    <div class="security-item">
                                        <i class="fas fa-key text-success me-2"></i>
                                        <span>Authentication Provider: <strong>Keycloak OIDC</strong></span>
                                    </div>
                                    <div class="security-item">
                                        <i class="fas fa-clock text-info me-2"></i>
                                        <span>Session active and valid</span>
                                    </div>
                                </div>
                            </div>
                        {:else if loading}
                            <div class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">Loading profile...</p>
                            </div>
                        {:else}
                            <div class="text-center">
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    Failed to load user information
                                </div>
                            </div>
                        {/if}

                        <div class="profile-actions mt-4 pt-3 border-top text-center">
                            <Button color="danger" on:click={handleLogout} class="me-2">
                                <i class="fas fa-sign-out-alt me-2"></i>
                                {$_('profile.logout') || 'Logout'}
                            </Button>
                            <Button color="secondary" href="/">
                                <i class="fas fa-home me-2"></i>
                                {$_('profile.back_home') || 'Back to Home'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </div>
</div>

<style>
    .profile-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 2rem 0;
    }

    .profile-card {
        border: none;
        border-radius: 16px;
        overflow: hidden;
    }

    .profile-avatar {
        margin-bottom: 1rem;
    }

    .section-title {
        color: #2d3748;
        font-weight: 600;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .info-grid {
        display: grid;
        gap: 1.5rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .info-label {
        font-weight: 600;
        color: #4a5568;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0;
    }

    .info-value {
        background: #f7fafc;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        color: #2d3748;
        font-weight: 500;
        display: flex;
        align-items: center;
    }

    .security-info {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
    }

    .security-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .security-item:last-child {
        margin-bottom: 0;
    }

    .profile-actions {
        background: #f8f9fa;
        margin: -1rem -1rem 0 -1rem;
        padding: 1.5rem 1rem 0 1rem;
        border-radius: 0 0 16px 16px;
    }

    @media (max-width: 768px) {
        .profile-page {
            padding: 1rem 0;
        }
        
        .profile-actions {
            margin: -1rem -0.5rem 0 -0.5rem;
            padding: 1rem 0.5rem 0 0.5rem;
        }
    }
</style>

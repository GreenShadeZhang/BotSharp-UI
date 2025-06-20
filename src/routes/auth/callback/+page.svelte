<!-- OIDC Authentication Callback Page -->
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { handleCallback } from '$lib/services/oidc-auth-service.js';
    import Loader from '$lib/common/Loader.svelte';    let loading = true;
    /** @type {string | null} */
    let error = null;
    let message = 'Processing authentication...';

    onMount(async () => {
        try {
            // Get code and state from URL parameters
            const urlParams = $page.url.searchParams;
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const errorParam = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');

            if (errorParam) {
                throw new Error(errorDescription || errorParam);
            }

            if (!code || !state) {
                throw new Error('Missing authorization code or state parameter');
            }

            message = 'Exchanging authorization code for tokens...';
            
            // Handle the callback
            const success = await handleCallback(code, state);
            
            if (success) {
                message = 'Authentication successful! Redirecting...';
                setTimeout(() => {
                    goto('/page/dashboard', { replaceState: true });
                }, 1500);
            } else {
                throw new Error('Failed to complete authentication');
            }        } catch (err) {
            console.error('Authentication callback error:', err);
            error = err instanceof Error ? err.message : 'Unknown error occurred';
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>Authentication - BotSharp</title>
</svelte:head>

<div class="auth-callback">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <div class="auth-card">
                    <div class="text-center mb-4">
                        <img src="/images/logo.png" alt="BotSharp" class="logo" />
                        <h4 class="mt-3">Authentication</h4>
                    </div>

                    {#if loading && !error}
                        <div class="text-center">
                            <Loader />
                            <p class="message mt-3">{message}</p>
                        </div>
                    {/if}

                    {#if error}
                        <div class="error-container">
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>Authentication Failed</strong>
                                <p class="mb-0 mt-2">{error}</p>
                            </div>
                            <div class="text-center mt-3">
                                <a href="/" class="btn btn-primary">
                                    <i class="fas fa-home me-2"></i>
                                    Return to Home
                                </a>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .auth-callback {
        min-height: 100vh;
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 0;
    }

    .auth-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        margin: 0 auto;
    }

    .logo {
        height: 64px;
        width: auto;
    }

    .message {
        color: #6c757d;
        font-size: 0.9rem;
    }

    .error-container {
        margin-top: 1rem;
    }

    .alert {
        border: none;
        border-radius: 8px;
    }

    .btn {
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s ease;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
        .auth-callback {
            padding: 1rem;
        }
        
        .auth-card {
            padding: 1.5rem;
            margin: 0 1rem;
        }
    }
</style>

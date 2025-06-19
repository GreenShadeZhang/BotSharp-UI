/**
 * OpenID Connect Authentication Service
 * This service handles OIDC authentication flow with support for multiple providers.
 * Currently configured for Keycloak but designed to be provider-agnostic.
 */

import { getOIDCConfig, generateRandomString, generatePKCE } from './oidc-config.js';
import { userStore, getUserStore } from '$lib/helpers/store.js';
import { browser } from '$app/environment';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'oidc_access_token',
    REFRESH_TOKEN: 'oidc_refresh_token',
    ID_TOKEN: 'oidc_id_token',
    STATE: 'oidc_state',
    PKCE_VERIFIER: 'oidc_pkce_verifier',
    USER_INFO: 'oidc_user_info'
};

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token - Access token
 * @property {string} refresh_token - Refresh token
 * @property {string} id_token - ID token
 * @property {number} expires_in - Token expiration time in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 */

/**
 * @typedef {Object} UserInfo
 * @property {string} sub - Subject identifier
 * @property {string} name - Full name
 * @property {string} given_name - First name
 * @property {string} family_name - Last name
 * @property {string} email - Email address
 * @property {boolean} email_verified - Email verification status
 * @property {string} preferred_username - Preferred username
 */

/**
 * Initiate OIDC login flow
 */
export async function initiateLogin() {
    if (!browser) return;

    const config = getOIDCConfig();
    const state = generateRandomString();
    const nonce = generateRandomString();
    const { verifier, challenge } = await generatePKCE();

    // Store state and PKCE verifier for later verification
    sessionStorage.setItem(STORAGE_KEYS.STATE, state);
    sessionStorage.setItem(STORAGE_KEYS.PKCE_VERIFIER, verifier);

    // Build authorization URL
    const params = new URLSearchParams({
        client_id: config.client_id,
        redirect_uri: config.redirect_uri,
        response_type: config.response_type,
        response_mode: config.response_mode,
        scope: config.scopes.join(' '),
        state: state,
        nonce: nonce,
        code_challenge: challenge,
        code_challenge_method: 'S256'
    });

    const authUrl = `${config.authorization_endpoint}?${params.toString()}`;
    window.location.href = authUrl;
}

/**
 * Handle OIDC callback and exchange code for tokens
 * @param {string} code - Authorization code from callback
 * @param {string} state - State parameter from callback
 * @returns {Promise<boolean>} Success status
 */
export async function handleCallback(code, state) {
    if (!browser) return false;

    try {
        // Verify state parameter
        const storedState = sessionStorage.getItem(STORAGE_KEYS.STATE);
        if (state !== storedState) {
            throw new Error('Invalid state parameter');
        }        const config = getOIDCConfig();
        const verifier = sessionStorage.getItem(STORAGE_KEYS.PKCE_VERIFIER);
        
        if (!verifier) {
            throw new Error('PKCE verifier not found');
        }

        // Exchange authorization code for tokens
        const tokenResponse = await exchangeCodeForTokens(code, verifier);
        
        if (tokenResponse) {
            // Store tokens
            await storeTokens(tokenResponse);
            
            // Fetch and store user info
            await fetchAndStoreUserInfo(tokenResponse.access_token);
            
            // Clean up session storage
            sessionStorage.removeItem(STORAGE_KEYS.STATE);
            sessionStorage.removeItem(STORAGE_KEYS.PKCE_VERIFIER);
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('OIDC callback error:', error);
        return false;
    }
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code
 * @param {string} verifier - PKCE verifier
 * @returns {Promise<TokenResponse|null>} Token response
 */
async function exchangeCodeForTokens(code, verifier) {
    const config = getOIDCConfig();
    
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.client_id,
        code: code,
        redirect_uri: config.redirect_uri,
        code_verifier: verifier
    });

    try {
        const response = await fetch(config.token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Token exchange error:', error);
        return null;
    }
}

/**
 * Store tokens in localStorage
 * @param {TokenResponse} tokens - Token response
 */
async function storeTokens(tokens) {
    if (!browser) return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    if (tokens.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    if (tokens.id_token) {
        localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.id_token);
    }

    // Update user store with token
    const user = getUserStore();
    user.token = tokens.access_token;
    user.expires = Date.now() + (tokens.expires_in * 1000);
    userStore.set(user);
}

/**
 * Fetch user information from userinfo endpoint
 * @param {string} accessToken - Access token
 * @returns {Promise<UserInfo|null>} User information
 */
async function fetchAndStoreUserInfo(accessToken) {
    const config = getOIDCConfig();
    
    try {
        const response = await fetch(config.userinfo_endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`UserInfo fetch failed: ${response.statusText}`);
        }

        const userInfo = await response.json();
        
        // Store user info
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
        
        // Update user store
        const user = getUserStore();
        user.id = userInfo.sub;
        user.full_name = userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim();
        user.email = userInfo.email;
        user.username = userInfo.preferred_username;
        userStore.set(user);

        return userInfo;
    } catch (error) {
        console.error('UserInfo fetch error:', error);
        return null;
    }
}

/**
 * Get current access token
 * @returns {string|null} Access token
 */
export function getAccessToken() {
    if (!browser) return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get current user info
 * @returns {UserInfo|null} User information
 */
export function getUserInfo() {
    if (!browser) return null;
    const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
    if (!browser) return false;
    const token = getAccessToken();
    const user = getUserStore();
    
    if (!token) return false;
    
    // Check if token is expired
    if (user.expires && Date.now() > user.expires) {
        return false;
    }
    
    return true;
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} Success status
 */
export async function refreshToken() {
    if (!browser) return false;

    const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshTokenValue) return false;

    const config = getOIDCConfig();
    
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.client_id,
        refresh_token: refreshTokenValue
    });

    try {
        const response = await fetch(config.token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`);
        }

        const tokens = await response.json();
        await storeTokens(tokens);
        return true;
    } catch (error) {
        console.error('Token refresh error:', error);
        await logout(); // Clear invalid tokens
        return false;
    }
}

/**
 * Logout user and clear all stored data
 */
export async function logout() {
    if (!browser) return;

    const config = getOIDCConfig();
    const idToken = localStorage.getItem(STORAGE_KEYS.ID_TOKEN);

    // Clear stored tokens and user data
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });

    // Clear user store
    userStore.set({});

    // Redirect to provider logout if ID token is available
    if (idToken) {
        const params = new URLSearchParams({
            id_token_hint: idToken,
            post_logout_redirect_uri: config.post_logout_redirect_uri
        });
        
        const logoutUrl = `${config.end_session_endpoint}?${params.toString()}`;
        window.location.href = logoutUrl;
    } else {
        // Just redirect to home
        window.location.href = '/';
    }
}

/**
 * Initialize authentication state on app startup
 */
export function initializeAuth() {
    if (!browser) return;

    const token = getAccessToken();
    const userInfo = getUserInfo();
    
    if (token && userInfo) {
        // Restore user state
        const user = getUserStore();
        user.token = token;
        user.id = userInfo.sub;
        user.full_name = userInfo.name;
        user.email = userInfo.email;
        user.username = userInfo.preferred_username;
        userStore.set(user);
    }
}

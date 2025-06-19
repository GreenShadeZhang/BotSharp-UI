/**
 * OpenID Connect Configuration
 * This file contains the OIDC configuration for different providers.
 * Currently configured for Keycloak, but can be easily extended for other providers.
 */

import { 
    PUBLIC_OIDC_AUTHORITY, 
    PUBLIC_OIDC_REALM, 
    PUBLIC_OIDC_CLIENT_ID 
} from '$env/static/public';

/**
 * @typedef {Object} OIDCConfig
 * @property {string} issuer - The OIDC issuer URL
 * @property {string} authorization_endpoint - Authorization endpoint URL
 * @property {string} token_endpoint - Token endpoint URL
 * @property {string} userinfo_endpoint - UserInfo endpoint URL
 * @property {string} end_session_endpoint - Logout endpoint URL
 * @property {string} client_id - Client ID
 * @property {string} redirect_uri - Redirect URI after authentication
 * @property {string} post_logout_redirect_uri - Redirect URI after logout
 * @property {string[]} scopes - Required scopes
 * @property {string} response_type - Response type (typically 'code')
 * @property {string} response_mode - Response mode
 */

// Get base URLs from environment variables with fallback defaults
const OIDC_AUTHORITY = PUBLIC_OIDC_AUTHORITY || 'http://localhost:8080';
const OIDC_REALM = PUBLIC_OIDC_REALM || 'scisharp';
const OIDC_CLIENT_ID = PUBLIC_OIDC_CLIENT_ID || 'botsharp-ui';

// Construct issuer URL
const ISSUER_URL = `${OIDC_AUTHORITY}/realms/${OIDC_REALM}`;

// Keycloak configuration
const KEYCLOAK_CONFIG = {
    issuer: ISSUER_URL,
    authorization_endpoint: `${ISSUER_URL}/protocol/openid-connect/auth`,
    token_endpoint: `${ISSUER_URL}/protocol/openid-connect/token`,
    userinfo_endpoint: `${ISSUER_URL}/protocol/openid-connect/userinfo`,
    end_session_endpoint: `${ISSUER_URL}/protocol/openid-connect/logout`,
    client_id: OIDC_CLIENT_ID,
    redirect_uri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    post_logout_redirect_uri: `${typeof window !== 'undefined' ? window.location.origin : ''}`,
    scopes: ['openid', 'profile', 'email'],
    response_type: 'code',
    response_mode: 'query'
};

/**
 * Get the current OIDC configuration
 * @returns {OIDCConfig} The OIDC configuration
 */
export function getOIDCConfig() {
    return KEYCLOAK_CONFIG;
}

/**
 * Generate a random string for state parameter
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    values.forEach(value => {
        result += charset[value % charset.length];
    });
    return result;
}

/**
 * Generate PKCE challenge
 * @returns {Promise<{verifier: string, challenge: string}>} PKCE verifier and challenge
 */
export async function generatePKCE() {
    const verifier = generateRandomString(128);
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return { verifier, challenge };
}

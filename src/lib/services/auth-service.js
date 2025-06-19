import { userStore, getUserStore } from '$lib/helpers/store.js';
import { endpoints } from './api-endpoints.js';
import axios from 'axios';
import { 
    getAccessToken as getOIDCToken, 
    isAuthenticated as isOIDCAuthenticated,
    logout as oidcLogout,
    refreshToken as oidcRefreshToken,
    getUserInfo as getOIDCUserInfo
} from './oidc-auth-service.js';

/**
 * @param {string} email
 * @param {string} password
 * @param {function} onSucceed
 * @param {function} onError
 */
export async function getToken(email, password, onSucceed, onError) {
    const credentials = btoa(`${email}:${password}`);
    const headers = {
        Authorization: `Basic ${credentials}`,
    };

    await fetch(endpoints.tokenUrl, {
        method: 'POST',
        headers: headers,
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            console.log(response.statusText);
            onError();
            return false;
        }
    }).then(result => {
        if (!result) {
            return;
        }
        let user = getUserStore();
        user.token = result.access_token;
        user.expires = result.expires;
        userStore.set(user);
        onSucceed();
    })
    .catch(() => {
        onError();
    });
}

/**
 * Set token from exteranl
 * @param {string} token
 */
export async function setToken(token) {
    let user = getUserStore();
    user.token = token;
    userStore.set(user);
}

/**
 * @returns {Promise<import('$userTypes').UserModel>}
 */
export async function myInfo() {
    const response = await axios.get(endpoints.myInfoUrl);
    let user = getUserStore();
    user.id = response.data.id;
    user.full_name = response.data.full_name;
    userStore.set(user);
    return response.data;
}

/**
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} password
 * @param {function} onSucceed
 */
export async function register(firstName, lastName, email, password, onSucceed) {
    let data = JSON.stringify({
        firstName,
        lastName,
        email,
        password
    });

    await fetch(endpoints.usrCreationUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(result => {
        if (result.ok) {
            onSucceed();
        } else {
            alert(result.statusText);
        }
    })
    .catch(error => alert(error.message));
}

/**
 * @param {import('$fileTypes').FileModel} file
 */
export async function uploadUserAvatar(file) {
    const response = await axios.post(endpoints.userAvatarUrl, { ...file });
    return response?.data;
}

/**
 * Check if user is authenticated (supports both legacy and OIDC)
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
    // Check OIDC authentication first
    if (isOIDCAuthenticated()) {
        return true;
    }
    
    // Fallback to legacy authentication
    const user = getUserStore();
    return !!(user.token && (!user.expires || Date.now() < user.expires));
}

/**
 * Get current user token (supports both legacy and OIDC)
 * @returns {string | null} Access token
 */
export function getCurrentToken() {
    // Try OIDC token first
    const oidcToken = getOIDCToken();
    if (oidcToken) {
        return oidcToken;
    }
    
    // Fallback to legacy token
    const user = getUserStore();
    return user.token || null;
}

/**
 * Get current user information (supports both legacy and OIDC)
 * @returns {Promise<import('$userTypes').UserModel>}
 */
export async function getCurrentUserInfo() {
    // Try OIDC user info first
    const oidcUserInfo = getOIDCUserInfo();    if (oidcUserInfo) {
        return {
            id: oidcUserInfo.sub,
            full_name: oidcUserInfo.name || `${oidcUserInfo.given_name || ''} ${oidcUserInfo.family_name || ''}`.trim(),
            email: oidcUserInfo.email,
            user_name: oidcUserInfo.preferred_username,
            source: 'oidc',
            permissions: [],
            agent_actions: []
        };
    }
    
    // Fallback to legacy myInfo
    return await myInfo();
}

/**
 * Logout user (supports both legacy and OIDC)
 */
export async function logout() {
    if (isOIDCAuthenticated()) {
        await oidcLogout();
    } else {
        // Legacy logout - just clear store
        userStore.set({});
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }
}

/**
 * Refresh token if possible (supports both legacy and OIDC)
 * @returns {Promise<boolean>} Success status
 */
export async function refreshAuthToken() {
    if (isOIDCAuthenticated()) {
        return await oidcRefreshToken();
    }
    
    // Legacy doesn't support refresh
    return false;
}
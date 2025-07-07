import axios from 'axios';
import { getUserStore, globalErrorStore, loaderStore } from '$lib/helpers/store.js';
import { getCurrentToken, refreshAuthToken } from '$lib/services/auth-service.js';

// Add a request interceptor to attach authentication tokens or headers
axios.interceptors.request.use(
    (config) => {
        // Add your authentication logic here
        if (!skipLoader(config)) {
            loaderStore.set(true);
        }

        // Get current token (supports both legacy and OIDC)
        const token = getCurrentToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        loaderStore.set(false);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors globally
axios.interceptors.response.use(
    (response) => {
        // If the request was successful, return the response
        loaderStore.set(false);
        return response;
    },
    async (error) => {
        loaderStore.set(false);

        if (error.response && error.response.status === 401) {
            // Try to refresh token first
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                // Retry the original request with new token
                const originalRequest = error.config;
                const newToken = getCurrentToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axios(originalRequest);
                }
            } else {
                // Refresh failed, redirect to login
                redirectToLogin();
                return Promise.reject(error);
            }
        } else if (!skipGlobalError(error.config)) {
            globalErrorStore.set(true);
            setTimeout(() => {
                globalErrorStore.set(false);
            }, 2500);
        }

        // Return the error to the calling function
        return Promise.reject(error);
    }
);


function redirectToLogin() {
    // Use OIDC login instead of legacy login page
    import('$lib/services/oidc-auth-service.js').then(({ initiateLogin }) => {
        initiateLogin();
    });
}

/** @param {import('axios').InternalAxiosRequestConfig<any>} config */
function skipLoader(config) {
    /** @type {RegExp[]} */
    const postRegexes = [
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/(.*?)', 'g'),
        new RegExp('http(s*)://(.*?)/agent', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/page', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/(.*?)/search', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/create', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/document/(.*?)/page', 'g'),
        new RegExp('http(s*)://(.*?)/users', 'g'),
        new RegExp('http(s*)://(.*?)/instruct/chat-completion', 'g'),
        // 聊天相关POST API - 防止触发全局加载器
        new RegExp('http(s*)://(.*?)/conversation/(.*?)$', 'g') // 会话初始化API
    ];

    /** @type {RegExp[]} */
    const putRegexes = [
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/update', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/update-message', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/update-tags', 'g'),
        new RegExp('http(s*)://(.*?)/users', 'g'),
    ];

    /** @type {RegExp[]} */
    const deleteRegexes = [
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/delete-collection', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/data/(.*?)', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/data', 'g'),
    ];    
    
    /** @type {RegExp[]} */
    const getRegexes = [
        new RegExp('http(s*)://(.*?)/setting/(.*?)', 'g'),
        new RegExp('http(s*)://(.*?)/user/me', 'g'),
        new RegExp('http(s*)://(.*?)/plugin/menu', 'g'),
        new RegExp('http(s*)://(.*?)/address/options(.*?)', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/files/(.*?)', 'g'),
        new RegExp('http(s*)://(.*?)/llm-provider/(.*?)/models', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/collections', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/exist', 'g'),
        new RegExp('http(s*)://(.*?)/role/options', 'g'),
        new RegExp('http(s*)://(.*?)/role/(.*?)/details', 'g'),
        new RegExp('http(s*)://(.*?)/user/(.*?)/details', 'g'),
        new RegExp('http(s*)://(.*?)/agent/labels', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/state/keys', 'g'),
        new RegExp('http(s*)://(.*?)/logger/instruction/log/keys', 'g'),
        new RegExp('http(s*)://(.*?)/logger/conversation/(.*?)/content-log', 'g'),
        new RegExp('http(s*)://(.*?)/logger/conversation/(.*?)/state-log', 'g'),
        new RegExp('http(s*)://(.*?)/mcp/server-configs', 'g'),
        new RegExp('http(s*)://(.*?)/conversations', 'g'), // 添加会话列表API
        new RegExp('http(s*)://(.*?)/agents', 'g'), // 添加代理列表API，
        new RegExp('http(s*)://(.*?)/agent/(.*?)', 'g'), // 智能体详情API
        // 聊天相关API - 防止触发全局加载器
        new RegExp('http(s*)://(.*?)/conversation/(.*?)', 'g'), // 会话详情API
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/dialogs', 'g'), // 对话历史API
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/user', 'g'), // 会话用户API
        new RegExp('http(s*)://(.*?)/agent/options', 'g'), // 代理选项API
        new RegExp('http(s*)://(.*?)/user/me', 'g') // 用户信息API
    ];
    
    if (config.method === 'post' && postRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    if (config.method === 'put' && putRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    if (config.method === 'delete' && deleteRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    if (config.method === 'get' && getRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    return false;
}

/** @param {import('axios').InternalAxiosRequestConfig<any>} config */
function skipGlobalError(config) {
    /** @type {RegExp[]} */
    const postRegexes = [
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/page', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/(.*?)/search', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/create', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/document/(.*?)/page', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/create-collection', 'g'),
        new RegExp('http(s*)://(.*?)/refresh-agents', 'g')
    ];

    /** @type {RegExp[]} */
    const putRegexes = [
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/update', 'g'),
        new RegExp('http(s*)://(.*?)/role', 'g'),
        new RegExp('http(s*)://(.*?)/user', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/update-message', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/(.*?)/update-tags', 'g')];

    /** @type {RegExp[]} */
    const deleteRegexes = [
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/delete-collection', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/data/(.*?)', 'g'),
        new RegExp('http(s*)://(.*?)/knowledge/vector/(.*?)/data', 'g'),
        new RegExp('http(s*)://(.*?)/conversation/(.*?)', 'g') // 添加删除会话API
    ];

    /** @type {RegExp[]} */
    const getRegexes = [];

    if (config.method === 'post' && postRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    if (config.method === 'put' && putRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    if (config.method === 'delete' && deleteRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    if (config.method === 'get' && getRegexes.some(regex => regex.test(config.url || ''))) {
        return true;
    }

    return false;
}

/**
 * @param {String} url
 * @param {Object} args
 * @returns {String}
 */
export function replaceUrl(url, args) {
    const keys = Object.keys(args);
    keys.forEach(key => {
        // @ts-ignore
        url = url.replace("{" + key + "}", args[key]);
    });
    return url;
}

/**
 * Replace new line as <br>
 * @param {string} text 
 * @returns string
 */
export function replaceNewLine(text) {
    return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

/**
 * Replace unnecessary markdown
 * @param {string} text 
 * @returns {string}
 */
export function replaceMarkdown(text) {
    let res = text.replace(/#([\s]+)/g, '\\# ').replace(/[-|=]{3,}/g, '');

    let regex1 = new RegExp('\\*(.*)\\*', 'g');
    let regex2 = new RegExp('\\*([\\*]+)\\*', 'g');

    if (!regex1.test(text) || regex2.test(text)) {
        res = res.replace(/\*/g, '\\*');
    }

    return res;
}
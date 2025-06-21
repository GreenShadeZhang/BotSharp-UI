import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} NotificationItem
 * @property {string} id - 通知唯一标识
 * @property {string} title - 通知标题
 * @property {string} message - 通知内容
 * @property {string} type - 通知类型: 'info' | 'success' | 'warning' | 'error'
 * @property {Date} timestamp - 通知时间
 * @property {boolean} read - 是否已读
 * @property {string} [conversationId] - 关联的会话ID
 * @property {string} [agentId] - 关联的代理ID
 * @property {string} [icon] - 图标类名
 * @property {Object} [data] - 附加数据
 */

/**
 * @typedef {Object} NotificationState
 * @property {NotificationItem[]} items - 通知列表
 * @property {number} unreadCount - 未读数量
 */

/** @type {import('svelte/store').Writable<NotificationState>} */
export const notificationStore = writable({
    items: [],
    unreadCount: 0
});

/**
 * 通知服务
 */
export const notificationService = {
    /**
     * 添加新通知
     * @param {Partial<NotificationItem>} notification 
     */
    add(notification) {
        const newNotification = {
            id: uuidv4(),
            title: notification.title || '新消息',
            message: notification.message || '',
            type: notification.type || 'info',
            timestamp: new Date(),
            read: false,
            conversationId: notification.conversationId,
            agentId: notification.agentId,
            icon: notification.icon || this.getDefaultIcon(notification.type || 'info'),
            data: notification.data || {}
        };

        notificationStore.update(state => {
            const newItems = [newNotification, ...state.items];
            // 限制通知数量，保留最新的100条
            if (newItems.length > 100) {
                newItems.splice(100);
            }
            
            return {
                items: newItems,
                unreadCount: state.unreadCount + 1
            };
        });

        // 触发浏览器通知（如果用户允许）
        this.showBrowserNotification(newNotification);
        
        return newNotification.id;
    },

    /**
     * 标记通知为已读
     * @param {string} id 
     */
    markAsRead(id) {
        notificationStore.update(state => {
            const item = state.items.find(n => n.id === id);
            if (item && !item.read) {
                item.read = true;
                return {
                    items: state.items,
                    unreadCount: Math.max(0, state.unreadCount - 1)
                };
            }
            return state;
        });
    },

    /**
     * 标记所有通知为已读
     */
    markAllAsRead() {
        notificationStore.update(state => ({
            items: state.items.map(item => ({ ...item, read: true })),
            unreadCount: 0
        }));
    },

    /**
     * 删除通知
     * @param {string} id 
     */
    remove(id) {
        notificationStore.update(state => {
            const item = state.items.find(n => n.id === id);
            const wasUnread = item && !item.read;
            
            return {
                items: state.items.filter(n => n.id !== id),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
        });
    },

    /**
     * 清空所有通知
     */
    clear() {
        notificationStore.set({
            items: [],
            unreadCount: 0
        });
    },    /**
     * 根据类型获取默认图标
     * @param {string} type 
     * @returns {string}
     */
    getDefaultIcon(type) {
        const iconMap = {
            'info': 'bx bx-info-circle',
            'success': 'bx bx-check-circle',
            'warning': 'bx bx-error-circle',
            'error': 'bx bx-x-circle',
            'message': 'bx bx-message-dots',
            'system': 'bx bx-cog'
        };
        return iconMap[/** @type {keyof typeof iconMap} */(type)] || 'bx bx-bell';
    },    /**
     * 获取通知类型对应的颜色
     * @param {string} type 
     * @returns {string}
     */
    getTypeColor(type) {
        const colorMap = {
            'info': 'primary',
            'success': 'success',
            'warning': 'warning',
            'error': 'danger',
            'message': 'info',
            'system': 'secondary'
        };
        return colorMap[/** @type {keyof typeof colorMap} */(type)] || 'primary';
    },

    /**
     * 显示浏览器原生通知
     * @param {NotificationItem} notification 
     */
    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                const browserNotification = new Notification(notification.title, {
                    body: notification.message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: notification.id,
                    requireInteraction: false,
                    silent: false
                });

                // 点击通知时的处理
                browserNotification.onclick = () => {
                    window.focus();
                    // 可以添加跳转到相关页面的逻辑
                    if (notification.conversationId) {
                        // 跳转到对应的会话页面
                        window.location.href = `/chat/${notification.agentId}/${notification.conversationId}`;
                    }
                    browserNotification.close();
                };

                // 3秒后自动关闭
                setTimeout(() => {
                    browserNotification.close();
                }, 3000);
            } catch (error) {
                console.warn('Failed to show browser notification:', error);
            }
        }
    },

    /**
     * 请求浏览器通知权限
     */
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    },

    /**
     * 处理SignalR通知消息
     * @param {any} message 
     */
    handleSignalRNotification(message) {
        const notificationText = message?.rich_content?.message?.text || message?.text || message?.message || '';
        if (!notificationText) return;

        this.add({
            title: message?.title || '系统通知',
            message: notificationText,
            type: message?.type || 'message',
            conversationId: message?.conversation_id,
            agentId: message?.agent_id,
            data: message
        });
    },

    /**
     * 格式化时间显示
     * @param {Date} timestamp 
     * @returns {string}
     */
    formatTime(timestamp) {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 30) return `${days}天前`;
        
        return timestamp.toLocaleDateString();
    }
};

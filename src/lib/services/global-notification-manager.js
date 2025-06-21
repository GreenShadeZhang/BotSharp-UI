import { notificationService } from './notification-service.js';
import { signalr } from './signalr-service.js';

/**
 * 全局通知管理器
 * 负责整合各种通知来源并统一管理
 */
export const globalNotificationManager = {
    /** @type {boolean} */
    isInitialized: false,

    /** @type {string | null} */
    currentConversationId: null,

    /**
     * 初始化全局通知管理器
     */
    initialize() {
        if (this.isInitialized) return;

        // 请求浏览器通知权限
        notificationService.requestPermission();
        
        this.isInitialized = true;
        console.log('Global notification manager initialized');
    },

    /**
     * 设置当前会话ID（用于过滤会话相关通知）
     * @param {string | null} conversationId 
     */
    setCurrentConversation(conversationId) {
        this.currentConversationId = conversationId;
    },

    /**
     * 集成SignalR通知到全局通知系统
     * @param {string} conversationId 
     */
    async integrateChatNotifications(conversationId) {
        this.setCurrentConversation(conversationId);

        // 备份原有的SignalR处理函数
        const originalOnNotificationGenerated = signalr.onNotificationGenerated;

        // 重写SignalR通知处理函数
        signalr.onNotificationGenerated = (message) => {
            // 先调用原有处理逻辑（保持向后兼容）
            if (originalOnNotificationGenerated && typeof originalOnNotificationGenerated === 'function') {
                originalOnNotificationGenerated(message);
            }

            // 添加到全局通知系统
            this.handleSignalRNotification(message);
        };

        console.log(`Chat notifications integrated for conversation: ${conversationId}`);
    },

    /**
     * 处理SignalR通知消息
     * @param {any} message 
     */
    handleSignalRNotification(message) {
        // 如果消息来自当前正在查看的会话，则不显示header通知（避免重复）
        if (this.currentConversationId && message?.conversation_id === this.currentConversationId) {
            return;
        }

        const notificationText = message?.rich_content?.message?.text || message?.text || message?.message || '';
        if (!notificationText) return;

        // 添加到全局通知系统
        notificationService.add({
            title: this.getNotificationTitle(message),
            message: this.truncateMessage(notificationText),
            type: this.getNotificationType(message),
            conversationId: message?.conversation_id,
            agentId: message?.agent_id,
            data: message
        });
    },

    /**
     * 获取通知标题
     * @param {any} message 
     * @returns {string}
     */
    getNotificationTitle(message) {
        if (message?.title) return message.title;
        if (message?.sender?.role === 'assistant') return '助手消息';
        if (message?.sender?.role === 'user') return '用户消息';
        if (message?.type === 'system') return '系统通知';
        return '新消息';
    },

    /**
     * 获取通知类型
     * @param {any} message 
     * @returns {string}
     */
    getNotificationType(message) {
        if (message?.type) return message.type;
        if (message?.sender?.role === 'assistant') return 'message';
        if (message?.sender?.role === 'user') return 'info';
        return 'info';
    },

    /**
     * 截断过长的消息
     * @param {string} message 
     * @returns {string}
     */
    truncateMessage(message) {
        const maxLength = 120;
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    },

    /**
     * 添加系统通知
     * @param {string} title 
     * @param {string} message 
     * @param {string} [type='info'] 
     */
    addSystemNotification(title, message, type = 'info') {
        notificationService.add({
            title,
            message,
            type,
            data: { source: 'system' }
        });
    },

    /**
     * 添加成功通知
     * @param {string} message 
     */
    addSuccessNotification(message) {
        this.addSystemNotification('操作成功', message, 'success');
    },

    /**
     * 添加错误通知
     * @param {string} message 
     */
    addErrorNotification(message) {
        this.addSystemNotification('操作失败', message, 'error');
    },

    /**
     * 添加警告通知
     * @param {string} message 
     */
    addWarningNotification(message) {
        this.addSystemNotification('注意', message, 'warning');
    },

    /**
     * 清理当前会话的通知
     */
    clearCurrentConversationNotifications() {
        if (!this.currentConversationId) return;
        
        // 这里可以添加清理特定会话通知的逻辑
        // 目前暂时不实现，因为用户可能想保留历史通知
    },

    /**
     * 断开通知集成
     */
    disconnect() {
        this.currentConversationId = null;
        // 重置SignalR处理函数（如果需要的话）
    }
};

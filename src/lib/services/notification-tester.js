import { globalNotificationManager } from './global-notification-manager.js';

/**
 * 测试通知功能的工具类
 * 在开发和调试时使用
 */
export const notificationTester = {
    /**
     * 添加测试通知
     */
    addTestNotifications() {
        // 添加不同类型的测试通知
        globalNotificationManager.addSystemNotification(
            '系统通知', 
            '这是一条系统通知消息，用于测试通知功能。', 
            'info'
        );

        setTimeout(() => {
            globalNotificationManager.addSuccessNotification(
                '操作已成功完成，所有数据已保存。'
            );
        }, 1000);

        setTimeout(() => {
            globalNotificationManager.addWarningNotification(
                '请注意：您的会话即将过期，请及时保存重要信息。'
            );
        }, 2000);

        setTimeout(() => {
            globalNotificationManager.addErrorNotification(
                '连接失败，请检查网络连接后重试。'
            );
        }, 3000);

        // 模拟聊天消息通知
        setTimeout(() => {
            globalNotificationManager.handleSignalRNotification({
                conversation_id: 'test-conv-001',
                agent_id: 'test-agent-001',
                text: '这是一条来自助手的测试消息，用于演示通知功能的效果。',
                sender: { role: 'assistant' },
                timestamp: new Date().toISOString()
            });
        }, 4000);
    },

    /**
     * 模拟大量通知（用于测试性能）
     */
    addBulkTestNotifications() {
        for (let i = 1; i <= 10; i++) {
            setTimeout(() => {
                globalNotificationManager.addSystemNotification(
                    `批量通知 ${i}`,
                    `这是第 ${i} 条批量测试通知，用于测试系统处理大量通知的能力。`,
                    ['info', 'success', 'warning', 'error'][i % 4]
                );
            }, i * 500);
        }
    },

    /**
     * 模拟不同会话的通知
     */
    addMultiConversationNotifications() {
        const conversations = [
            { id: 'conv-001', agentId: 'agent-001', title: '客服助手' },
            { id: 'conv-002', agentId: 'agent-002', title: '技术支持' },
            { id: 'conv-003', agentId: 'agent-003', title: '销售顾问' }
        ];

        conversations.forEach((conv, index) => {
            setTimeout(() => {
                globalNotificationManager.handleSignalRNotification({
                    conversation_id: conv.id,
                    agent_id: conv.agentId,
                    text: `来自${conv.title}的新消息：您好，有什么可以帮助您的吗？`,
                    sender: { role: 'assistant' },
                    timestamp: new Date().toISOString(),
                    title: conv.title
                });            }, (index + 1) * 1000);
        });
    },

    /**
     * 测试本地存储持久化功能
     */
    testPersistence() {
        console.log('开始测试通知持久化功能...');
        
        // 清空现有通知
        globalNotificationManager.addSystemNotification(
            '持久化测试', 
            '正在清空现有通知并添加测试数据...', 
            'info'
        );
        
        setTimeout(() => {
            // 添加一些测试通知
            for (let i = 1; i <= 5; i++) {
                globalNotificationManager.addSystemNotification(
                    `持久化测试 ${i}`,
                    `这是第 ${i} 条测试通知，用于验证本地存储功能。页面刷新后应该还能看到这些通知。`,
                    ['info', 'success', 'warning', 'error'][i % 4]
                );
            }
            
            console.log('测试通知已添加，请刷新页面验证持久化功能');
            alert('测试通知已添加，请刷新页面验证持久化功能是否正常工作');
        }, 1000);
    },

    /**
     * 测试查看全部页面功能
     */
    testViewAllPage() {
        // 添加一些通知后跳转到查看全部页面
        this.addTestNotifications();
        
        setTimeout(() => {
            window.open('/notifications', '_blank');
        }, 2000);
    }
};

// 在开发环境下，将测试工具挂载到全局对象上
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    // @ts-ignore
    window.notificationTester = notificationTester;
    // @ts-ignore
    window.globalNotificationManager = globalNotificationManager;
      console.log('通知测试工具已挂载到 window.notificationTester');
    console.log('全局通知管理器已挂载到 window.globalNotificationManager');
    console.log('可以使用以下命令测试：');
    console.log('- notificationTester.addTestNotifications() // 添加测试通知');
    console.log('- notificationTester.addBulkTestNotifications() // 添加批量通知');
    console.log('- notificationTester.addMultiConversationNotifications() // 添加多会话通知');
    console.log('- notificationTester.testPersistence() // 测试持久化功能');
    console.log('- notificationTester.testViewAllPage() // 测试查看全部页面');
}

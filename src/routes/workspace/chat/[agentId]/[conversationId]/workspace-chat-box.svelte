<script>
	import { onMount, tick, setContext } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Input } from '@sveltestrap/sveltestrap';
	import { v4 as uuidv4 } from 'uuid';
	import moment from 'moment';
	import {
		newConversation,
		sendMessageToHub,
		getConversation,
		getDialogs
	} from '$lib/services/conversation-service.js';
	import { signalr } from '$lib/services/signalr-service.js';
	import { BOT_SENDERS, USER_SENDERS, TRAINING_MODE } from '$lib/helpers/constants';
	import { SenderAction } from '$lib/helpers/enums';
	import Markdown from '$lib/common/markdown/Markdown.svelte';
	import LoadingDots from '$lib/common/LoadingDots.svelte';
	import { globalNotificationManager } from '$lib/services/global-notification-manager.js';
	/** @type {import('$userTypes').UserModel} */
	export let currentUser;

	// Use currentUser for potential future features like user avatar or permissions
	$: userInitials = currentUser?.id?.charAt(0)?.toUpperCase() || 'U';

	/** @type {import('$agentTypes').AgentModel} */
	export let agent;

	const params = $page.params;
	let conversationId = params.conversationId;
	let agentId = params.agentId;

	// Core message and conversation data
	/** @type {import('$conversationTypes').ChatResponseModel[]} */
	let dialogs = [];
	/** @type {import('$conversationTypes').ChatResponseModel[]} */
	let streamingMessages = []; // 流式消息数组
	/** @type {Map<string, import('$conversationTypes').ChatResponseModel>} */
	let streamingMessageCache = new Map(); // 流式消息缓存，用于文本拼接	/** @type {{ [s: string]: any; }} */
	let groupedDialogs = {};

	/** @type {import('$conversationTypes').ChatResponseModel?} */
	let lastBotMsg;
	/** @type {import('$conversationTypes').ChatResponseModel?} */
	let lastMsg;

	let messageInput = '';
	let isLoading = false;
	let isSendingMsg = false;
	let isThinking = false;
	/** @type {HTMLElement} */
	let chatContainer;
	/** @type {import('$conversationTypes').ConversationModel | null} */
	let conversation = null;
	let mounted = false;
	let indication = '';
	let notificationText = '';
	let isDisplayNotification = false;
	/** @type {any} */
	let notificationTimeout = undefined;
	setContext('workspace-chat-context', {
		autoScrollToBottom: autoScrollToBottom
	});

	onMount(async () => {
		mounted = true;
		await initializeChat();
	});

	async function initializeChat() {
		try {
			isLoading = true;
			if (conversationId === 'new') {
				// Create new conversation
				conversation = await newConversation(agentId);
				conversationId = conversation.id;

				// Update URL to reflect the new conversation ID
				const newUrl = `/workspace/chat/${agentId}/${conversationId}`;
				window.history.replaceState({}, '', newUrl);

				// Initialize empty dialogs for new conversation
				dialogs = [];
				console.log('[WorkspaceChat] 创建新对话:', conversation.id);
			} else {
				// Load existing conversation
				conversation = await getConversation(conversationId, true);
				if (conversation) {
					dialogs = await getDialogs(conversationId, 50);
					if (!dialogs) dialogs = [];
					// 确保加载的消息具有正确的标记
					dialogs = dialogs.map((msg) => ({
						...msg,
						is_chat_message: true
					}));
					console.log(
						`[WorkspaceChat] 加载现有对话: ${conversationId}, 消息数量: ${dialogs.length}`
					);
				} else {
					throw new Error('Conversation not found');
				}
			}

			// Initialize SignalR connection with comprehensive event handlers
			if (conversation) {
				signalr.onMessageReceivedFromClient = onMessageReceivedFromClient;
				signalr.onMessageReceivedFromCsr = onMessageReceivedFromClient;
				signalr.onMessageReceivedFromAssistant = onMessageReceivedFromAssistant;
				signalr.onStreamMessageReceivedFromAssistant = onStreamMessageReceivedFromAssistant;
				signalr.onNotificationGenerated = onNotificationGenerated;
				signalr.onSenderActionGenerated = onSenderActionGenerated; // 集成全局通知管理器
				await globalNotificationManager.integrateChatNotifications(conversationId);
				console.log('[WorkspaceChat] 开始SignalR连接:', conversation.id);
				await signalr.start(conversation.id);
				console.log('[WorkspaceChat] SignalR连接成功');
			}

			await refresh();
		} catch (error) {
			console.error('Failed to initialize chat:', error);
			// Redirect back to workspace on error
			goto('/workspace');
		} finally {
			isLoading = false;
		}
	}
	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function onMessageReceivedFromClient(message) {
		console.log('[WorkspaceChat] 收到用户消息:', message);
		dialogs.push({
			...message,
			is_chat_message: true
		});
		refresh();
		messageInput = ''; // 清空输入框
	}
	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function onMessageReceivedFromAssistant(message) {
		// 只处理 AI 助手的消息
		if (!message.sender || message.sender.role !== 'assistant') {
			console.log(`[WorkspaceChat] 忽略非助手消息，角色: ${message.sender?.role}`);
			return;
		}

		console.log(`[WorkspaceChat] 收到最终消息，ID: ${message.message_id}, 替换流式消息`);

		const messageId = message.message_id;

		// 清理流式消息缓存
		if (streamingMessageCache.has(messageId)) {
			streamingMessageCache.delete(messageId);
			console.log(`[WorkspaceChat] 清理流式消息缓存，ID: ${messageId}`);
		}

		// 检查是否有对应的流式消息需要替换
		const streamingIndex = streamingMessages.findIndex((m) => m.message_id === messageId);
		if (streamingIndex !== -1) {
			// 移除流式消息
			streamingMessages.splice(streamingIndex, 1);
			streamingMessages = [...streamingMessages];
			console.log(`[WorkspaceChat] 移除流式消息，ID: ${messageId}`);
		}

		// 检查 dialogs 中是否已存在该助手消息
		const existingIndex = dialogs.findIndex(
			(m) => m.message_id === message.message_id && m.sender && m.sender.role === 'assistant'
		);
		if (existingIndex !== -1) {
			// 替换现有的助手消息
			dialogs[existingIndex] = {
				...message,
				is_chat_message: true
			};
			console.log(`[WorkspaceChat] 替换现有助手消息，ID: ${message.message_id}`);
		} else {
			// 添加新的助手消息
			dialogs.push({
				...message,
				is_chat_message: true
			});
			console.log(`[WorkspaceChat] 添加新助手消息，ID: ${message.message_id}`);
		}

		// 重要：关闭发送状态并刷新界面
		isSendingMsg = false;
		isThinking = false;
		refresh();
	}
	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function onStreamMessageReceivedFromAssistant(message) {
		// 只处理 AI 助手的消息
		if (!message.sender || message.sender.role !== 'assistant') {
			console.log(`[WorkspaceChat] 忽略非助手流式消息，角色: ${message.sender?.role}`);
			return;
		}

		console.log(
			`[WorkspaceChat] 收到流式消息片段，ID: ${message.message_id}, 片段长度: ${message.text?.length || 0}`
		);

		const messageId = message.message_id;

		// 处理流式消息的增量更新
		if (streamingMessageCache.has(messageId)) {
			// 更新现有的流式消息 - 进行增量拼接
			const existingMessage = streamingMessageCache.get(messageId);
			if (existingMessage) {
				const updatedMessage = {
					...existingMessage,
					// 进行增量拼接文本内容
					text: (existingMessage.text || '') + (message.text || ''),
					// 合并其他可能的字段
					rich_content: message.rich_content || existingMessage.rich_content,
					created_at: existingMessage.created_at || message.created_at,
					sender: existingMessage.sender || message.sender,
					conversation_id: existingMessage.conversation_id || message.conversation_id,
					is_chat_message: true,
					is_streaming: true // 标记为流式消息
				};

				// 更新缓存
				streamingMessageCache.set(messageId, updatedMessage);

				// 更新显示数组中的对应消息
				const existingIndex = streamingMessages.findIndex((m) => m.message_id === messageId);
				if (existingIndex !== -1) {
					streamingMessages[existingIndex] = updatedMessage;
				}

				console.log(
					`[WorkspaceChat] 更新流式消息，ID: ${messageId}, 累积长度: ${updatedMessage.text?.length || 0}`
				);
			}
		} else {
			// 新的流式消息
			const newStreamingMessage = {
				...message,
				text: message.text || '',
				is_chat_message: true,
				is_streaming: true // 标记为流式消息
			};

			// 添加到缓存
			streamingMessageCache.set(messageId, newStreamingMessage);

			// 添加到显示数组
			streamingMessages.push(newStreamingMessage);
			console.log(`[WorkspaceChat] 添加新流式消息，ID: ${messageId}`);
		}

		streamingMessages = [...streamingMessages];
		refresh();
	}

	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function onNotificationGenerated(message) {
		sendReceivedNotification(message);
	}

	/** @param {import('$conversationTypes').ConversationSenderActionModel} data */
	function onSenderActionGenerated(data) {
		if (data?.sender_action == SenderAction.TypingOn) {
			isThinking = true;
			const retIndication = data.indication || '';
			indication = retIndication.split('|')[0];
		} else if (data?.sender_action == SenderAction.TypingOff) {
			isThinking = false;
			indication = '';
		}
	}

	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function sendReceivedNotification(message) {
		if (notificationTimeout) {
			clearTimeout(notificationTimeout);
		}

		notificationText = message?.rich_content?.message?.text || message.text || '';
		isDisplayNotification = true;
		notificationTimeout = setTimeout(
			() => {
				isDisplayNotification = false;
				notificationText = '';
			},
			notificationText?.length > 200 ? 8000 : 3000
		);
	}
	async function refresh() {
		// 合并常规对话和流式消息进行显示
		const allMessages = [...dialogs, ...streamingMessages];
		// 按创建时间排序
		allMessages.sort(
			(a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
		);

		console.log(
			`[WorkspaceChat] Refresh: 总消息数 ${allMessages.length}, 常规消息 ${dialogs.length}, 流式消息 ${streamingMessages.length}`
		);

		// trigger UI render - 使用合并后的消息进行显示
		lastBotMsg = null;
		await tick();
		lastBotMsg = findLastBotMessage(allMessages); // 在合并后的消息中查找
		lastMsg = allMessages.slice(-1)[0]; // 从合并后的消息中获取最后一条
		groupedDialogs = groupDialogs(allMessages); // 对合并后的消息进行分组

		console.log(
			`[WorkspaceChat] Grouped dialogs:`,
			Object.keys(groupedDialogs),
			'isEmpty:',
			Object.keys(groupedDialogs).length === 0
		);

		await tick();
		autoScrollToBottom();
	}

	function autoScrollToBottom() {
		if (chatContainer) {
			setTimeout(() => {
				chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
			}, 200);
		}
	}
	/** @param {import('$conversationTypes').ChatResponseModel[]} dialogs */
	function findLastBotMessage(dialogs) {
		const lastMsg = dialogs.slice(-1)[0];
		return BOT_SENDERS.includes(lastMsg?.sender?.role || '') ? lastMsg : null;
	}

	/** @param {import('$conversationTypes').ChatResponseModel[]} dialogs */
	function groupDialogs(dialogs) {
		if (!dialogs || dialogs.length === 0) {
			console.log('[WorkspaceChat] groupDialogs: 没有消息需要分组');
			return {};
		}

		const format = 'MMM D, YYYY';
		/** @type {{ [key: string]: import('$conversationTypes').ChatResponseModel[] }} */
		const grouped = {};

		dialogs.forEach((/** @type {any} */ dialog) => {
			const createDate = moment.utc(dialog.created_at).local().format(format);
			let dateKey;
			if (createDate == moment.utc().local().format(format)) {
				dateKey = 'Today';
			} else if (createDate == moment.utc().local().subtract(1, 'days').format(format)) {
				dateKey = 'Yesterday';
			} else {
				dateKey = createDate;
			}

			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}
			grouped[dateKey].push(dialog);
		});
		console.log(`[WorkspaceChat] groupDialogs: 分组结果`, Object.keys(grouped), grouped);
		return grouped;
	}

	function clearStreamingMessages() {
		streamingMessages = [];
		streamingMessageCache.clear();
	}
	async function sendMessage() {
		if (!messageInput.trim() || isLoading || isSendingMsg || !conversation) return;

		isSendingMsg = true;
		const currentInput = messageInput.trim();
		messageInput = '';

		try {
			await sendMessageToHub(agentId, conversation.id, currentInput);
			// 注意：isSendingMsg = false 将在 onMessageReceivedFromAssistant 中设置
		} catch (error) {
			console.error('Failed to send message:', error);
			// Create a minimal error message that matches ChatResponseModel structure
			const errorMessage = {
				message_id: uuidv4(),
				uuid: uuidv4(),
				text: 'Sorry, there was an error sending your message. Please try again.',
				sender: {
					id: 'system',
					role: 'assistant',
					source: 'system',
					permissions: [],
					agent_actions: []
				},
				created_at: new Date(),
				is_chat_message: true,
				conversation_id: conversation.id,
				editor: null,
				function: null,
				rich_content: null,
				post_action_disclaimer: null,
				has_message_files: false,
				data: null
			};
			// @ts-ignore - Adding as any to avoid type checking issues
			dialogs.push(errorMessage);
			isSendingMsg = false;
			isThinking = false;
			refresh();
		}
	}

	function scrollToBottom() {
		tick().then(() => {
			autoScrollToBottom();
		});
	}

	/** @param {KeyboardEvent} event */
	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function goBackToWorkspace() {
		goto('/workspace');
	}

	/** @param {string | Date} timestamp */
	function formatTimestamp(timestamp) {
		return moment.utc(timestamp).local().format('HH:mm');
	}

	/** @param {string | Date} date */
	function formatDateHeader(date) {
		const messageDate = moment.utc(date).local();
		const today = moment();
		const yesterday = moment().subtract(1, 'day');

		if (messageDate.isSame(today, 'day')) {
			return 'Today';
		} else if (messageDate.isSame(yesterday, 'day')) {
			return 'Yesterday';
		} else {
			return messageDate.format('MMMM DD, YYYY');
		}
	}

	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function isUserMessage(message) {
		return USER_SENDERS.includes(message.sender?.role || '');
	}

	/** @param {import('$conversationTypes').ChatResponseModel} message */
	function isBotMessage(message) {
		return BOT_SENDERS.includes(message.sender?.role || '');
	}
</script>

<div class="workspace-chat-container">
	<!-- Header -->
	<div class="chat-header">
		<div class="header-left">
			<button class="back-btn" on:click={goBackToWorkspace}>
				<i class="fas fa-arrow-left"></i>
			</button>
			<div class="agent-info">
				{#if agent}
					<div class="agent-avatar">
						<i class="fas fa-robot"></i>
					</div>
					<div class="agent-details">
						<h3 class="agent-name">{agent.name}</h3>
						<p class="agent-description">{agent.description}</p>
					</div>
				{/if}
			</div>
		</div>
		<div class="header-actions">
			<!-- Add any header actions here -->
		</div>
	</div>
	<!-- Chat Messages -->
	<div class="chat-messages" bind:this={chatContainer}>
		{#if isLoading}
			<div class="loading-container">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p class="mt-2 text-muted">Loading conversation...</p>
			</div>
		{:else if Object.keys(groupedDialogs).length === 0}
			<div class="empty-chat">
				<i class="fas fa-comments fa-3x text-muted mb-3"></i>
				<p class="text-muted">Start a conversation with {agent?.name || 'the assistant'}</p>
				<!-- Debug info -->
				<small class="text-muted">
					Debug: dialogs={dialogs.length}, streaming={streamingMessages.length}, grouped={JSON.stringify(
						Object.keys(groupedDialogs)
					)}
				</small>
			</div>
		{:else}
			{#each Object.entries(groupedDialogs) as [date, messages]}
				<div class="date-separator">
					<span class="date-label">{date}</span>
				</div>
				{#each messages as message}
					<div
						class="message-container {isUserMessage(message)
							? 'user-message'
							: 'assistant-message'}"
						in:fly={{ y: 20, duration: 300 }}
					>
						{#if !isUserMessage(message)}
							<div class="message-avatar">
								<i class="fas fa-robot"></i>
							</div>
						{/if}
						<div class="message-content">
							<div
								class="message-bubble {message.text?.includes('Sorry, there was an error')
									? 'error-message'
									: ''} {message.is_streaming ? 'streaming-message' : ''}"
							>							{#if message.rich_content}
								<!-- Handle rich content if needed -->
								<div class="rich-content">
									<Markdown 
										text={message.text || message.rich_content?.message?.text || ''} 
										containerClasses={isUserMessage(message) ? 'text-white markdown-lite' : 'text-dark markdown-dark'}
										rawText
									/>
								</div>
							{:else}
								<Markdown 
									text={message.text || ''} 
									containerClasses={isUserMessage(message) ? 'text-white markdown-lite' : 'text-dark markdown-dark'}
									rawText
								/>
							{/if}{#if message.is_streaming}
									<span class="streaming-indicator">
										<LoadingDots size="8" gap="4" color="#6c757d" />
									</span>
								{/if}
							</div>
							<div class="message-time">
								{formatTimestamp(message.created_at || message.timestamp)}
							</div>
						</div>
						{#if isUserMessage(message)}
							<div class="message-avatar user-avatar">
								<i class="fas fa-user"></i>
							</div>
						{/if}
					</div>
				{/each}
			{/each}
		{/if}

		{#if isSendingMsg || isThinking}
			<div class="message-container assistant-message" in:fade>
				<div class="message-avatar">
					<i class="fas fa-robot"></i>
				</div>
				<div class="message-content">
					<div class="message-bubble thinking">
						{#if indication}
							<div class="thinking-text">{indication}</div>
						{/if}
						<div class="typing-indicator">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Notification Banner -->
	{#if isDisplayNotification && notificationText}
		<div class="notification-banner" in:fade out:fade>
			<div class="notification-content">
				<i class="fas fa-bell"></i>
				<span>{notificationText}</span>
			</div>
		</div>
	{/if}

	<!-- Input Area -->
	<div class="chat-input-area">
		<div class="input-container">
			<textarea
				bind:value={messageInput}
				on:keydown={handleKeyPress}
				placeholder="Type your message..."
				rows="1"
				class="message-input"
				disabled={isLoading || isSendingMsg}
			></textarea>
			<button
				class="send-btn"
				on:click={sendMessage}
				disabled={!messageInput.trim() || isLoading || isSendingMsg}
			>
				<i class="fas fa-paper-plane"></i>
			</button>
		</div>
	</div>
</div>

<style>
	.workspace-chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f8f9fa;
		position: relative;
	}

	/* Header Styles */
	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: white;
		border-bottom: 1px solid #e9ecef;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-btn {
		background: none;
		border: none;
		color: #6c757d;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.back-btn:hover {
		background: #f8f9fa;
		color: #495057;
	}

	.agent-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.agent-avatar {
		width: 40px;
		height: 40px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.agent-details h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #343a40;
	}

	.agent-details p {
		margin: 0;
		font-size: 0.85rem;
		color: #6c757d;
	}

	/* Messages Styles */
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.loading-container,
	.empty-chat {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
	}

	/* Date Separator */
	.date-separator {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 1rem 0;
		position: relative;
	}

	.date-separator::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: #dee2e6;
		z-index: 1;
	}

	.date-label {
		background: #f8f9fa;
		color: #6c757d;
		padding: 0.25rem 1rem;
		border-radius: 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		z-index: 2;
		position: relative;
	}

	.message-container {
		display: flex;
		gap: 0.75rem;
		max-width: 80%;
		margin-bottom: 0.5rem;
	}
	.message-container.user-message {
		align-self: flex-end;
		flex-direction: row; /* 修复：用户消息头像在左侧，消息在右侧 */
	}

	.message-container.assistant-message {
		align-self: flex-start;
	}

	.message-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		flex-shrink: 0;
		margin-top: auto;
	}

	.message-avatar:not(.user-avatar) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.user-avatar {
		background: #28a745;
		color: white;
	}

	.message-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}	.message-bubble {
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		word-wrap: break-word;
		position: relative;
		color: #343a40; /* 确保AI消息文字颜色为深色 */
	}
	.user-message .message-bubble {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	/* 确保AI消息中的Markdown内容也是深色 */
	.assistant-message .message-bubble :global(.markdown),
	.assistant-message .message-bubble :global(.markdown p),
	.assistant-message .message-bubble :global(.markdown h1),
	.assistant-message .message-bubble :global(.markdown h2),
	.assistant-message .message-bubble :global(.markdown h3),
	.assistant-message .message-bubble :global(.markdown h4),
	.assistant-message .message-bubble :global(.markdown h5),
	.assistant-message .message-bubble :global(.markdown h6) {
		color: #343a40 !important;
	}

	/* 确保用户消息中的Markdown内容是白色 */
	.user-message .message-bubble :global(.markdown),
	.user-message .message-bubble :global(.markdown p),
	.user-message .message-bubble :global(.markdown h1),
	.user-message .message-bubble :global(.markdown h2),
	.user-message .message-bubble :global(.markdown h3),
	.user-message .message-bubble :global(.markdown h4),
	.user-message .message-bubble :global(.markdown h5),
	.user-message .message-bubble :global(.markdown h6) {
		color: white !important;
	}
	.message-bubble.streaming-message {
		border-left: 3px solid #667eea;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			border-left-color: #667eea;
		}
		50% {
			border-left-color: #764ba2;
		}
		100% {
			border-left-color: #667eea;
		}
	}

	.streaming-indicator {
		display: inline-flex;
		align-items: center;
		margin-left: 0.5rem;
		font-size: 0.8rem;
		color: #6c757d;
	}

	.thinking-text {
		color: #6c757d;
		font-style: italic;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}
	.message-time {
		font-size: 0.75rem;
		color: #6c757d;
		align-self: flex-start; /* 修复：时间戳统一在左侧 */
	}

	/* Typing Indicator */
	.typing-indicator {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.typing-indicator span {
		width: 6px;
		height: 6px;
		background: #6c757d;
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(1) {
		animation-delay: -0.32s;
	}
	.typing-indicator span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes typing {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Notification Banner */
	.notification-banner {
		position: absolute;
		top: 80px;
		left: 1rem;
		right: 1rem;
		background: #d1ecf1;
		border: 1px solid #bee5eb;
		border-radius: 0.5rem;
		z-index: 20;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.notification-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		color: #0c5460;
	}

	.notification-content i {
		flex-shrink: 0;
	}

	/* Input Area */
	.chat-input-area {
		padding: 1rem 1.5rem;
		background: white;
		border-top: 1px solid #e9ecef;
		z-index: 10;
	}

	.input-container {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		max-width: 100%;
	}

	.message-input {
		flex: 1;
		border: 1px solid #ced4da;
		border-radius: 1.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		resize: none;
		outline: none;
		transition: border-color 0.3s ease;
		min-height: 44px;
		max-height: 120px;
	}

	.message-input:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.send-btn {
		width: 44px;
		height: 44px;
		border: none;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	.send-btn:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.send-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}	/* Rich Content Styles */
	.rich-content {
		width: 100%;
	}

	/* 确保AI消息Markdown内容继承正确的样式 */
	.assistant-message .message-bubble :global(.markdown-container) {
		color: #343a40;
	}

	.assistant-message .message-bubble :global(.markdown-container p) {
		color: #343a40;
		margin: 0.25rem 0;
	}

	.assistant-message .message-bubble :global(.markdown-container h1),
	.assistant-message .message-bubble :global(.markdown-container h2),
	.assistant-message .message-bubble :global(.markdown-container h3),
	.assistant-message .message-bubble :global(.markdown-container h4),
	.assistant-message .message-bubble :global(.markdown-container h5),
	.assistant-message .message-bubble :global(.markdown-container h6) {
		color: #343a40;
		margin: 0.5rem 0 0.25rem 0;
	}

	.assistant-message .message-bubble :global(.markdown-container code) {
		background: #f8f9fa;
		color: #e83e8c;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}

	.assistant-message .message-bubble :global(.markdown-container pre) {
		background: #f8f9fa;
		color: #343a40;
		padding: 0.75rem;
		border-radius: 0.375rem;
		overflow-x: auto;
		margin: 0.5rem 0;
	}

	.assistant-message .message-bubble :global(.markdown-container ul),
	.assistant-message .message-bubble :global(.markdown-container ol) {
		margin: 0.25rem 0;
		padding-left: 1.5rem;
	}

	.assistant-message .message-bubble :global(.markdown-container table) {
		width: 100%;
		margin: 0.5rem 0;
		border-collapse: collapse;
	}

	.assistant-message .message-bubble :global(.markdown-container table th),
	.assistant-message .message-bubble :global(.markdown-container table td) {
		border: 1px solid #dee2e6;
		padding: 0.5rem;
		text-align: left;
	}

	.assistant-message .message-bubble :global(.markdown-container table th) {
		background: #f8f9fa;
		font-weight: 600;
	}

	/* 用户消息Markdown内容样式 */
	.user-message .message-bubble :global(.markdown-container) {
		color: white;
	}

	.user-message .message-bubble :global(.markdown-container p) {
		color: white;
		margin: 0.25rem 0;
	}

	.user-message .message-bubble :global(.markdown-container h1),
	.user-message .message-bubble :global(.markdown-container h2),
	.user-message .message-bubble :global(.markdown-container h3),
	.user-message .message-bubble :global(.markdown-container h4),
	.user-message .message-bubble :global(.markdown-container h5),
	.user-message .message-bubble :global(.markdown-container h6) {
		color: white;
		margin: 0.5rem 0 0.25rem 0;
	}

	.user-message .message-bubble :global(.markdown-container code) {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}

	.user-message .message-bubble :global(.markdown-container pre) {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		padding: 0.75rem;
		border-radius: 0.375rem;
		overflow-x: auto;
		margin: 0.5rem 0;
	}

	.user-message .message-bubble :global(.markdown-container ul),
	.user-message .message-bubble :global(.markdown-container ol) {
		margin: 0.25rem 0;
		padding-left: 1.5rem;
	}

	.user-message .message-bubble :global(.markdown-container table) {
		width: 100%;
		margin: 0.5rem 0;
		border-collapse: collapse;
	}

	.user-message .message-bubble :global(.markdown-container table th),
	.user-message .message-bubble :global(.markdown-container table td) {
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.5rem;
		text-align: left;
		color: white;
	}

	.user-message .message-bubble :global(.markdown-container table th) {
		background: rgba(255, 255, 255, 0.1);
		font-weight: 600;
	}

	/* 确保错误消息的文字颜色正确 */
	.message-bubble.error-message {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.message-bubble.error-message :global(.markdown),
	.message-bubble.error-message :global(.markdown p) {
		color: #721c24 !important;
	}

	/* 确保思考状态的文字颜色正确 */
	.message-bubble.thinking {
		background: #f8f9fa;
		padding: 1rem;
		color: #6c757d;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.message-container {
			max-width: 95%;
		}

		.chat-header {
			padding: 0.75rem 1rem;
		}

		.agent-details h3 {
			font-size: 1rem;
		}

		.agent-details p {
			font-size: 0.8rem;
		}

		.notification-banner {
			left: 0.5rem;
			right: 0.5rem;
		}
	}

	/* Scrollbar Styling */
	.chat-messages::-webkit-scrollbar {
		width: 6px;
	}

	.chat-messages::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}

	.chat-messages::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3px;
	}

	.chat-messages::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>

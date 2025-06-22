<script>	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { getAgents } from '$lib/services/agent-service.js';
	import { newConversation, sendMessageToHub } from '$lib/services/conversation-service.js';
	import { myInfo } from '$lib/services/auth-service.js';
	import { signalr } from '$lib/services/signalr-service.js';
	import Markdown from '$lib/common/markdown/Markdown.svelte';
	import RichContent from '../../chat/[agentId]/[conversationId]/rich-content/rich-content.svelte';
	import RcMessage from '../../chat/[agentId]/[conversationId]/rich-content/rc-message.svelte';	let mounted = false;
	let selectedAgent = null;
	let agents = [];
	let messages = [];
	let messageInput = '';
	let showAgentSelect = true;
	let isLoading = false;
	let chatContainer;
	let outputItems = [];
	let currentUser = null;
	let conversation = null;
	let isSendingMsg = false;
	let isThinking = false;

	// 流式消息处理相关变量
	let streamingMessages = []; // 流式消息数组
	let streamingMessageCache = new Map(); // 流式消息缓存，用于文本拼接

	// Get session ID from URL if exists
	const sessionId = $page.params.id;
	onMount(async () => {
		mounted = true;
		currentUser = await myInfo();
		await loadAgents();

		if (sessionId) {
			// Load existing session
			loadSession(sessionId);
		}
	});

	async function loadAgents() {
		try {
			const filter = {
				pager: { page: 1, size: 50, count: 0 }
			};
			const response = await getAgents(filter, true);
			agents = response?.items?.map((t) => ({ ...t })) || [];
		} catch (error) {
			console.error('Failed to load agents:', error);
		}
	}

	function loadSession(id) {
		// Mock loading session data
		showAgentSelect = false;
		selectedAgent = agents[0];
		messages = [
			{
				id: '1',
				content: 'Hello! How can I help you today?',
				isUser: false,
				timestamp: new Date(),
				agent: selectedAgent
			}
		];
	}
	async function selectAgent(agent) {
		selectedAgent = agent;
		showAgentSelect = false;
		isLoading = true;
		
		try {
			// Create new conversation with the selected agent
			conversation = await newConversation(agent.id);
			
			// Initialize SignalR connection
			signalr.onMessageReceivedFromAssistant = onMessageReceivedFromAssistant;
			signalr.onStreamMessageReceivedFromAssistant = onStreamMessageReceivedFromAssistant;
			await signalr.start(conversation.id);
			
			// Add welcome message
			messages = [
				{
					id: Date.now().toString(),
					content: `Hello! I'm ${agent.name}. ${agent.description}`,
					isUser: false,
					timestamp: new Date(),
					agent: agent
				}
			];
		} catch (error) {
			console.error('Failed to create conversation:', error);
		} finally {
			isLoading = false;
		}
	}
	function changeAgent() {
		showAgentSelect = true;
		selectedAgent = null;
		messages = [];
		outputItems = [];
		if (conversation) {
			signalr.stop();
			conversation = null;
		}
	}
	async function sendMessage() {
		if (!messageInput.trim() || isLoading || isSendingMsg || !conversation) return;

		const userMessage = {
			id: Date.now().toString(),
			content: messageInput.trim(),
			isUser: true,
			timestamp: new Date()
		};

		messages = [...messages, userMessage];
		const currentInput = messageInput;
		messageInput = '';
		isSendingMsg = true;

		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);

		try {
			// Send message via SignalR
			await sendMessageToHub(selectedAgent.id, conversation.id, currentInput);
		} catch (error) {
			console.error('Failed to send message:', error);
			// Add error message
			messages = [...messages, {
				id: Date.now().toString(),
				content: 'Sorry, I encountered an error while processing your message.',
				isUser: false,
				timestamp: new Date(),
				agent: selectedAgent,
				isError: true
			}];
		} finally {			isSendingMsg = false;		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
	function goBack() {
		goto('/workspace/sessions');
	}	/**
	 * Handle message received from assistant
	 */
	function onMessageReceivedFromAssistant(message) {
		// 只处理 AI 助手的消息
		if (!message.sender || message.sender.role !== 'assistant') {
			console.log(`[Workspace Chat] 忽略非助手消息，角色: ${message.sender?.role}`);
			return;
		}

		console.log(`[Workspace Chat] 收到最终助手消息，ID: ${message.message_id}`);

		// 检查是否为流式消息的最终版本
		const messageId = message.message_id;
		if (streamingMessageCache.has(messageId)) {
			// 将流式消息转换为最终消息
			const finalMessage = {
				id: message.message_id || Date.now().toString(),
				content: message.text || message.rich_content?.message?.text || '',
				isUser: false,
				timestamp: new Date(message.created_at || Date.now()),
				agent: selectedAgent,
				rich_content: message.rich_content,
				message_id: message.message_id,
				sender: message.sender,
				is_streaming: false,
				is_chat_message: true
			};

			// 从流式消息数组中移除
			streamingMessages = streamingMessages.filter(m => m.message_id !== messageId);
			// 从缓存中移除
			streamingMessageCache.delete(messageId);
			
			// 添加到最终消息数组
			messages = [...messages, finalMessage];
			console.log(`[Workspace Chat] 流式消息转换为最终消息，ID: ${messageId}`);
		} else {
			// 普通助手消息
			const assistantMessage = {
				id: message.message_id || Date.now().toString(),
				content: message.text || message.rich_content?.message?.text || '',
				isUser: false,
				timestamp: new Date(message.created_at || Date.now()),
				agent: selectedAgent,
				rich_content: message.rich_content,
				message_id: message.message_id,
				sender: message.sender,
				is_streaming: false,
				is_chat_message: true
			};

			messages = [...messages, assistantMessage];
			console.log(`[Workspace Chat] 添加新助手消息，ID: ${message.message_id}`);
		}

		isSendingMsg = false;
		isThinking = false;

		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	/**
	 * Handle streaming message from assistant
	 */
	function onStreamMessageReceivedFromAssistant(message) {
		// 只处理 AI 助手的消息
		if (!message.sender || message.sender.role !== 'assistant') {
			console.log(`[Workspace Chat] 忽略非助手流式消息，角色: ${message.sender?.role}`);
			return;
		}

		console.log(
			`[Workspace Chat] 收到流式消息片段，ID: ${message.message_id}, 片段长度: ${message.text?.length || 0}`
		);

		const messageId = message.message_id;

		// 处理流式消息的增量更新
		if (streamingMessageCache.has(messageId)) {
			// 更新现有的流式消息 - 进行增量拼接
			const existingMessage = streamingMessageCache.get(messageId);
			const updatedMessage = {
				...existingMessage,
				// 进行增量拼接文本内容
				content: (existingMessage.content || '') + (message.text || ''),
				text: (existingMessage.text || '') + (message.text || ''),
				// 合并其他可能的字段
				rich_content: message.rich_content || existingMessage.rich_content,
				timestamp: new Date(),
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
				`[Workspace Chat] 更新流式消息，ID: ${messageId}, 累积长度: ${updatedMessage.content?.length || 0}`
			);
		} else {
			// 新的流式消息
			const newStreamingMessage = {
				id: messageId || Date.now().toString(),
				content: message.text || '',
				text: message.text || '',
				isUser: false,
				timestamp: new Date(),
				agent: selectedAgent,
				rich_content: message.rich_content,
				message_id: messageId,
				sender: message.sender,
				is_streaming: true // 标记为流式消息
			};

			// 添加到缓存
			streamingMessageCache.set(messageId, newStreamingMessage);

			// 添加到显示数组
			streamingMessages.push(newStreamingMessage);
			console.log(`[Workspace Chat] 添加新流式消息，ID: ${messageId}`);
		}

		streamingMessages = [...streamingMessages];

		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 50);
	}

	function formatTime(timestamp) {
		return timestamp.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	function removeOutput(outputId) {
		outputItems = outputItems.filter((item) => item.id !== outputId);
	}
</script>

<div class="chat-page">
	{#if mounted}
		{#if showAgentSelect}
			<!-- Agent Selection -->
			<div class="agent-selection" in:fade={{ duration: 600 }}>
				<div class="selection-header">
					<button class="back-btn" on:click={goBack}>
						<i class="fas fa-arrow-left"></i>
						Back to Sessions
					</button>
					<h1 class="selection-title">Choose Your AI Assistant</h1>
					<p class="selection-subtitle">Select an agent to start your conversation</p>
				</div>				<div class="agents-grid" in:fly={{ y: 30, duration: 800, delay: 200 }}>
					{#each agents as agent, index}
						<div
							class="agent-card"
							on:click={() => selectAgent(agent)}
							on:keydown={(e) => e.key === 'Enter' && selectAgent(agent)}
							role="button"
							tabindex="0"
							in:fly={{ y: 30, duration: 600, delay: 100 * index }}
						>
							<div class="agent-avatar">
								{#if agent.icon_url}
									<img src={agent.icon_url} alt={agent.name} class="agent-image" />
								{:else}
									<img src="images/users/bot.png" alt={agent.name} class="agent-image" />
								{/if}
							</div>
							<div class="agent-info">
								<h3 class="agent-name">{agent.name}</h3>
								<p class="agent-description">{agent.description}</p>
							</div>
							<div class="select-arrow">
								<i class="fas fa-arrow-right"></i>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Chat Interface -->
			<div class="chat-interface" in:fade={{ duration: 600 }}>
				<!-- Chat Header -->
				<div class="chat-header">
					<div class="header-left">
						<button class="back-btn" on:click={goBack}>
							<i class="fas fa-arrow-left"></i>
						</button>						<div class="agent-info">
							<div class="agent-avatar-small">
								{#if selectedAgent?.icon_url}
									<img src={selectedAgent.icon_url} alt={selectedAgent.name} class="agent-header-image" />
								{:else}
									<img src="images/users/bot.png" alt={selectedAgent?.name || 'Agent'} class="agent-header-image" />
								{/if}
							</div>
							<div>
								<h3 class="current-agent-name">{selectedAgent?.name}</h3>
								<span class="agent-status">
									<i class="fas fa-circle online"></i>
									Online
								</span>
							</div>
						</div>
					</div>
					<div class="header-actions">
						<button class="header-btn" on:click={changeAgent} title="Change Agent">
							<i class="fas fa-exchange-alt"></i>
						</button>
						<button class="header-btn" title="Session Settings">
							<i class="fas fa-cog"></i>
						</button>
					</div>
				</div>

				<!-- Chat Content -->
				<div class="chat-content">
					<!-- Messages Panel -->
					<div class="messages-panel">						<div class="messages-container" bind:this={chatContainer}>
							<!-- 显示最终消息 -->
							{#each messages as message (message.id)}
								<div
									class="message {message.isUser ? 'user-message' : 'ai-message'}"
									in:fly={{ y: 20, duration: 400 }}
								>
									{#if !message.isUser}
										<div class="message-avatar">
											{#if message.agent?.icon_url}
												<img src={message.agent.icon_url} alt={message.agent.name} class="message-avatar-image" />
											{:else}
												<img src="images/users/bot.png" alt={message.agent?.name || 'Agent'} class="message-avatar-image" />
											{/if}
										</div>
									{/if}
									<div class="message-content">
										<div class="message-bubble">
											{#if message.rich_content}
												<!-- 使用RcMessage组件渲染富文本内容 -->
												<RcMessage message={message} containerClasses="workspace-message" />
												<!-- 渲染富文本交互组件 -->
												<RichContent message={message} />
											{:else}
												<!-- 使用Markdown组件渲染普通文本 -->
												<Markdown text={message.content || message.text || ''} containerClasses="text-dark workspace-markdown" rawText />
											{/if}
										</div>
										<div class="message-meta">
											<span class="message-time">{formatTime(message.timestamp)}</span>
											{#if !message.isUser}
												<span class="message-agent">{message.agent?.name}</span>
											{/if}
										</div>
									</div>
									{#if message.isUser}
										<div class="message-avatar user-avatar">
											<i class="fas fa-user"></i>
										</div>
									{/if}
								</div>
							{/each}

							<!-- 显示流式消息 -->
							{#each streamingMessages as streamMessage (streamMessage.message_id)}
								<div
									class="message ai-message streaming-message"
									in:fly={{ y: 20, duration: 400 }}
								>
									<div class="message-avatar">
										{#if streamMessage.agent?.icon_url}
											<img src={streamMessage.agent.icon_url} alt={streamMessage.agent.name} class="message-avatar-image" />
										{:else}
											<img src="images/users/bot.png" alt={streamMessage.agent?.name || 'Agent'} class="message-avatar-image" />
										{/if}
									</div>
									<div class="message-content">
										<div class="message-bubble">
											{#if streamMessage.rich_content}
												<!-- 流式富文本消息 -->
												<RcMessage message={streamMessage} containerClasses="workspace-message" />
											{:else}
												<!-- 流式普通文本消息 -->
												<Markdown text={streamMessage.content || streamMessage.text || ''} containerClasses="text-dark workspace-markdown" rawText />
												<span class="streaming-cursor">|</span>
											{/if}
										</div>
										<div class="message-meta">
											<span class="message-time">{formatTime(streamMessage.timestamp)}</span>
											<span class="message-agent">{streamMessage.agent?.name}</span>
											<span class="streaming-indicator">正在输入...</span>
										</div>
									</div>
								</div>
							{/each}

							{#if isSendingMsg || isThinking}
								<div class="message ai-message" in:fade={{ duration: 300 }}>
									<div class="message-avatar">
										{#if selectedAgent?.icon_url}
											<img src={selectedAgent.icon_url} alt={selectedAgent.name} class="message-avatar-image" />
										{:else}
											<img src="images/users/bot.png" alt={selectedAgent?.name || 'Agent'} class="message-avatar-image" />
										{/if}
									</div>
									<div class="message-content">
										<div class="typing-indicator">
											<div class="typing-dots">
												<span></span>
												<span></span>
												<span></span>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>

						<!-- Message Input -->
						<div class="message-input-area">
							<div class="input-container">								<textarea
									bind:value={messageInput}
									on:keydown={handleKeydown}
									placeholder="Type your message..."
									class="message-input"
									rows="1"
									disabled={isSendingMsg || isThinking}
								></textarea><button
									class="send-btn"
									on:click={sendMessage}
									disabled={!messageInput.trim() || isSendingMsg || isThinking}
								>
									<i class="fas fa-paper-plane"></i>
								</button>
							</div>
						</div>
					</div>

					<!-- Output Canvas Panel -->
					<div class="output-panel">
						<div class="output-header">
							<h3>
								<i class="fas fa-palette me-2"></i>
								Output Canvas
							</h3>
							<span class="output-count">{outputItems.length} items</span>
						</div>

						<div class="output-content">
							{#if outputItems.length > 0}
								{#each outputItems as item (item.id)}
									<div class="output-item" in:fly={{ x: 20, duration: 400 }}>
										<div class="output-item-header">
											<div class="output-icon">
												{#if item.type === 'image'}
													<i class="fas fa-image"></i>
												{:else if item.type === 'chart'}
													<i class="fas fa-chart-bar"></i>
												{:else if item.type === 'code'}
													<i class="fas fa-code"></i>
												{:else}
													<i class="fas fa-file"></i>
												{/if}
											</div>
											<div class="output-info">
												<h4>{item.title}</h4>
												<span class="output-time">{formatTime(item.timestamp)}</span>
											</div>
											<button class="remove-btn" on:click={() => removeOutput(item.id)}>
												<i class="fas fa-times"></i>
											</button>
										</div>
										<div class="output-preview">
											<p>{item.content}</p>
										</div>
									</div>
								{/each}
							{:else}
								<div class="output-placeholder">
									<i class="fas fa-palette"></i>
									<p>Output Canvas</p>
									<span>Generated content will appear here</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.chat-page {
		height: 100vh;
		background: #f8f9fa;
		overflow: hidden;
	}

	/* Agent Selection Styles */
	.agent-selection {
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		overflow-y: auto;
		padding: 2rem;
	}

	.selection-header {
		text-align: center;
		margin-bottom: 3rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.back-btn {
		background: none;
		border: none;
		color: #667eea;
		font-size: 1rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		transition: all 0.3s ease;
		margin-bottom: 2rem;
	}

	.back-btn:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.selection-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.selection-subtitle {
		font-size: 1.2rem;
		color: #7f8c8d;
	}
	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.agent-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
	}

	.agent-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}	.agent-avatar {
		width: 70px;
		height: 70px;
		border-radius: 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1.25rem;
		flex-shrink: 0;
		overflow: hidden;
		position: relative;
	}

	.agent-card:hover .agent-avatar {
		background: rgba(255, 255, 255, 0.2);
	}

	.agent-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 16px;
	}

	.agent-info {
		flex-grow: 1;
	}

	.agent-name {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	.agent-description {
		font-size: 0.9rem;
		color: #7f8c8d;
		margin: 0;
		line-height: 1.4;
	}

	.agent-card:hover .agent-description {
		color: rgba(255, 255, 255, 0.8);
	}

	.select-arrow {
		margin-left: 1rem;
		flex-shrink: 0;
	}

	.select-arrow i {
		font-size: 1rem;
		color: #bdc3c7;
		transition: all 0.3s ease;
	}

	.agent-card:hover .select-arrow i {
		color: white;
		transform: translateX(3px);
	}

	/* Chat Interface Styles */
	.chat-interface {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.chat-header {
		background: white;
		border-bottom: 1px solid #e9ecef;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}	.agent-avatar-small {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.75rem;
		overflow: hidden;
	}

	.agent-header-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
	}

	.current-agent-name {
		font-size: 1rem;
		font-weight: 600;
		color: #2c3e50;
		margin: 0 0 0.25rem 0;
	}

	.agent-status {
		font-size: 0.8rem;
		color: #7f8c8d;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.agent-status .online {
		color: #27ae60;
		font-size: 0.6rem;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.header-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 6px;
		color: #7f8c8d;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.header-btn:hover {
		background: #f8f9fa;
		color: #667eea;
	}

	.chat-content {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.messages-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #e9ecef;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.message {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		max-width: 80%;
	}

	.user-message {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.ai-message {
		align-self: flex-start;
	}
	.message-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
	}

	.user-avatar {
		background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
	}

	.message-avatar i {
		color: white;
		font-size: 0.8rem;
	}

	.message-avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.message-content {
		flex: 1;
	}

	.message-bubble {
		background: white;
		border-radius: 12px;
		padding: 0.75rem 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid #e9ecef;
	}
	.user-message .message-bubble {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.message-meta {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #bdc3c7;
		display: flex;
		gap: 0.5rem;
	}

	.user-message .message-meta {
		justify-content: flex-end;
	}

	.typing-indicator {
		padding: 0.75rem 1rem;
	}

	.typing-dots {
		display: flex;
		gap: 0.25rem;
	}

	.typing-dots span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #bdc3c7;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-dots span:nth-child(1) {
		animation-delay: -0.32s;
	}
	.typing-dots span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes typing {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

	.message-input-area {
		padding: 1rem;
		background: white;
		border-top: 1px solid #e9ecef;
	}

	.input-container {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
		max-width: 100%;
	}

	.message-input {
		flex: 1;
		border: 1px solid #e9ecef;
		border-radius: 12px;
		padding: 0.75rem 1rem;
		font-family: inherit;
		font-size: 0.9rem;
		resize: none;
		max-height: 120px;
		min-height: 40px;
		background: #f8f9fa;
		transition: all 0.3s ease;
	}

	.message-input:focus {
		outline: none;
		border-color: #667eea;
		background: white;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.message-input:disabled {
		background: #e9ecef;
		color: #7f8c8d;
	}

	.send-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.send-btn:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.send-btn:disabled {
		background: #bdc3c7;
		cursor: not-allowed;
		transform: none;
	}

	/* Output Panel Styles */
	.output-panel {
		width: 300px;
		background: white;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.output-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.output-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #2c3e50;
		margin: 0;
		display: flex;
		align-items: center;
	}

	.output-count {
		font-size: 0.8rem;
		color: #7f8c8d;
		background: #f8f9fa;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
	}

	.output-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.output-item {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		border: 1px solid #e9ecef;
	}

	.output-item-header {
		display: flex;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.output-icon {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.75rem;
		flex-shrink: 0;
	}

	.output-icon i {
		color: white;
		font-size: 0.9rem;
	}

	.output-info {
		flex: 1;
	}

	.output-info h4 {
		font-size: 0.9rem;
		font-weight: 600;
		color: #2c3e50;
		margin: 0 0 0.25rem 0;
	}

	.output-time {
		font-size: 0.75rem;
		color: #7f8c8d;
	}

	.remove-btn {
		background: none;
		border: none;
		color: #bdc3c7;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.remove-btn:hover {
		color: #e74c3c;
		background: rgba(231, 76, 60, 0.1);
	}

	.output-preview {
		background: white;
		border-radius: 6px;
		padding: 0.75rem;
		border: 1px solid #e9ecef;
	}

	.output-preview p {
		margin: 0;
		font-size: 0.8rem;
		color: #7f8c8d;
		line-height: 1.3;
	}

	.output-placeholder {
		text-align: center;
		padding: 3rem 1rem;
		color: #bdc3c7;
	}

	.output-placeholder i {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.output-placeholder p {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #7f8c8d;
	}

	.output-placeholder span {
		font-size: 0.8rem;
	}
	@media (max-width: 768px) {
		.output-panel {
			display: none;
		}

		.selection-title {
			font-size: 2rem;
		}

		.agents-grid {
			grid-template-columns: 1fr;
			padding: 0 1rem;
		}

		.agent-card {
			padding: 1rem;
		}

		.message {
			max-width: 95%;
		}
	}

	/* 流式消息样式 */
	.streaming-message {
		opacity: 0.9;
	}

	.streaming-cursor {
		animation: blink 1s infinite;
		color: #667eea;
		font-weight: bold;
		margin-left: 2px;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	.streaming-indicator {
		color: #667eea;
		font-size: 0.75rem;
		font-style: italic;
		margin-left: 0.5rem;
	}

	/* Markdown和富文本内容样式 */
	:global(.workspace-message) {
		background: transparent !important;
		color: #2c3e50 !important;
	}

	:global(.workspace-markdown) {
		color: #2c3e50 !important;
	}

	:global(.workspace-markdown h1),
	:global(.workspace-markdown h2),
	:global(.workspace-markdown h3),
	:global(.workspace-markdown h4),
	:global(.workspace-markdown h5),
	:global(.workspace-markdown h6) {
		color: #2c3e50 !important;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.workspace-markdown code) {
		background: #f8f9fa;
		color: #e83e8c;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-size: 0.875em;
	}

	:global(.workspace-markdown pre) {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 6px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0.5rem 0;
	}

	:global(.workspace-markdown pre code) {
		background: none;
		color: #2c3e50;
		padding: 0;
	}

	:global(.workspace-markdown ul),
	:global(.workspace-markdown ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.workspace-markdown blockquote) {
		border-left: 4px solid #667eea;
		margin: 0.5rem 0;
		padding-left: 1rem;
		color: #7f8c8d;
		font-style: italic;
	}

	:global(.workspace-markdown a) {
		color: #667eea;
		text-decoration: none;
	}

	:global(.workspace-markdown a:hover) {
		text-decoration: underline;
	}
</style>

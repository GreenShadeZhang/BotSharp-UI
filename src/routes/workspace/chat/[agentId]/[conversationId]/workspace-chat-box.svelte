<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Button, Input } from '@sveltestrap/sveltestrap';
	import { 
		newConversation,
		sendMessageToHub,
		getConversation,
		getDialogs
	} from '$lib/services/conversation-service.js';
	import { signalr } from '$lib/services/signalr-service.js';
	import Markdown from '$lib/common/markdown/Markdown.svelte';
	import { _ } from 'svelte-i18n';

	/** @type {import('$userTypes').UserModel} */
	export let currentUser;

	/** @type {import('$agentTypes').AgentModel} */
	export let agent;

	const params = $page.params;
	let conversationId = params.conversationId;
	let agentId = params.agentId;

	let messages = [];
	let messageInput = '';
	let isLoading = false;
	let isSendingMsg = false;
	let chatContainer;
	let conversation = null;
	let mounted = false;

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

				// Add welcome message
				messages = [{
					id: 'welcome',
					content: `Hello! I'm ${agent?.name || 'your assistant'}. How can I help you today?`,
					isUser: false,
					timestamp: new Date(),
					agent: agent
				}];
			} else {
				// Load existing conversation
				conversation = await getConversation(conversationId);
				if (conversation) {
					const dialogsResponse = await getDialogs(conversationId);
					if (dialogsResponse && dialogsResponse.length > 0) {
						messages = dialogsResponse.map((dialog) => ({
							id: dialog.message_id || dialog.id || Date.now().toString(),
							content: dialog.text || dialog.rich_content?.message?.text || '',
							isUser: dialog.sender?.role === 'user',
							timestamp: new Date(dialog.created_at || Date.now()),
							agent: agent,
							rich_content: dialog.rich_content,
							message_id: dialog.message_id,
							sender: dialog.sender
						}));
					}
				} else {
					throw new Error('Conversation not found');
				}
			}

			// Initialize SignalR connection
			if (conversation) {
				signalr.onMessageReceivedFromAssistant = onMessageReceivedFromAssistant;
				signalr.onStreamMessageReceivedFromAssistant = onStreamMessageReceivedFromAssistant;
				await signalr.start(conversation.id);
			}

		} catch (error) {
			console.error('Failed to initialize chat:', error);
			// Redirect back to workspace on error
			goto('/workspace');
		} finally {
			isLoading = false;
		}
	}

	function onMessageReceivedFromAssistant(message) {
		const assistantMessage = {
			id: message.id || Date.now().toString(),
			content: message.text || '',
			isUser: false,
			timestamp: new Date(),
			agent: agent,
			rich_content: message.rich_content,
			message_id: message.message_id,
			sender: message.sender
		};

		messages = [...messages, assistantMessage];
		isSendingMsg = false;
		scrollToBottom();
	}

	function onStreamMessageReceivedFromAssistant(message) {
		// Handle streaming messages
		// This is a simplified version - you might need to implement proper streaming logic
		const lastMessage = messages[messages.length - 1];
		if (lastMessage && !lastMessage.isUser) {
			lastMessage.content += message.text || '';
			messages = [...messages];
		} else {
			onMessageReceivedFromAssistant(message);
		}
		scrollToBottom();
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

		scrollToBottom();

		try {
			await sendMessageToHub(agentId, conversation.id, currentInput);
		} catch (error) {
			console.error('Failed to send message:', error);
			// Add error message
			messages = [...messages, {
				id: Date.now().toString(),
				content: 'Sorry, there was an error sending your message. Please try again.',
				isUser: false,
				timestamp: new Date(),
				isError: true
			}];
			isSendingMsg = false;
		}
	}

	function scrollToBottom() {
		tick().then(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		});
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function goBackToWorkspace() {
		goto('/workspace');
	}

	function formatTimestamp(timestamp) {
		return new Date(timestamp).toLocaleTimeString([], { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
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
		{:else if messages.length === 0}
			<div class="empty-chat">
				<i class="fas fa-comments fa-3x text-muted mb-3"></i>
				<p class="text-muted">Start a conversation with {agent?.name || 'the assistant'}</p>
			</div>
		{:else}
			{#each messages as message (message.id)}
				<div class="message-container {message.isUser ? 'user-message' : 'assistant-message'}"
					 in:fly={{ y: 20, duration: 300 }}>
					{#if !message.isUser}
						<div class="message-avatar">
							<i class="fas fa-robot"></i>
						</div>
					{/if}
					<div class="message-content">
						<div class="message-bubble {message.isError ? 'error-message' : ''}">
							{#if message.rich_content}
								<!-- Handle rich content if needed -->
								<div class="rich-content">
									<Markdown content={message.content} />
								</div>
							{:else}
								<Markdown content={message.content} />
							{/if}
						</div>
						<div class="message-time">
							{formatTimestamp(message.timestamp)}
						</div>
					</div>
					{#if message.isUser}
						<div class="message-avatar user-avatar">
							<i class="fas fa-user"></i>
						</div>
					{/if}
				</div>
			{/each}
		{/if}

		{#if isSendingMsg}
			<div class="message-container assistant-message" in:fade>
				<div class="message-avatar">
					<i class="fas fa-robot"></i>
				</div>
				<div class="message-content">
					<div class="message-bubble thinking">
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
	}

	/* Header Styles */
	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: white;
		border-bottom: 1px solid #e9ecef;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

	.loading-container, .empty-chat {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
	}

	.message-container {
		display: flex;
		gap: 0.75rem;
		max-width: 80%;
	}

	.message-container.user-message {
		align-self: flex-end;
		flex-direction: row-reverse;
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
	}

	.message-bubble {
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		word-wrap: break-word;
	}

	.user-message .message-bubble {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.message-bubble.error-message {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.message-bubble.thinking {
		background: #f8f9fa;
		padding: 1rem;
	}

	.message-time {
		font-size: 0.75rem;
		color: #6c757d;
		align-self: flex-end;
	}

	.user-message .message-time {
		align-self: flex-start;
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

	.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
	.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

	@keyframes typing {
		0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
		40% { transform: scale(1); opacity: 1; }
	}

	/* Input Area */
	.chat-input-area {
		padding: 1rem 1.5rem;
		background: white;
		border-top: 1px solid #e9ecef;
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
	}

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
	}
</style>
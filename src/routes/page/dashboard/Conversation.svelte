<script>
	import { Card, CardBody, CardTitle, Col, Row } from '@sveltestrap/sveltestrap';
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import ChatTextArea from '../../chat/[agentId]/[conversationId]/chat-util/chat-text-area.svelte';
	import { getConversation, updateDashboardConversation, unpinConversationFromDashboard } from '$lib/services/conversation-service';

	/** @type {string}*/
	export let conversationId;
	/** @type {string}*/
	export let instruction;
	/** @type {string}*/
	export let userId;

	/** @type {import('$conversationTypes').ConversationModel}*/
	let conversationModel;	
	let agent = {
		name: "Loading",
		icon_url: "https://botsharp.azurewebsites.net/images/users/bot.png"
	};
	
	let isLoading = true;
	let mounted = false;

	/** @type {string} */
	let hide = '';
	
	/** @type {string} */
	let text;
	/** @type {boolean} */
	let loadUtils;
	
	/** @type {number} */
	let messageInputTimeout = 0;

	/** @type {string[]} */
	let chatUtilOptions = [];

	onMount(() => {
			mounted = true;
			if (conversationId) {
				loadDashboardComponents(conversationId);
			}
			if (instruction) {
				text = instruction;
			}
		}
	);

	/**
	 * delete a message in conversation
	 * @param {string} id The user input
	 */
	 async function loadDashboardComponents(id) {
		getConversation(id)
		.then(
			response => {
				conversationModel = response;
				isLoading = false;
			}
		)
		.catch();
	}
	
	/** @param {any} e */
    function handleMessageInput(e) {
        const value = e.target.value;

        clearTimeout(messageInputTimeout);
        chatUtilOptions = [];
    }
</script>

<Col xl={4}>
	{#if mounted}
		<div in:fly={{ y: 30, duration: 600, delay: 200 }}>
			<Card class="modern-conversation-card {hide}">
				<CardBody>
					{#if isLoading}
						<div class="loading-state" in:fade={{ duration: 400 }}>
							<div class="loading-skeleton">
								<div class="skeleton-title"></div>
								<div class="skeleton-text"></div>
								<div class="skeleton-text short"></div>
							</div>
						</div>
					{:else}
						<div class="conversation-header" in:fade={{ duration: 600, delay: 300 }}>
							<div class="conversation-title">
								<CardTitle class="modern-conversation-title">{conversationModel.title}</CardTitle>
							</div>
							<button
								class="unpin-btn"
								on:click={() => {
									hide = 'hide';
									unpinConversationFromDashboard(conversationModel.agent_id, conversationId);
								}}
								title="Unpin conversation"
							>
								<i class="mdi mdi-pin-off"></i>
							</button>
						</div>
						
						<div class="modern-chat-card" in:fly={{ y: 20, duration: 500, delay: 500 }}>
							<div class="chat-agent-header">
								<div class="agent-info">
									{#if agent?.icon_url}
										<div class="agent-avatar">
											<img src={agent.icon_url} alt="Agent Avatar">
											<div class="status-indicator"></div>
										</div>
									{/if}
									<div class="agent-details">
										<span class="agent-name">{conversationModel.agent_id}</span>
										<span class="agent-status">Online</span>
									</div>
								</div>
							</div>

							<div class="chat-input-container">
								<div class="input-wrapper">
									<ChatTextArea
										className="modern-chat-input"
										maxLength={1024}
										disabled={false}
										bind:text={text}
										bind:loadUtils={loadUtils}
										bind:options={chatUtilOptions}
										onFocus={e => chatUtilOptions = []}
									/>
								</div>
								<button
									type="submit"
									class="modern-send-btn"
									disabled={!text}
									on:click={() => updateDashboardConversation({
										conversation_id: conversationId,
										name: '',
										instruction: text
									})}
								>
									<i class="mdi mdi-send"></i>
								</button>
							</div>
						</div>
					{/if}
				</CardBody>
			</Card>
		</div>
	{/if}
</Col>

<style>
.modern-conversation-card {
	border: none;
	border-radius: 20px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20px);
	background: rgba(255, 255, 255, 0.9);
	transition: all 0.3s ease;
	margin-bottom: 25px;
}

.modern-conversation-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modern-conversation-card.hide {
	opacity: 0;
	transform: translateY(-20px);
	pointer-events: none;
}

.conversation-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.modern-conversation-title {
	font-size: 18px;
	font-weight: 600;
	color: #2c3e50;
	margin: 0;
}

.unpin-btn {
	width: 35px;
	height: 35px;
	border: none;
	background: rgba(102, 126, 234, 0.1);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #667eea;
	transition: all 0.3s ease;
	cursor: pointer;
}

.unpin-btn:hover {
	background: rgba(102, 126, 234, 0.2);
	transform: scale(1.1);
}

.unpin-btn i {
	font-size: 16px;
}

.modern-chat-card {
	background: rgba(102, 126, 234, 0.03);
	border: 1px solid rgba(102, 126, 234, 0.1);
	border-radius: 15px;
	padding: 20px;
	margin-bottom: 15px;
}

.chat-agent-header {
	margin-bottom: 20px;
}

.agent-info {
	display: flex;
	align-items: center;
	gap: 12px;
}

.agent-avatar {
	position: relative;
	width: 45px;
	height: 45px;
}

.agent-avatar img {
	width: 100%;
	height: 100%;
	border-radius: 12px;
	object-fit: cover;
	border: 2px solid rgba(102, 126, 234, 0.2);
}

.status-indicator {
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 12px;
	height: 12px;
	background: #28a745;
	border: 2px solid white;
	border-radius: 50%;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.agent-details {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.agent-name {
	font-size: 16px;
	font-weight: 600;
	color: #2c3e50;
}

.agent-status {
	font-size: 12px;
	color: #28a745;
	font-weight: 500;
}

.chat-input-container {
	display: flex;
	align-items: flex-end;
	gap: 12px;
}

.input-wrapper {
	flex: 1;
}

.input-wrapper :global(.modern-chat-input) {
	border: 1px solid rgba(102, 126, 234, 0.2);
	border-radius: 12px;
	padding: 12px 16px;
	font-size: 14px;
	background: rgba(255, 255, 255, 0.8);
	transition: all 0.3s ease;
	resize: none;
	min-height: 45px;
	max-height: 120px;
}

.input-wrapper :global(.modern-chat-input:focus) {
	border-color: #667eea;
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	outline: none;
	background: white;
}

.modern-send-btn {
	width: 45px;
	height: 45px;
	border: none;
	background: linear-gradient(45deg, #667eea, #764ba2);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	transition: all 0.3s ease;
	cursor: pointer;
	box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.modern-send-btn:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.modern-send-btn:disabled {
	background: rgba(102, 126, 234, 0.3);
	cursor: not-allowed;
	box-shadow: none;
}

.modern-send-btn i {
	font-size: 18px;
}

/* Loading States */
.loading-state {
	padding: 20px 0;
}

.loading-skeleton {
	animation: pulse 2s infinite;
}

.skeleton-title {
	height: 20px;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	border-radius: 4px;
	margin-bottom: 15px;
}

.skeleton-text {
	height: 14px;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	border-radius: 4px;
	margin-bottom: 10px;
}

.skeleton-text.short {
	width: 60%;
}

@keyframes pulse {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
	100% {
		opacity: 1;
	}
}

@media (max-width: 768px) {
	.conversation-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}
	
	.unpin-btn {
		align-self: flex-end;
	}
	
	.agent-avatar {
		width: 40px;
		height: 40px;
	}
	
	.agent-name {
		font-size: 15px;
	}
	
	.chat-input-container {
		flex-direction: column;
		gap: 10px;
	}
	
	.modern-send-btn {
		align-self: flex-end;
	}
}
</style>

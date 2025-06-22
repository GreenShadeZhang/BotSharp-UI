import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { endpoints } from '$lib/services/api-endpoints.js';
import { getUserStore } from '$lib/helpers/store.js';

// create a writable store to store the connection object
/** @type {HubConnection} */
let connection;

// create a SignalR service object that exposes methods to interact with the hub
export const signalr = {

  /** @type {import('$conversationTypes').OnConversationInitialized} */
  onConversationInitFromClient: () => {},

  /** @type {import('$conversationTypes').OnMessageReceived} */
  onMessageReceivedFromClient: () => {},

  /** @type {import('$conversationTypes').OnMessageReceived} */
  onMessageReceivedFromCsr: () => {},
  
  /** @type {import('$conversationTypes').OnMessageReceived} */
  onMessageReceivedFromAssistant: () => {},

  /** @type {import('$conversationTypes').OnMessageReceived} */
  onStreamMessageReceivedFromAssistant: () => {},

  // 流式消息缓存，用于存储正在进行中的流式消息
  /** @type {Map<string, any>} */
  streamingMessages: new Map(),

  /** @type {import('$conversationTypes').OnMessageReceived} */
  onNotificationGenerated: () => {},

  /** @type {import('$conversationTypes').OnConversationContentLogReceived} */
  onConversationContentLogGenerated: () => {},

  /** @type {import('$conversationTypes').OnConversationStateLogGenerated} */
  onConversationStateLogGenerated: () => {},

  /** @type {import('$conversationTypes').OnStateChangeGenerated} */
  onStateChangeGenerated: () => {},

  /** @type {import('$conversationTypes').OnAgentQueueChanged} */
  onAgentQueueChanged: () => {},

  /** @type {import('$conversationTypes').OnSenderActionGenerated} */
  onSenderActionGenerated: () => {},

  /** @type {import('$conversationTypes').OnConversationMessageDeleted} */
  onConversationMessageDeleted: () => {},

  // start the connection
  /** @param {string} conversationId */
  async start(conversationId) {
    // create a new connection object with the hub URL and some options
    let user = getUserStore();
    connection = new HubConnectionBuilder()
      .withUrl(endpoints.chatHubUrl + `?conversation-id=${conversationId}&access_token=${user.token}`) // the hub URL, change it according to your server
      .withAutomaticReconnect() // enable automatic reconnection
      .configureLogging(LogLevel.Information) // configure the logging level
      .build();

    // start the connection
    try {
      await connection.start();
      console.log('Connected to SignalR hub');
    } catch (err) {
      console.error(err);
    }

    // register handlers for the hub methods
    connection.on('OnConversationInitFromClient', (conversation) => {
      // do something when receiving a message, such as updating the UI or showing a notification
      if (conversationId === conversation.id) {
        console.log(`[OnConversationInitFromClient] ${conversation.id}: ${conversation.title}`);
        this.onConversationInitFromClient(conversation);
      }
    });

    // register handlers for the hub methods
    connection.on('OnMessageReceivedFromClient', (message) => {
      // do something when receiving a message, such as updating the UI or showing a notification
      if (conversationId === message.conversation_id) {
        console.log(`[OnMessageReceivedFromClient] ${message.sender.role}: ${message.text}`);
        this.onMessageReceivedFromClient(message);
      }
    });

    connection.on('OnMessageReceivedFromCsr', (message) => {
      // do something when receiving a message, such as updating the UI or showing a notification
      if (conversationId === message.conversation_id) {
        console.log(`[OnMessageReceivedFromCsr] ${message.role}: ${message.content}`);
        this.onMessageReceivedFromCsr(message);
      }
    });

    connection.on('OnMessageReceivedFromAssistant', (json) => {
      // do something when receiving a message, such as updating the UI or showing a notification
      const message = JSON.parse(json);
      if (conversationId === message.conversation_id) {
        // 只处理 AI 助手的消息
        if (message.sender && message.sender.role === 'assistant') {
          console.log(`[OnMessageReceivedFromAssistant] ${message.sender.role}: ${message.text}`);
          console.log(message);
          
          // 检查是否有对应的流式消息需要替换
          const messageId = message.message_id;
          if (this.streamingMessages.has(messageId)) {
            // 清理流式消息缓存
            this.streamingMessages.delete(messageId);
            console.log(`[OnMessageReceivedFromAssistant] 替换流式消息，消息ID: ${messageId}`);
          }
          
          this.onMessageReceivedFromAssistant(message);
        }
      }
    });
    
    connection.on('OnStreamMessageReceivedFromAssistant', (json) => {
      console.log(`[OnStreamMessageReceivedFromAssistant json]:`);
      // do something when receiving a message, such as updating the UI or showing a notification
      const message = JSON.parse(json);
      //console.log(json);
      if (conversationId === message.conversation_id) {
        // 只处理 AI 助手的消息
        if (message.sender && message.sender.role === 'assistant') {
          console.log(`[OnStreamMessageReceivedFromAssistant] ${message.sender.role}: ${message.text}`);
          console.log(message);
          
          // 处理流式消息的增量更新
          const messageId = message.message_id;
          if (this.streamingMessages.has(messageId)) {
            // 更新现有的流式消息 - 进行增量拼接
            const existingMessage = this.streamingMessages.get(messageId);
            const updatedMessage = {
              ...existingMessage,
              // 进行增量拼接文本内容
              text: (existingMessage.text || '') + (message.text || ''),
              // 合并其他可能的字段
              rich_content: message.rich_content || existingMessage.rich_content,
              updated_at: message.updated_at || existingMessage.updated_at,
              created_at: existingMessage.created_at || message.created_at,
              sender: existingMessage.sender || message.sender,
              conversation_id: existingMessage.conversation_id || message.conversation_id
            };
            this.streamingMessages.set(messageId, updatedMessage);
            this.onStreamMessageReceivedFromAssistant(updatedMessage);
          } else {
            // 新的流式消息
            const newStreamingMessage = {
              ...message,
              text: message.text || '',
            };
            this.streamingMessages.set(messageId, newStreamingMessage);
            this.onStreamMessageReceivedFromAssistant(newStreamingMessage);
          }
        }
      }
    });

    connection.on('OnNotificationGenerated', (json) => {
      const message = JSON.parse(json);
      if (conversationId === message?.conversation_id) {
        this.onNotificationGenerated(message);
      }
    });

    connection.on('OnConversationContentLogGenerated', (log) => {
      const jsonLog = JSON.parse(log);
      if (conversationId === jsonLog?.conversation_id) {
        this.onConversationContentLogGenerated(jsonLog);
      }
    });

    connection.on('OnConversateStateLogGenerated', (log) => {
      const jsonData = JSON.parse(log);
      if (conversationId === jsonData?.conversation_id) {
        this.onConversationStateLogGenerated(jsonData);
      }
    });

    connection.on('OnStateChangeGenerated', (log) => {
      const jsonData = JSON.parse(log);
      if (conversationId === jsonData?.conversation_id) {
        this.onStateChangeGenerated(jsonData);
      }
    });

    connection.on('OnAgentQueueChanged', (log) => {
      const jsonData = JSON.parse(log);
      if (conversationId === jsonData?.conversation_id) {
        this.onAgentQueueChanged(jsonData);
      }
    });

    connection.on('OnSenderActionGenerated', (data) => {
      if (conversationId === data?.conversation_id) {
        this.onSenderActionGenerated(data);
      }
    });

    connection.on('OnMessageDeleted', (data) => {
      if (conversationId === data?.conversation_id) {
        this.onConversationMessageDeleted(data);
      }
    });
  },

  // stop the connection
  async stop() {
    // get the connection object from the store
    // const connection = connection.get();
    // stop the connection if it exists
    if (connection) {
      try {
        await connection.stop();
        console.log('Disconnected from SignalR hub');
        // 清理流式消息缓存
        this.streamingMessages.clear();
      } catch (err) {
        console.error(err);
      }
    }
  },

      // get the connection object from the store
    // const connection = connection.get();
    // invoke the hub method if the connection exists and is connected
    /*if (connection && connection.state === HubConnectionState.Connected) {
        try {
        await connection.invoke('OnMessageReceivedFromClient', message);
        console.log(`Sent message from client: ${message}`);
        } catch (err) {
        console.error(err);
        }
    }*/
};

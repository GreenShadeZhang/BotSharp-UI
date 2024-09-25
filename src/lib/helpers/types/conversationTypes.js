/**
 * @typedef {Object} InstructMessageModel
 * @property {string} [instruction] - User provided prompt instead of predefined template.
 * @property {string} [template] - The template name.
 */

/**
 * @typedef {Object} MessageConfig
 * @property {string} [taskId] - Optional task id.
 */

/**
 * @typedef {Object} ConversationFilter
 * @property {import('$commonTypes').Pagination} pager - Pagination
 * @property {string?} [agentId] - The agent id.
 * @property {string?} [channel] - The conversation channel.
 * @property {string?} [status] - The conversation status.
 * @property {string?} [taskId] - The task id.
 * @property {import('$commonTypes').KeyValuePair[]} [states] - The conversation status.
 */

/**
 * @typedef {Object} ConversationModel
 * @property {string} id - The conversation id.
 * @property {string} title - The conversation title.
 * @property {import('$userTypes').UserModel} user - The conversation initializer.
 * @property {string} agent_id - The conversation agent id.
 * @property {string} agent_name - The conversation entry agent name.
 * @property {string} channel - The conversation status.
 * @property {string} [task_id] - Optional task id.
 * @property {string} status - The conversation status.
 * @property {Object[]} states - The conversation states. 
 * @property {Date} updated_time - The conversation updated time.
 * @property {Date} created_time - The conversation created time.
 */


/**
 * @interface
 * @class
 * @classdesc A basic rich content interface.
 */
function IRichContent() {}

/**
 * The type of the rich content.
 *
 * @name rich_type
 * @type {string}
 * @instance
 */
IRichContent.prototype.rich_type;

/**
 * The text of the rich content.
 *
 * @name text
 * @type {string}
 * @instance
 */
IRichContent.prototype.text;

/**
 * The options of the rich content.
 *
 * @name options
 * @type {any[]}
 * @instance
 */
IRichContent.prototype.options;

/**
 * The buttons of the rich content.
 *
 * @name buttons
 * @type {any[]}
 * @instance
 */
IRichContent.prototype.buttons;

/**
 * The elements of the rich content.
 *
 * @name elements
 * @type {any[]}
 * @instance
 */
IRichContent.prototype.elements;

/**
 * The quick replies of the rich content.
 *
 * @name quick_replies
 * @type {any[]}
 * @instance
 */
IRichContent.prototype.quick_replies;

/**
 * @typedef {Object} TextMessage
 * @property {string} text
 * @property {string} rich_type 
 */

/**
 * @typedef {Object} QuickReplyElement
 * @property {string} content_type
 * @property {string} title
 * @property {string} payload
 * @property {string} image_url 
 */

/**
 * @typedef {Object} QuickReplyMessage
 * @property {string} text
 * @property {string} rich_type
 * @property {QuickReplyElement[]} quick_replies
 */

/**
 * @typedef {Object} RichContent
 * @property {string} messaging_type
 * @property {boolean} fill_postback
 * @property {string} editor
 * @property {string?} [editor_attributes]
 * @property {IRichContent} message
 */

/**
 * @typedef {Object} ChatResponseModel
 * @property {string} conversation_id - The conversation id.
 * @property {import('$userTypes').UserModel} sender - The message sender.
 * @property {string} message_id - The message id.
 * @property {string} text - The message content.
 * @property {string} editor - The message editor.
 * @property {string} function - The function name.
 * @property {RichContent} rich_content - Rich content.
 * @property {string} post_action_disclaimer - The message disclaimer.
 * @property {string} data - The message data.
 * @property {Date} created_at - The message sent time.
 * @property {boolean} has_message_files
 * @property {boolean} is_chat_message
 */

/**
 * @typedef {Object} ConversationContentLogModel
 * @property {string} conversation_id - The conversation id.
 * @property {string} message_id - The message id.
 * @property {string} name - The sender name.
 * @property {string} agent_id = The agent id.
 * @property {string} role - The sender role.
 * @property {string} source - The log source.
 * @property {string} content - The log content.
 * @property {Date} created_at - The log sent time.
 */

/**
 * @typedef {Object} ConversationStateLogModel
 * @property {string} conversation_id - The conversation id.
 * @property {string} message_id - The message id.
 * @property {Object} states - The states content.
 * @property {Date} created_at - The log sent time.
 */

/**
 * @typedef {Object} MessageStateLogModel
 * @property {string} conversation_id - The conversation id.
 * @property {string} message_id - The message id.
 * @property {string} before_value - The value before change.
 * @property {number?} before_active_rounds - The state active rounds before change.
 * @property {string} after_value - The value after change.
 * @property {number?} after_active_rounds - The state active rounds after change.
 * @property {string} data_type - The state value data type.
 * @property {string} source - The state source.
 * @property {Date} created_at - The log sent time.
 */

/**
 * @typedef {Object} AgentQueueLogModel
 * @property {string} conversation_id - The conversation id.
 * @property {string} log - The log content.
 * @property {Date} created_at - The log sent time.
 */

/** 
 * Conversation states
 * @typedef {Object} ConversationStateModel
 * @property {string} key - The state key.
 * @property {string} value - The state value.
 * @property {number} [active_rounds] - The state active rounds.
 */

/** 
 * Conversation states added by user
 * 
 * @typedef {Object} UserStateDetailModel
 * @property {{data: string, isValid: boolean}} key - The state key.
 * @property {{data: string, isValid: boolean}} value - The state value.
 * @property {{data: number, isValid: boolean}} active_rounds - The state active rounds.
 */

/** 
 * Conversation states added by user
 * 
 * @typedef {Object} ConversationUserStateModel
 * @property {string} conversationId - The conversation id.
 * @property {UserStateDetailModel[]} states - The states added by user.
 */


/** 
 * Conversation sender action
 * 
 * @typedef {Object} ConversationSenderActionModel
 * @property {string} conversation_id - The conversation id.
 * @property {number} sender_action - The sender action.
 * @property {string} [indication] - The function indication.
 */

/** 
 * Conversation message deleted
 * 
 * @typedef {Object} ConversationMessageDeleteModel
 * @property {string} conversation_id - The conversation id.
 * @property {string} message_id - The message id.
 */

/** 
 * Conversation postback
 * 
 * @typedef {Object} Postback
 * @property {string?} [functionName] - The function name.
 * @property {string?} payload - The payload.
 * @property {string?} [parentId] - The parent message id.
 */

/** 
 * Conversation send message data
 * 
 * @typedef {Object} MessageData
 * @property {string?} [truncateMsgId] - The truncated message.
 * @property {string?} [inputMessageId] - The input message.
 * @property {ConversationStateModel[]?} [states] - The states input by user.
 * @property {Postback?} [postback] - The parent message id.
 * @property {string?} [payload] - The payload message.
 */




/**
 * Invoked when a new conersation is created.
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback OnConversationInitialized
 * @param {ConversationModel} conversation
 */

/**
 * Invoked when message is received form chatHub.
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback OnMessageReceived
 * @param {ChatResponseModel} message
 */

/**
 * Invoked when speech to text is detected.
 *
 * @callback OnSpeechToTextDetected
 * @param {string} text
 */

/** 
 * Conversation content log
 * 
 * @callback OnConversationContentLogReceived
 * @param {ConversationContentLogModel} log
 */

/** 
 * Conversation state log
 * 
 * @callback OnConversationStateLogGenerated
 * @param {ConversationStateLogModel} log
 */

/** 
 * Conversation state change log
 * 
 * @callback OnStateChangeGenerated
 * @param {MessageStateLogModel} log
 */

/** 
 * Agent queue changed log
 * 
 * @callback OnAgentQueueChanged
 * @param {AgentQueueLogModel} log
 */

/** 
 * Conversation sender action
 * 
 * @callback OnSenderActionGenerated
 * @param {ConversationSenderActionModel} data
 */

/** 
 * Conversation message deleted
 * 
 * @callback OnConversationMessageDeleted
 * @param {ConversationMessageDeleteModel} data
 */

// having to export an empty object here is annoying, 
// but required for vscode to pass on your types. 
export default {};
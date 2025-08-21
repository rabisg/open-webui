/**
 * C1 Chat Plugin
 *
 * Provides C1-specific chat functionality that can be mixed into any chat component.
 * This avoids modifying the core Chat.svelte file extensively.
 */

import { tick } from 'svelte';
import { updateChatMessageById } from '$lib/services/c1-chat';

// We'll need to import createMessagesList or implement it
// For now, let's create a simple version
import { v4 as uuidv4 } from 'uuid';

// Simple implementation to avoid importing from utils
const createMessagesList = (history: any, currentId: string) => {
	const messages = [];
	let currentMessage = currentId ? history.messages[currentId] : null;

	// Build path from root to current message
	const path = [];
	while (currentMessage) {
		path.unshift(currentMessage);
		currentMessage = currentMessage.parentId ? history.messages[currentMessage.parentId] : null;
	}

	return path;
};

export interface C1ChatPluginConfig {
	history: any;
	selectedModels: string[];
	sendMessage: Function;
	chatId: string;
	token: string;
}

export class C1ChatPlugin {
	private config: C1ChatPluginConfig;

	constructor(config: C1ChatPluginConfig) {
		this.config = config;
		this.setupEventListeners();
	}

	private setupEventListeners() {
		// Listen for send user message events from C1 components
		document.addEventListener('send-user-message', this.handleSendUserMessage.bind(this));

		// Listen for update message events from C1 components
		document.addEventListener('update-message', this.handleUpdateMessage.bind(this));
	}

	private async handleSendUserMessage(event: CustomEvent) {
		if (!event.detail?.displayMessage || !event.detail?.llmMessage) return;

		const { displayMessage, llmMessage } = event.detail;
		const { history, selectedModels, sendMessage } = this.config;

		try {
			// Create user message with displayMessage for UI
			const messages = createMessagesList(history, history.currentId);
			let userMessageId = uuidv4();
			let userMessage = {
				id: userMessageId,
				parentId: messages.length !== 0 ? messages.at(-1).id : null,
				childrenIds: [],
				role: 'user',
				content: displayMessage, // Show human-friendly message in UI
				timestamp: Math.floor(Date.now() / 1000),
				models: selectedModels
			};

			// Add message to history and Set currentId to messageId
			history.messages[userMessageId] = userMessage;
			history.currentId = userMessageId;

			// Append messageId to childrenIds of parent message
			if (messages.length !== 0) {
				history.messages[messages.at(-1).id].childrenIds.push(userMessageId);
			}

			await tick();

			// Now send the LLM message to the backend for processing
			await sendMessage(history, userMessageId, {
				messages: [
					...createMessagesList(history, userMessageId).slice(0, -1), // All previous messages
					{
						role: 'user',
						content: llmMessage // Send LLM-friendly message to the backend
					}
				]
			});
		} catch (error) {
			console.error('Error handling C1 user message:', error);
		}
	}

	private async handleUpdateMessage(event: CustomEvent) {
		if (!event.detail?.messageId || !event.detail?.updatedContent) return;

		const { messageId, updatedContent } = event.detail;
		const { history, chatId, token } = this.config;

		try {
			// Extract the actual message ID from the component ID (format: chatId-messageId)
			const actualMessageId = messageId.split('-').slice(1).join('-');

			// Update the message content in history
			if (history.messages[actualMessageId]) {
				// Store original content if not already stored
				if (!history.messages[actualMessageId].originalContent) {
					history.messages[actualMessageId].originalContent =
						history.messages[actualMessageId].content;
				}

				// Update the message content locally first
				history.messages[actualMessageId].content = updatedContent;

				// Trigger reactivity (this will need to be handled by the consuming component)
				this.triggerHistoryUpdate();

				await tick();

				// Save to database using the specific message update API
				if (chatId && token) {
					try {
						await updateChatMessageById(token, chatId, actualMessageId, updatedContent);
						console.log('Message updated successfully in database');
					} catch (error) {
						console.error('Failed to update message in database:', error);
						// Optionally revert the local change
					}
				}
			}
		} catch (error) {
			console.error('Error handling C1 message update:', error);
		}
	}

	private triggerHistoryUpdate() {
		// Dispatch event that consuming component can listen to for reactivity
		document.dispatchEvent(
			new CustomEvent('c1-history-updated', {
				detail: { history: this.config.history }
			})
		);
	}

	// Cleanup method to remove event listeners
	destroy() {
		document.removeEventListener('send-user-message', this.handleSendUserMessage.bind(this));
		document.removeEventListener('update-message', this.handleUpdateMessage.bind(this));
	}
}

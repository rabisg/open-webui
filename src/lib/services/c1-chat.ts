/**
 * C1 Chat Service
 *
 * Provides C1-specific chat functionality without modifying core chat APIs.
 * This service can be imported and used alongside the standard chat service.
 */

import { WEBUI_API_BASE_URL } from '$lib/constants';

/**
 * Update a specific message content in a chat
 */
export const updateChatMessageById = async (
	token: string,
	chatId: string,
	messageId: string,
	content: string
) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${chatId}/messages/${messageId}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			content: content
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err;
			console.error('Error updating chat message:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Send a message to chat (wrapper around existing functionality)
 */
export const sendC1Message = async (
	chatId: string,
	message: string,
	options: {
		displayMessage?: string;
		llmMessage?: string;
	} = {}
) => {
	// Create custom event that the chat component can listen to
	const event = new CustomEvent('c1-send-message', {
		detail: {
			chatId,
			message: options.llmMessage || message,
			displayMessage: options.displayMessage || message
		},
		bubbles: true
	});

	document.dispatchEvent(event);
};

/**
 * Update message content (wrapper for C1 component updates)
 */
export const updateC1Message = async (
	messageId: string,
	content: string
) => {
	const event = new CustomEvent('c1-update-message', {
		detail: {
			messageId,
			content
		},
		bubbles: true
	});

	document.dispatchEvent(event);
};

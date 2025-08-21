/**
 * C1 Model Integration Module
 *
 * This module provides utilities and components for C1 model integration
 * while keeping changes isolated from core OpenWebUI files.
 */

// Model detection utilities
export const isC1Model = (model: { id?: string; name?: string } | null): boolean => {
	if (!model) return false;
	return model.id?.startsWith('c1') || model.name?.startsWith('c1') || false;
};

// Event handling for C1 component actions
export const createC1EventHandlers = () => {
	// Handle user message sending from C1 components
	const handleSendUserMessage = (displayMessage: string, llmMessage: string) => {
		const event = new CustomEvent('send-user-message', {
			detail: {
				displayMessage,
				llmMessage
			},
			bubbles: true
		});
		document.dispatchEvent(event);
	};

	// Handle message content updates from C1 components
	const handleUpdateMessage = (messageId: string, updatedContent: string) => {
		const event = new CustomEvent('update-message', {
			detail: {
				messageId,
				updatedContent
			},
			bubbles: true
		});
		document.dispatchEvent(event);
	};

	return {
		handleSendUserMessage,
		handleUpdateMessage
	};
};

// C1 component props utilities
export const createC1Props = (
	baseProps: any,
	handlers: { onAction?: Function; onUpdateMessage?: Function } = {}
) => {
	const { handleSendUserMessage, handleUpdateMessage } = createC1EventHandlers();

	return {
		...baseProps,
		onAction: (params: { llmFriendlyMessage: string; humanFriendlyMessage: string }) => {
			handleSendUserMessage(params.humanFriendlyMessage, params.llmFriendlyMessage);
			handlers.onAction?.(params);
		},
		onUpdateMessage: (updatedContent: string) => {
			if (baseProps.id) {
				handleUpdateMessage(baseProps.id, updatedContent);
			}
			handlers.onUpdateMessage?.(updatedContent);
		}
	};
};

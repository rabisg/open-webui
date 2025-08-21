import React from 'react';
import ReactMarkdown from 'react-markdown';
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk';
import '@crayonai/react-ui/styles/index.css';

// Import the same utilities as the Svelte version
import { replaceTokens, processResponseContent } from '../../utils';

interface ReactMarkdownRendererProps {
	id?: string;
	content: string;
	done?: boolean;
	model: { id: string };
	save?: boolean;
	preview?: boolean;
	topPadding?: boolean;
	sourceIds?: string[];
	onSave?: () => void;
	onUpdate?: () => void;
	onPreview?: () => void;
	onSourceClick?: () => void;
	onTaskClick?: () => void;
	onAction?: ({
		llmFriendlyMessage,
		humanFriendlyMessage
	}: {
		llmFriendlyMessage: string;
		humanFriendlyMessage: string;
	}) => void;
	onUpdateMessage?: (updatedContent: string) => void;
}

const ReactMarkdownRenderer: React.FC<ReactMarkdownRendererProps> = ({
	id = '',
	content,
	done = true,
	model,
	topPadding = false,
	sourceIds = [],
	onAction,
	onUpdateMessage
}) => {
	const shouldUseC1Component = model.id.startsWith('c1');

	// Process content the same way as the Svelte version
	const responseContent = replaceTokens(
		processResponseContent(content),
		sourceIds,
		model,
		'' // user name would come from store
	);

	// Create the onAction callback that sends the llmFriendly message as user input
	const handleAction = ({
		llmFriendlyMessage,
		humanFriendlyMessage
	}: {
		llmFriendlyMessage: string;
		humanFriendlyMessage: string;
	}) => {
		console.log('C1Component onAction triggered:', { llmFriendlyMessage, humanFriendlyMessage });

		// Send both messages - display humanFriendlyMessage but send llmFriendlyMessage to LLM
		if (llmFriendlyMessage && humanFriendlyMessage) {
			// Dispatch a custom event that parent components can listen to
			const event = new CustomEvent('send-user-message', {
				detail: {
					displayMessage: humanFriendlyMessage,
					llmMessage: llmFriendlyMessage
				},
				bubbles: true
			});
			document.dispatchEvent(event);
		}

		// Call the original onAction if provided
		if (onAction) {
			onAction({ llmFriendlyMessage, humanFriendlyMessage });
		}
	};

	// Create the updateMessage callback to update the current message content
	const handleUpdateMessage = (updatedContent: string) => {
		console.log('C1Component updateMessage triggered:', { updatedContent });

		// Dispatch a custom event for updating the current message
		const event = new CustomEvent('update-message', {
			detail: {
				messageId: id,
				updatedContent
			},
			bubbles: true
		});
		document.dispatchEvent(event);

		// Call the original onUpdateMessage if provided
		if (onUpdateMessage) {
			onUpdateMessage(updatedContent);
		}
	};

	return (
		<div
			id={id}
			className={`prose prose-sm max-w-none dark:prose-invert ${topPadding ? 'pt-4' : ''}`}
		>
			{shouldUseC1Component ? (
				<ThemeProvider>
					<C1Component
						c1Response={responseContent}
						isStreaming={!done}
						onAction={handleAction}
						updateMessage={handleUpdateMessage}
					/>
				</ThemeProvider>
			) : (
				<ReactMarkdown>{responseContent}</ReactMarkdown>
			)}
		</div>
	);
};

export default ReactMarkdownRenderer;

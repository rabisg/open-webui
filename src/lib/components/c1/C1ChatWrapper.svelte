<script lang="ts">
	/**
	 * C1 Chat Wrapper
	 *
	 * A minimal wrapper that adds C1 functionality to any chat component.
	 * This avoids modifying the core Chat.svelte extensively.
	 */
	import { onMount, onDestroy } from 'svelte';
	import { C1ChatPlugin } from './chat-plugin';
	import { updateChatMessageById } from '$lib/services/c1-chat';

	// Props passed from parent Chat component
	export let history: any;
	export let selectedModels: string[] = [];
	export let sendMessage: Function;
	export let chatId: string = '';
	export let token: string = '';

	let c1Plugin: C1ChatPlugin | null = null;

	onMount(() => {
		// Initialize C1 plugin with current config
		c1Plugin = new C1ChatPlugin({
			history,
			selectedModels,
			sendMessage,
			chatId,
			token
		});

		// Listen for history updates from the plugin and trigger reactivity
		const handleHistoryUpdate = (event: CustomEvent) => {
			history = event.detail.history;
		};

		document.addEventListener('c1-history-updated', handleHistoryUpdate);

		// Store reference for cleanup
		c1Plugin.destroy = () => {
			document.removeEventListener('c1-history-updated', handleHistoryUpdate);
			c1Plugin = null;
		};
	});

	onDestroy(() => {
		if (c1Plugin) {
			c1Plugin.destroy();
		}
	});

	// Re-initialize plugin when key props change
	$: if (c1Plugin && (chatId || token || selectedModels)) {
		c1Plugin.destroy();
		c1Plugin = new C1ChatPlugin({
			history,
			selectedModels,
			sendMessage,
			chatId,
			token
		});
	}
</script>

<!-- This component has no visual output, it just provides C1 functionality -->
<slot />

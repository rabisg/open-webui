<script lang="ts">
	/**
	 * C1-Enhanced Markdown Renderer
	 *
	 * This component provides a drop-in replacement for the standard Markdown component
	 * that automatically detects C1 models and uses React rendering when appropriate.
	 * It preserves full backward compatibility with the original implementation.
	 */
	import { marked } from 'marked';
	import { replaceTokens, processResponseContent } from '$lib/utils';
	import { user } from '$lib/stores';

	import markedExtension from '$lib/utils/marked/extension';
	import markedKatexExtension from '$lib/utils/marked/katex-extension';

	import MarkdownTokens from '../chat/Messages/Markdown/MarkdownTokens.svelte';
	import ReactMarkdownWrapper from '../react-markdown/ReactMarkdownWrapper.svelte';

	import { isC1Model, createC1Props } from './index';

	// Standard Markdown component props
	export let id: string = '';
	export let content: string;
	export let done: boolean = true;
	export let model: { id?: string; name?: string } | null = null;
	export let save: boolean = false;
	export let preview: boolean = false;
	export let topPadding: boolean = false;
	export let sourceIds: string[] = [];

	// Standard event handlers
	export let onSave = () => {};
	export let onUpdate = () => {};
	export let onPreview = () => {};
	export let onSourceClick = () => {};
	export let onTaskClick = () => {};

	// C1-specific event handlers (optional, will be no-op for non-C1 models)
	export let onAction = () => {};
	export let onUpdateMessage = () => {};

	let tokens: any[] = [];

	const options = {
		throwOnError: false,
		breaks: true
	};

	marked.use(markedKatexExtension(options));
	marked.use(markedExtension(options));

	// Determine renderer based on model
	$: useC1Renderer = isC1Model(model);

	// Process tokens for standard markdown rendering
	$: (async () => {
		if (content && !useC1Renderer) {
			tokens = marked.lexer(
				replaceTokens(processResponseContent(content), sourceIds, model?.name, $user?.name)
			);
		}
	})();

	// Create C1-enhanced props when needed
	$: c1Props = useC1Renderer ? createC1Props(
		{
			id,
			content,
			done,
			model: { id: model?.id || model?.name || 'c1' },
			save,
			preview,
			topPadding,
			sourceIds,
			onSave,
			onUpdate,
			onPreview,
			onSourceClick,
			onTaskClick
		},
		{ onAction, onUpdateMessage }
	) : null;
</script>

{#key id}
	{#if useC1Renderer && c1Props}
		<!-- Use React renderer for C1 models -->
		<ReactMarkdownWrapper {...c1Props} />
	{:else}
		<!-- Use original Svelte renderer for all other models -->
		<div class="markdown-prose w-full min-w-full">
			<MarkdownTokens
				{tokens}
				{id}
				{done}
				{save}
				{preview}
				{topPadding}
				{onTaskClick}
				{onSourceClick}
				{onSave}
				{onUpdate}
				{onPreview}
			/>
		</div>
	{/if}
{/key}

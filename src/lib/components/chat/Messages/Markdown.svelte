<script>
	// C1-enhanced markdown renderer with full backward compatibility
	import C1MarkdownRenderer from '$lib/components/c1/C1MarkdownRenderer.svelte';

	// All original props are passed through unchanged
	export let id = '';
	export let content;
	export let done = true;
	export let model = null;
	export let save = false;
	export let preview = false;
	export let topPadding = false;
	export let sourceIds = [];
	export let onSave = () => {};
	export let onUpdate = () => {};
	export let onPreview = () => {};
	export let onSourceClick = () => {};
	export let onTaskClick = () => {};

	// C1-specific props (optional, no-op for non-C1 models)
	export let onAction = () => {};
	export let onUpdateMessage = () => {};
</script>

<!-- Delegate to C1-enhanced renderer which handles both C1 and standard models -->
<C1MarkdownRenderer
	{id}
	{content}
	{done}
	{model}
	{save}
	{preview}
	{topPadding}
	{sourceIds}
	{onSave}
	{onUpdate}
	{onPreview}
	{onSourceClick}
	{onTaskClick}
	{onAction}
	{onUpdateMessage}
/>

<script lang="ts">
  import { onMount } from 'svelte';
  import { createReactWrapper } from './react-wrapper';

  export let id: string = '';
  export let content: string;
  export let done: boolean = true;
  export let model: { id: string } | null = null;
  export let save: boolean = false;
  export let preview: boolean = false;
  export let topPadding: boolean = false;
  export let sourceIds: string[] = [];
  export let onSave = () => {};
  export let onUpdate = () => {};
  export let onPreview = () => {};
  export let onSourceClick = () => {};
  export let onTaskClick = () => {};
  export let onAction = () => {};
  export let onUpdateMessage = () => {};

  let container: HTMLElement;
  let reactComponent: any;

  onMount(async () => {
    if (container) {
      const ReactMarkdownRenderer = (await import('./ReactMarkdownRenderer')).default;
      reactComponent = createReactWrapper(ReactMarkdownRenderer, {
        id,
        content,
        done,
        model,
        save,
        preview,
        topPadding,
        sourceIds,
        onSave,
        onUpdate,
        onPreview,
        onSourceClick,
        onTaskClick,
        onAction,
        onUpdateMessage
      });
      if (container && reactComponent) {
        reactComponent.render(container);
      }
    }
  });

  $: if (reactComponent && container) {
    reactComponent.updateProps({
      id,
      content,
      done,
      model,
      save,
      preview,
      topPadding,
      sourceIds,
      onSave,
      onUpdate,
      onPreview,
      onSourceClick,
      onTaskClick,
      onAction,
      onUpdateMessage
    });
  }

  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (reactComponent) {
      reactComponent.unmount();
    }
  });
</script>

<div bind:this={container}></div>

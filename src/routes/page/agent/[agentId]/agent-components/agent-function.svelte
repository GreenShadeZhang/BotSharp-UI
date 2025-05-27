<script>    import { JSONEditor, Mode } from 'svelte-jsoneditor';
    import { onMount } from 'svelte';
    import MaterialCard from '$lib/common/MaterialCard.svelte';

    /** @type {import('$agentTypes').AgentModel} */
    export let agent;

    /** @type {() => void} */
    export let handleAgentChange = () => {};

    export const fetchContent = () => {
        return content;
    }

    export const refresh = () => init();

    /** @type {import('svelte-jsoneditor').Content} */
    let content = {
        json: {}
    };

    onMount(() => {
        init();
    });

    function init() {
        content = {
            json: {
                functions: agent.functions,
                responses: agent.responses
            }
        };
    }

    /**
	 * @param {import('svelte-jsoneditor').Content} updatedContent
	 * @param {import('svelte-jsoneditor').Content} previousContent
     * @param {import('svelte-jsoneditor').OnChangeStatus} status
	 */
    function handleChange(updatedContent, previousContent, status) {
        content = updatedContent;
        const isInitial = 'json' in previousContent && JSON.stringify(previousContent.json) === "{}";
        !isInitial && handleAgentChange();
    }
</script>

<MaterialCard variant="outlined" className="agent-function-card">
    <div class="material-card-header">
        <h5 class="material-heading">Functions & Responses</h5>
    </div>
    <div class="material-card-content">
        <div class="material-json-editor">
            <JSONEditor mode={Mode.table} content={content} onChange={handleChange} />
        </div>
    </div>
</MaterialCard>

<style>
    .material-json-editor {
        /* Material Design theme for JSON editor */
        --jse-theme-color: var(--md-primary-color);
        --jse-theme-color-highlight: var(--md-primary-color-variant);
        --jse-panel-background: var(--md-surface-color);
        --jse-text-color: var(--md-on-surface-color);
        border-radius: var(--md-border-radius);
        overflow: hidden;
    }
</style>
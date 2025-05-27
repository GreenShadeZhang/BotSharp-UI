<script>
    import { onMount } from 'svelte';
    import { getLlmProviders, getLlmProviderModels } from '$lib/services/llm-provider-service';
	import { INTEGER_REGEX } from '$lib/helpers/constants';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';
    
    /** @type {import('$agentTypes').AgentModel} */
    export let agent;

    /** @type {() => void} */
    export let handleAgentChange = () => {};

    export const fetchLlmConfig = () => {
        return {
            ...config,
            max_output_tokens: Number(config.max_output_tokens) > 0 ? Number(config.max_output_tokens) : null
        };
    }

    export const fetchOriginalLlmConfig = () => {};

    export const refresh = () => {
        config = agent.llm_config;
        init();
    };

    const recursiveDepthLowerLimit = 1;

    let config = agent.llm_config;

    /** @type {string[]} */
    let providers = [];

    /** @type {import('$commonTypes').LlmModelSetting[]} */
    let models = [];

    onMount(async () =>{
        await init();
    });

    async function init() {
        providers = await getLlmProviders();
        providers = ['', ...providers]
        if (!!config.provider) {
            models = await getLlmProviderModels(config.provider);
        }
        const foundProvider = providers.find(x => x === config.provider);
        const foundModel = models.find(x => x.name === config.model);
        config.provider = foundProvider || null;
        config.model = foundModel?.name || null;
    }

    

    /** @param {any} e */
    async function changeProvider(e) {
        const provider = e.target.value;
        config.provider = provider || null;

        if (!!!provider) {
            models = [];
            config.model = null;
            handleAgentChange();
            return;
        }

        config.is_inherit = false;
        models = await getLlmProviderModels(provider);
        config.model = models[0]?.name;
        handleAgentChange();
    }

    /** @param {any} e */
    function changeModel(e) {
        config.is_inherit = false;
        config.model = e.target.value || null;
        handleAgentChange();
    }

    /** @param {any} e */
    function changeMaxRecursiveDepth(e) {
        let value = Number(e.target.value) || 0;
        
        if (value < recursiveDepthLowerLimit) {
            value = recursiveDepthLowerLimit;
        }

        config.max_recursion_depth = value;
        handleAgentChange();
    }

    /** @param {any} e */
    function changeMaxOutputToken(e) {
        const value = Number(e.target.value) || 0;
        config.max_output_tokens = value;
        handleAgentChange();
    }

    /** @param {any} e */
    function validateIntegerInput(e) {
        const reg = new RegExp(INTEGER_REGEX, 'g');
        if (e.key !== 'Backspace' && !reg.test(e.key)) {
            e.preventDefault();
        }
    }
</script>

<MaterialCard variant="outlined" className="agent-llm-config-card">
    <div class="material-card-content">
        <div class="text-center mb-4">
            <h5 class="material-heading">LLM Config</h5>
            <img src="images/brands/azure-openai-logo.avif" alt="" height="50" />
            {#if agent.llm_config?.is_inherit}
                <div class="mt-2">
                    <i class="mdi mdi-content-copy"></i> 
                    <span class="material-body-small text-outline">Inherited</span>
                </div>    
            {/if}
        </div>

        <div class="material-llm-config-container">            <div class="material-config-row">
                <div class="material-label">Provider</div>
                <div class="material-config-value">
                    <select 
                        class="material-select" 
                        value={config.provider} 
                        on:change={e => changeProvider(e)}
                    >
                        {#each providers as option}
                            <option value={option} selected={option == config.provider}>{option}</option>
                        {/each}
                    </select>
                </div>
            </div>
            
            <div class="material-config-row">
                <div class="material-label">Model</div>
                <div class="material-config-value">
                    <select 
                        class="material-select" 
                        value={config.model} 
                        disabled={models.length === 0} 
                        on:change={e => changeModel(e)}
                    >
                        {#each models as option}
                            <option value={option.name} selected={option.name == config.model}>{option.name}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="material-config-row">
                <div class="material-label">Max recursive depth</div>
                <div class="material-config-value">
                    <MaterialTextField
                        type="number"
                        className="text-center"
                        value={config.max_recursion_depth?.toString() || "1"}
                        min={recursiveDepthLowerLimit}
                        on:keydown={e => validateIntegerInput(e)}
                        on:change={e => changeMaxRecursiveDepth(e)}
                    />
                </div>
            </div>

            <div class="material-config-row">
                <div class="material-label">Max output tokens</div>
                <div class="material-config-value">
                    <MaterialTextField
                        type="number"
                        className="text-center"
                        value={config.max_output_tokens?.toString() || ""}
                        on:keydown={e => validateIntegerInput(e)}
                        on:change={e => changeMaxOutputToken(e)}
                    />
                </div>
            </div>
        </div>
    </div>
</MaterialCard>
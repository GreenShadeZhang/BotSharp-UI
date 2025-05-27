<script>
    import { onMount } from 'svelte';
    import { _ } from 'svelte-i18n';
    import { v4 as uuidv4 } from 'uuid';
    import lodash from "lodash";    
    const util = lodash;    import { Card, CardBody, FormGroup, Input, CardHeader } from '@sveltestrap/sveltestrap';
    import NavBar from '$lib/common/nav-bar/NavBar.svelte';
	import NavItem from '$lib/common/nav-bar/NavItem.svelte';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
    import MaterialButton from '$lib/common/MaterialButton.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';


    /** @type {import('$agentTypes').AgentModel} */
    export let agent;

    /** @type {() => void} */
    export let handleAgentChange = () => {};

    export const fetchOriginalTemplates = () => {
        return {
            templates: inner_templates?.map(x => ({
                name: x.name,
                content: x.content
            })) || []
        };
    };

    export const fetchTemplates = () => {
        const candidates = inner_templates?.filter((x, idx) => !!x.name?.trim())?.map(x => {
            return { name: x.name.trim().toLowerCase(), content: x.content };
        });

        const prompts = [];
        const groups = util.groupBy(candidates, (/** @type {any} */ x) => x.name);
        for (const key in groups) {
            if (groups[key]?.length > 0) {
                prompts.push(groups[key][0]);
            }
        }

        return {
            templates: prompts
        };
    }

    export const refresh = () => init();


    /** @type {import('$agentTypes').AgentTemplate} */
    const defaultTemplate = {
        uid: '',
        name: '',
        content: ''
    };

    /** @type {import('$agentTypes').AgentTemplate[]} */
    let inner_templates = [];

    /** @type {import('$agentTypes').AgentTemplate} */
    let selected_template = { ...defaultTemplate };

    onMount(() => {
        init();
    });

    function init() {
        inner_templates = [
            ...agent.templates?.map(x => ({
                uid: uuidv4(),
                name: x.name,
                content: x.content
            })) || []
        ];

        selected_template = inner_templates.length > 0 ? inner_templates[0] : {
            ...defaultTemplate
        };
    }


    /** @param {string | undefined | null} uid */
    function selectTemplate(uid) {
        if (uid === selected_template.uid) {
            return;
        }

        selected_template = inner_templates.find(x => x.uid === uid) || { ...defaultTemplate };
    }

    /** @param {any} e */
    function changePrompt(e) {
        e.preventDefault();
        const value = e.target.value;
        selected_template.content = value || '';
        handleAgentChange();
    }

    function addTemplate() {
        inner_templates = [
            ...inner_templates,
            {
                uid: uuidv4(),
                name: '',
                content: ''
            }
        ];

        selected_template = inner_templates[inner_templates.length-1];
        handleAgentChange();
    }

    /** @param {string | undefined | null} uid */
    function deleteTemplate(uid) {
        inner_templates = inner_templates.filter(x => x.uid !== uid);
        if (selected_template.uid === uid) {
            selected_template = inner_templates.length > 0 ? inner_templates[0] : {
                ...defaultTemplate
            };
        }
        handleAgentChange();
    }
</script>


<MaterialCard variant="outlined" className="agent-template-card">
    <div class="material-card-header">
        <div class="d-flex align-items-center">
            <div class="flex-grow-1">
                <h5 class="material-heading">Templates</h5>
            </div>
        </div>
    </div>
    <div class="material-card-content">
        <div class="material-form-group">
            <div class="mb-2 d-flex align-items-center gap-2">
                <div class="material-label">
                    Contents:
                </div>
                <MaterialButton
                    variant="text"
                    icon="mdi mdi-plus-circle-outline"
                    size="small"
                    on:click={() => addTemplate()}
                    title="Add template"
                >
                    Add Template
                </MaterialButton>
            </div>
              {#if inner_templates.length > 0}
            <div class="material-tabs mb-3">
                <NavBar
                    id={'agent-template-container'}
                    disableDefaultStyles
                    containerClasses={'nav-tabs-secondary'}
                >
                    {#each inner_templates as template, idx (idx) }
                    <NavItem
                        containerStyles={`flex: 0 1 calc(100% / ${inner_templates.length <= 2 ? inner_templates.length : 3})`}
                        navBtnStyles={'text-transform: none;'}
                        navBtnId={`template-${idx}-prompt-tab`}
                        dataBsTarget={`#template-${idx}-prompt-tab-pane`}
                        ariaControls={`template-${idx}-prompt-tab-pane`}
                        bind:navBtnText={template.name}
                        active={template.uid === selected_template.uid}
                        allowEdit
                        allowDelete
                        maxEditLength={50}
                        editPlaceholder={'Type a title here...'}
                        onClick={() => selectTemplate(template.uid)}
                        onDelete={() => deleteTemplate(template.uid)}
                        onInput={() => handleAgentChange()}
                    />
                    {/each}
                </NavBar>
            </div>
            <MaterialTextField
                type="textarea"
                value={selected_template.content}
                rows={15}
                on:input={(e) => changePrompt(e)}
                placeholder="Enter your template..."
            />
            {/if}
        </div>
    </div>
</MaterialCard>
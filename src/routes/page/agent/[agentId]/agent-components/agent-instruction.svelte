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

    const defaultChannel = "default";
    
    /** @type {import('$agentTypes').AgentModel} */
    export let agent;

    /** @type {() => void} */
    export let handleAgentChange = () => {};

    export const fetchOriginalInstructions = () => {
        return {
            systemPrompt: inner_instructions?.[0]?.instruction || '',
            channelPrompts: inner_instructions?.slice(1)?.map(x => ({
                channel: x.channel,
                instruction: x.instruction
            })) || []
        };
    };

    export const fetchInstructions = () => {
        const candidates = inner_instructions?.filter((x, idx) => idx > 0 && !!x.channel?.trim())?.map(x => {
            return { channel: x.channel.trim().toLowerCase(), instruction: x.instruction };
        });

        const prompts = [];
        const groups = util.groupBy(candidates, (/** @type {any} */ x) => x.channel);
        for (const key in groups) {
            if (groups[key]?.length > 0) {
                prompts.push(groups[key][0]);
            }
        }

        return {
            systemPrompt: inner_instructions[0].instruction,
            channelPrompts: prompts
        };
    }

    export const refresh = () => init();


    /** @type {import('$agentTypes').ChannelInstruction} */
    const defaultInstruction = {
        channel: defaultChannel,
        instruction: ''
    };

    /** @type {import('$agentTypes').ChannelInstruction[]} */
    let inner_instructions = [];

    /** @type {import('$agentTypes').ChannelInstruction} */
    let selected_instruction = { ...defaultInstruction };

    onMount(() => {
        init();
    });

    function init() {
        inner_instructions = [
            {
                uid: uuidv4(),
                channel: defaultChannel,
                instruction: agent.instruction
            },
            ...agent.channel_instructions?.map(x => ({
                uid: uuidv4(),
                channel: x.channel,
                instruction: x.instruction
            })) || []
        ];

        selected_instruction = inner_instructions[0];
    }

    /** @param {string | undefined} uid */
    function selectChannel(uid) {
        if (uid === selected_instruction.uid) {
            return;
        }

        selected_instruction = inner_instructions.find(x => x.uid === uid) || { ...defaultInstruction };
    }

    /** @param {any} e */
    function changePrompt(e) {
        e.preventDefault();
        const value = e.target.value;
        selected_instruction.instruction = value || '';
        handleAgentChange();
    }

    function addChannel() {
        inner_instructions = [
            ...inner_instructions,
            {
                uid: uuidv4(),
                channel: '',
                instruction: ''
            }
        ];

        selected_instruction = inner_instructions[inner_instructions.length-1];
        handleAgentChange();
    }

    /** @param {string | undefined} uid */
    function deleteChannel(uid) {
        inner_instructions = inner_instructions.filter(x => x.uid !== uid);
        if (selected_instruction.uid === uid) {
            selected_instruction = inner_instructions[0];
        }
        handleAgentChange();
    }
</script>

<MaterialCard variant="outlined" className="agent-instruction-card">
    <div class="material-card-header">
        <div class="d-flex align-items-center">
            <div class="flex-grow-1">
                <h5 class="material-heading">{agent.name}</h5>
            </div>
        </div>
    </div>
    <div class="material-card-content">
        <div class="material-form-group">
            <div class="mb-2">
                <div class="material-label">
                    Description:
                </div>
            </div>
            <MaterialTextField
                type="textarea"
                rows={4}
                bind:value={agent.description}
                placeholder="Enter agent description..."
                on:input={handleAgentChange}
            />
        </div>        <div class="material-form-group">
            <div class="mb-2 d-flex align-items-center gap-2">
                <div class="material-label">
                    {#if inner_instructions.length > 1}
                        Instructions:
                    {:else}
                        System instruction:
                    {/if}
                </div>
                <MaterialButton
                    variant="text"
                    icon="mdi mdi-plus-circle-outline"
                    size="small"
                    on:click={() => addChannel()}
                    title="Add channel instruction"
                >
                    Add Channel
                </MaterialButton>
            </div>
            
            {#if inner_instructions.length > 1}
            <div class="material-tabs mb-3">
                <NavBar
                    id={'agent-instruction-container'}
                    disableDefaultStyles
                    containerClasses={'nav-tabs-secondary'}
                >
                    {#each inner_instructions as inst, idx (idx) }
                    <NavItem
                        containerStyles={`flex: 0 1 calc(100% / ${inner_instructions.length <= 2 ? inner_instructions.length : 3})`}
                        navBtnStyles={'text-transform: none;'}
                        navBtnId={`${inst.channel}-prompt-tab`}
                        dataBsTarget={`#${inst.channel}-prompt-tab-pane`}
                        ariaControls={`${inst.channel}-prompt-tab-pane`}
                        bind:navBtnText={inst.channel}
                        active={inst.uid === selected_instruction.uid}
                        allowEdit={idx > 0}
                        allowDelete={idx > 0}
                        maxEditLength={20}
                        editPlaceholder={'Type a channel here...'}
                    onClick={() => selectChannel(inst.uid)}
                    onDelete={() => deleteChannel(inst.uid)}                        onInput={handleAgentChange}
                    />
                    {/each}
                </NavBar>
            </div>
            {/if}
            <MaterialTextField
                type="textarea"
                value={selected_instruction.instruction}
                rows={20}
                on:input={(e) => changePrompt(e)}
                placeholder="Enter your instruction..."
            />
        </div>
    </div>
</MaterialCard>
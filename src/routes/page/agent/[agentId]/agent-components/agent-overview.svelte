<script>
    import { onMount } from 'svelte';    import { Button, Card, CardBody, CardHeader, Input, Table } from '@sveltestrap/sveltestrap';
    import { _ } from 'svelte-i18n'  
    import InPlaceEdit from '$lib/common/InPlaceEdit.svelte'
    import { utcToLocal } from '$lib/helpers/datetime';
	import { AgentType } from '$lib/helpers/enums';
	import { AgentExtensions } from '$lib/helpers/utils/agent';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
    import MaterialButton from '$lib/common/MaterialButton.svelte';

    const limit = 10;


    /** @type {import('$agentTypes').AgentModel} */
    export let agent;

    /** @type {string[]} */
    export let profiles = [];

    /** @type {string[]} */
    export let labels = [];
    
    /** @type {() => void} */
    export let handleAgentChange = () => {};

    /** @type {boolean} */
    export let resetable = false;

    /** @type {() => void} */
    export let resetAgent = () => {};
   
    onMount(() => {});

    function addProfile() {
        if (!!!agent) return;

        profiles = [...profiles, ''];
        agent.profiles = profiles;
        handleAgentChange();
    }

    /**
	 * @param {number} index
	 */
    function removeProfile(index) {
        profiles = profiles.filter((x, idx) => idx !== index);
        agent.profiles = profiles;
        handleAgentChange();
    }

    function addLabel() {
        if (!!!agent) return;

        labels = [...labels, ''];
        agent.labels = labels;
        handleAgentChange();
    }

    /**
	 * @param {number} index
	 */
    function removeLabel(index) {
        labels = labels.filter((x, idx) => idx !== index);
        agent.labels = labels;
        handleAgentChange();
    }

    function chatWithAgent() {
        if (!!!agent?.id) return;
        
        window.open(`/chat/${agent?.id}`, '_blank');
    }
</script>

<MaterialCard variant="outlined" className="agent-overview-card">
    <div class="material-card-content">
        {#if resetable}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="agent-reset-container"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                title={$_('Reset')}
                on:click={() => resetAgent()}
            >
                <i class="mdi mdi-refresh text-primary clickable" />
            </div>
        {/if}
        <div class="text-center mb-4">
            <div class="agent-overview-header">
                <img
                    src="images/users/bot.png"
                    alt=""
                    height="50"
                    class="mx-auto d-block"
                />
                {#if !!AgentExtensions.chatable(agent)}
                    <MaterialButton
                        variant="tonal"
                        icon="mdi mdi-chat"
                        size="small"
                        className="agent-chat mt-2"
                        on:click={() => chatWithAgent()}
                    >
                        Chat with me
                    </MaterialButton>
                {/if}
            </div>
            <h5 class="mt-3 mb-1 material-heading">
                <InPlaceEdit bind:value={agent.name} on:input={handleAgentChange} />
            </h5>
            <p class="material-body-medium text-outline mb-0">{`Updated at ${utcToLocal(agent.updated_datetime)}`}</p>
        </div>
        <div class="material-table-container">
            <Table class="material-table">
                <tbody>
                    <tr>
                        <th class="material-table-header">Type</th>
                        <td class="material-table-cell">
                            {#if agent.type == AgentType.Routing}
                                Routing Agent
                            {:else if agent.type == AgentType.Planning}
                                Planning Agent
                            {:else if agent.type == AgentType.Evaluating}
                                Evaluation Agent
                            {:else if agent.type == AgentType.Static}
                                Static Agent
                            {:else if agent.type == AgentType.Task}
                                Task Agent
                            {:else}
                                Unkown
                            {/if}
                        </td>
                    </tr>                    <tr>
                        <th class="material-table-header">
                            <div class="mt-2 mb-2">
                                Visibility
                            </div>
                        </th>
                        <td class="material-table-cell">
                            <div class="material-checkbox-container">
                                <input 
                                    class="material-checkbox" 
                                    type="checkbox" 
                                    bind:checked={agent.is_public} 
                                    on:change={handleAgentChange}
                                    id="is_public" 
                                />
                                <label class="material-checkbox-label" for="is_public">
                                    Public
                                </label>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="material-table-header">
                            <div class="mt-2 mb-2">
                                Routable
                            </div>
                        </th>
                        <td class="material-table-cell">
                            <div class="material-checkbox-container">
                                <input 
                                    class="material-checkbox" 
                                    type="checkbox" 
                                    bind:checked={agent.allow_routing} 
                                    on:change={handleAgentChange}
                                    id="allow_routing" 
                                />                                <label class="material-checkbox-label" for="allow_routing">Allow</label>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="material-table-header">
                            <div class="mt-2 mb-2">
                                Profiles
                            </div>
                        </th>
                        <td class="material-table-cell">
                            <div class="material-list-container">
                                {#each profiles as profile, index}
                                <div class="material-input-group">
                                    <input
                                        class="material-text-field"
                                        type="text"
                                        placeholder="Enter profile..."
                                        maxlength={30}
                                        bind:value={profile}
                                        on:input={handleAgentChange}
                                    />
                                    <button
                                        class="material-icon-button material-icon-button--error"
                                        type="button"
                                        on:click={() => removeProfile(index)}
                                    >
                                        <i class="mdi mdi-close"></i>
                                    </button>
                                </div>                                {/each}
                                {#if profiles?.length < limit}
                                <div class="material-add-button-container">
                                    <MaterialButton
                                        variant="text"
                                        icon="mdi mdi-plus"
                                        size="small"
                                        on:click={() => addProfile()}
                                    >
                                        Add Profile
                                    </MaterialButton>
                                </div>
                                {/if}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="material-table-header">
                            <div class="mt-2 mb-2">
                                Labels
                            </div>
                        </th>                        <td class="material-table-cell">
                            <div class="material-list-container">
                                {#each labels as label, index}
                                <div class="material-input-group">
                                    <input
                                        class="material-text-field"
                                        type="text"
                                        placeholder="Enter label..."
                                        maxlength={30}
                                        bind:value={label}
                                        on:input={handleAgentChange}
                                    />
                                    <button
                                        class="material-icon-button material-icon-button--error"
                                        type="button"
                                        on:click={() => removeLabel(index)}
                                    >
                                        <i class="mdi mdi-close"></i>
                                    </button>
                                </div>
                                {/each}
                                {#if labels?.length < limit}
                                <div class="material-add-button-container">
                                    <MaterialButton
                                        variant="text"
                                        icon="mdi mdi-plus"
                                        size="small"
                                        on:click={() => addLabel()}
                                    >
                                        Add Label
                                    </MaterialButton>
                                </div>
                                {/if}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="material-table-header">
                            <div class="mt-2 mb-2">
                                Status
                            </div>
                        </th>                        <td class="material-table-cell">							
                            <div class="material-checkbox-container">
                                <input 
                                    class="material-checkbox" 
                                    type="checkbox" 
                                    bind:checked={agent.disabled} 
                                    on:change={handleAgentChange}
                                    id="disabled" 
                                />
                                <label class="material-checkbox-label" for="disabled">Disabled</label>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="material-table-header" style="vertical-align: middle">
                            <div class="mt-1">
                                Max message count
                            </div>
                        </th>                        <td class="material-table-cell">
                            <div class="mt-2 mb-2">
                                <input
                                    type="number"
                                    class="material-text-field material-text-field--number"
									min={1}
                                    max={1000}
									step={1}
                                    bind:value={agent.max_message_count}
                                    on:input={handleAgentChange}
                                    placeholder="Enter max count..."
                                />
                            </div>
                        </td>
                    </tr><tr>
                        <th class="material-table-header">
                            <div class="mt-2 mb-2">
                                Created Date
                            </div>
                        </th>
                        <td class="material-table-cell">
                            <div class="mt-2 mb-2 material-body-medium">
                                {utcToLocal(agent.created_datetime)}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    </div>
</MaterialCard>

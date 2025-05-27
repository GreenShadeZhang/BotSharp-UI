<script>
	import CollapsibleCard from "$lib/common/CollapsibleCard.svelte";
	import { directToAgentPage } from "$lib/helpers/utils/common";
	import MaterialCard from '$lib/common/MaterialCard.svelte';

    /** @type {import('$agentTypes').AgentModel} */
    export let agent;
</script>

<MaterialCard variant="outlined" className="agent-routing-card">
    <div class="material-card-content">
        <div class="text-center mb-4">
            <h5 class="material-heading">Routing</h5>
            <h6 class="material-body-medium text-outline">Agent routing rules and redirections</h6>
        </div>

        <div class="material-routing-container">
            {#each agent.routing_rules as rule, idx (idx)}
            <div class="routing-rule-container mb-3">
                <CollapsibleCard open={idx === 0}>
                    <div slot='header'>
                        <h5 class="material-heading-small">{`Rule #${idx + 1}`}</h5>
                    </div>
                    <div slot='body'>
                        <div class="material-routing-table">
                            <div class="material-table-responsive">
                                {#if !!rule.field}
                                <div class="material-table-row">
                                    <div class="material-table-header">Field</div>
                                    <div class="material-table-cell">{rule.field}</div>
                                </div>
                                {/if}
                                {#if !!rule.description}
                                <div class="material-table-row">
                                    <div class="material-table-header">Description</div>
                                    <div class="material-table-cell">{rule.description}</div>
                                </div>
                                {/if}
                                {#if !!rule.fieldType}
                                <div class="material-table-row">
                                    <div class="material-table-header">Field Type</div>
                                    <div class="material-table-cell">{rule.fieldType}</div>
                                </div>
                                {/if}
                                <div class="material-table-row">
                                    <div class="material-table-header">Required</div>
                                    <div class="material-table-cell">{!!rule.required ? `Yes` : `No`}</div>
                                </div>
                                {#if !!rule.redirectTo}
                                <div class="material-table-row">
                                    <div class="material-table-header">Redirect to Agent</div>
                                    <div class="material-table-cell material-link" on:click={() => directToAgentPage(rule.redirectTo)}>
                                        {rule.redirect_to_agent || ''}
                                    </div>
                                </div>
                                {/if}
                                {#if !!rule.type}
                                <div class="material-table-row">
                                    <div class="material-table-header">Type</div>
                                    <div class="material-table-cell">{rule.type}</div>
                                </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </CollapsibleCard>
            </div>
            {/each}
        </div>
    </div>
</MaterialCard>
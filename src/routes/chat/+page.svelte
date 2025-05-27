<script>
    import { Container, Row, Col } from '@sveltestrap/sveltestrap';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
    import MaterialButton from '$lib/common/MaterialButton.svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { getSettingDetail } from '$lib/services/setting-service';
    import { getAgents } from '$lib/services/agent-service.js'
    
    const params = $page.params;
    /** @type {import('$agentTypes').AgentFilter} */
    const filter = {
        pager: { page: 1, size: 10, count: 0 }
    };

    /** @type {import('$agentTypes').AgentModel[]} */
    let agents = [];
    let agentId = 'undefined';

	onMount(async () => {
        const response = await getAgents(filter, true);
        agents = response?.items?.map(t => { return { ...t }; }) || [];
        const agentSettings = await getSettingDetail("Agent");
        // @ts-ignore
        agentId = agentSettings.hostAgentId;
	});
</script>

<div class="material-chat-selection">
    <Container fluid>
        <Row class="justify-content-center">
            <Col lg={8} xl={6}>
                <div class="material-chat-header">
                    <h1 class="material-chat-title">Choose Your Assistant</h1>
                    <p class="material-chat-subtitle">Select a bot you want to start chatting with</p>
                </div>
                
                <div class="material-agent-list">
                    {#each agents as agent}
                        <MaterialCard 
                            variant="outlined" 
                            class="material-agent-card {agentId === agent.id ? 'material-agent-card--selected' : ''}"
                        >
                            <label class="material-agent-option" for={agent.id}>
                                <input
                                    class="material-agent-radio"
                                    type="radio"
                                    name="agents"
                                    id={agent.id}
                                    value={agent.id}
                                    checked={agentId === agent.id}
                                    on:click={() => agentId = agent.id}
                                />
                                <div class="material-agent-content">
                                    <div class="material-agent-icon">
                                        <i class="mdi mdi-robot"></i>
                                    </div>
                                    <div class="material-agent-info">
                                        <h3 class="material-agent-name">{agent.name}</h3>
                                        <p class="material-agent-description">{agent.description}</p>
                                    </div>
                                    <div class="material-agent-indicator">
                                        <div class="material-radio-button"></div>
                                    </div>
                                </div>
                            </label>
                        </MaterialCard>
                    {/each}
                </div>
                
                <div class="material-chat-actions">
                    <MaterialButton 
                        variant="filled" 
                        size="large"
                        href="chat/{agentId}"
                        disabled={agentId === 'undefined'}
                        class="material-start-button"
                    >
                        <i class="mdi mdi-chat"></i>
                        Start Conversation
                    </MaterialButton>
                </div>
            </Col>
        </Row>
    </Container>
</div>
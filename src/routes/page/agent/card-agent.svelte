<script>
  import Link from "svelte-link";
  import { Col } from '@sveltestrap/sveltestrap';
  import { utcToLocal } from '$lib/helpers/datetime';
  import { _ } from 'svelte-i18n';
	import { LEARNER_ID } from "$lib/helpers/constants";
	import { AgentExtensions } from "$lib/helpers/utils/agent";
	import MaterialCard from '$lib/common/MaterialCard.svelte';
	import MaterialButton from '$lib/common/MaterialButton.svelte';

  /** @type {import('$agentTypes').AgentModel[]} */
  export let agents;
</script>

{#each agents as agent}
  <Col xl="4" sm="6">
    <MaterialCard variant="outlined" clickable className="material-agent-card">
      <div class="material-agent-content">
        <div class="material-agent-avatar">
          <div class="material-avatar-container">
            {#if agent.icon_url}
            <img src={agent.icon_url} alt="" class="material-avatar-image" />
            {:else}
            <img src="images/users/bot.png" alt="" class="material-avatar-image" />
            {/if}
          </div>
        </div>

        <div class="material-agent-info">
          <div class="material-agent-header">
            <h5 class="material-agent-name">
              <Link href= "page/agent/{agent.id}" class="material-link">
                {agent.name}
              </Link>
            </h5>
            {#if agent.is_router}
            <div class="material-router-indicator">
              <Link href={`page/agent/router?agent_id=${agent.id}`} target="_blank">
                <i class="mdi mdi-sitemap" />
              </Link>
            </div>
            {/if}
          </div>
          
          {#if agent.labels?.length > 0}
            <div class="material-agent-labels">
              {#each agent.labels as label}
                <span class="md-chip md-chip--outlined">{label}</span>
              {/each}
            </div>
          {:else}
            <p class="material-agent-provider">Provided by {agent.plugin.name}</p>
          {/if}
          
          <p class="material-agent-description">{agent.description}</p>
          
          <div class="material-agent-features">
            {#if agent.is_router}
            <div class="material-feature-icon" title="Router Agent">
              <img src="icons/router.png" class="feature-icon" alt="routing"/>
            </div>
            {/if}
            {#if agent.allow_routing}
            <div class="material-feature-icon" title="Routing Enabled">
              <img src="icons/routing-2.png" class="feature-icon" alt="routing"/>
            </div>
            {/if}
            {#each agent.functions as fn}
              <div class="material-feature-icon" title={fn.name}>
                <img src="images/function.png" class="feature-icon" alt={fn.name}/>
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <div class="material-agent-footer">
        <div class="material-agent-status">
          <span class="md-chip {agent.disabled ? 'md-chip--warning' : 'md-chip--success'}">
            {agent.disabled ? $_('Disabled') : $_('Enabled')}
          </span>
          <span class="md-chip {agent.is_public ? 'md-chip--success' : 'md-chip--warning'}">
            {agent.is_public ? $_('Public') : $_('Private')}
          </span>
          <span class="material-date-info">
            <i class="bx bx-calendar" />
            {utcToLocal(agent.updated_datetime, 'MMM D, YYYY')}
          </span>
        </div>
        
        <div class="material-agent-actions">
          <MaterialButton
            variant="text"
            icon="bx bx-wrench"
            size="small"
          >
            <Link href="page/agent/{agent.id}/build" target="_blank" class="material-link">
              {$_('Build')}
            </Link>
          </MaterialButton>
          
          {#if agent.is_public}      
          <MaterialButton
            variant="text"
            icon="bx bx-book-open"
            size="small"
          >
            <Link href={`/chat/${LEARNER_ID}`} target="_blank" class="material-link">
              {$_('Train')}
            </Link>
          </MaterialButton>
          <MaterialButton
            variant="outlined"
            icon="bx bx-chat"
            size="small"
            disabled={!AgentExtensions.chatable(agent)}
          >
            <Link href= "chat/{agent.id}" target="_blank" class="material-link">
              {$_('Test')}
            </Link>
          </MaterialButton>
          {/if}
        </div>
      </div>
    </MaterialCard>
  </Col>
{/each}
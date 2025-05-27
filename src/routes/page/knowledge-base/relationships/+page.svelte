<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import lodash from "lodash";
	const util = lodash;
    import MaterialButton from '$lib/common/MaterialButton.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
	import LoadingDots from '$lib/common/LoadingDots.svelte';
	import HeadTitle from '$lib/common/HeadTitle.svelte';
    import Breadcrumb from '$lib/common/Breadcrumb.svelte';
	import { searchGraphKnowledge } from '$lib/services/knowledge-base-service';
    
	const maxLength = 4096;

    let showDemo = false;
    let isSearching = false;
    let searchDone = false;
    let text = '';
    let result = '';

    onMount(() => {
        showDemo = true;
    });

    function search() {
        searchDone = false;
		isSearching = true;
		searchGraphKnowledge(util.trim(text)).then(res => {
            result = res.result || '';
		}).catch(err => {
            result = 'Error!';
        }).finally(() => {
			isSearching = false;
            searchDone = true;
		});
	}

    /** @param {KeyboardEvent} e */
	function pressKey(e) {
		if ((e.key === 'Enter' && (!!e.shiftKey || !!e.ctrlKey)) || e.key !== 'Enter' || !!!util.trim(text) || isSearching) {
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
		}

		search();
	}
</script>


<HeadTitle title="{$_('Relation Knowledge')}" />
<Breadcrumb pagetitle="{$_('Relation Knowledge')}" title="{$_('Knowledge Base')}"/>

<div class="d-xl-flex">
	<div class="w-100">
        {#if showDemo}
            <div
                in:fly={{ y: -10, duration: 500 }}
                out:fly={{ y: -10, duration: 200 }}
            >
                <MaterialCard variant="outlined" className="material-knowledge-search-card">
                    <div class="material-card-content">
                        <h6 class="material-heading">Graph Knowledge Search</h6>                        <div class="material-search-container">
                            <MaterialTextField
                                label="Search query"
                                helpText={`${text?.length || 0}/${maxLength} characters`}
                                maxlength={maxLength}
                                disabled={isSearching}
                                placeholder="Start searching here..."
                                bind:value={text}
                                on:keydown={(e) => pressKey(e)}
                                className="material-search-input"
                            />
                        
                            <div class="material-search-actions">
                                <MaterialButton
                                    variant="filled"
                                    disabled={!text || util.trim(text).length === 0 || isSearching}
                                    on:click={() => search()}
                                >
                                    Search
                                </MaterialButton>
                            </div>
                        </div>
                    
                        {#if isSearching}
                            <div class="knowledge-loader mt-4">
                                <LoadingDots duration={'1s'} size={12} gap={5} color={'var(--md-sys-color-primary)'} />
                            </div>
                        {:else if searchDone && !!result}
                            <div class="material-result-section">
                                <div class="material-result-header">
                                    <i class="mdi mdi-graph-outline" />
                                    <span>Answer:</span>
                                </div>
                                <div class="material-result-content">
                                    {result}
                                </div>
                            </div>
                        {:else if searchDone && !result}
                            <div class="material-empty-state">
                                <i class="mdi mdi-graph-outline material-empty-icon"></i>
                                <h4 class="material-heading-small">No knowledge found</h4>
                                <p class="material-body-medium">Try adjusting your search query</p>
                            </div>
                        {/if}
                    </div>
                </MaterialCard>
            </div>
        {/if}
    </div>
</div>
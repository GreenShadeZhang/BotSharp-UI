<script>
	import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import lodash from "lodash";
	const util = lodash;
	import Swal from 'sweetalert2';	import {
        Button,
        Tooltip
    } from '@sveltestrap/sveltestrap';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
    import MaterialButton from '$lib/common/MaterialButton.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';
    import {
        getVectorKnowledgeCollections,
        getVectorKnowledgePageList,
        searchVectorKnowledge,
		createVectorKnowledgeData,
		updateVectorKnowledgeData,
		deleteVectorCollection,
		deleteVectorKnowledgeData,
		deleteAllVectorKnowledgeData,
		createVectorCollection,
    } from '$lib/services/knowledge-base-service';
	import Breadcrumb from '$lib/common/Breadcrumb.svelte';
    import HeadTitle from '$lib/common/HeadTitle.svelte';
	import Loader from '$lib/common/Loader.svelte';
	import LoadingDots from '$lib/common/LoadingDots.svelte';
	import LoadingToComplete from '$lib/common/LoadingToComplete.svelte';
	import {
		KnowledgeCollectionType,
		KnowledgePayloadName,
		VectorDataSource
	} from '$lib/helpers/enums';
	import VectorItem from '../common/vector-table/vector-item.svelte';
	import VectorItemEditModal from '../common/vector-table/vector-item-edit-modal.svelte';
	import CollectionCreateModal from '../common/collection/collection-create-modal.svelte';
	import AdvancedSearch from '../common/search/advanced-search.svelte';
	import KnowledgeDocumentUpload from './knowledge-document-upload.svelte';
	import { DECIMAL_REGEX } from '$lib/helpers/constants';
	
	const pageSize = 8;
  	const duration = 2000;
	const maxLength = 4096;
	const step = 0.1;
	const enableVector = true;
	const collectionType = KnowledgeCollectionType.Document;
	const includedPayloads = [
		KnowledgePayloadName.Text,
		KnowledgePayloadName.FileId,
		KnowledgePayloadName.FileName,
		KnowledgePayloadName.DataSource,
		KnowledgePayloadName.FileSource,
		KnowledgePayloadName.FileUrl
	];
	
	/** @type {string} */
	let text = "";
	let successText = "Done";
	let errorText = "Error";
    let confidence = '0.5';

    /** @type {string} */
    let selectedCollection;

	/** @type {import('$knowledgeTypes').KnowledgeSearchViewModel[]} */
	let items = [];

	/** @type {string[]} */
	let collections = [];

	/** @type {string | null | undefined } */
	let nextId;

	/** @type {string} */
	let editCollection;

	/** @type {import('$knowledgeTypes').KnowledgeSearchViewModel | null} */
	let editItem;

	/** @type {string} */
	let editModalTitle = "Edit knowledge";

	/** @type {import('$commonTypes').KeyValuePair[]} */
	let searchItems = [];

	/** @type {boolean} */
    let showDemo = true;
    let isSearching = false;
	let searchDone = false;
	let isFromSearch = false;
	let isLoading = false;
	let isLoadingMore = false;
	let isComplete = false;
	let isError = false;
	let isOpenEditKnowledge = false;
	let isOpenCreateCollection = false;
	let textSearch = false;
	let disableSearchBtn = false;

    /** @type {any} */
    let docUploadrCmp;

	/** @type {{
	 * startId: string | null,
	 * isReset: boolean,
	 * isLocalLoading: boolean,
	 * skipLoader: boolean,
	 * useSearhPair: boolean
	 * }}
	*/
	const defaultParams = {
		startId: null,
		isReset: false,
		isLocalLoading: false,
		skipLoader: false,
		useSearhPair: false
	};

    $: disabled = isLoading || isLoadingMore || isSearching;
	$: {
		disableSearchBtn = false;
		if (isSearching || isLoadingMore) {
			disableSearchBtn = true;
		} else if (textSearch && searchItems.length > 0) {
			disableSearchBtn = false;
		} else if (!text || util.trim(text).length === 0) {
			disableSearchBtn = true;
		}
	}

	onMount(() => {
		initData();
	});

	function initData() {
		isLoading = true;
    	getCollections().then(() => {
			getData({
				...defaultParams,
				isReset: true,
				skipLoader: true
			}).finally(() => isLoading = false);
		}).finally(() => {
			isLoading = false;
		});
	}


	// Search knowledge
	function toggleDemo() {
		showDemo = !showDemo;
	}

	function toggleTextSearch() {
		textSearch = !textSearch;
		if (!textSearch) {
			searchItems = [];
		}
	}

	function search() {
		items = [];
		isSearching = true;
		searchDone = false;
		isFromSearch = false;

		if (textSearch) {
			getData({
				...defaultParams,
				isReset: true,
				skipLoader: true,
				useSearhPair: true
			}).then(() => {
				isFromSearch = true;
			}).finally(() => {
				isSearching = false;
				searchDone = true;
			});
		} else {
			searchVectorKnowledge(selectedCollection,
			{
				text: util.trim(text),
				confidence: Number(validateConfidenceNumber(confidence)),
				with_vector: enableVector
			}).then(res => {
				items = res || [];
				isFromSearch = true;
			}).finally(() => {
				isSearching = false;
				searchDone = true;
				nextId = null;
			});
		}
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

	/** @param {boolean} skipLoader */
	function reset(skipLoader = false) {
		resetStates();
		getData({
			...defaultParams,
			startId: null,
			isReset: true,
			skipLoader: skipLoader
		});
	}

	function initPage() {
		resetStates();
    	initData();
	}

	function resetEditData() {
		editCollection = '';
		editItem = null;
	}

	function resetStates() {
		text = "";
		nextId = null;
		isSearching = false;
		searchDone = false;
		isFromSearch = false;
		textSearch = false;
	}


    /** @param {any} e */
    function validateConfidenceInput(e) {
        const reg = new RegExp(DECIMAL_REGEX, 'g');
        if (e.key !== 'Backspace' && !reg.test(e.key)) {
            e.preventDefault();
        }
    }

	/** @param {string} value */
	function validateConfidenceNumber(value) {
		const num = Number(value);

		if (isNaN(num) || num < 0) {
			confidence = '0.0';
		} else if (num >= 1) {
			confidence = '1.0';
		} else {
			confidence = num.toFixed(1);
		}
		return confidence;
	}

    /** @param {any} e */
    function changeConfidence(e) {
        const value = e.target.value;
		confidence = validateConfidenceNumber(value);
    }

	/**
	 * @param {string} type
	 * @param {number} step
	 */
	 function stepChangeConfidence(type, step) {
		let innerStep = step || 0;
		if (type === 'plus') {
			innerStep = Math.abs(innerStep);
		} else if (type === 'minus') {
			innerStep = -Math.abs(innerStep);
		}

		const newConfidence = Number(confidence) + innerStep;
		confidence = validateConfidenceNumber(newConfidence?.toString());
	}

	// Knowledge list data
	function getCollections() {
		return new Promise((resolve, reject) => {
			getVectorKnowledgeCollections(collectionType).then(res => {
				const retCollections = res?.map(x => x.name) || [];
				collections = [ ...retCollections ];
				selectedCollection = collections[0];
				resolve(res);
			}).catch(err => {
				collections = [];
				selectedCollection = collections[0];
				reject(err);
			});
		});
	}

	/**
	 * @param {{
	 * startId: string | null,
	 * isReset: boolean,
	 * useSearhPair: boolean }} params
	 */
	function getKnowledgeListData(params = {
		startId: null,
		isReset: false,
		useSearhPair: false
	}) {
		return new Promise((resolve, reject) => {
			/** @type {import('$commonTypes').KeyValuePair[]} */
			let searchPairs = [];
			if (params.useSearhPair) {
				if (!!text) {
					searchPairs = [ ...searchPairs, { key: KnowledgePayloadName.Text, value: text } ];
				}

				if (textSearch && searchItems.length > 0) {
					searchPairs = [ ...searchPairs, ...searchItems ];
				}
			}

			const filter = {
				size: pageSize,
				start_id: params.startId,
				with_vector: enableVector,
				included_payloads: includedPayloads,
				search_pairs: searchPairs
			};

			getVectorKnowledgePageList(
				selectedCollection,
				filter
			).then(res => {
				const newItems = res.items || [];
				if (params.isReset) {
					items = [ ...newItems ];
				} else {
					items = [ ...items, ...newItems ];
				}
				nextId = res.next_id;
				resolve(res);
			}).catch(err => {
				console.log(err);
				reject(err);
			});
		});
	}


	/**
	 * @param {{
	 * startId: string | null,
	 * isReset: boolean,
	 * isLocalLoading: boolean,
	 * skipLoader: boolean,
	 * useSearhPair: boolean }} params
	 */
	function getData(params = {
		startId: null,
		isReset: false,
		isLocalLoading: false,
		skipLoader: false,
		useSearhPair: false
	}) {
		return new Promise((resolve, reject) => {
			if (!params.skipLoader) {
                toggleLoader(params.isLocalLoading);
            }
			
			getKnowledgeListData({
				...params
			}).then(res => {
				resolve(res);
			}).catch(err => {
				isError = true;
				setTimeout(() => {
					isError = false;
				}, 2000);
				reject(err);
			}).finally(() => {
				if (!params.skipLoader) {
                    toggleLoader(params.isLocalLoading);
                }
			});
		});
	}

	/** @param {boolean} isLocalLoading */
	function toggleLoader(isLocalLoading) {
		if (isLocalLoading) {
			isLoadingMore = !isLoadingMore;
		} else {
			isLoading = !isLoading;
		}
	}

	function loadMore() {
		let params = { ...defaultParams };

		if (textSearch) {
			params = {
				...params,
				startId: nextId || null,
				isLocalLoading: true,
				useSearhPair: true
			};
		} else {
			params = {
				...params,
				startId: nextId || null,
				isLocalLoading: true,
			};
		}

		getData(params);
	}

	/** @param {any} e */
	function onKnowledgeDelete(e) {
		const id = e.detail.id;
		isLoading = true;
		deleteVectorKnowledgeData(selectedCollection, id).then(res => {
			if (res) {
				isComplete = true;
				successText = "Knowledge has been deleted!";
				setTimeout(() => {
					isComplete = false;
				}, duration);
				items = items?.filter(x => x.id !== id) || [];
			} else {
				throw 'error when deleting vector knowledge!';
			}
		}).catch(() => {
			isError = true;
			errorText = "Error when deleting knowledge!";
			setTimeout(() => {
				isError = false;
			}, duration);
		}).finally(() => {
			isLoading = false;
		});
	}

	/** @param {any} e */
	function onKnowledgeUpdate(e) {
		editModalTitle = "Edit knowledge";
		editCollection = e.detail.collection;
		editItem = e.detail.item;
		isOpenEditKnowledge = true;
	}

	function onKnowledgeCreate() {
		editModalTitle = "Create knowledge";
		editCollection = selectedCollection;
		editItem = null;
		isOpenEditKnowledge = true;
	}

	function onKnowledgeDeleteAll() {
		Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to delete all data in collection "${selectedCollection}"?`,
            icon: 'warning',
			customClass: { confirmButton: 'danger-background' },
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
        }).then(async (result) => {
            if (result.value) {
				isLoading = true;
                deleteAllVectorKnowledgeData(selectedCollection).then(res => {
					if (res) {
						successText = "All data has been deleted!";
						isComplete = true;
						setTimeout(() => {
							isComplete = false;
						}, duration);
						reset(true);
					} else {
						throw 'Error when deleting all data';
					}
				}).catch(() => {
					errorText = "Failed to delete all data."
					isError = true;
					setTimeout(() => {
						isError = false;
					}, duration);
				}).finally(() => {
					isLoading = false;
				});
            }
        });
	}

	function toggleKnowledgeEditModal() {
		isOpenEditKnowledge = !isOpenEditKnowledge;
		if (!isOpenEditKnowledge) {
			resetEditData();
		}
	}

	/** @param {any} e */
	function confirmEdit(e) {
		isLoading = true;
		isOpenEditKnowledge = false;
		const dataSource = e.data?.dataSource || VectorDataSource.User;
		e.data.dataSource = dataSource;

		if (!!editItem) {
			const {
				text,
				answer,
				...payload
			} = e.data;
			updateVectorKnowledgeData(
				e.id,
				editCollection,
				e.data?.text,
				e.data?.dataSource,
				{ ...payload }
			).then(res => {
				if (res) {
					isComplete = true;
					refreshItems(e);
					resetEditData();
					successText = "Knowledge has been updated!";
					setTimeout(() => {
						isComplete = false;
					}, duration);
				} else {
					throw 'error when updating vector knowledge!';
				}
			}).catch(() => {
				resetEditData();
				isError = true;
				errorText = "Error when updating knowledge!";
				setTimeout(() => {
					isError = false;
				}, duration);
			}).finally(() => {
				isLoading = false;
			});
		} else {
			createVectorKnowledgeData(
				editCollection,
				e.data?.text,
				e.data.dataSource
			).then(res => {
				if (res) {
					isComplete = true;
					refreshItems(e);
					resetEditData();
					reset(true);
					successText = "Knowledge has been created!";
					setTimeout(() => {
						isComplete = false;
					}, duration);
				} else {
					throw 'error when creating vector knowledge!';
				}
			}).catch(() => {
				resetEditData();
				isError = true;
				errorText = "Error when creating knowledge!";
				setTimeout(() => {
					isError = false;
				}, duration);
			}).finally(() => {
				isLoading = false;
			});
		}
	}

	/** @param {any} newItem */
	function refreshItems(newItem) {
		const found = items?.find(x => x.id == newItem?.id);
		if (found) {
			found.data = {
				...found.data,
				text: newItem.data?.text || '',
				dataSource: newItem.data?.dataSource,
			};
			items = [ ...items ];
		}
	}

	/** @param {any} e */
	function changeCollection(e) {
		const value = e.target.value;
		selectedCollection = value;
        docUploadrCmp?.onCollectionChanged();
		reset();
	}

	function toggleCollectionCreate() {
		isOpenCreateCollection = !isOpenCreateCollection;
	}

	/** @param {import('$knowledgeTypes').CreateVectorCollectionRequest} data */
	function confirmCollectionCreate(data) {
		isLoading = true;
		toggleCollectionCreate();
		createVectorCollection({
			collection_name: data.collection_name,
			collection_type: collectionType,
			dimension: data.dimension,
			provider: data.provider,
			model: data.model
		}).then(res => {
			if (res) {
				successText = "Collection has been created!";
				isComplete = true;
				setTimeout(() => {
					isComplete = false;
				}, duration);
				initPage();
			} else {
				throw 'Error when creating collection';
			}
		}).catch(() => {
			errorText = "Failed to create collection."
			isError = true;
			setTimeout(() => {
				isError = false;
			}, duration);
		}).finally(() => {
			isLoading = false;
		});
	}

	function deleteCollection() {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to delete collection "${selectedCollection}"?`,
            icon: 'warning',
			customClass: { confirmButton: 'danger-background' },
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
        }).then(async (result) => {
            if (result.value) {
				isLoading = true;
                deleteVectorCollection(selectedCollection).then(res => {
					if (res) {
						successText = "Collection has been deleted!";
						isComplete = true;
						setTimeout(() => {
							isComplete = false;
						}, duration);
						initPage();
					} else {
						throw 'Error when deleting vector collection';
					}
				}).catch(() => {
					errorText = "Failed to delete collection."
					isError = true;
					setTimeout(() => {
						isError = false;
					}, duration);
				}).finally(() => {
					isLoading = false;
				});
            }
        });
	}

    /** @param {any} e */
    function onDocUploaded(e) {
        reset();
    }

    /** @param {any} e */
    function onDocDelected(e) {
        reset();
        const success = e.detail.success;
        if (success) {
            successText = "Knowledge document has been deleted!";
            isComplete = true;
            setTimeout(() => {
                isComplete = false;
            }, duration);
        } else {
            errorText = "Failed to delete knowledge document."
            isError = true;
            setTimeout(() => {
                isError = false;
            }, duration);
        }
    }

	/** @param {any} e */
    function onDocsReset(e) {
        reset();
        const success = e.detail.success;
        if (success) {
            successText = "Knowledge document has been reset!";
            isComplete = true;
            setTimeout(() => {
                isComplete = false;
            }, duration);
        } else {
            errorText = "Failed to reset knowledge documents."
            isError = true;
            setTimeout(() => {
                isError = false;
            }, duration);
        }
    }

	/** @param {any} e */
	function onSearchItemsChanged(e) {
		searchItems = e.detail.searchItems || [];
	}
</script>

<HeadTitle title="{$_('Document Knowledge')}" />
<Breadcrumb pagetitle="{$_('Document Knowledge')}" title="{$_('Knowledge Base')}"/>

<LoadingToComplete
	isLoading={isLoading}
	isComplete={isComplete}
	isError={isError}
	successText={successText}
	errorText={errorText}
/>

{#if isOpenEditKnowledge}
	<VectorItemEditModal
		className={'vector-edit-container'}
		title={editModalTitle}
		size={'lg'}
		collection={editCollection}
        collectionType={collectionType}
		item={editItem}
		open={isOpenEditKnowledge}
		toggleModal={() => isOpenEditKnowledge = !isOpenEditKnowledge}
		confirm={(e) => confirmEdit(e)}
		cancel={() => toggleKnowledgeEditModal()}
	/>
{/if}

<CollectionCreateModal
	title={'Create new collection'}
	open={isOpenCreateCollection}
	toggleModal={() => toggleCollectionCreate()}
	confirm={e => confirmCollectionCreate(e)}
	cancel={() => toggleCollectionCreate()}
/>

<div class="material-knowledge-container">
	<div class="material-knowledge-header">
		<MaterialCard variant="outlined" className="material-search-card">
			<div class="material-card-content">
				<div class="knowledge-demo-btn">
					<div class="demo-btn">
						<MaterialButton
							variant={showDemo ? 'filled' : 'outlined'}
							on:click={() => toggleDemo()}
						>
							{#if !showDemo}
								<div class="btn-content">
									<div class="knowledge-btn-icon"><i class="mdi mdi-magnify" /></div>
									<div>{'Start Search'}</div>
								</div>
							{:else}
								<div class="btn-content">
									<div class="knowledge-btn-icon"><i class="mdi mdi-eye-off" /></div>
									<div>{'Hide Search'}</div>
								</div>
							{/if}
						</MaterialButton>

						{#if showDemo}
							<div class="knowledge-btn-icon demo-tooltip-icon line-align-center" id="demo-tooltip">
								<i class="mdi mdi-information" />
							</div>
							<Tooltip target="demo-tooltip" placement="top" class="demo-tooltip-note">
								<ul>
									<li>Click "Search" or press "Enter" to search knowledge</li>
									<li>Switch collection will not search</li>
								</ul>
							</Tooltip>
						{/if}
					</div>
					
					<div class="reset-btn">
						<MaterialButton
							variant="text"
							on:click={() => reset()}
						>
							<div class="btn-content">
								<div class="knowledge-btn-icon"><i class="mdi mdi-refresh" /></div>
								<div>{'Reset'}</div>
							</div>
						</MaterialButton>
					</div>
				</div>

				{#if showDemo}
					<div
						class="material-search-section"
						in:fly={{ y: -10, duration: 500 }}
						out:fly={{ y: -10, duration: 200 }}
					>						<div class="knowledge-search-container">
							<MaterialTextField
								label="Search Knowledge"
								helpText={`${text?.length || 0}/${maxLength} characters`}
								bind:value={text}
								disabled={isSearching}
								maxlength={maxLength}
								on:keydown={(e) => pressKey(e)}
							/>
						
							<div class="material-search-controls">
								<div class="search-input-group">
									<div class="material-confidence-control">
										<MaterialTextField
											label="Confidence"
											type="text"
											class="text-center"
											disabled={textSearch}
											bind:value={confidence}
											on:keydown={(e) => validateConfidenceInput(e)}
											on:blur={(e) => changeConfidence(e)}
										/>
										<div class="confidence-step-controls">
											<MaterialButton
												variant="text"
												size="small"
												on:click={() => stepChangeConfidence('plus', step)}
											>
												<i class="mdi mdi-chevron-up" />
											</MaterialButton>
											<MaterialButton
												variant="text"
												size="small"
												on:click={() => stepChangeConfidence('minus', step)}
											>
												<i class="mdi mdi-chevron-down" />
											</MaterialButton>
										</div>
									</div>
								</div>
								<div class="search-mode-toggle">
									<div class="material-search-mode">
										<span class="search-mode-label">Similarity search</span>
										<div class="material-switch">
											<input
												type="checkbox"
												class="material-switch-input"
												checked={textSearch}
												on:change={e => toggleTextSearch()}
											/>
										</div>
										<span class="search-mode-label">Keyword search</span>
									</div>
								</div>
								<div class="search-action">
									<MaterialButton
										variant="filled"
										disabled={disableSearchBtn}
										on:click={() => search()}
									>
										{'Search'}
									</MaterialButton>
								</div>
							</div>

							{#if textSearch}
								<AdvancedSearch
									on:changeitems={e => onSearchItemsChanged(e)}
									disabled={disabled}
									items={[
										{ key: KnowledgePayloadName.FileName, displayName: "File name" },
										{ key: KnowledgePayloadName.FileSource, displayName: "File source" }
									]}
								/>
							{/if}
						
							{#if isSearching}
								<div class="knowledge-loader mt-5">
									<LoadingDots duration={'1s'} size={12} gap={5} color={'var(--md-sys-color-primary)'} />
								</div>
							{:else if searchDone && (!items || items.length === 0)}
								<div class="material-empty-state">
									<i class="mdi mdi-database-search material-empty-icon"></i>
									<h4 class="material-heading-small">{"No knowledge found"}</h4>
									<p class="material-body-medium">{"Try adjusting your search criteria"}</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</MaterialCard>
	</div>        
        {#if selectedCollection}
            <KnowledgeDocumentUpload
                collection={selectedCollection}
                disabled={disabled}
                bind:this={docUploadrCmp}
                on:docuploaded={(e) => onDocUploaded(e)}
                on:docdeleted={(e) => onDocDelected(e)}
				on:resetdocs={(e) => onDocsReset(e)}
            />
        {/if}

		<div class="material-knowledge-table-section">
			<MaterialCard variant="outlined" className="material-knowledge-card">
				<div class="material-card-content">
					<div class="material-knowledge-header">
						<div class="knowledge-actions">
							<h6 class="material-heading">{$_('Knowledge Database')}</h6>
							<div class="header-actions">
								<MaterialButton
									variant="text"
									size="small"
									on:click={() => onKnowledgeCreate()}
									className="material-action-btn"
								>
									<i class="mdi mdi-plus" />
									<span>Add</span>
								</MaterialButton>
								<MaterialButton
									variant="text"
									size="small"
									on:click={() => onKnowledgeDeleteAll()}
									className="material-action-btn material-danger-text"
								>
									<i class="mdi mdi-delete-sweep" />
									<span>Clear All</span>
								</MaterialButton>
							</div>
						</div>
						<div class="collection-controls">
							<div class="material-select-wrapper">
								<select 
									class="material-select"
									value={selectedCollection}
									on:change={(e) => changeCollection(e)}
								>
									{#each collections as option, idx (idx)}
										<option value={option}>{option}</option>
									{/each}
								</select>
								<label class="material-select-label">Collection</label>
							</div>
							<div class="collection-actions">
								<MaterialButton
									variant="text"
									size="small"
									on:click={() => toggleCollectionCreate()}
									className="material-action-btn"
								>
									<i class="mdi mdi-plus" />
								</MaterialButton>
								<MaterialButton
									variant="text"
									size="small"
									on:click={() => deleteCollection()}
									className="material-action-btn material-danger-text"
								>
									<i class="mdi mdi-delete" />
								</MaterialButton>
							</div>
						</div>
					</div>
				  
					<div class="material-table-container">
						<div class="material-table">
							<div class="material-table-header">
								<div class="material-table-cell material-table-header-cell">{$_('Text')}</div>
								<div class="material-table-cell material-table-header-cell">Actions</div>
							</div>
							<div class="material-table-body">
								{#each items as item, idx (idx)}
									<VectorItem
										collection={selectedCollection}
										collectionType={collectionType}
										item={item}
										open={isFromSearch && idx === 0}
										on:delete={(e) => onKnowledgeDelete(e)}
										on:update={(e) => onKnowledgeUpdate(e)}
									/>
								{/each}
							</div>
						</div>
				  
						{#if isLoadingMore}
							<div class="knowledge-loader mt-4">
								<LoadingDots duration={'1s'} size={12} gap={5} color={'var(--md-sys-color-primary)'} />
							</div>
						{:else if !!nextId}
							<div class="material-load-more">
								<MaterialButton
									variant="outlined"
									on:click={() => loadMore()}
								>
									{'Load more'}
								</MaterialButton>
							</div>
						{/if}
					</div>
				</div>
			</MaterialCard>
		</div>
	</div>
</div>
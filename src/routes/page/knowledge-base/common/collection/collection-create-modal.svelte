<script>
    import { onMount } from "svelte";	import {
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Row
    } from "@sveltestrap/sveltestrap";
    import MaterialButton from '$lib/common/MaterialButton.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';
    import lodash from "lodash";
    const _ = lodash;
	import { existVectorCollection } from "$lib/services/knowledge-base-service";

    
    /** @type {boolean} */
    export let open = false;

    /** @type {string} */
    export let className = "";

    /** @type {string} */
    export let title;

    /** @type {string} */
    export let size = 'md';

    /** @type {number} */
    export let minDimension = 1;

    /** @type {number} */
    export let step = 1;

    /** @type {number} */
    export let maxLength = 30;

    /** @type {() => void} */
    export let toggleModal;

    /** @type {(args0: any) => void} */
    export let confirm;

    /** @type {() => void} */
    export let cancel;

    /** @type {string} */
    let collection;

    /** @type {boolean} */
    let isValidCollection = true;    /** @type {string} */
    let dimension;

    /** @type {string} */
    let provider;

    /** @type {string} */
    let model;    $: disableConfirmBtn = (!_.trim(collection) || collection.length > maxLength) ||
                            (!_.trim(provider) || provider.length > maxLength) ||
                            (!_.trim(model) || model.length > maxLength) ||
                            parseInt(dimension) <= 0;

    onMount(() => {
        reset();
    });    function reset() {
        collection = '';
        dimension = '3072';
        provider = 'openai';
        model = 'text-embedding-3-large';
    }

    function toggle() {
        reset();
        toggleModal?.();
    }

    /** @param {string} text */
    function validateCollection(text) {
        return new Promise((resolve, reject) => {
            existVectorCollection(text).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /** @param {any} e */
    function changeCollectionText(e) {
        isValidCollection = true;
        collection = e.target.value;
    }

    /** @param {any} e */
    function handleConfirm(e) {
        e.preventDefault();

        validateCollection(_.trim(collection)).then(res => {
            if (res) {
                isValidCollection = false;
            } else {
                confirm?.({
                    collection_name: _.trim(collection),
                    dimension: dimension,
                    provider: _.trim(provider),
                    model: _.trim(model)
                });
            }
        }).catch(() => {
            isValidCollection = false;
        });
    }

    /** @param {any} e */
    function handleCancel(e) {
        e.preventDefault();
        reset();
        cancel?.();
    }

</script>

<Modal
    class={`vector-collection-create-container ${className}`}
    fade
    size={size}
    isOpen={open}
    toggle={() => toggle()}
    unmountOnClose
>
    <ModalHeader>
        <div>{title}</div>
    </ModalHeader>
    <ModalBody>        <div class="material-form">            <Row>
                <div class="collection-input">
                    <MaterialTextField                        label="Collection name"
                        error={!isValidCollection ? "The collection already exists." : ""}
                        maxlength={maxLength}
                        value={collection}
                        on:input={(e) => changeCollectionText(e)}
                        helpText={!isValidCollection ? "The collection already exists." : `${collection?.length || 0}/${maxLength}`}
                    />
                </div>
            </Row>
            <Row>
                <div>                    <MaterialTextField
                        label="Embedding provider"
                        maxlength={maxLength}
                        bind:value={provider}
                        helpText="{provider?.length || 0}/{maxLength}"
                    />
                </div>
            </Row>
            <Row>
                <div>                    <MaterialTextField
                        label="Embedding model"
                        maxlength={maxLength}
                        bind:value={model}
                        helpText="{model?.length || 0}/{maxLength}"
                    />
                </div>
            </Row>
            <Row>
                <div>                    <MaterialTextField
                        label="Vector dimension"
                        type="number"
                        bind:value={dimension}
                        min={minDimension}
                        step={step}
                        helpText="The value must be larger than 0."
                    />
                </div>
            </Row>        </div>
    </ModalBody><ModalFooter>
        <MaterialButton
            variant="filled"
            disabled={disableConfirmBtn}
            on:click={(e) => handleConfirm(e)}
        >
            Confirm
        </MaterialButton>
        <MaterialButton
            variant="outlined"
            on:click={(e) => handleCancel(e)}
        >
            Cancel
        </MaterialButton>
    </ModalFooter>
</Modal>
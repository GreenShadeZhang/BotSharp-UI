<script>
    import { onMount } from "svelte";	import {
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Row
    } from "@sveltestrap/sveltestrap";
    import MaterialButton from "$lib/common/MaterialButton.svelte";
    import MaterialTextField from "$lib/common/MaterialTextField.svelte";
    import { KnowledgeCollectionType } from "$lib/helpers/enums";
    import lodash from "lodash";
    const _ = lodash;
	

    /** @type {import('$knowledgeTypes').KnowledgeSearchViewModel | null} */
    export let item;

    /** @type {string} */
    export let collection;

    /** @type {string} */
    export let collectionType;

    /** @type {boolean} */
    export let open = false;

    /** @type {string} */
    export let className = "";

    /** @type {string} */
    export let title;

    /** @type {string} */
    export let size = 'md';

    /** @type {() => void} */
    export let toggleModal;

    /** @type {(item: any) => void} */
    export let confirm;

    /** @type {() => void} */
    export let cancel;

    $: isQuestionAnswerCollection = collectionType === KnowledgeCollectionType.QuestionAnswer;
    $: isDocumentCollection = collectionType === KnowledgeCollectionType.Document;
    $: disableConfirmBtn = !_.trim(question.text) || (isQuestionAnswerCollection && !_.trim(answer.text));


    let question = {
        text: '',
        rows: 3,
        maxLength: 4096
    };

    let answer = {
        text: '',
        rows: 5,
        maxLength: 4096
    }

    onMount(() => {
        init();
    });

    function init() {
        question = {
            ...question,
            rows: isQuestionAnswerCollection ? 3 : 10,
            text: item?.data?.text || item?.data?.question || ''
        };

        answer = {
            ...answer,
            text: item?.data?.answer || ''
        };
    }

    /** @param {any} e */
    function handleConfirm(e) {
        e.preventDefault();

        const newItem = {
            ...item,
            data: {
                ...item?.data,
                text: question.text,
                answer: answer.text
            }
        };
        confirm?.(newItem);
    }

    /** @param {any} e */
    function handleCancel(e) {
        e.preventDefault();
        cancel?.();
    }

</script>

<Modal
    class={className}
    fade
    size={size}
    isOpen={open}
    toggle={() => toggleModal && toggleModal()}
    unmountOnClose
>
    <ModalHeader>
        <div>{title}</div>
        <div>
            <span class="fw-bold">{'Collection: '}</span>
            <span class="text-primary collection-value">{collection}</span>
        </div>
    </ModalHeader>
    <ModalBody>        <div class="material-form">
            {#if isQuestionAnswerCollection}
            <Row>                <div class="edit-group">                    <MaterialTextField
                        label="Question"
                        maxlength={question.maxLength}
                        placeholder="Enter question..."
                        bind:value={question.text}
                        helpText="{question.text?.length || 0}/{question.maxLength}"
                    />
                </div>
            </Row>            <Row>
                <div class="edit-group">                    <MaterialTextField
                        label="Answer"
                        maxlength={answer.maxLength}
                        placeholder="Enter answer..."
                        bind:value={answer.text}
                        helpText="{answer.text?.length || 0}/{answer.maxLength}"
                    />
                </div>
            </Row>            {:else if isDocumentCollection}
            <Row>
                <div class="edit-group">                    <MaterialTextField
                        label="Text"
                        maxlength={question.maxLength}
                        placeholder="Enter text..."
                        bind:value={question.text}
                        helpText="{question.text?.length || 0}/{question.maxLength}"
                    />
                </div>
            </Row>
            {/if}
        </div>
    </ModalBody>    <ModalFooter>
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
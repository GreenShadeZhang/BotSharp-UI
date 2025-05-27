<script>
    import { _ } from 'svelte-i18n';
    import MaterialButton from '$lib/common/MaterialButton.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';

    /** @type {FileList} */
    let files;

	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		console.log(files);

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`);
		}
	}

    async function handleFileUpload() {}
</script>

<div class="material-upload-group">
    <input
        type="file"
        bind:files
        class="material-file-input"
        aria-label="{$_('Upload')}"
        id="file-input"
    />
    <label for="file-input" class="material-file-label">
        <i class="mdi mdi-file-upload-outline" />
        Choose File
    </label>
    <MaterialButton 
        variant="filled" 
        disabled={!files} 
        on:click={() => handleFileUpload()}
    >
        {$_('Upload')}
    </MaterialButton>
</div>

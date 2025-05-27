<script>
	import { _ } from 'svelte-i18n'
	import Link from 'svelte-link';
	import {
		DropdownMenu,
		DropdownItem,
		DropdownToggle,
		Dropdown
	} from '@sveltestrap/sveltestrap';
    import MaterialCard from '$lib/common/MaterialCard.svelte';
    import MaterialTextField from '$lib/common/MaterialTextField.svelte';
    import MaterialButton from '$lib/common/MaterialButton.svelte';

	const myfiles = [
		{
			id: 1,
			name: 'Design',
			file: '12',
			Gb: 6
		},
	];
</script>

<div class="material-files-container">
	<div class="material-files-header">
		<div class="material-files-title">
			<h5 class="material-heading">{$_('My Files')}</h5>
		</div>		<div class="material-files-controls">
			<div class="material-search-container">				<MaterialTextField
					label="Search files"
					className="material-files-search"
				>
					<i slot="startIcon" class="mdi mdi-magnify" />
				</MaterialTextField>
			</div>
			<Dropdown>
				<DropdownToggle
					color=""
					class="material-dropdown-toggle"
					tag="div"
				>
					<i class="mdi mdi-dots-vertical" />
				</DropdownToggle>
				<DropdownMenu class="dropdown-menu-end">
					<DropdownItem>{$_('Share Files')}</DropdownItem>
					<DropdownItem>{$_('Share with me')}</DropdownItem>
					<DropdownItem>{$_('Other Actions')}</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	</div>
</div>

<div class="material-files-grid">
	{#each myfiles as myfile}
		<MaterialCard variant="outlined" className="material-file-card">
			<div class="material-card-content">
				<div class="material-file-header">
					<Dropdown>
						<DropdownToggle class="material-file-menu" color="" tag="div">
							<i class="mdi mdi-dots-horizontal" />
						</DropdownToggle>
						<DropdownMenu class="dropdown-menu-end">
							<DropdownItem header>{$_('Open')}</DropdownItem>
							<DropdownItem>{$_('Edit')}</DropdownItem>
							<DropdownItem>{$_('Rename')}</DropdownItem>
							<DropdownItem divider />
							<DropdownItem>{$_('Remove')}</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
				
				<div class="material-file-icon">
					<i class="mdi mdi-folder material-folder-icon" />
				</div>
				
				<div class="material-file-content">
					<div class="material-file-info">
						<h6 class="material-body-large">
							<Link to="#" class="material-file-link">
								{myfile.name}
							</Link>
						</h6>
						<p class="material-body-medium material-file-meta">
							{myfile.file} {$_('Files')}
						</p>
					</div>
					<div class="material-file-size">
						<p class="material-body-medium">{myfile.Gb}GB</p>
					</div>
				</div>
			</div>
		</MaterialCard>
	{/each}
</div>

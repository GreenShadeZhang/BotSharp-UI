<script>
  import Link from "svelte-link";
  import { Collapse } from "@sveltestrap/sveltestrap";
  import MaterialCard from '$lib/common/MaterialCard.svelte';
  import MaterialButton from '$lib/common/MaterialButton.svelte';
  import { _ } from 'svelte-i18n';

  let isOpen = true;

  const handleOnClick = () => {
    isOpen = !isOpen;
  };
</script>

<MaterialCard variant="outlined" className="material-file-sidebar">
  <div class="material-card-content">
    <div class="material-sidebar-container">
      <div class="material-navigation">
        <ul class="material-nav-list">
          <li class="material-nav-item">
            <div class="material-nav-accordion">
              <Link
                class="material-nav-link"
                on:click={handleOnClick}
                id="toggler"
              >
                <i class="mdi mdi-folder material-nav-icon" />
                <span class="material-nav-text">{$_('Files')}</span>
                <i
                  class={`mdi ${isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'} material-nav-chevron`}
                />
              </Link>
              <Collapse {isOpen} toggler="#toggler">
                <div class="material-nav-submenu">
                  <ul class="material-nav-sublist">
                    <li class="material-nav-subitem">
                      <Link href="#" class="material-nav-sublink">
                        <span>{$_('Design')}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </Collapse>
            </div>
          </li>
          <li class="material-nav-item">
            <Link href="#" class="material-nav-link">
              <i class="mdi mdi-google-drive material-nav-icon material-muted" />
              <span class="material-nav-text">{$_('Google Drive')}</span>
            </Link>
          </li>
          <li class="material-nav-item">
            <Link href="#" class="material-nav-link">
              <i class="mdi mdi-dropbox material-nav-icon material-primary" />
              <span class="material-nav-text">{$_('Dropbox')}</span>
            </Link>
          </li>
          <li class="material-nav-item">
            <Link href="#" class="material-nav-link">
              <i class="mdi mdi-star-outline material-nav-icon material-muted" />
              <span class="material-nav-text">{$_('Starred')}</span>
            </Link>
          </li>
          <li class="material-nav-item">
            <Link href="#" class="material-nav-link">
              <i class="mdi mdi-delete material-nav-icon material-error" />
              <span class="material-nav-text">{$_('Trash')}</span>
            </Link>
          </li>
          <li class="material-nav-item">
            <Link href="#" class="material-nav-link">
              <i class="mdi mdi-cog material-nav-icon material-muted" />
              <span class="material-nav-text">{$_('Setting')}</span>
              <span class="material-badge">01</span>
            </Link>
          </li>
        </ul>
      </div>

      <div class="material-sidebar-footer">
        <div class="material-upgrade-card">
          <div class="material-upgrade-icon">
            <i class="mdi mdi-folder-open" />
          </div>
          <div class="material-upgrade-content">
            <h6 class="material-heading-small">{$_('Upgrade Features')}</h6>
            <p class="material-body-medium">{$_('Cum sociis natoque penatibus et')}</p>
            <div class="material-upgrade-action">
              <MaterialButton
                variant="text"
                size="small"
                className="material-upgrade-btn"
              >
                {$_('Upgrade')}
                <i class="mdi mdi-arrow-right" />
              </MaterialButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</MaterialCard>

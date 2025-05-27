<script>
	import { onMount } from "svelte";
  import { _ } from 'svelte-i18n';
  import Link from "svelte-link";
  import MaterialCard from '$lib/common/MaterialCard.svelte';
  import "//cdn.jsdelivr.net/npm/apexcharts";

  const options = {
    series: [0],
    chart: {
      height: 150,
      type: "radialBar",
      sparkline: {
        enabled: !0,
      },
    },
    colors: ["#556ee6"],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
          margin: 5, // margin is in pixels
        },

        hollow: {
          size: "60%",
        },

        dataLabels: {
          name: {
            show: !1,
          },
          value: {
            offsetY: -2,
            fontSize: "16px",
          },
        },
      },
    },
    grid: {
      padding: {
        top: -10,
      },
    },
    stroke: {
      dashArray: 3,
    },
    labels: [$_('Storage')],
  };

  onMount(() => {
    let chart = new ApexCharts(document.getElementById("storageChart"),options)
    chart.render();
  })

</script>

<MaterialCard variant="outlined" className="material-storage-card">
  <div class="material-card-content">
    <div class="material-storage-header">
      <h6 class="material-heading">{$_('Storage')}</h6>
      <div class="material-chart-container">
        <div id="storageChart" class="apex-charts" />
      </div>
      <p class="material-body-medium material-storage-usage">{$_('0 GB (0%) of 1 GB used')}</p>
    </div>

    <div class="material-storage-breakdown">
      <div class="material-storage-item">
        <Link href="#" class="material-storage-link">
          <div class="material-storage-item-content">
            <div class="material-storage-icon material-success">
              <i class="mdi mdi-image" />
            </div>
            <div class="material-storage-info">
              <h6 class="material-body-large">{$_('Images')}</h6>
              <p class="material-body-medium">0 {$_('Files')}</p>
            </div>
            <div class="material-storage-size">
              <p class="material-body-medium">0 GB</p>
            </div>
          </div>
        </Link>
      </div>

      <div class="material-storage-item">
        <Link href="#" class="material-storage-link">
          <div class="material-storage-item-content">
            <div class="material-storage-icon material-error">
              <i class="mdi mdi-play-circle-outline" />
            </div>
            <div class="material-storage-info">
              <h6 class="material-body-large">{$_('Video')}</h6>
              <p class="material-body-medium">0 {$_('Files')}</p>
            </div>
            <div class="material-storage-size">
              <p class="material-body-medium">0 GB</p>
            </div>
          </div>
        </Link>
      </div>

      <div class="material-storage-item">
        <Link href="#" class="material-storage-link">
          <div class="material-storage-item-content">
            <div class="material-storage-icon material-info">
              <i class="mdi mdi-music" />
            </div>
            <div class="material-storage-info">
              <h6 class="material-body-large">{$_('Music')}</h6>
              <p class="material-body-medium">0 {$_('Files')}</p>
            </div>
            <div class="material-storage-size">
              <p class="material-body-medium">0 GB</p>
            </div>
          </div>
        </Link>
      </div>

      <div class="material-storage-item">
        <Link href="#" class="material-storage-link">
          <div class="material-storage-item-content">
            <div class="material-storage-icon material-primary">
              <i class="mdi mdi-file-document" />
            </div>
            <div class="material-storage-info">
              <h6 class="material-body-large">{$_('Document')}</h6>
              <p class="material-body-medium">0 {$_('Files')}</p>
            </div>
            <div class="material-storage-size">
              <p class="material-body-medium">0 GB</p>
            </div>
          </div>
        </Link>
      </div>

      <div class="material-storage-item">
        <Link href="#" class="material-storage-link">
          <div class="material-storage-item-content">
            <div class="material-storage-icon material-warning">
              <i class="mdi mdi-folder" />
            </div>
            <div class="material-storage-info">
              <h6 class="material-body-large">{$_('Others')}</h6>
              <p class="material-body-medium">0 {$_('Files')}</p>
            </div>
            <div class="material-storage-size">
              <p class="material-body-medium">0 GB</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </div>
</MaterialCard>

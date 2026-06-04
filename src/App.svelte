<script lang="ts">
  import AppHeader from "./lib/components/AppHeader.svelte";
  import AttackPanel from "./lib/components/AttackPanel.svelte";
  import CenterPanel from "./lib/components/CenterPanel.svelte";
  import MetricsPanel from "./lib/components/MetricsPanel.svelte";
</script>

<div class="app">
  <AppHeader />
  <main class="layout">
    <AttackPanel />
    <CenterPanel />
    <MetricsPanel />
  </main>
</div>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }

  :global(:root) {
    --bg:         #0b0f14;
    --surface:    #111720;
    --surface2:   #1a2230;
    --border:     #1f2d3d;
    --border2:    #2a3f55;
    --text:       #d4e0ec;
    --muted:      #607080;
    --accent:     #2563eb;
    --accent-dim: #1a3f8a;
    --green:      #16a34a;
    --green-dim:  #0d4a28;
    --red:        #dc2626;
    --red-dim:    #5a1010;
    --amber:      #d97706;
    --amber-dim:  #5a3500;
    --cyan:       #0891b2;
    --mono:       'Courier New', monospace;
  }

  :global(body) {
    background: var(--bg);
    color: var(--text);
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }

  :global(::-webkit-scrollbar) { width: 4px; }
  :global(::-webkit-scrollbar-track) { background: transparent; }
  :global(::-webkit-scrollbar-thumb) { background: var(--border2); border-radius: 2px; }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
</style>

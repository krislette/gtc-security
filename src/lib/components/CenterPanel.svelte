<script lang="ts">
  import { activeTab } from "../stores/security";
  import EventLog from "./EventLog.svelte";
  import WalletInspector from "./WalletInspector.svelte";
  import ProposalValidator from "./ProposalValidator.svelte";

  const tabs = [
    { id: "log",     label: "EVENT LOG" },
    { id: "wallet",  label: "WALLET INSPECTOR" },
    { id: "propose", label: "PROPOSAL VALIDATOR" },
  ] as const;
</script>

<div class="center-panel">
  <nav class="tabs">
    {#each tabs as tab}
      <button
        class="tab"
        class:active={$activeTab === tab.id}
        on:click={() => activeTab.set(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <div class="tab-content">
    {#if $activeTab === "log"}
      <EventLog />
    {:else if $activeTab === "wallet"}
      <WalletInspector />
    {:else if $activeTab === "propose"}
      <div class="scrollable">
        <ProposalValidator />
      </div>
    {/if}
  </div>
</div>

<style>
  .center-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .tab {
    padding: 0.6rem 1rem;
    font-size: 11px;
    font-family: var(--mono);
    color: var(--muted);
    cursor: pointer;
    letter-spacing: 0.06em;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    margin-bottom: -1px;
    transition: color 0.15s;
  }

  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: var(--text); }

  .tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .scrollable { flex: 1; overflow-y: auto; }
</style>

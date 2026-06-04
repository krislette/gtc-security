<script lang="ts">
  import { afterUpdate } from "svelte";
  import { logs } from "../stores/security";

  let logArea: HTMLDivElement;

  afterUpdate(() => {
    if (logArea) logArea.scrollTop = logArea.scrollHeight;
  });

  const tagClass: Record<string, string> = {
    INFO: "tag-info",
    WARN: "tag-warn",
    DANGER: "tag-danger",
    BLOCK: "tag-block",
    OK: "tag-ok",
    MITIGATE: "tag-mitigate",
  };
</script>

<div class="log-panel">
  <div class="panel-header">
    <span>Real-time event stream</span>
    <button class="clear-btn" on:click={() => logs.clear()}>CLEAR</button>
  </div>

  <div class="log-area" bind:this={logArea}>
    {#if $logs.length === 0}
      <div class="empty-state">
        <span class="empty-icon">⬡</span>
        <span>Awaiting events. Launch an attack vector to begin.</span>
      </div>
    {:else}
      {#each $logs as entry (entry.id)}
        {#if entry.phase}
          <div class="phase-separator">
            <span class="phase-label">{entry.phase}</span>
          </div>
        {/if}
        <div class="log-entry {entry.type}">
          <span class="log-time">{entry.time}</span>
          <span class="log-tag {tagClass[entry.tag]}">{entry.tag}</span>
          <span class="log-msg">{@html entry.msg}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .log-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    font-family: var(--mono);
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    flex-shrink: 0;
  }

  .clear-btn {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    letter-spacing: 0.05em;
    transition: color 0.15s;
  }

  .clear-btn:hover {
    color: var(--text);
  }

  .log-area {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1rem;
    font-family: var(--mono);
    font-size: 12px;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 12px;
    flex-direction: column;
    gap: 8px;
  }

  .empty-icon {
    font-size: 24px;
    opacity: 0.3;
  }

  .phase-separator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0 6px;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .phase-separator::before,
  .phase-separator::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .phase-label {
    padding: 2px 10px;
    border-radius: 3px;
    background: var(--surface2);
    border: 1px solid var(--border);
    white-space: nowrap;
  }

  .log-entry {
    padding: 5px 8px;
    border-radius: 4px;
    margin-bottom: 3px;
    display: grid;
    grid-template-columns: 80px 70px 1fr;
    gap: 8px;
    align-items: start;
    animation: fadein 0.3s forwards;
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .log-entry.warn {
    background: rgba(217, 119, 6, 0.08);
  }
  .log-entry.danger {
    background: rgba(220, 38, 38, 0.1);
  }
  .log-entry.block {
    background: rgba(220, 38, 38, 0.15);
    border-left: 2px solid var(--red);
  }
  .log-entry.success {
    background: rgba(22, 163, 74, 0.08);
    border-left: 2px solid var(--green);
  }

  .log-time {
    color: var(--muted);
    white-space: nowrap;
  }

  .log-tag {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    font-weight: 700;
    letter-spacing: 0.06em;
    white-space: nowrap;
    align-self: start;
  }

  :global(.tag-info) {
    background: #1e3a5f;
    color: #60a5fa;
  }
  :global(.tag-warn) {
    background: var(--amber-dim);
    color: #fbbf24;
  }
  :global(.tag-danger) {
    background: #5a1010;
    color: #f87171;
  }
  :global(.tag-block) {
    background: #5a1010;
    color: #ef4444;
  }
  :global(.tag-ok) {
    background: var(--green-dim);
    color: #4ade80;
  }
  :global(.tag-mitigate) {
    background: #1a3f1a;
    color: #4ade80;
  }

  .log-msg {
    color: var(--text);
    word-break: break-all;
  }
  :global(.log-msg b) {
    color: #f87171;
    font-weight: 600;
  }
</style>

<script lang="ts">
  import { metrics, blocklist, incidents, logs, voteRateInfo } from "../stores/security";
  import { VOTE_RATE_LIMIT } from "../engine/constants";

  function unblock(target: string) {
    blocklist.remove(target);
    metrics.decrement("blocked");
    logs.add("success", "OK", `Unblocked ${target}. Access has been restored.`);
  }

  $: ratePct = Math.min(($voteRateInfo.rate / (VOTE_RATE_LIMIT * 2)) * 100, 100);
  $: rateColor =
    $voteRateInfo.rate > VOTE_RATE_LIMIT ? "#dc2626" :
    $voteRateInfo.rate === VOTE_RATE_LIMIT ? "#d97706" : "#16a34a";
  $: rateStatus =
    $voteRateInfo.rate > VOTE_RATE_LIMIT ? "RATE EXCEEDED - throttling" :
    $voteRateInfo.rate === VOTE_RATE_LIMIT ? "Approaching threshold" : "Normal";
</script>

<aside class="metrics-panel">
  <div class="panel-header">Security Metrics</div>

  <div class="panel-body">
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-label">Events</div>
        <div class="metric-val">{$metrics.events}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Threats</div>
        <div class="metric-val red">{$metrics.threats}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Blocked</div>
        <div class="metric-val amber">{$metrics.blocked}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Mitigated</div>
        <div class="metric-val green">{$metrics.mitigated}</div>
      </div>
    </div>

    <div class="section-title">Vote rate (attempts / 10s)</div>
    <div class="rate-header">
      <span>Threshold: {VOTE_RATE_LIMIT} req/10s</span>
      <span>{$voteRateInfo.rate}/10s</span>
    </div>
    <div class="rate-bar-wrap">
      <div class="rate-bar" style="width: {ratePct}%; background: {rateColor};" />
    </div>
    <div class="rate-status" style="color: {$voteRateInfo.rate > VOTE_RATE_LIMIT ? '#f87171' : 'var(--muted)'}">
      {rateStatus}
    </div>

    <div class="section-title">Blocked IPs / Wallets</div>
    <div class="blocked-list">
      {#if $blocklist.size === 0}
        <span class="empty">None</span>
      {:else}
        {#each [...$blocklist] as target}
          <button class="ip-tag" on:click={() => unblock(target)} title="Click to unblock">
            {target} ✕
          </button>
        {/each}
      {/if}
    </div>

    <div class="section-title">Incident Log</div>
    <div class="incident-list">
      {#if $incidents.length === 0}
        <span class="empty">No incidents recorded</span>
      {:else}
        {#each $incidents as inc}
          <div class="incident">
            <div class="incident-top">
              <span class="incident-type">
                <span class="sev {inc.severity}" />
                {inc.type}
              </span>
              <span class="incident-time">{inc.time}</span>
            </div>
            <div class="incident-detail">{inc.detail}</div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</aside>

<style>
  .metrics-panel {
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 280px;
    flex-shrink: 0;
  }

  .panel-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    font-family: var(--mono);
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    background: var(--surface);
    flex-shrink: 0;
  }

  .panel-body { flex: 1; overflow-y: auto; padding: 1rem; }

  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .metric {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.6rem 0.75rem;
  }

  .metric-label {
    font-size: 10px;
    color: var(--muted);
    font-family: var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .metric-val {
    font-size: 20px;
    font-weight: 700;
    font-family: var(--mono);
    color: var(--text);
  }

  .metric-val.red   { color: #f87171; }
  .metric-val.amber { color: #fbbf24; }
  .metric-val.green { color: #4ade80; }

  .section-title {
    font-size: 10px;
    font-family: var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 1rem 0 0.5rem;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }

  .rate-header {
    font-family: var(--mono);
    font-size: 12px;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
    color: var(--muted);
  }

  .rate-bar-wrap {
    background: var(--surface2);
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
  }

  .rate-bar { height: 100%; border-radius: 4px; transition: width 0.3s, background 0.3s; }

  .rate-status {
    font-size: 10px;
    margin-top: 4px;
    font-family: var(--mono);
  }

  .blocked-list { min-height: 28px; }

  .empty { font-size: 11px; color: var(--muted); font-family: var(--mono); }

  .ip-tag {
    display: inline-block;
    font-family: var(--mono);
    font-size: 11px;
    background: var(--red-dim);
    color: #f87171;
    border: 1px solid #7f1d1d;
    border-radius: 4px;
    padding: 2px 8px;
    margin: 3px 3px 0 0;
    cursor: pointer;
    transition: background 0.15s;
  }

  .ip-tag:hover { background: #5a1010; }

  .incident {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.6rem 0.75rem;
    margin-bottom: 0.5rem;
    background: var(--surface);
    font-size: 12px;
  }

  .incident-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .incident-type {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    color: #f87171;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .incident-time { font-size: 10px; color: var(--muted); font-family: var(--mono); }
  .incident-detail { color: var(--muted); font-size: 11px; }

  .sev {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .sev.high { background: var(--red); }
  .sev.med  { background: var(--amber); }
  .sev.low  { background: var(--cyan); }
</style>

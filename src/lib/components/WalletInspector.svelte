<script lang="ts">
  import { inspectProvider } from "../engine/attacks";
  import type { FingerprintResult } from "../engine/types";

  let results: FingerprintResult[] = [];
  let connecting = false;

  async function connect(type: "real" | "fake") {
    connecting = true;
    results = inspectProvider(type);
    await new Promise((r) => setTimeout(r, 500));
    connecting = false;
  }

  const trusted = (r: FingerprintResult) => r.ok;
</script>

<div class="wallet-inspector">
  <div class="intro">
    The PREPARE phase pre-registers the legitimate MetaMask fingerprint. When a
    wallet connects, we compare the live provider object against the stored
    profile. Connect one of the providers below to see detection in action.
  </div>

  <div class="section-title">Available providers</div>

  <div class="wallet-box">
    <div class="wallet-icon ok">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    </div>
    <div>
      <div class="wallet-name">MetaMask (legitimate)</div>
      <div class="wallet-detail">
        isMetaMask: true · chainId: 0x7a69 · methods: 12
      </div>
    </div>
    <button
      class="connect-btn ok"
      disabled={connecting}
      on:click={() => connect("real")}>Connect</button
    >
  </div>

  <div class="wallet-box">
    <div class="wallet-icon bad">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        />
        <line x1="12" y1="9" x2="12" y2="13" /><line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
        />
      </svg>
    </div>
    <div>
      <div class="wallet-name">Rogue extension (spoof)</div>
      <div class="wallet-detail">
        isMetaMask: true · chainId: 0x1 · methods: 3
      </div>
    </div>
    <button
      class="connect-btn bad"
      disabled={connecting}
      on:click={() => connect("fake")}>Connect</button
    >
  </div>

  {#if results.length > 0}
    <div class="section-title">Fingerprint comparison</div>
    <table class="fp-table">
      {#each results as r}
        <tr>
          <td class="field">{r.field}</td>
          <td class="expected">{r.expected}</td>
          <td class={r.ok ? "ok-val" : "bad-val"}>{r.got}</td>
          <td class="verdict-cell">{r.ok ? "✔" : "✘"}</td>
        </tr>
      {/each}
      <tr class="verdict-row">
        <td colspan="3" class="field">Overall verdict</td>
        <td
          class={results.every(trusted) ? "ok-val verdict" : "bad-val verdict"}
        >
          {results.every(trusted) ? "TRUSTED" : "BLOCKED"}
        </td>
      </tr>
    </table>
  {/if}
</div>

<style>
  .wallet-inspector {
    padding: 1rem;
  }

  .intro {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 1rem;
    line-height: 1.6;
  }

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

  .wallet-box {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    background: var(--surface);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .wallet-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .wallet-icon.ok {
    background: var(--green-dim);
  }
  .wallet-icon.bad {
    background: var(--red-dim);
  }

  .wallet-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .wallet-detail {
    font-size: 11px;
    color: var(--muted);
    font-family: var(--mono);
    margin-top: 2px;
  }

  .connect-btn {
    margin-left: auto;
    padding: 0.45rem 0.75rem;
    border-radius: 5px;
    border: 1px solid;
    font-size: 11px;
    font-family: var(--mono);
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: background 0.15s;
  }

  .connect-btn.ok {
    border-color: var(--green);
    background: var(--green-dim);
    color: #4ade80;
  }
  .connect-btn.bad {
    border-color: var(--red);
    background: var(--red-dim);
    color: #f87171;
  }
  .connect-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .fp-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--mono);
    font-size: 11px;
    margin-top: 0.5rem;
  }

  .fp-table td {
    padding: 4px 6px;
    border-bottom: 1px solid var(--border);
  }
  .field {
    color: var(--muted);
    width: 35%;
  }
  .expected {
    color: var(--muted);
    width: 30%;
  }
  .ok-val {
    color: #4ade80;
  }
  .bad-val {
    color: #f87171;
  }

  .verdict-cell {
    text-align: center;
  }

  .verdict-row td {
    padding-top: 8px;
    border-bottom: none;
  }
  .verdict {
    font-weight: 700;
    font-size: 12px;
  }
</style>

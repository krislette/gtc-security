<script lang="ts">
  import { activeTab } from "../stores/security";
  import { runProviderSpoof, runVoteSpam } from "../engine/attacks";

  let spoofRunning = false;
  let voteRunning = false;

  async function launchSpoof() {
    if (spoofRunning) return;
    spoofRunning = true;
    await runProviderSpoof();
    spoofRunning = false;
  }

  async function launchVoteSpam() {
    if (voteRunning) return;
    voteRunning = true;
    await runVoteSpam();
    voteRunning = false;
  }
</script>

<aside class="panel">
  <div class="panel-header">
    <span>Attack Vectors</span>
    <span class="red">3 simulated</span>
  </div>

  <div class="panel-body">
    <div class="vector-card">
      <div class="vector-header">
        <div class="vector-icon red">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7z"
            />
            <line x1="12" y1="8" x2="12" y2="12" /><line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
            />
          </svg>
        </div>
        <div>
          <div class="vector-title">Provider Spoofing</div>
          <div class="vector-sub">Wallet / MetaMask layer</div>
        </div>
        <div class="vector-phase">Prepare<br />→ Detect<br />→ Respond</div>
      </div>
      <div class="vector-body">
        A rogue browser extension injects a fake <code>window.ethereum</code>
        provider. The guard fingerprints the real MetaMask and compares at connection
        time, blocking any impersonator before a transaction is signed.
        <button
          class="attack-btn"
          class:running={spoofRunning}
          disabled={spoofRunning}
          on:click={launchSpoof}
        >
          {spoofRunning ? "⟳ Running…" : "▶ Launch Provider Spoof"}
        </button>
      </div>
    </div>

    <div class="vector-card">
      <div class="vector-header">
        <div class="vector-icon amber">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="16 18 22 12 16 6" /><polyline
              points="8 6 2 12 8 18"
            />
          </svg>
        </div>
        <div>
          <div class="vector-title">Proposal Injection</div>
          <div class="vector-sub">ProposeTab input layer</div>
        </div>
        <div class="vector-phase">Prepare<br />→ Detect<br />→ Respond</div>
      </div>
      <div class="vector-body">
        Malicious payloads (XSS, oversized strings, invalid katakana) submitted
        via the proposal form. Since on-chain writes are immutable, we validate
        and sanitize before the transaction fires. This prevents garbage data
        from becoming permanent.
        <button class="attack-btn" on:click={() => activeTab.set("propose")}>
          ▶ Open Injection Tester
        </button>
      </div>
    </div>

    <div class="vector-card">
      <div class="vector-header">
        <div class="vector-icon blue">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="1 4 1 10 7 10" /><path
              d="M3.51 15a9 9 0 1 0 .49-5.1L1 10"
            />
          </svg>
        </div>
        <div>
          <div class="vector-title">Vote Replay Spam</div>
          <div class="vector-sub">VoteTab / contract layer</div>
        </div>
        <div class="vector-phase">Prepare<br />→ Detect<br />→ Respond</div>
      </div>
      <div class="vector-body">
        A script hammers the vote function to drain gas from a wallet. Even
        though the contract rejects double-votes, each attempt costs gas. We
        track request rate and apply exponential backoff plus a session lock.
        <button
          class="attack-btn"
          class:running={voteRunning}
          disabled={voteRunning}
          on:click={launchVoteSpam}
        >
          {voteRunning ? "⟳ Replaying…" : "▶ Launch Vote Replay"}
        </button>
      </div>
    </div>
  </div>
</aside>

<style>
  .panel {
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 320px;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    flex-shrink: 0;
  }

  .red {
    color: #f87171;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .vector-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    overflow: hidden;
    background: var(--surface);
    transition: border-color 0.2s;
  }

  .vector-card:hover {
    border-color: var(--border2);
  }

  .vector-header {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .vector-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .vector-icon.red {
    background: var(--red-dim);
  }
  .vector-icon.amber {
    background: var(--amber-dim);
  }
  .vector-icon.blue {
    background: var(--accent-dim);
  }

  .vector-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }
  .vector-sub {
    font-size: 11px;
    color: var(--muted);
    margin-top: 1px;
  }

  .vector-phase {
    margin-left: auto;
    font-size: 10px;
    font-family: var(--mono);
    color: var(--muted);
    text-align: right;
  }

  .vector-body {
    padding: 0 1rem 0.75rem;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
  }

  .attack-btn {
    display: block;
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border2);
    background: var(--surface2);
    color: var(--text);
    font-size: 12px;
    font-family: var(--mono);
    cursor: pointer;
    letter-spacing: 0.05em;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .attack-btn:hover:not(:disabled) {
    background: var(--red-dim);
    border-color: #7f1d1d;
    color: #f87171;
  }

  .attack-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .attack-btn.running {
    background: var(--amber-dim);
    border-color: var(--amber);
    color: #fbbf24;
    animation: blink 0.7s infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0.6;
    }
  }
</style>

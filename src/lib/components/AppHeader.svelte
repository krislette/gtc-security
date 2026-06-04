<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { metrics } from "../stores/security";

  let clock = "00:00:00";
  let startTime = Date.now();
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      clock = `${h}:${m}:${s}`;
    }, 1000);
  });

  onDestroy(() => clearInterval(interval));
</script>

<header>
  <div class="logo">語典チェーン · <span>Security Simulation</span></div>
  <div class="status-bar">
    <div class="status-item">
      <div class="dot" />
      <span>MONITORING</span>
    </div>
    <div class="status-item muted">
      THREATS: <span class="red">{$metrics.threats}</span>
    </div>
    <div class="status-item muted">
      BLOCKED: <span class="amber">{$metrics.blocked}</span>
    </div>
    <div class="status-item muted">{clock}</div>
  </div>
</header>

<style>
  header {
    border-bottom: 1px solid var(--border);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--surface);
    flex-shrink: 0;
  }

  .logo {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .logo span { color: var(--muted); }

  .status-bar {
    margin-left: auto;
    display: flex;
    gap: 1.5rem;
    font-size: 12px;
    font-family: var(--mono);
  }

  .status-item { display: flex; align-items: center; gap: 6px; }
  .muted { color: var(--muted); }
  .red { color: var(--red); }
  .amber { color: var(--amber); }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>

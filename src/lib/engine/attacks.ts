import { logs, metrics, blocklist, incidents, activeTab, voteRateInfo } from "../stores/security";
import {
  TRUSTED_FINGERPRINT,
  KNOWN_BLOCKLIST,
  VALIDATION_SCHEMA,
  VOTE_RATE_LIMIT,
  VOTE_WINDOW_MS,
  MAX_VOTE_ATTEMPTS,
  ROGUE_PROVIDER,
} from "./constants";
import type { ProviderFingerprint, FingerprintResult, ProposalField, ProposalValues } from "./types";
import { get } from "svelte/store";

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export async function runProviderSpoof(): Promise<void> {
  const spoofIP = "192.168.99.254";
  const spoofWallet = "0xDEAD000000000000000000000000000000000000";
  activeTab.set("log");

  logs.add("info", "INFO", `Provider guard initialized. Trusted fingerprint loaded into memory.`, "① PREPARE");
  logs.add("info", "INFO", `Blocklist loaded: ${KNOWN_BLOCKLIST.size} known malicious addresses`);
  metrics.increment("events");

  await delay(800);
  logs.add("warn", "WARN", `Incoming connection request from <b>${spoofIP}</b>`, "② DETECT");
  metrics.increment("events");

  await delay(600);
  logs.add("warn", "WARN", "Fingerprinting injected provider object…");
  metrics.increment("events");

  await delay(600);
  logs.add("danger", "DANGER", `chainId mismatch: expected 0x7a69, got <b>${ROGUE_PROVIDER.chainId}</b>`);
  metrics.increment("events");

  await delay(500);
  logs.add("danger", "DANGER", `Method count anomaly: expected 12, got <b>${ROGUE_PROVIDER.methodCount}</b>`);
  metrics.increment("events");

  await delay(500);
  logs.add("danger", "DANGER", `Provider hash mismatch: got <b>${ROGUE_PROVIDER.hash}</b>, expected mm_v10_7a69_canonical`);
  metrics.increment("events");

  await delay(500);
  logs.add("danger", "DANGER", `Address ${spoofWallet.slice(0, 14)}… found in known blocklist`);
  metrics.increment("events");

  await delay(700);
  logs.add("block", "BLOCK", `Connection from <b>${spoofIP}</b> REJECTED. Provider fingerprint is invalid.`, "③ RESPOND");
  blocklist.add(spoofIP);
  metrics.increment("blocked");
  metrics.increment("threats");
  incidents.add({ type: "PROVIDER_SPOOF", detail: `Rogue provider from ${spoofIP} — fingerprint mismatch`, severity: "high" });
  metrics.increment("events");

  await delay(800);
  logs.add("success", "MITIGATE", "Mitigation complete — connection aborted, user alerted, IP blocked");
  metrics.increment("mitigated");
  metrics.increment("events");
}

export function inspectProvider(type: "real" | "fake"): FingerprintResult[] {
  const provider: ProviderFingerprint = type === "real" ? TRUSTED_FINGERPRINT : ROGUE_PROVIDER;

  const results: FingerprintResult[] = [
    {
      field: "isMetaMask",
      expected: String(TRUSTED_FINGERPRINT.isMetaMask),
      got: String(provider.isMetaMask),
      ok: provider.isMetaMask === TRUSTED_FINGERPRINT.isMetaMask,
    },
    {
      field: "chainId",
      expected: TRUSTED_FINGERPRINT.chainId,
      got: provider.chainId,
      ok: provider.chainId === TRUSTED_FINGERPRINT.chainId,
    },
    {
      field: "methodCount",
      expected: String(TRUSTED_FINGERPRINT.methodCount),
      got: String(provider.methodCount),
      ok: provider.methodCount === TRUSTED_FINGERPRINT.methodCount,
    },
    {
      field: "isUnlocked",
      expected: String(TRUSTED_FINGERPRINT.isUnlocked),
      got: String(provider.isUnlocked),
      ok: provider.isUnlocked === TRUSTED_FINGERPRINT.isUnlocked,
    },
    {
      field: "hash",
      expected: TRUSTED_FINGERPRINT.hash,
      got: provider.hash,
      ok: provider.hash === TRUSTED_FINGERPRINT.hash,
    },
  ];

  const trusted = results.every((r) => r.ok);

  if (trusted) {
    logs.add("success", "OK", "Provider fingerprint verified — MetaMask legitimate, connection allowed");
    metrics.increment("mitigated");
  } else {
    logs.add("block", "BLOCK", "Provider fingerprint FAILED — rogue extension detected, connection rejected");
    incidents.add({ type: "PROVIDER_SPOOF", detail: "Wallet inspector: fingerprint mismatch on manual connect", severity: "high" });
    blocklist.add("rogue-ext-session");
    metrics.increment("blocked");
    metrics.increment("threats");
  }

  metrics.increment("events");
  activeTab.set("log");
  return results;
}

export interface FieldError {
  field: ProposalField;
  message: string;
}

export function validateProposal(values: ProposalValues): FieldError[] {
  const errors: FieldError[] = [];

  (Object.keys(VALIDATION_SCHEMA) as ProposalField[]).forEach((field) => {
    const val = values[field];
    const rule = VALIDATION_SCHEMA[field];

    if (!val) {
      errors.push({ field, message: "Required" });
    } else if (val.length > rule.max) {
      errors.push({ field, message: `Max ${rule.max} chars (got ${val.length})` });
    } else if (!rule.pattern.test(val)) {
      errors.push({ field, message: rule.label });
    }
  });

  return errors;
}

export function submitProposal(values: ProposalValues): void {
  logs.add("info", "INFO", "Proposal submission intercepted — running pre-tx validation guard", "① PREPARE → ② DETECT");
  metrics.increment("events");

  const errors = validateProposal(values);

  if (errors.length > 0) {
    logs.add("danger", "DANGER", "Validation FAILED — malicious or invalid content detected");
    metrics.increment("events");

    errors.forEach((e) => {
      logs.add("danger", "DANGER", `Field <b>${e.field}</b>: ${e.message}`);
      metrics.increment("events");
    });

    logs.add("block", "BLOCK", "Transaction ABORTED — proposal rejected before reaching ethers.js", "③ RESPOND");
    incidents.add({ type: "PROPOSAL_INJECTION", detail: "Malicious field content blocked pre-tx", severity: "med" });
    metrics.increment("blocked");
    metrics.increment("threats");
    metrics.increment("events");
  } else {
    logs.add("success", "OK", "All fields passed validation — proposal sanitized and safe to submit", "③ RESPOND");
    logs.add("success", "MITIGATE", "Proposal forwarded to ethers.js → GotenChain.proposeEntry() — clean tx");
    metrics.increment("mitigated");
    metrics.increment("events");
  }
}

export async function runVoteSpam(): Promise<void> {
  const attackerWallet = "0xBAD1fa75C3A8D28cC0F43b73a8FDE28B4F3eE1a9";
  const attempts: number[] = [];
  let attemptCount = 0;
  activeTab.set("log");

  logs.add("info", "INFO", `Vote rate limiter armed — threshold: ${VOTE_RATE_LIMIT} req / ${VOTE_WINDOW_MS / 1000}s`, "① PREPARE");
  logs.add("info", "INFO", `Attacker wallet: ${attackerWallet}`);
  metrics.increment("events");

  await new Promise<void>((resolve) => {
    const interval = setInterval(async () => {
      attemptCount++;
      const now = Date.now();
      attempts.push(now);

      const windowedAttempts = attempts.filter((t) => now - t < VOTE_WINDOW_MS);
      const rate = windowedAttempts.length;
      const locked = attemptCount >= MAX_VOTE_ATTEMPTS;

      voteRateInfo.set({ rate, locked });
      metrics.increment("events");

      if (rate <= VOTE_RATE_LIMIT) {
        logs.add("info", "INFO", `Vote attempt #${attemptCount} from ${attackerWallet.slice(0, 12)}… — rate: ${rate}/${VOTE_WINDOW_MS / 1000}s`, attemptCount === 1 ? "② DETECT" : undefined);
      } else if (!locked) {
        const backoff = Math.pow(2, rate - VOTE_RATE_LIMIT) * 200;
        logs.add("warn", "WARN", `Attempt #${attemptCount} — rate ${rate}/${VOTE_WINDOW_MS / 1000}s exceeds threshold — backoff ${backoff}ms`);
      }

      if (locked) {
        clearInterval(interval);

        await delay(200);
        logs.add("block", "BLOCK", `Vote session from ${attackerWallet.slice(0, 14)}… LOCKED — ${attemptCount} attempts in ${VOTE_WINDOW_MS / 1000}s`, "③ RESPOND");
        blocklist.add(`${attackerWallet.slice(0, 18)}…`);
        incidents.add({ type: "VOTE_REPLAY_SPAM", detail: `${attemptCount} vote attempts from ${attackerWallet.slice(0, 12)}…`, severity: "high" });
        metrics.increment("blocked");
        metrics.increment("threats");

        await delay(1000);
        logs.add("success", "MITIGATE", "Session locked, wallet flagged, exponential backoff applied — gas drain prevented");
        metrics.increment("mitigated");

        await delay(8000);
        voteRateInfo.set({ rate: 0, locked: false });
        logs.add("info", "INFO", "Rate limiter reset — session unlocked for re-demonstration");
        resolve();
      }
    }, 900);
  });
}

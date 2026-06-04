import type { ProviderFingerprint, ValidationRule, ProposalField } from "./types";

export const TRUSTED_FINGERPRINT: ProviderFingerprint = {
  isMetaMask: true,
  chainId: "0x7a69",
  methodCount: 12,
  isUnlocked: true,
  hash: "mm_v10_7a69_canonical",
};

export const KNOWN_BLOCKLIST = new Set([
  "192.168.99.254",
  "10.0.0.666",
  "0xDEAD000000000000000000000000000000000000",
]);

export const VALIDATION_SCHEMA: Record<ProposalField, ValidationRule> = {
  kata: {
    max: 64,
    pattern: /^[\u30A0-\u30FF\u30FCー\s]+$/,
    label: "Katakana only (カタカナ)",
  },
  romaji: {
    max: 64,
    pattern: /^[a-z\s\-']+$/i,
    label: "Latin characters only",
  },
  meaning: {
    max: 256,
    pattern: /^[^<>"'`;]+$/,
    label: "No script or quote characters",
  },
  source: {
    max: 128,
    pattern: /^[^<>"'`;]+$/,
    label: "No script or quote characters",
  },
};

export const VOTE_RATE_LIMIT = 3;
export const VOTE_WINDOW_MS = 10_000;
export const MAX_VOTE_ATTEMPTS = 8;

export const ROGUE_PROVIDER: ProviderFingerprint = {
  isMetaMask: true,
  chainId: "0x1",
  methodCount: 3,
  isUnlocked: false,
  hash: "UNKNOWN_PROVIDER",
};

export const INJECTION_PAYLOADS: Record<string, Record<string, string>> = {
  xss: {
    kata: '<script>alert(document.cookie)</script>',
    romaji: "xss",
    meaning: '<img src=x onerror=alert(1)>',
    source: "malicious",
  },
  overflow: {
    kata: "コ".repeat(300),
    romaji: "a".repeat(300),
    meaning: "x".repeat(2048),
    source: "overflow",
  },
  invalid: {
    kata: "Hello World 123 !@#",
    romaji: "日本語テスト",
    meaning: "normal",
    source: "normal",
  },
  sql: {
    kata: "コーヒー'; DROP TABLE entries;--",
    romaji: "coffee' OR '1'='1",
    meaning: "normal",
    source: "normal",
  },
};

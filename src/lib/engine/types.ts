export type Severity = "high" | "med" | "low";
export type LogType = "info" | "warn" | "danger" | "block" | "success";
export type LogTag = "INFO" | "WARN" | "DANGER" | "BLOCK" | "OK" | "MITIGATE";

export interface LogEntry {
  id: number;
  time: string;
  type: LogType;
  tag: LogTag;
  msg: string;
  phase?: string;
}

export interface Incident {
  type: string;
  detail: string;
  severity: Severity;
  time: string;
}

export interface ProviderFingerprint {
  isMetaMask: boolean;
  chainId: string;
  methodCount: number;
  isUnlocked: boolean;
  hash: string;
}

export interface FingerprintResult {
  field: keyof ProviderFingerprint;
  expected: string;
  got: string;
  ok: boolean;
}

export interface ValidationRule {
  max: number;
  pattern: RegExp;
  label: string;
}

export type ProposalField = "kata" | "romaji" | "meaning" | "source";

export interface ProposalValues {
  kata: string;
  romaji: string;
  meaning: string;
  source: string;
}

export type ActiveTab = "log" | "wallet" | "propose";

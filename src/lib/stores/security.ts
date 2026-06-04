import { writable, derived } from "svelte/store";
import type { LogEntry, Incident, ActiveTab } from "../engine/types";

function timestamp(): string {
  return new Date()
    .toTimeString()
    .slice(0, 8);
}

let logCounter = 0;

function createLogStore() {
  const { subscribe, update, set } = writable<LogEntry[]>([]);

  function add(
    type: LogEntry["type"],
    tag: LogEntry["tag"],
    msg: string,
    phase?: string
  ) {
    update((entries) => [
      ...entries,
      { id: logCounter++, time: timestamp(), type, tag, msg, phase },
    ]);
  }

  return { subscribe, add, clear: () => set([]) };
}

function createMetricsStore() {
  const { subscribe, update } = writable({
    events: 0,
    threats: 0,
    blocked: 0,
    mitigated: 0,
  });

  return {
    subscribe,
    increment: (key: "events" | "threats" | "blocked" | "mitigated") =>
      update((m) => ({ ...m, [key]: m[key] + 1 })),
    decrement: (key: "blocked") =>
      update((m) => ({ ...m, [key]: Math.max(0, m[key] - 1) }),
    ),
  };
}

function createBlocklistStore() {
  const { subscribe, update } = writable<Set<string>>(new Set());

  return {
    subscribe,
    add: (target: string) =>
      update((s) => new Set([...s, target])),
    remove: (target: string) =>
      update((s) => { const n = new Set(s); n.delete(target); return n; }),
  };
}

function createIncidentStore() {
  const { subscribe, update } = writable<Incident[]>([]);

  return {
    subscribe,
    add: (incident: Omit<Incident, "time">) =>
      update((list) => [{ ...incident, time: timestamp() }, ...list].slice(0, 6)),
  };
}

export const logs = createLogStore();
export const metrics = createMetricsStore();
export const blocklist = createBlocklistStore();
export const incidents = createIncidentStore();
export const activeTab = writable<ActiveTab>("log");
export const voteRateInfo = writable({ rate: 0, locked: false });

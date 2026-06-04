<a id="readme-top"></a>

<div align="center">
  <h1>語典チェーン · Security Simulation</h1>
  <p align="center">
    A threat detection and mitigation simulation built on top of the GotenChain Web3 voting application
    <br />
    <a href="#features">Features</a>
    ·
    <a href="#setup">Setup</a>
    ·
    <a href="#project-structure">Structure</a>
    ·
    <a href="#attack-vectors">Attack Vectors</a>
  </p>
</div>

## About The Project

語典チェーン Security Simulation is a browser-based security dashboard that models three realistic attack vectors targeting the [GotenChain](https://github.com/krislette/gotenchen) Web3 voting application. Built with Svelte 4, TypeScript, and Vite, it simulates provider spoofing, proposal injection, and vote replay spam, each paired with a detection and mitigation strategy following a Prepare, Detect, Respond framework. All detection logic is implemented from first principles with no external security libraries, keeping the reasoning transparent and auditable.

## Table of Contents

1. [About The Project](#about-the-project)
2. [Features](#features)
3. [Attack Vectors](#attack-vectors)
4. [Technologies Used](#technologies-used)
5. [Setup](#setup)
6. [Project Structure](#project-structure)
7. [Website Snapshots](#website-snapshots)

## Features

- **Provider Spoofing Simulation**: Fingerprints the trusted MetaMask provider at startup and compares it field-by-field against any incoming connection, blocking rogue extensions before a transaction is signed
- **Proposal Injection Simulation**: Validates every form field against a strict schema (character limits, regex patterns per field type) before the transaction fires, with one-click injection of XSS, overflow, invalid katakana, and SQL-style payloads
- **Vote Replay Spam Simulation**: Tracks vote request rate in a sliding 10-second window, applies exponential backoff on threshold breach, and locks the session after 8 attempts
- **Real-time Event Log**: Color-coded, phase-labeled log stream (INFO, WARN, DANGER, BLOCK, OK, MITIGATE) with timestamps and fade-in animation per entry
- **Wallet Inspector**: Side-by-side fingerprint comparison table showing expected vs. actual provider fields with a TRUSTED or BLOCKED verdict
- **Proposal Validator**: Live per-keystroke field validation with green/red border states and a pre-tx submission guard
- **Security Metrics Panel**: Live counters for events, threats, blocked connections, and mitigations; a vote rate progress bar; a runtime blocklist with one-click unblock; and a recent incidents log
- **Terminal Aesthetic**: Dark monospace UI with a consistent Prepare, Detect, Respond phase structure across all simulations

## Attack Vectors

### Provider Spoofing

A malicious browser extension replaces `window.ethereum` with a fake provider that mimics MetaMask to intercept transaction signatures. The guard pre-registers the trusted MetaMask fingerprint (chainId, method count, unlock state, canonical hash) and compares it on every connection. Any mismatch rejects the connection, blocks the source IP, and records an incident.

### Proposal Injection

GotenChain entries are immutable once on-chain, making malicious submissions permanent. Every field is validated against a schema before reaching `ethers.js`: the katakana field accepts only Unicode katakana, romaji accepts only Latin characters, and meaning and source fields reject script-injection characters. Four pre-built payloads (XSS, overflow, invalid katakana, SQL-style) can be injected with one click to demonstrate detection.

### Vote Replay Spam

Each failed vote transaction still costs gas, so a script hammering the vote function can drain a wallet without ever succeeding on-chain. A rate limiter tracks attempts within a sliding 10-second window (threshold: 3 req/10s), applies exponential backoff on excess, and locks the session after 8 total attempts with the wallet flagged on the blocklist.

## Technologies Used

| Technology                                  | Purpose                               |
| ------------------------------------------- | ------------------------------------- |
| [Svelte 4](https://svelte.dev/) + TypeScript | Frontend framework and type safety    |
| [Vite](https://vitejs.dev/)                 | Build tool and dev server             |
| [GotenChain](https://github.com/krislette/goten-chain) | Base application the simulation targets |

## Setup

### Prerequisites

- Node.js 18+

### Installation

```bash
git clone https://github.com/krislette/gtc-security.git
cd gtc-security
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. No wallet, contract, or backend required.

## Project Structure

```bash
gotenchain-security/
├── index.html
├── src/
│   ├── main.ts
│   ├── App.svelte                        # Root layout: header, three-column main
│   └── lib/
│       ├── components/
│       │   ├── AppHeader.svelte          # Logo, monitoring status, live threat counters, clock
│       │   ├── AttackPanel.svelte        # Three attack vector cards with launch controls
│       │   ├── CenterPanel.svelte        # Tab bar: Event Log, Wallet Inspector, Proposal Validator
│       │   ├── EventLog.svelte           # Real-time phase-labeled log stream
│       │   ├── WalletInspector.svelte    # Provider fingerprint comparison table
│       │   ├── ProposalValidator.svelte  # Live-validated proposal form with injection presets
│       │   └── MetricsPanel.svelte       # Counters, rate bar, blocklist, incident log
│       ├── engine/
│       │   ├── attacks.ts                # Core simulation logic: runProviderSpoof, runVoteSpam, validateProposal, submitProposal, inspectProvider
│       │   ├── constants.ts              # Trusted fingerprint, blocklist seeds, validation schema, rate limit config, injection payloads
│       │   └── types.ts                  # TypeScript interfaces and type aliases
│       └── stores/
│           └── security.ts               # Svelte stores: logs, metrics, blocklist, incidents, activeTab, voteRateInfo
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Website Snapshots

### Attack Panel and Event Log


### Wallet Inspector


### Proposal Validator


### Metrics Panel


<p align="right"><a href="#readme-top">Back to top</a></p>

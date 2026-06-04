<script lang="ts">
  import { validateProposal, submitProposal } from "../engine/attacks";
  import { INJECTION_PAYLOADS, VALIDATION_SCHEMA } from "../engine/constants";
  import type { ProposalValues, ProposalField } from "../engine/types";

  let values: ProposalValues = {
    kata: "",
    romaji: "",
    meaning: "",
    source: "",
  };
  let errors: Record<ProposalField, string> = {
    kata: "",
    romaji: "",
    meaning: "",
    source: "",
  };

  const fields: { key: ProposalField; label: string; placeholder: string }[] = [
    { key: "kata", label: "Katakana (片仮名)", placeholder: "e.g. コーヒー" },
    { key: "romaji", label: "Romaji", placeholder: "e.g. koohii" },
    {
      key: "meaning",
      label: "Meaning / Definition",
      placeholder: "e.g. coffee (beverage)",
    },
    {
      key: "source",
      label: "Source word",
      placeholder: "e.g. coffee (English)",
    },
  ];

  function revalidate(field: ProposalField) {
    const val = values[field];
    const rule = VALIDATION_SCHEMA[field];
    if (!val) {
      errors[field] = "";
      return;
    }
    if (val.length > rule.max) {
      errors[field] = `Max ${rule.max} chars (got ${val.length})`;
      return;
    }
    if (!rule.pattern.test(val)) {
      errors[field] = rule.label;
      return;
    }
    errors[field] = "";
  }

  function fieldState(key: ProposalField): string {
    if (!values[key]) return "";
    return errors[key] ? "invalid" : "valid";
  }

  function injectPayload(type: string) {
    const payload = INJECTION_PAYLOADS[type];
    if (!payload) return;
    (Object.keys(payload) as ProposalField[]).forEach((f) => {
      values[f] = payload[f];
      revalidate(f);
    });
    values = { ...values };
  }

  function handleSubmit() {
    fields.forEach((f) => revalidate(f.key));
    submitProposal(values);
  }
</script>

<div class="proposal-form">
  <div class="intro">
    The PREPARE phase defines the validation schema. Every keystroke runs the
    DETECT phase in real time. Submitting triggers the RESPOND phase. Clean
    inputs proceed, while malicious ones are logged and blocked before reaching
    <code>ethers.js</code>.
  </div>

  {#each fields as f}
    <div class="field-row">
      <div class="field-label">
        <span>{f.label}</span>
        {#if errors[f.key]}<span class="field-error">{errors[f.key]}</span>{/if}
      </div>
      <input
        class="field-input {fieldState(f.key)}"
        type="text"
        placeholder={f.placeholder}
        bind:value={values[f.key]}
        on:input={() => revalidate(f.key)}
      />
    </div>
  {/each}

  <button class="propose-btn" on:click={handleSubmit}>
    Submit Proposal (simulate tx)
  </button>

  <div class="inject-section">
    <div class="inject-title">Inject malicious payloads</div>
    <button class="injection-btn" on:click={() => injectPayload("xss")}>
      Inject XSS payload (&lt;script&gt;alert(1)&lt;/script&gt;)
    </button>
    <button class="injection-btn" on:click={() => injectPayload("overflow")}>
      Inject oversized string (2048+ chars)
    </button>
    <button class="injection-btn" on:click={() => injectPayload("invalid")}>
      Inject invalid katakana (ASCII garbage)
    </button>
    <button class="injection-btn" on:click={() => injectPayload("sql")}>
      Inject SQL-style string (' OR 1=1 --)
    </button>
  </div>
</div>

<style>
  .proposal-form {
    padding: 1rem;
  }

  .intro {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .field-row {
    margin-bottom: 0.75rem;
  }

  .field-label {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
  }

  .field-error {
    font-size: 10px;
    color: #f87171;
    font-family: var(--mono);
  }

  .field-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    padding: 6px 8px;
    outline: none;
    transition: border-color 0.15s;
  }

  .field-input:focus {
    border-color: var(--accent);
  }
  .field-input.invalid {
    border-color: var(--red);
  }
  .field-input.valid {
    border-color: var(--green);
  }

  .propose-btn {
    width: 100%;
    padding: 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--accent);
    background: var(--accent-dim);
    color: #93c5fd;
    font-size: 12px;
    font-family: var(--mono);
    cursor: pointer;
    letter-spacing: 0.06em;
    transition: background 0.15s;
    margin-top: 0.25rem;
  }

  .propose-btn:hover {
    background: #1e40af;
  }

  .inject-section {
    margin-top: 1.25rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .inject-title {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 0.5rem;
    font-family: var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .injection-btn {
    display: block;
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #7f1d1d;
    background: var(--red-dim);
    color: #f87171;
    font-size: 11px;
    font-family: var(--mono);
    cursor: pointer;
    letter-spacing: 0.05em;
    margin-top: 0.4rem;
    transition: background 0.15s;
    text-align: left;
  }

  .injection-btn:hover {
    background: #5a1010;
  }
</style>

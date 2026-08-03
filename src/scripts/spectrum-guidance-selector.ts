export {};

type SpectrumLevel = {
  condition: string;
  doubt: string;
  full: Array<{
    points: string[];
    title?: string;
  }>;
  grip: string;
  id: string;
  title: string;
};

const levels: SpectrumLevel[] = [
  {
    id: "light",
    title: "Light",
    condition: "Both dials low",
    grip:
      "Every step loosens one notch, except the one with your name on it. Guided becomes Assist, Human only becomes Guided.",
    doubt:
      "Your own judgement, as you go. Nobody’s decision rides on this: a scan to orient yourself, old notes tidied, a quick internal pulse.",
    full: [
      {
        points: [
          "Synthetic respondents are fine here for stress-testing an idea, because nothing claims to speak for real people.",
          "No disclosure needed beyond your own notes.",
          "You are still the one who decides it is good enough.",
        ],
      },
    ],
  },
  {
    id: "standard",
    title: "Standard",
    condition: "Includes everything in Light",
    grip:
      "No shift. Every phase sits exactly where the previous section put it. No tightening, and no slack either.",
    doubt:
      "You check your own work, then your lead checks it before it leaves. One round from inside your own line.",
    full: [
      {
        points: [
          'The "so what" test.',
          "The research objective is written by a human.",
          "The final recommendation is authored by a human.",
          "A one-line AI note in the method section.",
          "Lead reviews before delivery.",
        ],
      },
    ],
  },
  {
    id: "elevated",
    title: "Elevated",
    condition: "Includes everything in Standard",
    grip:
      "Every step not already Human only tightens one notch. Automate becomes Assist, Guided becomes Human only. In practice, meaning-making comes back to a person.",
    doubt:
      "Claims stop being taken on trust, yours or the model’s. You prove them against the raw data, and someone senior looks before it goes out.",
    full: [
      {
        title: "Because stakes are high",
        points: [
          "Check 10 to 15% against raw data by hand.",
          "Cross-check for hallucinations.",
          "Short AI-use summary for stakeholders, naming the phases.",
          "Whatever stays in Automate must be checkable against a source.",
          "Senior reviewer at synthesis.",
        ],
      },
      {
        title: "Because sensitivity is high",
        points: [
          "Interviews run in the language people actually think in.",
          "A human checks transcription and translation against the recording, for tone as well as accuracy.",
          "A culturally fluent researcher consulted.",
        ],
      },
    ],
  },
  {
    id: "critical",
    title: "Critical",
    condition: "Includes everything in Elevated",
    grip:
      "Tighten again. Assist becomes Guided, and what little AI still touches has to be traceable to a source. Human only is now most of the workflow, and at high sensitivity it reaches into data collection too.",
    doubt:
      "Checking that you are right is no longer enough. You go looking for what would kill the finding, and someone outside your team looks with you.",
    full: [
      {
        title: "Because stakes are high",
        points: [
          "Actively hunt for contradicting evidence.",
          "Full methodology appendix.",
          "Mark AI vs human content throughout.",
          "Every remaining AI use has a reason someone can state.",
          "A reviewer from outside the team.",
          "Senior co-author from day one.",
        ],
      },
      {
        title: "Because sensitivity is high",
        points: [
          "No AI translation of primary material. A bilingual researcher does it.",
          "A named cultural advisor.",
          "Field-check any AI read of culture.",
          "Someone who knows the community is close to the work before you interpret it.",
        ],
      },
    ],
  },
];

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --selector-accent: var(--color-accent, #4849c4);
      --selector-accent-2: var(--color-accent-2, #7164bc);
      --selector-accent-3: var(--color-accent-3, #d5a7aa);
      --selector-bg: var(--color-bg, #fefdfb);
      --selector-border: var(--color-border, #d8d8d8);
      --selector-muted: var(--color-muted, #5d5d5d);
      --selector-surface: var(--color-surface, #f7f7f7);
      --selector-text: var(--color-text, #343131);
      display: block;
      margin-block: 2rem 2.5rem;
    }

    .selector {
      color: var(--selector-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      hyphens: none;
      text-align: left;
      word-break: normal;
    }

    .rail {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 1.5rem;
      position: relative;
    }

    .rail::before {
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--selector-accent) 10%, var(--selector-bg)),
        color-mix(in srgb, var(--selector-accent-2) 58%, var(--selector-bg))
      );
      border-radius: 999px;
      content: "";
      height: 0.2rem;
      left: 12.5%;
      position: absolute;
      right: 12.5%;
      top: 0.525rem;
    }

    .level-button {
      align-items: center;
      appearance: none;
      background: transparent;
      border: 0;
      color: color-mix(in srgb, var(--selector-accent-2) 66%, var(--selector-text));
      cursor: pointer;
      display: grid;
      font: inherit;
      font-size: var(--text-small, 0.8rem);
      font-weight: 720;
      gap: 0.45rem;
      justify-items: center;
      min-width: 0;
      padding: 0;
      position: relative;
      z-index: 1;
    }

    .level-button__marker {
      background: var(--selector-bg);
      border: 2px solid color-mix(in srgb, var(--selector-accent-2) 20%, var(--selector-border));
      border-radius: 50%;
      box-sizing: border-box;
      height: 1.25rem;
      transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
      width: 1.25rem;
    }

    .level-button:hover .level-button__marker,
    .level-button:focus-visible .level-button__marker {
      border-color: var(--selector-accent);
      transform: scale(1.08);
    }

    .level-button:focus-visible {
      outline: 2px solid var(--selector-accent);
      outline-offset: 0.3rem;
    }

    .level-button[aria-selected="true"] {
      color: var(--selector-accent);
    }

    .level-button[aria-selected="true"] .level-button__marker {
      animation: selected-node-pulse 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
      background: var(--selector-accent);
      border-color: var(--selector-accent);
      height: 1.7rem;
      margin-block: -0.225rem;
      will-change: box-shadow, transform;
      width: 1.7rem;
    }

    .panel {
      animation: panel-in 220ms ease-out;
      border: 1px solid var(--selector-border);
      display: grid;
      gap: clamp(1rem, 3vw, 2rem);
      grid-template-columns: clamp(4.5rem, 14%, 7rem) minmax(0, 1fr);
      padding: clamp(1rem, 3vw, 2rem);
    }

    .panel[hidden] {
      display: none;
    }

    .panel[data-spectrum-panel="light"] {
      --signal-core-size: 0.85rem;
      --signal-ring-1: 0rem;
      --signal-ring-2: 0rem;
    }

    .panel[data-spectrum-panel="standard"] {
      --signal-core-size: 1.1rem;
      --signal-ring-1: 0.28rem;
      --signal-ring-2: 0.5rem;
    }

    .panel[data-spectrum-panel="elevated"] {
      --signal-core-size: 1.35rem;
      --signal-ring-1: 0.42rem;
      --signal-ring-2: 0.75rem;
    }

    .panel[data-spectrum-panel="critical"] {
      --signal-core-size: 1.6rem;
      --signal-ring-1: 0.58rem;
      --signal-ring-2: 1.02rem;
    }

    .panel__signal {
      align-self: start;
      aspect-ratio: 1;
      border: 1px dashed color-mix(in srgb, var(--selector-accent) 14%, transparent);
      border-radius: 50%;
      display: grid;
      margin-inline: auto;
      max-width: 5.5rem;
      place-items: center;
      position: relative;
      width: 100%;
    }

    .panel__signal::before,
    .panel__signal::after {
      border-radius: 50%;
      content: "";
      position: absolute;
    }

    .panel__signal::before {
      background: var(--selector-accent);
      box-shadow:
        0 0 0 var(--signal-ring-1) color-mix(in srgb, var(--selector-accent-2) 48%, var(--selector-bg)),
        0 0 0 var(--signal-ring-2) color-mix(in srgb, var(--selector-accent-3) 38%, var(--selector-bg)),
        0 0 1.25rem color-mix(in srgb, var(--selector-accent) 24%, transparent);
      height: var(--signal-core-size);
      width: var(--signal-core-size);
    }

    .panel__signal::after {
      border: 1px dotted color-mix(in srgb, var(--selector-accent-2) 22%, transparent);
      height: 72%;
      width: 72%;
    }

    .panel__content {
      min-width: 0;
    }

    .panel__title {
      color: var(--selector-accent);
      font-size: var(--text-h6, 1.25rem);
      line-height: 1.15;
      margin: 0 0 0.35rem;
    }

    .panel__condition {
      color: var(--selector-muted);
      font-size: var(--text-small, 0.8rem);
      font-weight: 760;
      letter-spacing: 0.025em;
      margin: 0 0 1.35rem;
      text-transform: uppercase;
    }

    .panel__section + .panel__section {
      margin-top: 1.25rem;
    }

    .panel__eyebrow {
      color: var(--selector-accent);
      display: block;
      font-size: var(--text-tiny, 0.64rem);
      font-weight: 800;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
    }

    .panel__statement {
      color: var(--selector-accent);
      font-size: var(--text-base, 1rem);
      font-weight: 650;
      line-height: 1.45;
      margin: 0;
      text-wrap: pretty;
    }

    .panel__points-label {
      color: var(--selector-muted);
    }

    .panel__point-groups {
      display: grid;
      gap: 1rem;
    }

    .panel__points-table {
      border-collapse: collapse;
      color: var(--selector-muted);
      font-size: var(--text-small, 0.8rem);
      font-weight: 600;
      line-height: 1.42;
      table-layout: auto;
      width: 100%;
    }

    .panel__points-table th,
    .panel__points-table td {
      border: 1px solid var(--selector-border);
      padding: 0.75rem;
      text-align: left;
      text-wrap: pretty;
      vertical-align: top;
    }

    .panel__points-table th {
      background: var(--selector-surface);
      font-weight: 700;
    }

    .panel__points-table td {
      background: var(--selector-bg);
    }

    .panel__points-table td:first-child {
      color: var(--selector-muted);
      padding-inline: 0.75rem;
      text-align: center;
      white-space: nowrap;
      width: 1%;
    }

    @keyframes panel-in {
      from {
        opacity: 0;
        transform: translateY(0.35rem);
      }

      to {
        opacity: 1;
        transform: none;
      }
    }

    @keyframes selected-node-pulse {
      0%,
      100% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--selector-accent) 28%, transparent);
        transform: scale(1);
      }

      55% {
        box-shadow: 0 0 0 0.55rem transparent;
        transform: scale(1.06);
      }
    }

    @media (max-width: 560px) {
      :host {
        margin-block: 1.5rem 2rem;
      }

      .rail {
        margin-bottom: 1rem;
      }

      .level-button {
        font-size: 0.65rem;
        gap: 0.35rem;
      }

      .level-button__marker {
        height: 1rem;
        width: 1rem;
      }

      .level-button[aria-selected="true"] .level-button__marker {
        height: 1.35rem;
        margin-block: -0.175rem;
        width: 1.35rem;
      }

      .rail::before {
        top: 0.4rem;
      }

      .panel {
        gap: 0.75rem;
        grid-template-columns: 2.75rem minmax(0, 1fr);
        padding: 0.85rem;
      }

      .panel[data-spectrum-panel="light"] {
        --signal-core-size: 0.6rem;
      }

      .panel[data-spectrum-panel="standard"] {
        --signal-core-size: 0.75rem;
        --signal-ring-1: 0.18rem;
        --signal-ring-2: 0.3rem;
      }

      .panel[data-spectrum-panel="elevated"] {
        --signal-core-size: 0.9rem;
        --signal-ring-1: 0.27rem;
        --signal-ring-2: 0.46rem;
      }

      .panel[data-spectrum-panel="critical"] {
        --signal-core-size: 1.05rem;
        --signal-ring-1: 0.35rem;
        --signal-ring-2: 0.58rem;
      }

      .panel__condition {
        margin-bottom: 1rem;
      }

    }

    @media (prefers-reduced-motion: reduce) {
      .panel {
        animation: none;
      }

      .level-button__marker {
        animation: none !important;
        transition: none;
      }
    }

    @media print {
      :host {
        display: block;
        margin-block: 0;
      }

      .selector {
        color-adjust: exact;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .rail {
        display: none;
      }

      .panels {
        display: grid;
        gap: 10mm;
      }

      .panel,
      .panel[hidden] {
        animation: none;
        break-before: page;
        break-inside: auto;
        display: grid;
        page-break-before: always;
        page-break-inside: auto;
      }

      .panel__signal,
      .panel__title,
      .panel__condition,
      .panel__section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .panel__point-group,
      .panel__points-table,
      .panel__points-table tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>

  <section class="selector" aria-label="Project standard guidance">
    <div class="rail" role="tablist" aria-label="Choose a project standard">
      ${levels
        .map(
          (level) => `
            <button
              class="level-button"
              data-spectrum-tab="${level.id}"
              id="spectrum-tab-${level.id}"
              role="tab"
              type="button"
              aria-controls="spectrum-panel-${level.id}"
              aria-selected="${level.id === "standard"}"
              tabindex="${level.id === "standard" ? "0" : "-1"}"
            >
              <span class="level-button__marker" aria-hidden="true"></span>
              <span>${level.title}</span>
            </button>
          `,
        )
        .join("")}
    </div>

    <div class="panels">
      ${levels
        .map(
          (level) => `
            <article
              class="panel"
              data-spectrum-panel="${level.id}"
              id="spectrum-panel-${level.id}"
              role="tabpanel"
              aria-labelledby="spectrum-tab-${level.id}"
              ${level.id === "standard" ? "" : "hidden"}
            >
              <div class="panel__signal" aria-hidden="true"></div>
              <div class="panel__content">
                <h5 class="panel__title">${level.title}</h5>
                <p class="panel__condition">${level.condition}</p>

                <div class="panel__section">
                  <span class="panel__eyebrow">The grip</span>
                  <p class="panel__statement">${level.grip}</p>
                </div>

                <div class="panel__section">
                  <span class="panel__eyebrow">The doubt</span>
                  <p class="panel__statement">${level.doubt}</p>
                </div>

                <div class="panel__section">
                  ${level.full.length > 1 ? '<span class="panel__eyebrow panel__points-label">In full</span>' : ""}
                  <div class="panel__point-groups${level.full.length > 1 ? " panel__point-groups--split" : ""}">
                    ${level.full
                      .map(
                        (group) => `
                          <div class="panel__point-group">
                            <table class="panel__points-table">
                              <thead>
                                <tr>
                                  <th colspan="2">${group.title ?? "In full"}</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${group.points
                                  .map(
                                    (point) => `
                                      <tr>
                                        <td aria-hidden="true">☞</td>
                                        <td>${point}</td>
                                      </tr>
                                    `,
                                  )
                                  .join("")}
                              </tbody>
                            </table>
                          </div>
                        `,
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  </section>
`;

class SpectrumGuidanceSelector extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    this.shadowRoot?.addEventListener("click", this.handleClick);
    this.shadowRoot?.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    this.shadowRoot?.removeEventListener("click", this.handleClick);
    this.shadowRoot?.removeEventListener("keydown", this.handleKeydown);
  }

  private get tabs() {
    return Array.from(this.shadowRoot?.querySelectorAll<HTMLButtonElement>("[data-spectrum-tab]") ?? []);
  }

  private selectLevel(id: string, moveFocus = false) {
    const selectedTab = this.tabs.find((tab) => tab.dataset.spectrumTab === id);

    if (!selectedTab) {
      return;
    }

    this.tabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });

    this.shadowRoot?.querySelectorAll<HTMLElement>("[data-spectrum-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.spectrumPanel !== id;
    });

    if (moveFocus) {
      selectedTab.focus();
    }
  }

  private handleClick = (event: Event) => {
    const tab = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-spectrum-tab]");

    if (tab?.dataset.spectrumTab) {
      this.selectLevel(tab.dataset.spectrumTab);
    }
  };

  private handleKeydown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    const currentTab = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-spectrum-tab]");

    if (!currentTab) {
      return;
    }

    const currentIndex = this.tabs.indexOf(currentTab);
    let nextIndex = currentIndex;

    if (keyboardEvent.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % this.tabs.length;
    } else if (keyboardEvent.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
    } else if (keyboardEvent.key === "Home") {
      nextIndex = 0;
    } else if (keyboardEvent.key === "End") {
      nextIndex = this.tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const nextTab = this.tabs[nextIndex];

    if (nextTab?.dataset.spectrumTab) {
      this.selectLevel(nextTab.dataset.spectrumTab, true);
    }
  };
}

if (!customElements.get("spectrum-guidance-selector")) {
  customElements.define("spectrum-guidance-selector", SpectrumGuidanceSelector);
}

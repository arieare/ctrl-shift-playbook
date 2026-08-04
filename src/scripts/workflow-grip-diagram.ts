export {};

type GripLevel = "assist" | "automate" | "guided" | "human";

type GripStep = {
  label: string;
  level: GripLevel;
  zone: string;
};

type GripPhase = {
  label: string;
  profile: string;
  steps: GripStep[];
};

const phases: Record<string, GripPhase> = {
  planning: {
    label: "Planning",
    profile: "Grip at the front",
    steps: [
      { label: "Frame the problem", level: "human", zone: "Human only" },
      { label: "Design the study", level: "guided", zone: "Guided" },
      { label: "Build the guide", level: "assist", zone: "Assist" },
    ],
  },
  "data-collection": {
    label: "Data Collection",
    profile: "Grip in the middle",
    steps: [
      { label: "Recruit & set up", level: "assist", zone: "Assist" },
      { label: "Interview & immerse", level: "human", zone: "Human only" },
      { label: "Transcribe & translate", level: "automate", zone: "Automate" },
    ],
  },
  analysis: {
    label: "Analysis & meaning-making",
    profile: "Grip tightens as you go",
    steps: [
      { label: "Observations", level: "automate", zone: "Automate" },
      { label: "Meaning", level: "guided", zone: "Guided" },
      { label: "Implications", level: "human", zone: "Human only" },
      { label: "Actions", level: "human", zone: "Human only" },
    ],
  },
  reporting: {
    label: "Reporting",
    profile: "Grip at both ends",
    steps: [
      { label: "Set the message", level: "human", zone: "Human only" },
      { label: "Craft the telling", level: "assist", zone: "Assist" },
      { label: "Tailor & deliver", level: "human", zone: "Human only" },
    ],
  },
  "knowledge-management": {
    label: "Knowledge Management",
    profile: "Grip at the back",
    steps: [
      { label: "Archive & tag", level: "automate", zone: "Automate" },
      { label: "Retrieve & connect", level: "assist", zone: "Assist" },
      { label: "Synthesise over time", level: "human", zone: "Human only" },
    ],
  },
};

const styles = `
  :host {
    --grip-accent: var(--color-accent, #4849c4);
    --grip-bg: var(--color-bg, #fefdfb);
    --grip-border: var(--color-border, #d8d8d8);
    --grip-surface: var(--color-surface, #f7f7f7);
    --grip-text: var(--color-text, #343131);
    display: block;
    margin: 1.15rem 0 1.6rem;
  }

  :host(.is-exporting) {
    background: transparent;
    margin: 0;
    max-width: none;
    width: 62.5rem;
  }

  .diagram {
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--grip-accent) 4%, transparent), transparent 48%);
    border: 1px solid color-mix(in srgb, var(--grip-accent) 22%, var(--grip-border));
    border-radius: 0.9rem;
    color: var(--grip-text);
    font-family: var(--font-sans, system-ui, sans-serif);
    overflow: hidden;
    padding: clamp(0.8rem, 2vw, 1.15rem) clamp(0.75rem, 2.5vw, 1.35rem) 2.8rem;
    position: relative;
  }

  .diagram__intro {
    margin-bottom: 0.4rem;
  }

  .diagram__profile {
    color: var(--grip-accent);
    font-size: var(--text-base, 1rem);
    font-weight: 800;
    line-height: 1.15;
    margin: 0;
  }

  .timeline {
    --grip-center-y: 4.65rem;
    display: grid;
    grid-template-columns: repeat(var(--step-count), minmax(0, 1fr));
    min-height: 8.35rem;
    padding: 0.95rem 0.35rem 0.4rem;
    position: relative;
  }

  .timeline__rail {
    background: color-mix(in srgb, var(--grip-accent) 38%, var(--grip-border));
    height: 0.16rem;
    left: calc(0.35rem + (100% - 0.7rem) / var(--step-count) / 2);
    position: absolute;
    right: calc(0.35rem + (100% - 0.7rem) / var(--step-count) / 2);
    top: calc(var(--grip-center-y) - 0.08rem);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 620ms cubic-bezier(0.2, 0.75, 0.2, 1);
  }

  .timeline__rail::after {
    border-bottom: 0.28rem solid transparent;
    border-left: 0.5rem solid color-mix(in srgb, var(--grip-accent) 55%, var(--grip-border));
    border-top: 0.28rem solid transparent;
    content: "";
    position: absolute;
    right: -0.4rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .step {
    display: grid;
    grid-template-rows: 2.45rem 2.5rem 1.4rem;
    justify-items: center;
    min-width: 0;
    opacity: 0;
    position: relative;
    transform: translateY(0.65rem);
    transition:
      opacity 320ms ease var(--step-delay),
      transform 420ms cubic-bezier(0.2, 0.75, 0.2, 1) var(--step-delay);
    z-index: 1;
  }

  .step__name {
    align-self: start;
    font-size: var(--text-small, 0.82rem);
    font-weight: 750;
    line-height: 1.15;
    max-width: 11rem;
    padding: 0.2rem 0.35rem 0;
    text-align: center;
  }

  .step__grip {
    --grip-fill: var(--color-surface, #f7f7f7);
    --grip-ink: var(--grip-text);
    --grip-outline: var(--grip-border);
    align-self: center;
    background:
      repeating-linear-gradient(
        90deg,
        transparent 0,
        transparent 0.48rem,
        color-mix(in srgb, var(--grip-ink) 16%, transparent) 0.5rem,
        transparent 0.56rem
      ),
      var(--grip-fill);
    border: 1px solid var(--grip-outline);
    border-radius: 999px;
    box-shadow: 0 0.35rem 0.85rem color-mix(in srgb, var(--grip-outline) 12%, transparent);
    height: var(--grip-height);
    min-height: 0.5rem;
    transform: scaleX(0.2);
    transition: transform 460ms cubic-bezier(0.2, 0.75, 0.2, 1) calc(var(--step-delay) + 100ms);
    width: var(--grip-width);
  }

  .step--human .step__grip {
    --grip-fill: var(--color-red-1, #fde9ec);
    --grip-height: 2.15rem;
    --grip-ink: var(--color-red-5, #2c030f);
    --grip-outline: var(--color-red-3, #db3069);
    --grip-width: calc(100% - 0.65rem);
  }

  .step--guided .step__grip {
    --grip-fill: var(--color-orange-1, #fbebdf);
    --grip-height: 1.65rem;
    --grip-ink: var(--color-orange-5, #533114);
    --grip-outline: var(--color-orange-3, #ee964b);
    --grip-width: calc(88% - 0.45rem);
  }

  .step--assist .step__grip {
    --grip-fill: var(--color-yellow-1, #f3edce);
    --grip-height: 1.12rem;
    --grip-ink: var(--color-yellow-5, #695616);
    --grip-outline: var(--color-yellow-4, #c0b233);
    --grip-width: calc(76% - 0.35rem);
  }

  .step--automate .step__grip {
    --grip-fill: var(--color-green-1, #e2f4e4);
    --grip-height: 0.58rem;
    --grip-ink: var(--color-green-5, #29392b);
    --grip-outline: var(--color-green-3, #87b38d);
    --grip-width: calc(58% - 0.25rem);
  }

  .step__zone {
    align-self: end;
    background: transparent;
    border: 1px solid var(--grip-border);
    border-radius: 999px;
    color: var(--grip-text);
    font-size: var(--text-tiny, 0.68rem);
    font-weight: 700;
    line-height: 1;
    padding: 0.32rem 0.5rem;
    text-align: center;
  }

  .step--human .step__zone {
    border-color: var(--color-red-2, #f793a7);
    color: var(--color-red-5, #2c030f);
  }

  .step--guided .step__zone {
    border-color: var(--color-orange-2, #f5c29c);
    color: var(--color-orange-5, #533114);
  }

  .step--assist .step__zone {
    border-color: var(--color-yellow-2, #f5e49c);
    color: var(--color-yellow-5, #695616);
  }

  .step--automate .step__zone {
    border-color: var(--color-green-2, #a5d9ac);
    color: var(--color-green-5, #29392b);
  }

  .diagram-download,
  .diagram-reveal {
    align-items: center;
    appearance: none;
    backdrop-filter: blur(0.35rem);
    background: color-mix(in srgb, var(--grip-bg) 88%, transparent);
    border: 1px solid var(--grip-border);
    border-radius: 50%;
    bottom: 0.55rem;
    color: var(--grip-text);
    cursor: pointer;
    display: inline-flex;
    height: 2rem;
    justify-content: center;
    padding: 0;
    position: absolute;
    right: 0.65rem;
    transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
    width: 2rem;
    z-index: 6;
  }

  .diagram-reveal { right: 3.05rem; }

  .diagram-download:hover,
  .diagram-download:focus-visible,
  .diagram-reveal:hover,
  .diagram-reveal:focus-visible {
    background: var(--grip-bg);
    border-color: var(--grip-accent);
    transform: translateY(-0.1rem);
  }

  .diagram-download:focus-visible,
  .diagram-reveal:focus-visible {
    outline: 2px solid var(--grip-accent);
    outline-offset: 2px;
  }

  .diagram-download::after,
  .diagram-reveal::after {
    background: var(--grip-text);
    border-radius: 0.25rem;
    bottom: calc(100% + 0.45rem);
    color: var(--grip-bg);
    content: attr(data-tooltip);
    font-size: var(--text-small, 0.75rem);
    font-weight: 600;
    opacity: 0;
    padding: 0.35rem 0.5rem;
    pointer-events: none;
    position: absolute;
    right: 0;
    transform: translateY(0.2rem);
    transition: opacity 140ms ease, transform 140ms ease;
    white-space: nowrap;
  }

  .diagram-download:hover::after,
  .diagram-download:focus-visible::after,
  .diagram-reveal:hover::after,
  .diagram-reveal:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

  .diagram-download svg,
  .diagram-reveal svg {
    height: 0.85rem;
    width: 0.85rem;
  }

  .diagram-reveal[aria-pressed="true"] {
    background: var(--grip-accent);
    border-color: var(--grip-accent);
    color: var(--grip-bg);
  }

  :host(.is-revealed) .timeline__rail,
  :host(.is-static-view) .timeline__rail {
    transform: scaleX(1);
  }

  :host(.is-revealed) .step,
  :host(.is-static-view) .step {
    opacity: 1;
    transform: none;
  }

  :host(.is-revealed) .step__grip,
  :host(.is-static-view) .step__grip {
    transform: scaleX(1);
  }

  :host(.is-static-view) .timeline__rail,
  :host(.is-static-view) .step,
  :host(.is-static-view) .step__grip {
    transition: none;
  }

  :host(.is-exporting) .diagram {
    background: transparent;
    box-shadow: none;
    padding-bottom: 0.85rem;
  }

  :host(.is-exporting) .diagram-download,
  :host(.is-exporting) .diagram-reveal {
    display: none !important;
  }

  :host(.is-exporting) .step__grip {
    box-shadow: none;
  }

  @media (max-width: 560px) {
    :host { margin-block: 0.9rem 1.25rem; }

    .diagram {
      border-radius: 0.7rem;
      padding: 0.7rem 0.4rem 3rem;
    }

    .diagram__intro { padding-inline: 0.35rem; }

    .diagram__profile { font-size: var(--text-small, 0.82rem); }

    .timeline {
      --grip-center-y: 4.6rem;
      min-height: 7.9rem;
      padding-inline: 0;
    }

    .timeline__rail {
      left: calc((100% / var(--step-count)) / 2);
      right: calc((100% / var(--step-count)) / 2);
    }

    .step {
      grid-template-rows: 2.65rem 2rem 1.35rem;
    }

    .step__name {
      font-size: 0.65rem;
      overflow-wrap: anywhere;
      padding-inline: 0.12rem;
    }

    .step__zone {
      font-size: 0.54rem;
      padding: 0.28rem 0.34rem;
    }

    .step--human .step__grip { --grip-height: 1.65rem; --grip-width: calc(100% - 0.25rem); }
    .step--guided .step__grip { --grip-height: 1.28rem; --grip-width: calc(88% - 0.15rem); }
    .step--assist .step__grip { --grip-height: 0.92rem; --grip-width: calc(76% - 0.08rem); }
    .step--automate .step__grip { --grip-height: 0.48rem; --grip-width: 58%; }

  }

  @media (prefers-reduced-motion: reduce) {
    .timeline__rail,
    .step,
    .step__grip {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }

  @media print {
    :host { display: none; }
  }
`;

const eyeIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 5c5.3 0 9.27 4.11 10.5 6.17a1.6 1.6 0 0 1 0 1.66C21.27 14.89 17.3 19 12 19S2.73 14.89 1.5 12.83a1.6 1.6 0 0 1 0-1.66C2.73 9.11 6.7 5 12 5Zm0 2c-4.13 0-7.43 3.08-8.55 5C4.57 13.92 7.87 17 12 17s7.43-3.08 8.55-5C19.43 10.08 16.13 7 12 7Zm0 1.75A3.25 3.25 0 1 1 12 15.25 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 12 13.25 1.25 1.25 0 0 0 12 10.75Z"></path>
  </svg>
`;

const downloadIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M11 4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"></path>
  </svg>
`;

class WorkflowGripDiagram extends HTMLElement {
  private intersectionObserver?: IntersectionObserver;

  connectedCallback() {
    const phaseKey = this.getAttribute("phase") ?? "planning";
    const phase = phases[phaseKey] ?? phases.planning;

    if (!phase) {
      return;
    }

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    const steps = phase.steps.map((step, index) => `
      <article
        class="step step--${step.level}"
        style="--step-delay: ${120 + index * 150}ms"
        role="listitem"
      >
        <strong class="step__name">${step.label}</strong>
        <span class="step__grip" aria-hidden="true"></span>
        <span class="step__zone">${step.zone}</span>
      </article>
    `).join("");
    const assetName = `workflow-grip-${phaseKey}.png`;

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <section class="diagram" aria-label="${phase.label} workflow grip map">
        <header class="diagram__intro">
          <h6 class="diagram__profile">${phase.profile}</h6>
        </header>
        <div class="timeline" style="--step-count: ${phase.steps.length}" role="list">
          <span class="timeline__rail" aria-hidden="true"></span>
          ${steps}
        </div>
        <button
          class="diagram-reveal"
          data-diagram-reveal
          data-tooltip="reveal"
          type="button"
          aria-label="Reveal complete ${phase.label} grip map"
          aria-pressed="false"
        >${eyeIcon}</button>
        <a
          class="diagram-download"
          data-tooltip="download diagram"
          href="/images/print/${assetName}?v=20260801-6"
          download="${assetName}"
          aria-label="Download ${phase.label} grip map"
        >${downloadIcon}</a>
      </section>
    `;

    const isExporting = new URL(window.location.href).searchParams.get("diagram-export") === "revealed";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.classList.toggle("is-exporting", isExporting);
    this.shadowRoot?.addEventListener("click", this.handleClick);

    if (isExporting || reduceMotion || !("IntersectionObserver" in window)) {
      this.setStaticView(true);
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        this.classList.add("is-revealed");
        this.intersectionObserver?.disconnect();
      },
      { threshold: 0.12 },
    );
    this.intersectionObserver.observe(this);
  }

  disconnectedCallback() {
    this.intersectionObserver?.disconnect();
    this.shadowRoot?.removeEventListener("click", this.handleClick);
  }

  private handleClick = (event: Event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-diagram-reveal]");

    if (!button) {
      return;
    }

    this.setStaticView(!this.classList.contains("is-static-view"));
  };

  private setStaticView(isStatic: boolean) {
    const button = this.shadowRoot?.querySelector<HTMLButtonElement>("[data-diagram-reveal]");

    this.classList.toggle("is-static-view", isStatic);
    button?.setAttribute("aria-pressed", String(isStatic));

    if (isStatic) {
      this.classList.add("is-revealed");
    }
  }
}

if (!customElements.get("workflow-grip-diagram")) {
  customElements.define("workflow-grip-diagram", WorkflowGripDiagram);
}

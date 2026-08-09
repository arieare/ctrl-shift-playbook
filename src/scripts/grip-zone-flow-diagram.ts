export {};

type GripLevel = "critical" | "elevated" | "light" | "standard";
type GripZone = "assist" | "automate" | "guided" | "human";

const gripLevelSequences: Record<GripLevel, Array<{ title: string; zone: GripZone }>> = {
  light: [
    { title: "Automate", zone: "automate" },
    { title: "Assist", zone: "assist" },
    { title: "Guided", zone: "guided" },
    { title: "Human only", zone: "human" },
  ],
  standard: [
    { title: "Automate", zone: "automate" },
    { title: "Guided", zone: "guided" },
    { title: "Human only", zone: "human" },
    { title: "Human only", zone: "human" },
  ],
  elevated: [
    { title: "Assist", zone: "assist" },
    { title: "Human only", zone: "human" },
    { title: "Human only", zone: "human" },
    { title: "Human only", zone: "human" },
  ],
  critical: [
    { title: "Guided", zone: "guided" },
    { title: "Human only", zone: "human" },
    { title: "Human only", zone: "human" },
    { title: "Human only", zone: "human" },
  ],
};

const gripLevelTitles: Record<GripLevel, string> = {
  light: "Light",
  standard: "Standard",
  elevated: "Elevated",
  critical: "Critical",
};

const gripLevelCaptions: Record<GripLevel, string> = {
  light: "Everything has slid one notch left, except Actions. That is the step with your name on it.",
  standard: "The grip as drawn. This is the baseline every other level moves away from.",
  elevated:
    "Meaning has moved to Human only. AI still helps clean and cluster, but it no longer proposes what any of it means.",
  critical: "Even the mechanical front end is supervised now. Nothing here runs without a person watching it.",
};

const getGripLevel = (value: string | null): GripLevel => {
  return value === "standard" || value === "elevated" || value === "critical" ? value : "light";
};

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --flow-accent: var(--color-accent, #4849c4);
      --flow-bg: var(--color-bg, #fefdfb);
      --flow-border: var(--color-border, #d8d8d8);
      --flow-text: var(--color-text, #343131);
      display: block;
      margin: 2rem 0;
    }

    :host(.is-exporting) {
      background: transparent;
      margin: 0;
      max-width: none;
      width: 62.5rem;
    }

    .diagram {
      color: var(--flow-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      isolation: isolate;
      padding: 1rem 0 3.5rem;
      position: relative;
    }

    .flow {
      align-items: stretch;
      display: grid;
      gap: clamp(0.25rem, 0.65vw, 0.5rem);
      grid-template-columns: repeat(4, minmax(0, 1fr));
      padding-inline: 0.25rem;
    }

    .step {
      display: grid;
      gap: 0.45rem;
      min-width: 0;
      opacity: 0;
      transform: translateY(0.8rem) scale(0.985);
      transition:
        opacity 360ms ease,
        transform 460ms cubic-bezier(0.2, 0.75, 0.2, 1);
    }

    .step__label {
      color: var(--flow-text);
      font-size: var(--text-small, 0.8rem);
      font-weight: 700;
      line-height: 1.15;
      text-align: left;
    }

    .step__pill {
      align-items: center;
      background:
        linear-gradient(
          145deg,
          color-mix(in srgb, var(--step-fill) 92%, var(--flow-bg)) 0%,
          color-mix(in srgb, var(--step-fill) 72%, var(--flow-bg)) 100%
        );
      border: 1px solid color-mix(in srgb, var(--step-outline) 50%, var(--flow-border));
      border-radius: 0.8rem;
      box-shadow: 0 0.75rem 1.75rem color-mix(in srgb, var(--step-outline) 9%, transparent);
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      min-height: 0;
      padding: clamp(0.7rem, 1.2vw, 0.9rem) clamp(0.65rem, 1.5vw, 1rem);
      text-align: center;
    }

    .step--automate {
      --step-fill: var(--color-green-1, #e2f4e4);
      --step-ink: var(--color-green-5, #29392b);
      --step-outline: var(--color-green-3, #87b38d);
    }

    .step--assist {
      --step-fill: var(--color-yellow-1, #f3edce);
      --step-ink: var(--color-yellow-5, #695616);
      --step-outline: var(--color-yellow-4, #c0b233);
    }

    .step--guided {
      --step-fill: var(--color-orange-1, #fbebdf);
      --step-ink: var(--color-orange-5, #533114);
      --step-outline: var(--color-orange-3, #ee964b);
    }

    .step--human {
      --step-fill: var(--color-red-1, #fde9ec);
      --step-ink: var(--color-red-4, #7d1839);
      --step-outline: var(--color-red-3, #db3069);
    }

    .step__title {
      color: var(--step-ink);
      font-size: clamp(0.82rem, 1.65vw, var(--text-base, 1rem));
      font-weight: 800;
      hyphens: none;
      line-height: 1.1;
      white-space: nowrap;
    }

    .diagram__caption {
      color: color-mix(in srgb, var(--flow-text) 78%, var(--flow-bg));
      font-family: var(--font-serif-alt, Georgia, serif);
      font-size: var(--text-small, 0.8rem);
      line-height: 1.5;
      margin: 1rem 0 0;
      padding: 0 4.75rem 0 0.25rem;
      text-wrap: pretty;
    }

    .diagram-download,
    .diagram-reveal {
      align-items: center;
      appearance: none;
      backdrop-filter: blur(0.35rem);
      background: color-mix(in srgb, var(--flow-bg) 88%, transparent);
      border: 1px solid var(--flow-border);
      border-radius: 50%;
      bottom: 0.5rem;
      color: var(--flow-text);
      cursor: pointer;
      display: inline-flex;
      height: 2rem;
      justify-content: center;
      padding: 0;
      position: absolute;
      right: 0;
      transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
      width: 2rem;
      z-index: 2;
    }

    .diagram-reveal {
      right: 2.4rem;
    }

    .diagram-download:hover,
    .diagram-download:focus-visible,
    .diagram-reveal:hover,
    .diagram-reveal:focus-visible {
      background: var(--flow-bg);
      border-color: var(--flow-accent);
      transform: translateY(-0.1rem);
    }

    .diagram-download:focus-visible,
    .diagram-reveal:focus-visible {
      outline: 2px solid var(--flow-accent);
      outline-offset: 2px;
    }

    .diagram-download::after,
    .diagram-reveal::after {
      background: var(--flow-text);
      border-radius: 0.25rem;
      bottom: calc(100% + 0.45rem);
      color: var(--flow-bg);
      content: attr(data-tooltip);
      font-size: var(--text-small, 0.8rem);
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
      background: var(--flow-accent);
      border-color: var(--flow-accent);
      color: var(--flow-bg);
    }

    :host(.is-revealed) .step,
    :host(.is-static-view) .step {
      opacity: 1;
      transform: none;
    }

    :host(.is-revealed) .step:nth-of-type(1) {
      transition-delay: 80ms;
    }

    :host(.is-revealed) .step:nth-of-type(2) {
      transition-delay: 360ms;
    }

    :host(.is-revealed) .step:nth-of-type(3) {
      transition-delay: 640ms;
    }

    :host(.is-revealed) .step:nth-of-type(4) {
      transition-delay: 920ms;
    }

    :host(.is-static-view) .step,
    :host(.is-exporting) .step {
      transition: none;
    }

    :host(.is-exporting) .diagram-download,
    :host(.is-exporting) .diagram-reveal {
      display: none !important;
    }

    :host(.is-exporting) .step__pill {
      box-shadow: none;
    }

    @media (max-width: 560px) {
      .diagram {
        padding: 0.25rem 0 2.75rem;
      }

      .flow {
        gap: 0.5rem;
        grid-template-columns: minmax(0, 1fr);
        padding-inline: 0.25rem;
      }

      .step__pill {
        border-radius: 0.65rem;
        min-height: 0;
        padding: 0.75rem;
      }

      .step__title {
        font-size: var(--text-base, 1rem);
      }

      .diagram__caption {
        font-size: 0.74rem;
        margin-top: 0.85rem;
        padding-inline: 0.25rem 3rem;
      }

    }

    @media (prefers-reduced-motion: reduce) {
      .step {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }

    }

    @media print {
      :host {
        display: none;
      }
    }
  </style>

  <section class="diagram" aria-label="Light Analysis phase grip zones">
    <div class="flow" role="list">
      <article class="step step--automate" role="listitem">
        <span class="step__label">Observations</span>
        <div class="step__pill"><strong class="step__title">Automate</strong></div>
      </article>
      <article class="step step--assist" role="listitem">
        <span class="step__label">Meaning</span>
        <div class="step__pill"><strong class="step__title">Assist</strong></div>
      </article>
      <article class="step step--guided" role="listitem">
        <span class="step__label">Implications</span>
        <div class="step__pill"><strong class="step__title">Guided</strong></div>
      </article>
      <article class="step step--human" role="listitem">
        <span class="step__label">Actions</span>
        <div class="step__pill"><strong class="step__title">Human only</strong></div>
      </article>
    </div>

    <p class="diagram__caption">Everything has slid one notch left, except Actions. That is the step with your name on it.</p>

    <button
      class="diagram-reveal"
      data-diagram-reveal
      data-tooltip="reveal"
      type="button"
      aria-label="Reveal all grip zones"
      aria-pressed="false"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 5c5.3 0 9.27 4.11 10.5 6.17a1.6 1.6 0 0 1 0 1.66C21.27 14.89 17.3 19 12 19S2.73 14.89 1.5 12.83a1.6 1.6 0 0 1 0-1.66C2.73 9.11 6.7 5 12 5Zm0 2c-4.13 0-7.43 3.08-8.55 5C4.57 13.92 7.87 17 12 17s7.43-3.08 8.55-5C19.43 10.08 16.13 7 12 7Zm0 1.75A3.25 3.25 0 1 1 12 15.25 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 12 13.25 1.25 1.25 0 0 0 12 10.75Z"></path>
      </svg>
    </button>

    <a
      class="diagram-download"
      data-tooltip="download diagram"
      href="/images/print/grip-zone-flow-diagram.png?v=20260809-2"
      download="grip-zone-flow-diagram.png"
      aria-label="Download grip zone flow diagram"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M11 4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"></path>
      </svg>
    </a>
  </section>
`;

class GripZoneFlowDiagram extends HTMLElement {
  private intersectionObserver?: IntersectionObserver;

  static get observedAttributes() {
    return ["level"];
  }

  attributeChangedCallback() {
    this.applyLevel();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    this.applyLevel();

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

  private applyLevel() {
    if (!this.shadowRoot) {
      return;
    }

    const level = getGripLevel(this.getAttribute("level"));
    const levelTitle = gripLevelTitles[level];
    const steps = Array.from(this.shadowRoot.querySelectorAll<HTMLElement>(".step"));

    gripLevelSequences[level].forEach((item, index) => {
      const step = steps[index];
      const title = step?.querySelector<HTMLElement>(".step__title");

      if (!step || !title) {
        return;
      }

      step.className = `step step--${item.zone}`;
      title.textContent = item.title;
    });

    this.shadowRoot
      .querySelector<HTMLElement>(".diagram")
      ?.setAttribute("aria-label", `${levelTitle} Analysis phase grip zones`);

    const caption = this.shadowRoot.querySelector<HTMLElement>(".diagram__caption");

    if (caption) {
      caption.textContent = gripLevelCaptions[level];
    }

    const download = this.shadowRoot.querySelector<HTMLAnchorElement>(".diagram-download");
    const filename = `grip-zone-flow-diagram-${level}.png`;

    if (download) {
      download.href = `/images/print/${filename}?v=20260809-2`;
      download.download = filename;
      download.setAttribute("aria-label", `Download ${levelTitle} Analysis phase grip diagram`);
    }
  }

  private setStaticView(isStatic: boolean) {
    const button = this.shadowRoot?.querySelector<HTMLButtonElement>("[data-diagram-reveal]");

    this.classList.toggle("is-static-view", isStatic);
    button?.setAttribute("aria-pressed", String(isStatic));

    if (isStatic) {
      this.classList.add("is-revealed");
    }
  }
}

if (!customElements.get("grip-zone-flow-diagram")) {
  customElements.define("grip-zone-flow-diagram", GripZoneFlowDiagram);
}

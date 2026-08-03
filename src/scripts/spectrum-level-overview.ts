export {};

const levels = [
  {
    id: "light",
    label: "Light",
    grip: "Loosen the grip.",
    check: "Your judgement is enough.",
  },
  {
    id: "standard",
    label: "Standard",
    grip: "The grip as drawn.",
    check: "Your lead checks it.",
  },
  {
    id: "elevated",
    label: "Elevated",
    grip: "Tighten one notch.",
    check: "Prove it against raw data.",
  },
  {
    id: "critical",
    label: "Critical",
    grip: "Tighten again.",
    check: "Someone outside checks it.",
  },
];

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --overview-accent: var(--color-accent, #4849c4);
      --overview-accent-2: var(--color-accent-2, #7164bc);
      --overview-accent-3: var(--color-accent-3, #d5a7aa);
      --overview-bg: var(--color-bg, #fefdfb);
      --overview-border: var(--color-border, #d8d8d8);
      --overview-text: var(--color-text, #343131);
      display: block;
      margin: 1.4rem 0 2rem;
    }

    :host(.is-exporting) {
      background: transparent;
      margin: 0;
      width: 62.5rem;
    }

    .diagram {
      color: var(--overview-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      padding: 0.5rem 0 3rem;
      position: relative;
    }

    .levels {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      position: relative;
    }

    .level {
      align-content: start;
      align-items: start;
      display: grid;
      gap: 0.55rem;
      grid-template-rows: auto 1fr;
      justify-items: center;
      min-width: 0;
      opacity: 0;
      position: relative;
      transform: translateY(0.5rem) scale(0.96);
      transition:
        opacity 320ms ease,
        transform 420ms cubic-bezier(0.2, 0.75, 0.2, 1);
      z-index: 1;
    }

    .level--light {
      --signal-core-size: 0.85rem;
      --signal-ring-1: 0rem;
      --signal-ring-2: 0rem;
    }

    .level--standard {
      --signal-core-size: 1.1rem;
      --signal-ring-1: 0.28rem;
      --signal-ring-2: 0.5rem;
    }

    .level--elevated {
      --signal-core-size: 1.35rem;
      --signal-ring-1: 0.42rem;
      --signal-ring-2: 0.75rem;
    }

    .level--critical {
      --signal-core-size: 1.6rem;
      --signal-ring-1: 0.58rem;
      --signal-ring-2: 1.02rem;
    }

    .signal {
      aspect-ratio: 1;
      background: color-mix(in srgb, var(--overview-bg) 88%, transparent);
      border: 1px dashed color-mix(in srgb, var(--overview-accent) 14%, transparent);
      border-radius: 50%;
      display: grid;
      place-items: center;
      position: relative;
      width: 5.5rem;
    }

    .signal::before,
    .signal::after {
      border-radius: 50%;
      content: "";
      position: absolute;
    }

    .signal::before {
      background: var(--overview-accent);
      box-shadow:
        0 0 0 var(--signal-ring-1) color-mix(in srgb, var(--overview-accent-2) 48%, var(--overview-bg)),
        0 0 0 var(--signal-ring-2) color-mix(in srgb, var(--overview-accent-3) 38%, var(--overview-bg)),
        0 0 1.25rem color-mix(in srgb, var(--overview-accent) 24%, transparent);
      height: var(--signal-core-size);
      width: var(--signal-core-size);
    }

    .signal::after {
      border: 1px dotted color-mix(in srgb, var(--overview-accent-2) 22%, transparent);
      height: 72%;
      width: 72%;
    }

    .label {
      color: color-mix(in srgb, var(--overview-accent-2) 72%, var(--overview-text));
      font-size: var(--text-small, 0.8rem);
      font-weight: 760;
      line-height: 1.1;
    }

    .copy {
      align-self: stretch;
      display: grid;
      gap: 0.3rem;
      padding-inline: 0.4rem;
      text-align: center;
    }

    .detail {
      font-size: var(--text-small, 0.8rem);
      line-height: 1.3;
      margin: 0;
      text-wrap: balance;
    }

    .detail--grip {
      color: var(--overview-accent);
      font-weight: 720;
    }

    .detail--check {
      color: color-mix(in srgb, var(--overview-text) 78%, var(--overview-bg));
      font-weight: 600;
    }

    .diagram-download,
    .diagram-reveal {
      align-items: center;
      appearance: none;
      backdrop-filter: blur(0.35rem);
      background: color-mix(in srgb, var(--overview-bg) 88%, transparent);
      border: 1px solid var(--overview-border);
      border-radius: 50%;
      bottom: 0.25rem;
      color: var(--overview-text);
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
      background: var(--overview-bg);
      border-color: var(--overview-accent);
      transform: translateY(-0.1rem);
    }

    .diagram-download:focus-visible,
    .diagram-reveal:focus-visible {
      outline: 2px solid var(--overview-accent);
      outline-offset: 2px;
    }

    .diagram-download::after,
    .diagram-reveal::after {
      background: var(--overview-text);
      border-radius: 0.25rem;
      bottom: calc(100% + 0.45rem);
      color: var(--overview-bg);
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
      background: var(--overview-accent);
      border-color: var(--overview-accent);
      color: var(--overview-bg);
    }

    :host(.is-revealed) .level,
    :host(.is-static-view) .level {
      opacity: 1;
      transform: none;
    }

    :host(.is-revealed) .level:nth-child(1) { transition-delay: 80ms; }
    :host(.is-revealed) .level:nth-child(2) { transition-delay: 260ms; }
    :host(.is-revealed) .level:nth-child(3) { transition-delay: 440ms; }
    :host(.is-revealed) .level:nth-child(4) { transition-delay: 620ms; }

    :host(.is-static-view) .level,
    :host(.is-exporting) .level {
      transition: none;
    }

    :host(.is-exporting) .diagram-download,
    :host(.is-exporting) .diagram-reveal {
      display: none !important;
    }

    @media (max-width: 560px) {
      :host {
        margin-block: 1rem 1.5rem;
      }

      .diagram {
        padding-top: 0.25rem;
      }

      .signal {
        width: 4rem;
      }

      .level--light { --signal-core-size: 0.6rem; }
      .level--standard {
        --signal-core-size: 0.75rem;
        --signal-ring-1: 0.18rem;
        --signal-ring-2: 0.3rem;
      }
      .level--elevated {
        --signal-core-size: 0.9rem;
        --signal-ring-1: 0.27rem;
        --signal-ring-2: 0.46rem;
      }
      .level--critical {
        --signal-core-size: 1.05rem;
        --signal-ring-1: 0.35rem;
        --signal-ring-2: 0.58rem;
      }

      .label {
        font-size: 0.68rem;
      }

      .copy {
        gap: 0.2rem;
        padding-inline: 0.15rem;
      }

      .detail {
        font-size: 0.58rem;
        line-height: 1.25;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .level {
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

  <section class="diagram" aria-label="Spectrum levels from Light to Critical">
    <div class="levels" role="list">
      ${levels
        .map(
          (level) => `
            <article class="level level--${level.id}" role="listitem">
              <span class="signal" aria-hidden="true"></span>
              <div class="copy">
                <strong class="label">${level.label}</strong>
                <p class="detail detail--grip">${level.grip}</p>
                <p class="detail detail--check">${level.check}</p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>

    <button
      class="diagram-reveal"
      data-diagram-reveal
      data-tooltip="reveal"
      type="button"
      aria-label="Reveal all Spectrum levels"
      aria-pressed="false"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 5c5.3 0 9.27 4.11 10.5 6.17a1.6 1.6 0 0 1 0 1.66C21.27 14.89 17.3 19 12 19S2.73 14.89 1.5 12.83a1.6 1.6 0 0 1 0-1.66C2.73 9.11 6.7 5 12 5Zm0 2c-4.13 0-7.43 3.08-8.55 5C4.57 13.92 7.87 17 12 17s7.43-3.08 8.55-5C19.43 10.08 16.13 7 12 7Zm0 1.75A3.25 3.25 0 1 1 12 15.25 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 12 13.25 1.25 1.25 0 0 0 12 10.75Z"></path>
      </svg>
    </button>

    <a
      class="diagram-download"
      data-tooltip="download diagram"
      href="/images/print/spectrum-level-overview.png?v=20260803-1"
      download="spectrum-level-overview.png"
      aria-label="Download Spectrum level overview"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M11 4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"></path>
      </svg>
    </a>
  </section>
`;

class SpectrumLevelOverview extends HTMLElement {
  private intersectionObserver?: IntersectionObserver;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

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

        this.reveal();
      },
      { threshold: 0.15 },
    );
    this.intersectionObserver.observe(this);
    window.addEventListener("scroll", this.revealIfVisible, { passive: true });
    window.addEventListener("resize", this.revealIfVisible);
    requestAnimationFrame(this.revealIfVisible);
  }

  disconnectedCallback() {
    this.intersectionObserver?.disconnect();
    this.shadowRoot?.removeEventListener("click", this.handleClick);
    window.removeEventListener("scroll", this.revealIfVisible);
    window.removeEventListener("resize", this.revealIfVisible);
  }

  private reveal = () => {
    this.classList.add("is-revealed");
    this.intersectionObserver?.disconnect();
    window.removeEventListener("scroll", this.revealIfVisible);
    window.removeEventListener("resize", this.revealIfVisible);
  };

  private revealIfVisible = () => {
    if (this.classList.contains("is-revealed") || this.getClientRects().length === 0) {
      return;
    }

    const rect = this.getBoundingClientRect();

    if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
      this.reveal();
    }
  };

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

if (!customElements.get("spectrum-level-overview")) {
  customElements.define("spectrum-level-overview", SpectrumLevelOverview);
}

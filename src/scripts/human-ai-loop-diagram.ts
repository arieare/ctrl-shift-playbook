export {};

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --loop-accent-human: var(--color-accent, #4849c4);
      --loop-accent-ai: var(--color-accent-2, #7164bc);
      --loop-bg: var(--color-bg, #ffffff);
      --loop-border: var(--color-border, #d8d8d8);
      --loop-surface: var(--color-surface, #f7f7f7);
      --loop-text: var(--color-text, #343131);
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
      color: var(--loop-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      isolation: isolate;
      padding: 1rem 0 3.5rem;
      position: relative;
    }

    .lane-headings {
      display: grid;
      gap: clamp(2.5rem, 9vw, 7rem);
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding: 0 clamp(1.35rem, 4vw, 2.75rem) 0.75rem;
      position: relative;
      z-index: 1;
    }

    .lane-heading {
      align-items: center;
      border-bottom: 2px solid currentColor;
      display: flex;
      font-size: var(--text-h6, 1.125rem);
      font-weight: 750;
      gap: 0.5rem;
      justify-content: center;
      letter-spacing: 0.02em;
      padding: 0.4rem 0.75rem 0.65rem;
      text-transform: uppercase;
    }

    .lane-heading--human {
      color: var(--loop-accent-human);
    }

    .lane-heading--ai {
      color: var(--loop-accent-ai);
    }

    .lane-heading__dot {
      background: currentColor;
      border-radius: 50%;
      height: 0.55rem;
      width: 0.55rem;
    }

    .lane-divider {
      border-left: 2px dotted
        color-mix(in srgb, var(--loop-accent-human) 20%, var(--loop-border));
      bottom: 3.5rem;
      left: 50%;
      pointer-events: none;
      position: absolute;
      top: 1rem;
      transform: translateX(-50%);
      width: 0;
      z-index: 0;
    }

    .flow {
      display: grid;
      gap: clamp(2.85rem, 5.25vw, 4.25rem) clamp(2.5rem, 9vw, 7rem);
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding: 0.75rem clamp(1.35rem, 4vw, 2.75rem) 1rem;
      position: relative;
      z-index: 1;
    }

    .connectors {
      height: 100%;
      inset: 0;
      overflow: visible;
      pointer-events: none;
      position: absolute;
      width: 100%;
      z-index: 2;
    }

    .connector {
      fill: none;
      opacity: 0;
      path-length: 1;
      stroke: var(--loop-accent-human);
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      stroke-linecap: round;
      stroke-linejoin: miter;
      stroke-width: 2.5;
      vector-effect: non-scaling-stroke;
    }

    .connector[data-connector-index="1"],
    .connector[data-connector-index="3"] {
      stroke: var(--loop-accent-ai);
    }

    .connector--return {
      opacity: 0;
      stroke: color-mix(in srgb, var(--loop-accent-human) 62%, var(--loop-border));
      stroke-dasharray: 5 7;
      stroke-dashoffset: 0;
    }

    .step {
      align-items: start;
      background:
        linear-gradient(
          145deg,
          color-mix(in srgb, var(--step-accent) 13%, var(--loop-bg)) 0%,
          color-mix(in srgb, var(--step-accent) 5%, var(--loop-bg)) 100%
        );
      border: 1px solid color-mix(in srgb, var(--step-accent) 48%, var(--loop-border));
      border-radius: 0.85rem;
      box-shadow: 0 0.75rem 1.75rem color-mix(in srgb, var(--step-accent) 9%, transparent);
      display: grid;
      gap: 0.65rem;
      grid-template-columns: auto minmax(0, 1fr);
      opacity: 0;
      padding: clamp(0.85rem, 2vw, 1.15rem);
      position: relative;
      transform: translateY(1rem) scale(0.985);
      transition:
        opacity 380ms ease,
        transform 480ms cubic-bezier(0.2, 0.75, 0.2, 1);
      z-index: 1;
    }

    .step--human {
      --step-accent: var(--loop-accent-human);
      grid-column: 1;
    }

    .step--ai {
      --step-accent: var(--loop-accent-ai);
      grid-column: 2;
    }

    .step[data-step-index="0"] {
      grid-row: 1;
    }

    .step[data-step-index="1"] {
      grid-row: 2;
    }

    .step[data-step-index="2"] {
      grid-row: 3;
    }

    .step[data-step-index="3"] {
      grid-row: 4;
    }

    .step[data-step-index="4"] {
      grid-row: 5;
    }

    .step__number {
      align-items: center;
      background: var(--step-accent);
      border-radius: 50%;
      color: var(--loop-bg);
      display: inline-flex;
      font-size: var(--text-small, 0.8rem);
      font-weight: 800;
      height: 1.8rem;
      justify-content: center;
      line-height: 1;
      width: 1.8rem;
    }

    .step__copy {
      min-width: 0;
    }

    .step__title {
      color: var(--step-accent);
      display: block;
      font-size: var(--text-base, 1rem);
      font-weight: 800;
      hyphens: none;
      line-height: 1.05;
      margin-bottom: 0.45rem;
      white-space: nowrap;
    }

    .step__description {
      color: var(--loop-text);
      font-size: var(--text-small, 0.9rem);
      hyphens: none;
      line-height: 1.4;
      margin: 0;
      overflow-wrap: normal;
      text-align: left;
      word-break: normal;
    }

    .step__warning {
      background: color-mix(in srgb, var(--color-red-1, #fde9ec) 94%, var(--loop-bg));
      border: 1px solid var(--color-red-3, #db3069);
      border-radius: 0.55rem;
      box-shadow: 0 0.55rem 1.2rem color-mix(in srgb, var(--color-red-3, #db3069) 10%, transparent);
      color: var(--color-red-5, #2c030f);
      font-size: var(--text-small, 0.8rem);
      hyphens: none;
      left: calc(100% + clamp(0.75rem, 1.75vw, 1.25rem));
      line-height: 1.2;
      margin: 0;
      overflow-wrap: anywhere;
      padding: 0.5rem 0.65rem;
      pointer-events: none;
      position: absolute;
      text-align: left;
      top: -1rem;
      width: clamp(8.5rem, 14vw, 10.5rem);
      word-break: normal;
      z-index: 3;
    }

    .step__warning strong {
      color: var(--color-red-4, #7d1839);
      font-weight: 800;
    }

    .step__warning--ownership {
      top: -2rem;
    }

    .diagram-download,
    .diagram-reveal {
      align-items: center;
      appearance: none;
      backdrop-filter: blur(0.35rem);
      background: color-mix(in srgb, var(--loop-bg) 88%, transparent);
      border: 1px solid var(--loop-border);
      border-radius: 50%;
      bottom: 0.5rem;
      color: var(--loop-text);
      cursor: pointer;
      display: inline-flex;
      height: 2rem;
      justify-content: center;
      padding: 0;
      position: absolute;
      right: 0;
      transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
      width: 2rem;
      z-index: 3;
    }

    .diagram-reveal {
      right: 2.4rem;
    }

    .diagram-download:hover,
    .diagram-download:focus-visible,
    .diagram-reveal:hover,
    .diagram-reveal:focus-visible {
      background: var(--loop-bg);
      border-color: var(--loop-accent-human);
      transform: translateY(-0.1rem);
    }

    .diagram-download:focus-visible,
    .diagram-reveal:focus-visible {
      outline: 2px solid var(--loop-accent-human);
      outline-offset: 2px;
    }

    .diagram-download::after,
    .diagram-reveal::after {
      background: var(--loop-text);
      border-radius: 0.25rem;
      bottom: calc(100% + 0.45rem);
      color: var(--loop-bg);
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
      background: var(--loop-accent-human);
      border-color: var(--loop-accent-human);
      color: var(--loop-bg);
    }

    :host(.is-revealed) .step,
    :host(.is-static-view) .step {
      opacity: 1;
      transform: none;
    }

    :host(.is-revealed) .step[data-step-index="0"] {
      transition-delay: 80ms;
    }

    :host(.is-revealed) .step[data-step-index="1"] {
      transition-delay: 520ms;
    }

    :host(.is-revealed) .step[data-step-index="2"] {
      transition-delay: 960ms;
    }

    :host(.is-revealed) .step[data-step-index="3"] {
      transition-delay: 1400ms;
    }

    :host(.is-revealed) .step[data-step-index="4"] {
      transition-delay: 1840ms;
    }

    :host(.is-revealed) .connector {
      animation: draw-connector 420ms ease forwards;
    }

    :host(.is-revealed) .connector[data-connector-index="0"] {
      animation-delay: 400ms;
    }

    :host(.is-revealed) .connector[data-connector-index="1"] {
      animation-delay: 840ms;
    }

    :host(.is-revealed) .connector[data-connector-index="2"] {
      animation-delay: 1280ms;
    }

    :host(.is-revealed) .connector[data-connector-index="3"] {
      animation-delay: 1720ms;
    }

    :host(.is-revealed) .connector--return {
      animation-delay: 2200ms;
    }

    :host(.is-static-view) .connector {
      animation: none;
      opacity: 1;
      stroke-dashoffset: 0;
    }

    :host(.is-exporting) .diagram-download,
    :host(.is-exporting) .diagram-reveal {
      display: none !important;
    }

    :host(.is-exporting) .step {
      box-shadow: none;
    }

    :host(.is-exporting) .step__warning {
      box-shadow: none;
    }

    @keyframes draw-connector {
      0% {
        opacity: 0.2;
        stroke-dashoffset: 1;
      }

      100% {
        opacity: 1;
        stroke-dashoffset: 0;
      }
    }

    @media (max-width: 560px) {
      .diagram {
        padding: 0.25rem 0 2.75rem;
      }

      .lane-headings,
      .flow {
        column-gap: 0.85rem;
        padding-inline: 0.25rem;
      }

      .lane-headings {
        padding-bottom: 0.4rem;
      }

      .lane-divider {
        bottom: 2.75rem;
        top: 0.35rem;
      }

      .flow {
        padding-block: 0.4rem 0.5rem;
        row-gap: 1.25rem;
      }

      .lane-heading {
        font-size: var(--text-small, 0.8rem);
        padding: 0.25rem 0.2rem 0.4rem;
      }

      .lane-heading__dot {
        height: 0.45rem;
        width: 0.45rem;
      }

      .step {
        border-radius: 0.65rem;
        gap: 0.3rem;
        grid-template-columns: 1fr;
        padding: 0.55rem;
      }

      .step__number {
        font-size: 0.67rem;
        height: 1.4rem;
        width: 1.4rem;
      }

      .step__title {
        font-size: var(--text-small, 0.8rem);
        margin-bottom: 0.35rem;
        white-space: nowrap;
      }

      .step__description {
        font-size: var(--text-tiny, 0.72rem);
        line-height: 1.35;
      }

      .step__warning {
        border-radius: 0.4rem;
        font-size: 0.58rem;
        left: calc(100% + 0.25rem);
        line-height: 1.15;
        padding: 0.35rem 0.4rem;
        top: -0.75rem;
        width: calc(50% + 0.75rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .step,
      .connector {
        animation: none !important;
        opacity: 1 !important;
        stroke-dashoffset: 0 !important;
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

  <section class="diagram" aria-label="Five-step Human and AI execution loop">
    <div class="lane-headings" aria-hidden="true">
      <div class="lane-heading lane-heading--human"><span class="lane-heading__dot"></span>Human</div>
      <div class="lane-heading lane-heading--ai"><span class="lane-heading__dot"></span>AI</div>
    </div>

    <div class="lane-divider" aria-hidden="true"></div>

    <div class="flow">
      <svg class="connectors" data-connectors aria-hidden="true">
        <defs>
          <marker id="loop-arrow-human" markerHeight="8" markerWidth="8" orient="auto-start-reverse" refX="7" refY="4">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--loop-accent-human)"></path>
          </marker>
          <marker id="loop-arrow-ai" markerHeight="8" markerWidth="8" orient="auto-start-reverse" refX="7" refY="4">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--loop-accent-ai)"></path>
          </marker>
          <marker id="loop-arrow-return" markerHeight="8" markerWidth="8" orient="auto-start-reverse" refX="7" refY="4">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="color-mix(in srgb, var(--loop-accent-human) 62%, var(--loop-border))"></path>
          </marker>
        </defs>
        <path class="connector" data-connector-index="0" pathLength="1" marker-end="url(#loop-arrow-human)"></path>
        <path class="connector" data-connector-index="1" pathLength="1" marker-end="url(#loop-arrow-ai)"></path>
        <path class="connector" data-connector-index="2" pathLength="1" marker-end="url(#loop-arrow-human)"></path>
        <path class="connector" data-connector-index="3" pathLength="1" marker-end="url(#loop-arrow-ai)"></path>
        <path class="connector connector--return" data-return-connector pathLength="1" marker-end="url(#loop-arrow-return)"></path>
      </svg>

      <article class="step step--human" data-step data-step-index="0">
        <span class="step__number">1</span>
        <div class="step__copy">
          <strong class="step__title">Frames</strong>
          <p class="step__description">Set the direction, stakes, and constraints.</p>
        </div>
        <p class="step__warning"><strong>If skipped:</strong> direction weakens</p>
      </article>

      <article class="step step--ai" data-step data-step-index="1">
        <span class="step__number">2</span>
        <div class="step__copy">
          <strong class="step__title">Expands</strong>
          <p class="step__description">Generate options, surface patterns, increase range.</p>
        </div>
      </article>

      <article class="step step--human" data-step data-step-index="2">
        <span class="step__number">3</span>
        <div class="step__copy">
          <strong class="step__title">Interprets</strong>
          <p class="step__description">Select meaning, prioritize, challenge bias.</p>
        </div>
        <p class="step__warning"><strong>If skipped:</strong> meaning collapses</p>
      </article>

      <article class="step step--ai" data-step data-step-index="3">
        <span class="step__number">4</span>
        <div class="step__copy">
          <strong class="step__title">Scales</strong>
          <p class="step__description">Refine, structure, retrieve, operationalize.</p>
        </div>
      </article>

      <article class="step step--human" data-step data-step-index="4">
        <span class="step__number">5</span>
        <div class="step__copy">
          <strong class="step__title">Owns</strong>
          <p class="step__description">Sign, defend, take responsibility.</p>
        </div>
        <p class="step__warning step__warning--ownership"><strong>If skipped:</strong> accountability disappears</p>
      </article>
    </div>

    <button
      class="diagram-reveal"
      data-diagram-reveal
      data-tooltip="reveal"
      type="button"
      aria-label="Reveal all diagram content"
      aria-pressed="false"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 5c5.3 0 9.27 4.11 10.5 6.17a1.6 1.6 0 0 1 0 1.66C21.27 14.89 17.3 19 12 19S2.73 14.89 1.5 12.83a1.6 1.6 0 0 1 0-1.66C2.73 9.11 6.7 5 12 5Zm0 2c-4.13 0-7.43 3.08-8.55 5C4.57 13.92 7.87 17 12 17s7.43-3.08 8.55-5C19.43 10.08 16.13 7 12 7Zm0 1.75A3.25 3.25 0 1 1 12 15.25 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 12 13.25 1.25 1.25 0 0 0 12 10.75Z"></path>
      </svg>
    </button>

    <a
      class="diagram-download"
      data-tooltip="download diagram"
      href="/images/print/human-ai-loop-diagram.png"
      download="human-ai-loop-diagram.png"
      aria-label="Download diagram"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M11 4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"></path>
      </svg>
    </a>
  </section>
`;

class HumanAILoopDiagram extends HTMLElement {
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    const isExporting = new URL(window.location.href).searchParams.get("diagram-export") === "revealed";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.classList.toggle("is-exporting", isExporting);
    this.shadowRoot?.addEventListener("click", this.handleClick);
    this.resizeObserver = new ResizeObserver(() => this.updateConnectors());

    const flow = this.shadowRoot?.querySelector<HTMLElement>(".flow");

    if (flow) {
      this.resizeObserver.observe(flow);
    }

    requestAnimationFrame(() => this.updateConnectors());

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
      { threshold: 0.05 },
    );
    this.intersectionObserver.observe(this);
  }

  disconnectedCallback() {
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
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

    requestAnimationFrame(() => this.updateConnectors());
  }

  private updateConnectors() {
    const flow = this.shadowRoot?.querySelector<HTMLElement>(".flow");
    const svg = this.shadowRoot?.querySelector<SVGSVGElement>("[data-connectors]");
    const steps = Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>("[data-step]") ?? []);

    if (!flow || !svg || steps.length !== 5) {
      return;
    }

    const flowRect = flow.getBoundingClientRect();
    const relativeRect = (step: HTMLElement) => {
      const rect = step.getBoundingClientRect();

      return {
        bottom: rect.bottom - flowRect.top,
        centerX: rect.left - flowRect.left + rect.width / 2,
        centerY: rect.top - flowRect.top + rect.height / 2,
        left: rect.left - flowRect.left,
        right: rect.right - flowRect.left,
        top: rect.top - flowRect.top,
      };
    };
    const rects = steps.map(relativeRect);

    svg.setAttribute("viewBox", `0 0 ${flowRect.width} ${flowRect.height}`);

    for (let index = 0; index < rects.length - 1; index += 1) {
      const source = rects[index];
      const target = rects[index + 1];
      const connector = svg.querySelector<SVGPathElement>(`[data-connector-index="${index}"]`);

      if (!source || !target || !connector) {
        continue;
      }

      const movesRight = target.centerX > source.centerX;
      const targetEdgeX = movesRight ? target.left : target.right;
      connector.setAttribute(
        "d",
        `M ${source.centerX} ${source.bottom} V ${target.centerY} H ${targetEdgeX}`,
      );
    }

    const first = rects[0];
    const last = rects[4];
    const returnConnector = svg.querySelector<SVGPathElement>("[data-return-connector]");

    if (!first || !last || !returnConnector) {
      return;
    }

    const outerX = 3;
    returnConnector.setAttribute(
      "d",
      `M ${last.left} ${last.centerY} H ${outerX} V ${first.centerY} H ${first.left}`,
    );
  }
}

if (!customElements.get("human-ai-loop-diagram")) {
  customElements.define("human-ai-loop-diagram", HumanAILoopDiagram);
}

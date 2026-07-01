const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --quadrant-bg: var(--color-bg, #ffffff);
      --quadrant-text: var(--color-text, #111111);
      --quadrant-muted: var(--color-muted, #5d5d5d);
      --quadrant-surface: var(--color-surface, #f7f7f7);
      --quadrant-border: var(--color-border, #d8d8d8);
      display: block;
      margin: 2rem 0;
    }

    .quadrant {
      color: var(--quadrant-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      max-width: 100%;
      overflow: hidden;
      padding: 1rem 0;
      width: min(100%, 39rem);
    }

    .quadrant__canvas {
      aspect-ratio: 16 / 10;
      background: var(--quadrant-bg);
      min-height: 20rem;
      position: relative;
      width: 100%;
    }

    .axis {
      background: currentColor;
      color: var(--quadrant-text);
      display: block;
      opacity: 0.82;
      position: absolute;
      transition: transform 820ms cubic-bezier(0.2, 0.8, 0.2, 1);
      z-index: 1;
    }

    .axis--x {
      height: 2px;
      left: 8%;
      top: 50%;
      transform: scaleX(0);
      transform-origin: center;
      width: 80%;
    }

    .axis--y {
      height: 82%;
      left: 50%;
      top: 8%;
      transform: scaleY(0);
      transform-origin: center;
      width: 2px;
    }

    .axis::before,
    .axis::after {
      content: "";
      height: 0;
      opacity: 0;
      position: absolute;
      transition: opacity 180ms ease 760ms;
      width: 0;
    }

    .axis--x::before {
      border-bottom: 0.45rem solid transparent;
      border-right: 0.7rem solid currentColor;
      border-top: 0.45rem solid transparent;
      left: -0.7rem;
      top: 50%;
      transform: translateY(-50%);
    }

    .axis--x::after {
      border-bottom: 0.45rem solid transparent;
      border-left: 0.7rem solid currentColor;
      border-top: 0.45rem solid transparent;
      right: -0.7rem;
      top: 50%;
      transform: translateY(-50%);
    }

    .axis--y::before {
      border-bottom: 0.7rem solid currentColor;
      border-left: 0.45rem solid transparent;
      border-right: 0.45rem solid transparent;
      left: 50%;
      top: -0.7rem;
      transform: translateX(-50%);
    }

    .axis--y::after {
      border-left: 0.45rem solid transparent;
      border-right: 0.45rem solid transparent;
      border-top: 0.7rem solid currentColor;
      bottom: -0.7rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .axis-label {
      background: var(--quadrant-bg);
      color: var(--quadrant-muted);
      font-size: clamp(0.78rem, 1.5vw, 0.95rem);
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1.15;
      opacity: 0;
      padding: 0.125rem 0.25rem;
      pointer-events: none;
      position: absolute;
      text-align: center;
      transition:
        opacity 360ms ease 900ms,
        transform 360ms ease 900ms;
      z-index: 10;
    }

    .axis-label--y {
      left: 50%;
      top: 1%;
      transform: translate(-50%, 0.35rem);
    }

    .axis-label--x {
      font-size: clamp(0.68rem, 1.3vw, 0.82rem);
      right: 0;
      top: calc(50% - 2rem);
      transform: translate(0.2rem, -0.15rem);
      width: min(10rem, 27%);
    }

    .zone {
      appearance: none;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 0;
      color: inherit;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 32%;
      opacity: 0.92;
      padding: clamp(0.5rem, 2vw, 1.25rem);
      position: absolute;
      text-align: left;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        opacity 180ms ease;
      width: 38%;
      z-index: 3;
    }

    .zone:focus-visible {
      border-color: currentColor;
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }

    .zone:hover,
    .zone.is-open {
      background: transparent;
      border-color: transparent;
    }

    .zone--assist {
      left: 7%;
      top: 15%;
    }

    .zone--human {
      left: 54%;
      top: 15%;
    }

    .zone--automate {
      left: 7%;
      top: 56%;
    }

    .zone--guided {
      left: 54%;
      top: 56%;
    }

    .zone__title {
      color: var(--quadrant-muted);
      display: block;
      font-size: clamp(0.78rem, 1.5vw, 0.95rem);
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1.05;
      opacity: 0;
      transform: translateY(0.2rem);
      transition:
        opacity 180ms ease,
        transform 180ms ease;
    }

    .zone__criteria {
      color: var(--quadrant-text);
      display: grid;
      gap: 0.42rem;
      font-size: clamp(0.76rem, 1.45vw, 0.92rem);
      line-height: 1.25;
      opacity: 0;
      transform: translateY(0.2rem);
      transition:
        opacity 180ms ease,
        transform 180ms ease;
    }

    .zone.is-open .zone__title {
      opacity: 1;
      transform: none;
    }

    .zone.is-open:hover .zone__criteria,
    .zone.is-open:focus-visible .zone__criteria {
      opacity: 1;
      transform: none;
    }

    :host(.has-selected-phase) .zone {
      cursor: default;
    }

    :host(.has-selected-phase) .zone__title {
      opacity: 1;
      transform: none;
    }

    :host(.has-selected-phase) .zone__criteria {
      display: none;
    }

    .phase-label-layer {
      inset: 0;
      pointer-events: none;
      position: absolute;
      z-index: 6;
    }

    .phase-label {
      background: #595959;
      border: 1px solid #4d4d4d;
      border-radius: 999px;
      box-sizing: border-box;
      color: #ffffff;
      cursor: grab;
      font-size: clamp(0.74rem, 1.55vw, 1rem);
      font-weight: 500;
      height: 0.8rem;
      left: var(--label-left);
      letter-spacing: 0;
      line-height: 1.16;
      max-width: 46%;
      opacity: 0;
      overflow: hidden;
      padding: 0;
      pointer-events: auto;
      position: absolute;
      text-align: left;
      top: var(--label-top);
      touch-action: none;
      transform: translate(-50%, -50%) scale(0.96);
      transition:
        opacity 260ms ease var(--label-delay),
        left 520ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--label-delay),
      top 520ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--label-delay),
      transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--label-delay),
        width 180ms ease var(--expand-delay, 0ms),
        height 180ms ease var(--expand-delay, 0ms),
        padding 180ms ease var(--expand-delay, 0ms),
        border-radius 180ms ease var(--expand-delay, 0ms);
      user-select: none;
      width: 0.8rem;
    }

    .phase-label:hover {
      cursor: grab;
    }

    .phase-label.is-dragging {
      cursor: grabbing;
    }

    .phase-label.is-expanded,
    .phase-label.is-dragging,
    .phase-label.is-returning {
      border-radius: 6px;
      height: auto;
      padding: 0.55rem 0.75rem;
      width: min(var(--label-width), 46%);
    }

    .phase-label.is-dragging {
      transition: none;
      z-index: 9;
    }

    .phase-label.is-returning {
      transition:
        left 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
        top 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
        transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
      z-index: 9;
    }

    .phase-label__text {
      display: block;
      opacity: 0;
      transition: opacity 120ms ease var(--expand-delay, 0ms);
      white-space: normal;
    }

    .phase-label.is-expanded .phase-label__text,
    .phase-label.is-dragging .phase-label__text,
    .phase-label.is-returning .phase-label__text {
      opacity: 1;
    }

    :host(.has-phase) .phase-label {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    :host(.has-phase) .phase-label--float-a.is-expanded:not(.is-dragging):not(.is-returning) {
      animation: phase-label-float-a 5.8s ease-in-out var(--float-delay) infinite;
    }

    :host(.has-phase) .phase-label--float-b.is-expanded:not(.is-dragging):not(.is-returning) {
      animation: phase-label-float-b 6.4s ease-in-out var(--float-delay) infinite;
    }

    :host(.has-phase) .phase-label--float-c.is-expanded:not(.is-dragging):not(.is-returning) {
      animation: phase-label-float-c 6s ease-in-out var(--float-delay) infinite;
    }

    :host(.has-phase) .phase-label:hover,
    :host(.has-phase) .phase-label.is-dragging,
    :host(.has-phase) .phase-label.is-returning {
      animation-play-state: paused;
    }

    @keyframes phase-label-float-a {
      0%, 100% { transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1); }
      50% { transform: translate(-50%, -50%) translate3d(0.25rem, -0.22rem, 0) scale(1); }
    }

    @keyframes phase-label-float-b {
      0%, 100% { transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1); }
      50% { transform: translate(-50%, -50%) translate3d(-0.28rem, 0.24rem, 0) scale(1); }
    }

    @keyframes phase-label-float-c {
      0%, 100% { transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1); }
      50% { transform: translate(-50%, -50%) translate3d(0.18rem, 0.28rem, 0) scale(1); }
    }

    .phase-control {
      align-items: center;
      display: flex;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    :host([phase]) .phase-control {
      display: none;
    }

    .phase-control__label {
      color: var(--quadrant-muted);
      font-size: 0.82rem;
      font-weight: 700;
      line-height: 1;
    }

    .phase-control__select {
      appearance: auto;
      background: var(--quadrant-bg);
      border: 1px solid var(--quadrant-border);
      border-radius: 6px;
      color: var(--quadrant-text);
      font: inherit;
      font-size: 0.9rem;
      max-width: 100%;
      min-height: 2.25rem;
      padding: 0.35rem 0.5rem;
    }

    :host(.is-revealed) .axis--x {
      transform: scaleX(1);
    }

    :host(.is-revealed) .axis--y {
      transform: scaleY(1);
    }

    :host(.is-revealed) .axis::before,
    :host(.is-revealed) .axis::after,
    :host(.is-revealed) .axis-label {
      opacity: 1;
    }

    :host(.is-revealed) .axis-label--y {
      transform: translate(-50%, 0);
    }

    :host(.is-revealed) .axis-label--x {
      transform: translate(0, 0);
    }

    @media (max-width: 640px) {
      .quadrant__canvas {
        aspect-ratio: auto;
        min-height: 31rem;
      }

      .axis--x {
        left: 6%;
        width: 76%;
      }

      .axis--y {
        height: 78%;
        top: 11%;
      }

      .axis-label--x {
        font-size: 0.75rem;
        right: 0;
        width: 7rem;
      }

      .zone {
        min-height: 34%;
        padding: 0.75rem;
        width: 43%;
      }

      .zone--assist,
      .zone--automate {
        left: 1%;
      }

      .zone--human,
      .zone--guided {
        left: 55%;
      }

      .zone__title {
        font-size: clamp(0.72rem, 3vw, 0.86rem);
      }

      .phase-label {
        font-size: clamp(0.64rem, 2.8vw, 0.78rem);
        height: 0.7rem;
        max-width: 42%;
        width: 0.7rem;
      }

      .phase-label.is-expanded,
      .phase-label.is-dragging,
      .phase-label.is-returning {
        padding: 0.45rem 0.55rem;
        width: min(var(--label-width), 42%);
      }

      .phase-control {
        align-items: stretch;
        flex-direction: column;
        gap: 0.45rem;
      }
    }

    @media print {
      :host {
        break-inside: avoid;
        display: block;
        margin: 10pt 0;
        page-break-inside: avoid;
      }

      .quadrant {
        overflow: visible;
        padding: 0;
        width: 100%;
      }

      .quadrant__canvas {
        aspect-ratio: 16 / 10;
        min-height: 0;
      }

      .axis,
      .axis::before,
      .axis::after,
      .axis-label,
      .zone,
      .zone__title,
      .zone__criteria,
      .phase-label,
      .phase-label__text {
        transition: none !important;
      }

      .axis--x {
        transform: scaleX(1);
      }

      .axis--y {
        transform: scaleY(1);
      }

      .axis::before,
      .axis::after,
      .axis-label {
        opacity: 1;
      }

      .axis::before,
      .axis::after {
        background: transparent;
        border: 0;
        display: block;
        font-size: 10pt;
        font-weight: 800;
        height: auto;
        line-height: 1;
        width: auto;
      }

      .axis--x::before {
        content: "←";
        left: -10pt;
        top: 50%;
        transform: translateY(-50%);
      }

      .axis--x::after {
        content: "→";
        right: -10pt;
        top: 50%;
        transform: translateY(-50%);
      }

      .axis--y::before {
        content: "↑";
        left: 50%;
        top: -10pt;
        transform: translateX(-50%);
      }

      .axis--y::after {
        bottom: -10pt;
        content: "↓";
        left: 50%;
        transform: translateX(-50%);
      }

      .axis-label--y {
        transform: translate(-50%, 0);
      }

      .axis-label--x {
        transform: translate(0, 0);
      }

      .zone {
        cursor: default;
        gap: 0.24rem;
        min-height: 34%;
        padding: 0.32rem 0.45rem;
      }

      .zone__title,
      .zone__criteria,
      :host(.has-selected-phase) .zone__title,
      :host(.has-selected-phase) .zone__criteria {
        display: grid;
        opacity: 1;
        transform: none;
      }

      .zone__title {
        font-size: 7.2pt;
      }

      .zone__criteria {
        font-size: 6.2pt;
        gap: 0.08rem;
        line-height: 1.12;
      }

      .phase-label {
        animation: none !important;
        border-radius: 5px;
        font-size: 6.2pt;
        height: auto;
        max-width: 43%;
        opacity: 1;
        padding: 0.28rem 0.4rem;
        transform: translate(-50%, -50%) scale(1);
        width: min(var(--label-width), 43%);
      }

      .phase-label__text {
        opacity: 1;
      }

      .phase-control {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .axis,
      .axis::before,
      .axis::after,
      .axis-label,
      .zone,
      .zone__title,
      .zone__criteria,
      .phase-label__text,
      .phase-label {
        transition: none;
      }

      :host(.has-phase) .phase-label {
        animation: none !important;
      }
    }
  </style>
  <div
    class="quadrant"
    role="group"
    aria-label="AI research responsibility quadrant. Task complexity increases upward; context and judgment sensitivity increase to the right. Select a project phase to map task labels into the quadrant."
  >
    <div class="quadrant__canvas">
      <span class="axis axis--x" aria-hidden="true"></span>
      <span class="axis axis--y" aria-hidden="true"></span>
      <span class="axis-label axis-label--y">Task Complexity</span>
      <span class="axis-label axis-label--x">Context / Judgment Sensitivity</span>
      <button class="zone zone--assist" type="button" data-zone="assist" aria-expanded="false">
        <span class="zone__title">Assist Zone</span>
        <span class="zone__criteria">
          <span>Medium risk</span>
          <span>Safe with senior supervision</span>
        </span>
      </button>
      <button class="zone zone--human" type="button" data-zone="human" aria-expanded="false">
        <span class="zone__title">Human Only Zone</span>
        <span class="zone__criteria">
          <span>Critical human judgment</span>
          <span>No AI involvement</span>
        </span>
      </button>
      <button class="zone zone--automate" type="button" data-zone="automate" aria-expanded="false">
        <span class="zone__title">Automate Zone</span>
        <span class="zone__criteria">
          <span>Low risk</span>
          <span>Safe for all levels</span>
        </span>
      </button>
      <button class="zone zone--guided" type="button" data-zone="guided" aria-expanded="false">
        <span class="zone__title">Guided Interpretation Zone</span>
        <span class="zone__criteria">
          <span>High risk</span>
          <span>Senior judgment required</span>
        </span>
      </button>
      <div class="phase-label-layer" data-phase-label-layer aria-live="polite"></div>
    </div>
    <label class="phase-control">
      <span class="phase-control__label">Phase</span>
      <select class="phase-control__select" data-phase-select>
        <option value="none">None</option>
        <option value="planning">Planning Phase</option>
        <option value="data-collection">Data Collection</option>
        <option value="analysis">Analysis &amp; Meaning Making</option>
        <option value="reporting">Reporting</option>
        <option value="knowledge-management">Knowledge Management Phase</option>
      </select>
    </label>
  </div>
`;

type PhaseId =
  | "none"
  | "planning"
  | "data-collection"
  | "analysis"
  | "reporting"
  | "knowledge-management";

type PhaseZone = "assist" | "human" | "automate" | "guided";

type PhaseLabel = {
  text: string;
  left: string;
  top: string;
  width: string;
  zone: PhaseZone;
};

type PhaseLabelDragState = {
  container: HTMLElement;
  label: HTMLElement;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  returnTimer?: number;
};

const phaseLabels: Record<PhaseId, PhaseLabel[]> = {
  none: [],
  planning: [
    {
      text: "Enrich the external context understanding",
      left: "24%",
      top: "30%",
      width: "18rem",
      zone: "assist",
    },
    {
      text: "Understand the brief and objectives",
      left: "72%",
      top: "27%",
      width: "22rem",
      zone: "human",
    },
    {
      text: "Identify timeline and budget",
      left: "68%",
      top: "39%",
      width: "18rem",
      zone: "human",
    },
    {
      text: "Create the right sampling strategy",
      left: "68%",
      top: "58%",
      width: "21rem",
      zone: "guided",
    },
    {
      text: "Identify research method",
      left: "64%",
      top: "70%",
      width: "17rem",
      zone: "guided",
    },
    {
      text: "Developing survey questions/interview guides",
      left: "72%",
      top: "81%",
      width: "27rem",
      zone: "guided",
    },
  ],
  "data-collection": [],
  analysis: [],
  reporting: [],
  "knowledge-management": [],
};

class AIQuadrantDiagram extends HTMLElement {
  private activePhase: PhaseId = "none";
  private activeLabelDrag?: PhaseLabelDragState;
  private hoveredZone?: PhaseZone;
  private observer?: IntersectionObserver;
  private toggledZone?: PhaseZone;

  static get observedAttributes() {
    return ["phase"];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    this.shadowRoot?.addEventListener("click", this.handleClick);
    this.shadowRoot?.addEventListener("change", this.handlePhaseChange);
    this.shadowRoot?.addEventListener("pointerdown", this.handleLabelPointerDown);
    this.shadowRoot?.addEventListener("pointerover", this.handlePointerOver);
    this.shadowRoot?.addEventListener("pointerout", this.handlePointerOut);
    this.renderPhaseLabels(this.getConfiguredPhase() ?? "none");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      this.reveal();
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.reveal();
          this.observer?.disconnect();
        }
      },
      {
        threshold: 0.35,
      },
    );

    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.shadowRoot?.removeEventListener("click", this.handleClick);
    this.shadowRoot?.removeEventListener("change", this.handlePhaseChange);
    this.shadowRoot?.removeEventListener("pointerdown", this.handleLabelPointerDown);
    this.shadowRoot?.removeEventListener("pointerover", this.handlePointerOver);
    this.shadowRoot?.removeEventListener("pointerout", this.handlePointerOut);
    this.stopLabelDragTracking();
  }

  private reveal() {
    this.classList.add("is-revealed");
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) {
      return;
    }

    this.renderPhaseLabels(this.getConfiguredPhase() ?? "none");
  }

  private handleClick = (event: Event) => {
    const target = event.target as Element | null;
    const zoneElement = target?.closest<HTMLElement>(".zone");
    const zone = this.getZoneFromElement(target);

    if (!zone || !zoneElement) {
      return;
    }

    if (this.activePhase === "none") {
      const isOpen = zoneElement.classList.toggle("is-open");
      zoneElement.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    if (!this.isTouchToggleMode()) {
      return;
    }

    this.toggledZone = this.toggledZone === zone ? undefined : zone;
    this.updateExpandedLabels();
  };

  private handlePhaseChange = (event: Event) => {
    const target = event.target as HTMLSelectElement | null;

    if (!target?.matches("[data-phase-select]")) {
      return;
    }

    if (this.getConfiguredPhase()) {
      target.value = this.activePhase;
      return;
    }

    this.renderPhaseLabels(this.toPhaseId(target.value));
  };

  private handleLabelPointerDown = (event: Event) => {
    const pointerEvent = event as PointerEvent;

    if (pointerEvent.button !== 0) {
      return;
    }

    const target = pointerEvent.target as Element | null;
    const label = target?.closest<HTMLElement>(".phase-label");
    const container = target?.closest<HTMLElement>(".quadrant__canvas");

    if (!label || !container) {
      return;
    }

    pointerEvent.preventDefault();

    if (this.activeLabelDrag?.returnTimer) {
      window.clearTimeout(this.activeLabelDrag.returnTimer);
    }

    label.classList.remove("is-returning");
    label.classList.add("is-dragging");
    void label.offsetWidth;

    const containerRect = container.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const pointerX = pointerEvent.clientX - containerRect.left;
    const pointerY = pointerEvent.clientY - containerRect.top;
    const centerX = labelRect.left - containerRect.left + labelRect.width / 2;
    const centerY = labelRect.top - containerRect.top + labelRect.height / 2;

    label.style.left = `${centerX}px`;
    label.style.top = `${centerY}px`;
    label.setPointerCapture(pointerEvent.pointerId);

    this.activeLabelDrag = {
      container,
      label,
      offsetX: pointerX - centerX,
      offsetY: pointerY - centerY,
      pointerId: pointerEvent.pointerId,
    };

    window.addEventListener("pointermove", this.handleLabelPointerMove);
    window.addEventListener("pointerup", this.handleLabelPointerEnd);
    window.addEventListener("pointercancel", this.handleLabelPointerEnd);
  };

  private handleLabelPointerMove = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const drag = this.activeLabelDrag;

    if (!drag || drag.pointerId !== pointerEvent.pointerId) {
      return;
    }

    pointerEvent.preventDefault();

    const containerRect = drag.container.getBoundingClientRect();
    const labelRect = drag.label.getBoundingClientRect();
    const minX = labelRect.width / 2;
    const minY = labelRect.height / 2;
    const maxX = containerRect.width - minX;
    const maxY = containerRect.height - minY;
    const nextX = pointerEvent.clientX - containerRect.left - drag.offsetX;
    const nextY = pointerEvent.clientY - containerRect.top - drag.offsetY;

    drag.label.style.left = `${this.clamp(nextX, minX, maxX)}px`;
    drag.label.style.top = `${this.clamp(nextY, minY, maxY)}px`;
  };

  private handleLabelPointerEnd = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const drag = this.activeLabelDrag;

    if (!drag || drag.pointerId !== pointerEvent.pointerId) {
      return;
    }

    if (drag.label.hasPointerCapture(pointerEvent.pointerId)) {
      drag.label.releasePointerCapture(pointerEvent.pointerId);
    }

    this.stopLabelDragTracking();

    drag.label.classList.remove("is-dragging");
    drag.label.classList.add("is-returning");
    drag.label.style.left = "";
    drag.label.style.top = "";

    drag.returnTimer = window.setTimeout(() => {
      drag.label.classList.remove("is-returning");
      this.updateExpandedLabels();
    }, 460);

    this.activeLabelDrag = undefined;
  };

  private handlePointerOver = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const target = event.target as Element | null;
    const zone = this.getZoneFromElement(target);

    if (!zone || pointerEvent.pointerType === "touch") {
      return;
    }

    this.hoveredZone = zone;
    this.updateExpandedLabels();
  };

  private handlePointerOut = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const target = pointerEvent.target as Element | null;
    const zone = this.getZoneFromElement(target);
    const nextZone = this.getZoneFromElement(pointerEvent.relatedTarget as Element | null);

    if (!zone || pointerEvent.pointerType === "touch" || zone === nextZone) {
      return;
    }

    this.hoveredZone = undefined;
    this.updateExpandedLabels();
  };

  private renderPhaseLabels(phase: PhaseId) {
    const layer = this.shadowRoot?.querySelector<HTMLElement>("[data-phase-label-layer]");

    if (!layer) {
      return;
    }

    this.stopLabelDragTracking();
    this.activeLabelDrag = undefined;
    this.activePhase = phase;
    this.hoveredZone = undefined;
    this.toggledZone = undefined;
    this.classList.remove("has-phase");
    this.classList.toggle("has-selected-phase", phase !== "none");
    this.resetZoneReveal();
    layer.replaceChildren();
    this.syncPhaseControl(phase);

    const labels = phaseLabels[phase];

    if (labels.length === 0) {
      return;
    }

    labels.forEach((phaseLabel, index) => {
      const label = document.createElement("span");
      const text = document.createElement("span");

      label.className = `phase-label phase-label--float-${["a", "b", "c"][index % 3]}`;
      label.setAttribute("aria-label", phaseLabel.text);
      label.dataset.zone = phaseLabel.zone;
      label.style.setProperty("--label-left", phaseLabel.left);
      label.style.setProperty("--label-top", phaseLabel.top);
      label.style.setProperty("--label-width", phaseLabel.width);
      label.style.setProperty("--label-delay", `${180 + index * 135}ms`);
      label.style.setProperty("--float-delay", `${760 + index * 135}ms`);

      text.className = "phase-label__text";
      text.textContent = phaseLabel.text;
      label.append(text);
      layer.append(label);
    });

    requestAnimationFrame(() => {
      this.classList.add("has-phase");
      this.updateExpandedLabels();
    });
  }

  private toPhaseId(value: string): PhaseId {
    return Object.hasOwn(phaseLabels, value) ? (value as PhaseId) : "none";
  }

  private getConfiguredPhase(): PhaseId | undefined {
    const phase = this.getAttribute("phase");

    if (!phase || !Object.hasOwn(phaseLabels, phase)) {
      return undefined;
    }

    return phase as PhaseId;
  }

  private getZoneFromElement(element: Element | null): PhaseZone | undefined {
    const zoneElement = element?.closest<HTMLElement>("[data-zone]");
    const zone = zoneElement?.dataset.zone;

    return zone === "assist" || zone === "human" || zone === "automate" || zone === "guided"
      ? zone
      : undefined;
  }

  private isTouchToggleMode() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches || window.innerWidth <= 640;
  }

  private updateExpandedLabels() {
    const activeZone = this.hoveredZone ?? this.toggledZone;
    const labels = this.shadowRoot?.querySelectorAll<HTMLElement>(".phase-label");
    let expandedIndex = 0;

    labels?.forEach((label) => {
      const shouldExpand = label.dataset.zone === activeZone;

      if (shouldExpand) {
        label.style.setProperty("--expand-delay", `${expandedIndex * 95}ms`);
        expandedIndex += 1;
      } else {
        label.style.setProperty("--expand-delay", "0ms");
      }

      label.classList.toggle("is-expanded", shouldExpand);
    });
  }

  private resetZoneReveal() {
    const zones = this.shadowRoot?.querySelectorAll<HTMLElement>(".zone");

    zones?.forEach((zone) => {
      zone.classList.remove("is-open");
      zone.setAttribute("aria-expanded", "false");
    });
  }

  private syncPhaseControl(phase: PhaseId) {
    const select = this.shadowRoot?.querySelector<HTMLSelectElement>("[data-phase-select]");

    if (!select) {
      return;
    }

    select.value = phase;
  }

  private stopLabelDragTracking() {
    window.removeEventListener("pointermove", this.handleLabelPointerMove);
    window.removeEventListener("pointerup", this.handleLabelPointerEnd);
    window.removeEventListener("pointercancel", this.handleLabelPointerEnd);
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}

if (!customElements.get("ai-quadrant-diagram")) {
  customElements.define("ai-quadrant-diagram", AIQuadrantDiagram);
}

export {};

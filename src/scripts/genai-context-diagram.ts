const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --diagram-accent: var(--color-accent, #4b4bc3);
      --diagram-accent-3: var(--color-accent-3, #d6a9ac);
      --diagram-bg: var(--color-bg, #ffffff);
      --diagram-text: #fff;
      --diagram-muted: var(--color-muted, #5d5d5d);
      --diagram-surface: var(--color-surface, #f7f7f7);
      --diagram-border: var(--color-border, #d8d8d8);
      --connector-hot-x: 72%;
      --connector-hot-y: 50%;
      --word-origin-left: -4%;
      --word-origin-top: 50%;
      display: block;
      margin: 2rem 0;
    }

    .diagram {
      align-items: center;
      color: var(--diagram-text);
      display: grid;
      gap: clamp(0.5rem, 1.4vw, 1rem);
      grid-template-columns: minmax(14rem, 19rem) minmax(3rem, 1fr) minmax(14rem, 19rem);
      max-width: 100%;
      overflow: visible;
      padding: 1.25rem 0.75rem;
      position: relative;
    }

    .diagram-download {
      align-items: center;
      backdrop-filter: blur(0.35rem);
      background: color-mix(in srgb, var(--diagram-bg) 88%, transparent);
      border: 1px solid var(--diagram-border);
      border-radius: 50%;
      bottom: 0.65rem;
      color: var(--color-text, #111111);
      display: inline-flex;
      height: 2rem;
      justify-content: center;
      position: absolute;
      right: 0.65rem;
      transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
      width: 2rem;
      z-index: 6;
    }

    .diagram-download:hover,
    .diagram-download:focus-visible {
      background: var(--diagram-bg);
      border-color: var(--diagram-accent);
      transform: translateY(-0.1rem);
    }

    .diagram-download:focus-visible {
      outline: 2px solid var(--diagram-accent);
      outline-offset: 2px;
    }

    .diagram-download::after {
      background: var(--color-text, #111111);
      border-radius: 0.25rem;
      bottom: calc(100% + 0.45rem);
      color: var(--diagram-bg);
      content: attr(data-tooltip);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-small);
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
    .diagram-download:focus-visible::after {
      opacity: 1;
      transform: translateY(0);
    }

    .diagram-download svg {
      height: 0.85rem;
      width: 0.85rem;
    }

    .you-system {
      aspect-ratio: 1;
      display: grid;
      justify-self: center;
      place-items: center;
      position: relative;
      width: min(100%, 19rem);
    }

    .node {
      align-items: center;
      aspect-ratio: 1;
      background: var(--diagram-bg);
      // border: 2px solid currentColor;
      border-radius: 50%;
      display: inline-flex;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-h6);
      font-weight: 650;
      justify-content: center;
      justify-self: center;
      line-height: 1;
      min-width: 0;
      width: 100%;
    }

    .node.you {
      background: radial-gradient(circle at 50% 90%,var(--color-accent-3), var(--color-accent-4), var(--color-accent-5));
      box-shadow:
        0 0.75rem 1.45rem color-mix(in srgb, var(--diagram-accent) 12%, transparent),
        inset 0 0 2.25rem color-mix(in srgb, var(--diagram-bg) 12%, transparent);
      color: var(--color-accent-2);
    }

    .connector {
      align-items: center;
      color: var(--diagram-muted);
      display: flex;
      min-height: 2rem;
      overflow: visible;
      position: relative;
      width: 100%;
    }

    .connector__line {
      background:
        radial-gradient(
          circle at var(--connector-hot-x) var(--connector-hot-y),
          var(--diagram-accent-3) 0,
          color-mix(in srgb, var(--diagram-accent-3) 64%, var(--diagram-accent)) 16%,
          var(--diagram-accent) 44%
        );
      display: block;
      height: 4px;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1);
      width: calc(100% - 0.95rem);
    }

    .connector__head {
      background: var(--diagram-accent);
      clip-path: polygon(0 0, 100% 50%, 0 100%);
      display: block;
      height: 1.1rem;
      opacity: 0;
      transform: translateX(-0.4rem);
      transition:
        opacity 180ms ease 760ms,
        transform 260ms ease 760ms;
      width: 0.95rem;
    }

    .context-system {
      aspect-ratio: 1;
      justify-self: center;
      overflow: visible;
      position: relative;
      width: min(100%, 19rem);
    }

    .context-field {
      background: transparent;
      border: 3px dashed var(--diagram-accent);
      border-radius: 50%;
      box-sizing: border-box;
      box-shadow: none;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      position: absolute;
      z-index: 0;
    }

    .context-field__metaballs {
      filter: blur(0.18rem) saturate(1.08);
      height: 100%;
      inset: 0;
      mix-blend-mode: screen;
      opacity: 0.54;
      overflow: visible;
      position: absolute;
      width: 100%;
    }

    .context-field__blob {
      fill: url(#context-field-gradient-a);
      transform-box: fill-box;
      transform-origin: center;
      will-change: transform;
    }

    .context-field__blob--a {
      animation: field-metaball-a 18s ease-in-out infinite alternate;
    }

    .context-field__blob--b {
      animation: field-metaball-b 20s ease-in-out -3s infinite alternate;
    }

    .context-field__blob--c {
      animation: field-metaball-c 17s ease-in-out -2s infinite alternate;
    }

    .context-field__blob--d {
      animation: field-metaball-d 19s ease-in-out -4s infinite alternate;
    }

    .context-field__blob--e {
      animation: field-metaball-e 21s ease-in-out -5s infinite alternate;
      fill: url(#context-field-gradient-highlight);
      opacity: 0.58;
    }

    .genai-core {
      align-items: center;
      // background: var(--diagram-bg);
      // border: 2px solid currentColor;
      border-radius: 50%;
      display: flex;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-h6);
      font-weight: 650;
      height: 43%;
      isolation: isolate;
      justify-content: center;
      left: 50%;
      line-height: 1;
      // overflow: hidden;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 43%;
      z-index: 2;
    }

    .genai-core__metaballs {
      height: 136%;
      inset: -18%;
      opacity: 0.78;
      pointer-events: none;
      position: absolute;
      width: 136%;
      z-index: 0;
    }

    .genai-core__blob {
      transform-box: fill-box;
      transform-origin: center;
      will-change: transform;
    }

    .genai-core__blob--a {
      animation: metaball-a 7.4s ease-in-out infinite alternate;
      fill: var(--diagram-accent);
    }

    .genai-core__blob--b {
      animation: metaball-b 8.2s ease-in-out -1.2s infinite alternate;
      fill: color-mix(in srgb, var(--diagram-accent-3) 74%, var(--diagram-accent));
    }

    .genai-core__blob--c {
      animation: metaball-c 6.8s ease-in-out -2s infinite alternate;
      fill: var(--diagram-accent-3);
    }

    .genai-core__blob--d {
      animation: metaball-d 9s ease-in-out -3s infinite alternate;
      fill: color-mix(in srgb, var(--diagram-accent) 72%, var(--diagram-bg));
    }

    .genai-core__label {
      position: relative;
      // text-shadow:
      //   0 0 0.2rem var(--color-accent-4),
      //   0 0.02rem 0.1rem var(--diagram-bg);
      z-index: 2;
      color: var(--color-bg);
    }

    .context-word {
      color: var(--diagram-text);
      cursor: grab;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-small);
      font-weight: 650;
      line-height: 1.08;
      max-width: 7.25rem;
      opacity: 0;
      position: absolute;
      text-align: center;
      left: var(--word-origin-left);
      top: var(--word-origin-top);
      transform: translate(-50%, -50%) scale(0.78);
      transition:
        opacity 300ms ease var(--word-delay),
        left 620ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--word-delay),
        top 620ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--word-delay),
        transform 620ms cubic-bezier(0.2, 0.8, 0.2, 1) var(--word-delay);
      touch-action: none;
      user-select: none;
      z-index: 3;
    }

    .context-word:hover {
      cursor: grab;
    }

    .context-word.is-dragging {
      cursor: grabbing;
      transition: none;
      z-index: 4;
    }

    .context-word.is-returning {
      transition:
        left 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
        top 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
        transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
      z-index: 4;
    }

    .context-word__label {
      -webkit-text-stroke: 0.045rem var(--diagram-accent);
      animation: none;
      display: block;
      paint-order: stroke fill;
      text-shadow:
        0 0.055rem 0 var(--diagram-accent),
        0.055rem 0 0 var(--diagram-accent),
        0 -0.055rem 0 var(--diagram-accent),
        -0.055rem 0 0 var(--diagram-accent),
        0 0.12rem 0.9rem color-mix(in srgb, var(--diagram-accent) 46%, transparent);
    }

    .context-word--transfer {
      --target-left: var(--transfer-you-x, 22%);
      --target-top: var(--transfer-you-y, 58%);
      --word-delay: 1680ms;
      --float-delay: 2340ms;
      color: var(--diagram-accent);
      max-width: 6.75rem;
      z-index: 5;
    }

    .context-word--transfer.is-dropped {
      --target-left: var(--transfer-genai-x, 77%);
      --target-top: var(--transfer-genai-y, 72%);
    }

    .context-word--transfer.is-dragging {
      z-index: 6;
    }

    .context-word--transfer .context-word__label {
      -webkit-text-stroke: 0;
      paint-order: normal;
      text-shadow: none;
    }

    .diagram > .context-word--transfer {
      --target-left: var(--transfer-you-x, 22%);
      --target-top: var(--transfer-you-y, 58%);
    }

    .diagram > .context-word--transfer.is-dropped {
      --target-left: var(--transfer-genai-x, 77%);
      --target-top: var(--transfer-genai-y, 72%);
    }

    :host(.is-revealed) .connector__line {
      transform: scaleX(1);
    }

    :host(.is-revealed) .connector__head {
      opacity: 1;
      transform: translateX(0);
    }

    :host(.is-revealed) .context-word {
      left: var(--target-left);
      opacity: 1;
      top: var(--target-top);
      transform: translate(-50%, -50%) scale(1);
    }

    :host(.is-revealed) .context-word--transfer .context-word__label {
      animation: float-context-a 6.1s ease-in-out var(--float-delay) infinite;
    }

    :host(.is-revealed) .context-word:hover .context-word__label,
    :host(.is-revealed) .context-word.is-dragging .context-word__label,
    :host(.is-revealed) .context-word.is-returning .context-word__label {
      animation-play-state: paused;
    }

    @keyframes float-context-a {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0.35rem, -0.45rem, 0); }
    }

    @keyframes float-context-b {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(-0.4rem, 0.35rem, 0); }
    }

    @keyframes float-context-c {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0.25rem, 0.45rem, 0); }
    }

    @keyframes metaball-a {
      0% { transform: translate3d(-0.2rem, -0.15rem, 0) scale(1); }
      50% { transform: translate3d(0.55rem, 0.2rem, 0) scale(1.18); }
      100% { transform: translate3d(0.1rem, 0.55rem, 0) scale(0.92); }
    }

    @keyframes metaball-b {
      0% { transform: translate3d(0.55rem, -0.35rem, 0) scale(0.94); }
      45% { transform: translate3d(-0.2rem, 0.4rem, 0) scale(1.14); }
      100% { transform: translate3d(-0.55rem, -0.05rem, 0) scale(1.02); }
    }

    @keyframes metaball-c {
      0% { transform: translate3d(-0.4rem, 0.45rem, 0) scale(0.88); }
      55% { transform: translate3d(0.2rem, -0.3rem, 0) scale(1.2); }
      100% { transform: translate3d(0.45rem, 0.25rem, 0) scale(0.96); }
    }

    @keyframes metaball-d {
      0% { transform: translate3d(0.05rem, 0.15rem, 0) scale(1.08); }
      50% { transform: translate3d(-0.35rem, -0.45rem, 0) scale(0.94); }
      100% { transform: translate3d(0.42rem, -0.18rem, 0) scale(1.16); }
    }

    @keyframes field-metaball-a {
      0% { transform: translate3d(-0.08rem, -0.06rem, 0) scale(1); }
      45% { transform: translate3d(0.16rem, 0.08rem, 0) scale(1.015); }
      100% { transform: translate3d(0.06rem, 0.14rem, 0) scale(0.99); }
    }

    @keyframes field-metaball-b {
      0% { transform: translate3d(0.12rem, -0.1rem, 0) scale(0.995); }
      50% { transform: translate3d(-0.12rem, 0.16rem, 0) scale(1.02); }
      100% { transform: translate3d(-0.16rem, -0.02rem, 0) scale(1.005); }
    }

    @keyframes field-metaball-c {
      0% { transform: translate3d(-0.14rem, 0.14rem, 0) scale(0.995); }
      55% { transform: translate3d(0.08rem, -0.12rem, 0) scale(1.018); }
      100% { transform: translate3d(0.12rem, 0.08rem, 0) scale(1); }
    }

    @keyframes field-metaball-d {
      0% { transform: translate3d(0.04rem, 0.08rem, 0) scale(1.01); }
      50% { transform: translate3d(-0.12rem, -0.14rem, 0) scale(0.995); }
      100% { transform: translate3d(0.16rem, -0.06rem, 0) scale(1.02); }
    }

    @keyframes field-metaball-e {
      0% { transform: translate3d(-0.06rem, -0.12rem, 0) scale(1); }
      50% { transform: translate3d(0.12rem, 0.12rem, 0) scale(1.025); }
      100% { transform: translate3d(-0.12rem, 0.04rem, 0) scale(0.99); }
    }

    @media (max-width: 560px) {
      :host {
        margin: 1.5rem 0;
      }

      .diagram {
        gap: 0.5rem;
        grid-template-columns: 1fr;
        justify-items: center;
        padding: 0.5rem 0;
      }

      :host {
        --connector-hot-x: 50%;
        --connector-hot-y: 72%;
        --word-origin-left: 50%;
        --word-origin-top: -4%;
      }

      .node {
        width: min(7rem, 42vw);
      }

      .you-system {
        width: min(7rem, 42vw);
      }

      .connector {
        height: 3.5rem;
        justify-content: center;
        min-height: 3.5rem;
        width: 2rem;
      }

      .connector__line {
        background:
          radial-gradient(
            circle at var(--connector-hot-x) var(--connector-hot-y),
            var(--diagram-accent-3) 0,
            color-mix(in srgb, var(--diagram-accent-3) 64%, var(--diagram-accent)) 16%,
            var(--diagram-accent) 44%
          );
        height: calc(100% - 0.95rem);
        transform: scaleY(0);
        transform-origin: top center;
        width: 4px;
      }

      .connector__head {
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        height: 0.95rem;
        left: 50%;
        position: absolute;
        top: calc(100% - 0.95rem);
        transform: translate(-50%, -0.4rem);
        width: 1.1rem;
      }

      :host(.is-revealed) .connector__line {
        transform: scaleY(1);
      }

      :host(.is-revealed) .connector__head {
        transform: translate(-50%, 0);
      }

      .context-system {
        width: min(18rem, 92vw);
      }

      .context-field {
        inset: 0;
      }

      .context-word {
        font-size: var(--text-small);
        max-width: 5.75rem;
      }

      .context-word--transfer {
        font-size: var(--text-tiny);
        max-width: 4.75rem;
      }
    }

    @media print {
      :host {
        break-inside: avoid;
        display: block;
        margin: 10pt 0;
        page-break-inside: avoid;
      }

      .diagram {
        gap: 10pt;
        grid-template-columns: minmax(48pt, 64pt) minmax(24pt, 1fr) minmax(150pt, 176pt);
        overflow: visible;
        padding: 16pt 18pt;
      }

      .node,
      .genai-core {
        font-size: var(--text-base);
      }

      .context-field__metaballs,
      .genai-core__metaballs {
        display: none;
      }

      .connector__line,
      .connector__head,
      .context-word,
      .context-word__label {
        animation: none !important;
        transition: none !important;
      }

      .connector__line {
        height: 3pt;
        transform: scaleX(1);
      }

      .connector__head {
        height: 8pt;
        opacity: 1;
        transform: translateX(0);
        width: 7pt;
      }

      .context-system {
        width: 176pt;
      }

      .context-word {
        font-size: var(--text-tiny);
        left: var(--target-left);
        max-width: 54pt;
        opacity: 1;
        top: var(--target-top);
        transform: translate(-50%, -50%) scale(1);
      }

      .diagram-download {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .connector__line,
      .connector__head,
      .genai-core__blob,
      .context-field__blob,
      .context-word {
        transition: none;
      }

      .genai-core__blob,
      .context-field__blob {
        animation: none;
      }

      :host(.is-revealed) .context-word__label {
        animation: none;
      }
    }
  </style>
  <div
    class="diagram"
    role="group"
    aria-label="Human context moves from You toward GenAI, while physical context, social dynamic, emotion, cultural reflexes, and informal language remain around GenAI as contextual signals it cannot fully see."
  >
    <div class="you-system">
      <div class="node you">You</div>
    </div>
    <div class="connector" aria-hidden="true">
      <span class="connector__line"></span>
      <span class="connector__head"></span>
    </div>
    <div class="context-system">
      <div class="context-field" aria-hidden="true">

      </div>
      <div class="genai-core" aria-hidden="true">
        <svg class="genai-core__metaballs" viewBox="0 0 100 100" focusable="false">
          <defs>
            <filter id="genai-metaballs-filter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="goo"
              />
            </filter>
          </defs>
          <g filter="url(#genai-metaballs-filter)">
            <circle class="genai-core__blob genai-core__blob--a" cx="39" cy="42" r="24"></circle>
            <circle class="genai-core__blob genai-core__blob--b" cx="61" cy="37" r="21"></circle>
            <circle class="genai-core__blob genai-core__blob--c" cx="57" cy="62" r="19"></circle>
            <circle class="genai-core__blob genai-core__blob--d" cx="43" cy="58" r="16"></circle>
          </g>
        </svg>
        <span class="genai-core__label">GenAI</span>
      </div>
    </div>
    <span class="context-word context-word--transfer" data-transfer-index="0"><span class="context-word__label">Physical<br />Context</span></span>
    <span class="context-word context-word--transfer" data-transfer-index="1"><span class="context-word__label">Social<br />Dynamic</span></span>
    <span class="context-word context-word--transfer" data-transfer-index="2"><span class="context-word__label">Emotion</span></span>
    <span class="context-word context-word--transfer" data-transfer-index="3"><span class="context-word__label">Cultural<br />Reflexes</span></span>
    <span class="context-word context-word--transfer" data-transfer-index="4"><span class="context-word__label">Informal<br />Language</span></span>
    <a
      class="diagram-download"
      data-tooltip="download diagram"
      href="/images/print/genai-context-diagram.png"
      download="genai-context-diagram.png"
      aria-label="Download diagram"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3Zm-5 16h12v2H6v-2Z" />
      </svg>
    </a>
  </div>
`;

type DragState = {
  container: HTMLElement;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  returnTimer?: number;
  transfer: boolean;
  word: HTMLElement;
};

class GenAIContextDiagram extends HTMLElement {
  private activeDrag?: DragState;
  private connectorAnimationFrame = 0;
  private connectorCurrentX = 72;
  private connectorCurrentY = 50;
  private connectorTargetX = 72;
  private connectorTargetY = 50;
  private observer?: IntersectionObserver;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    const root = this.shadowRoot;

    if (!root) {
      return;
    }

    root.addEventListener("pointerdown", this.handlePointerDown);
    root.querySelector(".diagram")?.addEventListener("pointermove", this.handleConnectorPointerMove);
    root.querySelector(".diagram")?.addEventListener("pointerleave", this.handleConnectorPointerLeave);
    window.addEventListener("resize", this.updateTransferWordPositions);
    this.updateTransferWordPositions();

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
    this.shadowRoot?.removeEventListener("pointerdown", this.handlePointerDown);
    this.shadowRoot?.querySelector(".diagram")?.removeEventListener("pointermove", this.handleConnectorPointerMove);
    this.shadowRoot?.querySelector(".diagram")?.removeEventListener("pointerleave", this.handleConnectorPointerLeave);
    window.removeEventListener("resize", this.updateTransferWordPositions);
    this.stopConnectorPointerAnimation();
    this.stopDragTracking();
  }

  private reveal() {
    this.updateTransferWordPositions();
    this.classList.add("is-revealed");
  }

  private handlePointerDown = (event: Event) => {
    const pointerEvent = event as PointerEvent;

    if (!this.classList.contains("is-revealed") || pointerEvent.button !== 0) {
      return;
    }

    const target = pointerEvent.target as Element | null;
    const word = target?.closest<HTMLElement>(".context-word");
    const transfer = word?.classList.contains("context-word--transfer") ?? false;
    const container = transfer
      ? target?.closest<HTMLElement>(".diagram")
      : target?.closest<HTMLElement>(".context-system");

    if (!word || !container) {
      return;
    }

    pointerEvent.preventDefault();

    if (this.activeDrag?.returnTimer) {
      window.clearTimeout(this.activeDrag.returnTimer);
    }

    const containerRect = container.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    const pointerX = pointerEvent.clientX - containerRect.left;
    const pointerY = pointerEvent.clientY - containerRect.top;
    const centerX = wordRect.left - containerRect.left + wordRect.width / 2;
    const centerY = wordRect.top - containerRect.top + wordRect.height / 2;

    word.classList.remove("is-returning");
    word.classList.add("is-dragging");
    word.style.left = `${centerX}px`;
    word.style.top = `${centerY}px`;
    word.setPointerCapture(pointerEvent.pointerId);

    this.activeDrag = {
      container,
      offsetX: pointerX - centerX,
      offsetY: pointerY - centerY,
      pointerId: pointerEvent.pointerId,
      transfer,
      word,
    };

    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerEnd);
    window.addEventListener("pointercancel", this.handlePointerEnd);
  };

  private handlePointerMove = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const drag = this.activeDrag;

    if (!drag || drag.pointerId !== pointerEvent.pointerId) {
      return;
    }

    pointerEvent.preventDefault();

    const containerRect = drag.container.getBoundingClientRect();
    const wordRect = drag.word.getBoundingClientRect();
    const minX = wordRect.width / 2;
    const minY = wordRect.height / 2;
    const maxX = containerRect.width - minX;
    const maxY = containerRect.height - minY;
    const nextX = pointerEvent.clientX - containerRect.left - drag.offsetX;
    const nextY = pointerEvent.clientY - containerRect.top - drag.offsetY;

    drag.word.style.left = `${this.clamp(nextX, minX, maxX)}px`;
    drag.word.style.top = `${this.clamp(nextY, minY, maxY)}px`;
  };

  private handlePointerEnd = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const drag = this.activeDrag;

    if (!drag || drag.pointerId !== pointerEvent.pointerId) {
      return;
    }

    if (drag.word.hasPointerCapture(pointerEvent.pointerId)) {
      drag.word.releasePointerCapture(pointerEvent.pointerId);
    }

    this.stopDragTracking();

    drag.word.classList.remove("is-dragging");
    if (drag.transfer) {
      drag.word.classList.toggle("is-dropped", this.isPointInsideGenAIContainer(pointerEvent.clientX, pointerEvent.clientY));
    }
    drag.word.classList.add("is-returning");
    drag.word.style.left = "";
    drag.word.style.top = "";

    drag.returnTimer = window.setTimeout(() => {
      drag.word.classList.remove("is-returning");
    }, 460);

    this.activeDrag = undefined;
  };

  private handleConnectorPointerMove = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const diagram = pointerEvent.currentTarget as HTMLElement | null;

    if (!diagram || pointerEvent.pointerType === "touch" || this.activeDrag) {
      return;
    }

    const rect = diagram.getBoundingClientRect();
    const x = ((pointerEvent.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((pointerEvent.clientY - rect.top) / Math.max(rect.height, 1)) * 100;

    this.connectorTargetX = this.clamp(x, 0, 100);
    this.connectorTargetY = this.clamp(y, 0, 100);
    this.startConnectorPointerAnimation();
  };

  private handleConnectorPointerLeave = () => {
    const idlePoint = this.getConnectorIdlePoint();

    this.connectorTargetX = idlePoint.x;
    this.connectorTargetY = idlePoint.y;
    this.startConnectorPointerAnimation();
  };

  private startConnectorPointerAnimation() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.connectorCurrentX = this.connectorTargetX;
      this.connectorCurrentY = this.connectorTargetY;
      this.updateConnectorPointerVariables();
      return;
    }

    if (!this.connectorAnimationFrame) {
      this.connectorAnimationFrame = window.requestAnimationFrame(this.animateConnectorPointer);
    }
  }

  private animateConnectorPointer = () => {
    this.connectorCurrentX += (this.connectorTargetX - this.connectorCurrentX) * 0.16;
    this.connectorCurrentY += (this.connectorTargetY - this.connectorCurrentY) * 0.16;
    this.updateConnectorPointerVariables();

    if (
      Math.abs(this.connectorTargetX - this.connectorCurrentX) < 0.08
      && Math.abs(this.connectorTargetY - this.connectorCurrentY) < 0.08
    ) {
      this.connectorCurrentX = this.connectorTargetX;
      this.connectorCurrentY = this.connectorTargetY;
      this.updateConnectorPointerVariables();
      this.connectorAnimationFrame = 0;
      return;
    }

    this.connectorAnimationFrame = window.requestAnimationFrame(this.animateConnectorPointer);
  };

  private updateConnectorPointerVariables() {
    this.style.setProperty("--connector-hot-x", `${this.connectorCurrentX.toFixed(2)}%`);
    this.style.setProperty("--connector-hot-y", `${this.connectorCurrentY.toFixed(2)}%`);
  }

  private getConnectorIdlePoint() {
    if (window.matchMedia("(max-width: 560px)").matches) {
      return { x: 50, y: 72 };
    }

    return { x: 72, y: 50 };
  }

  private updateTransferWordPositions = () => {
    const root = this.shadowRoot;
    const diagram = root?.querySelector<HTMLElement>(".diagram");
    const you = root?.querySelector<HTMLElement>(".node.you");
    const contextSystem = root?.querySelector<HTMLElement>(".context-system");
    const transferWords = Array.from(root?.querySelectorAll<HTMLElement>(".context-word--transfer") ?? []);

    if (!diagram || !you || !contextSystem || transferWords.length === 0) {
      return;
    }

    const diagramRect = diagram.getBoundingClientRect();
    const youRect = you.getBoundingClientRect();
    const contextRect = contextSystem.getBoundingClientRect();

    if (!diagramRect.width || !diagramRect.height || !youRect.width || !contextRect.width) {
      return;
    }

    const youPlacements = [
      { x: 0.5, y: 0.28 },
      { x: 0.7, y: 0.45 },
      { x: 0.72, y: 0.62 },
      { x: 0.5, y: 0.78 },
      { x: 0.3, y: 0.62 },
    ];
    const genAIPlacements = [
      { x: 0.5, y: 0.13 },
      { x: 0.8, y: 0.32 },
      { x: 0.82, y: 0.58 },
      { x: 0.68, y: 0.78 },
      { x: 0.34, y: 0.77 },
    ];

    transferWords.forEach((word, fallbackIndex) => {
      const index = Number.parseInt(word.dataset.transferIndex ?? "", 10);
      const placementIndex = Number.isNaN(index) ? fallbackIndex : index;
      const youPlacement = youPlacements[placementIndex] ?? youPlacements[0];
      const genAIPlacement = genAIPlacements[placementIndex] ?? genAIPlacements[0];
      const youX = youRect.left - diagramRect.left + youRect.width * youPlacement.x;
      const youY = youRect.top - diagramRect.top + youRect.height * youPlacement.y;
      const genaiX = contextRect.left - diagramRect.left + contextRect.width * genAIPlacement.x;
      const genaiY = contextRect.top - diagramRect.top + contextRect.height * genAIPlacement.y;

      word.style.setProperty("--transfer-you-x", `${youX.toFixed(1)}px`);
      word.style.setProperty("--transfer-you-y", `${youY.toFixed(1)}px`);
      word.style.setProperty("--transfer-genai-x", `${genaiX.toFixed(1)}px`);
      word.style.setProperty("--transfer-genai-y", `${genaiY.toFixed(1)}px`);
    });
  };

  private isPointInsideGenAIContainer(clientX: number, clientY: number) {
    const field = this.shadowRoot?.querySelector<HTMLElement>(".context-field");

    if (!field) {
      return false;
    }

    const rect = field.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) / 2;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(clientX - centerX, clientY - centerY);

    return distance <= radius;
  }

  private stopConnectorPointerAnimation() {
    if (!this.connectorAnimationFrame) {
      return;
    }

    window.cancelAnimationFrame(this.connectorAnimationFrame);
    this.connectorAnimationFrame = 0;
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  private stopDragTracking() {
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerEnd);
    window.removeEventListener("pointercancel", this.handlePointerEnd);
  }
}

if (!customElements.get("genai-context-diagram")) {
  customElements.define("genai-context-diagram", GenAIContextDiagram);
}

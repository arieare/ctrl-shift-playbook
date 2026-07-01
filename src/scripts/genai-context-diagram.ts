const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --diagram-bg: var(--color-bg, #ffffff);
      --diagram-text: var(--color-text, #111111);
      --diagram-muted: var(--color-muted, #5d5d5d);
      --diagram-surface: var(--color-surface, #f7f7f7);
      --diagram-border: var(--color-border, #d8d8d8);
      display: block;
      margin: 2rem 0;
    }

    .diagram {
      align-items: center;
      color: var(--diagram-text);
      display: grid;
      gap: clamp(0.75rem, 3vw, 2rem);
      grid-template-columns: minmax(5.5rem, 7.5rem) minmax(3rem, 1fr) minmax(14rem, 19rem);
      max-width: 100%;
      overflow: visible;
      padding: 1.25rem 0.75rem;
    }

    .node {
      align-items: center;
      aspect-ratio: 1;
      background: var(--diagram-bg);
      border: 2px solid currentColor;
      border-radius: 50%;
      display: inline-flex;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: clamp(1rem, 2.2vw, 1.35rem);
      font-weight: 650;
      justify-content: center;
      justify-self: center;
      line-height: 1;
      min-width: 0;
      width: 100%;
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
      background: currentColor;
      display: block;
      height: 2px;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1);
      width: calc(100% - 0.625rem);
    }

    .connector__head {
      border-bottom: 0.4rem solid transparent;
      border-left: 0.65rem solid currentColor;
      border-top: 0.4rem solid transparent;
      display: block;
      opacity: 0;
      transform: translateX(-0.4rem);
      transition:
        opacity 180ms ease 760ms,
        transform 260ms ease 760ms;
    }

    .context-system {
      aspect-ratio: 1;
      justify-self: center;
      position: relative;
      width: min(100%, 19rem);
    }

    .context-field {
      background:
        radial-gradient(circle at center, var(--diagram-bg) 0 37%, transparent 38%),
        var(--diagram-surface);
      border: 2px solid currentColor;
      border-radius: 50%;
      inset: 0;
      position: absolute;
    }

    .genai-core {
      align-items: center;
      background: var(--diagram-bg);
      border: 2px solid currentColor;
      border-radius: 50%;
      display: flex;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: clamp(1.15rem, 2.4vw, 1.6rem);
      font-weight: 650;
      height: 43%;
      justify-content: center;
      left: 50%;
      line-height: 1;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 43%;
      z-index: 2;
    }

    .context-word {
      color: var(--diagram-text);
      cursor: grab;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: clamp(0.72rem, 1.45vw, 0.95rem);
      font-weight: 650;
      line-height: 1.08;
      max-width: 7.25rem;
      opacity: 0;
      position: absolute;
      text-align: center;
      left: 50%;
      top: 50%;
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
      animation: none;
      display: block;
    }

    .context-word:nth-of-type(1) {
      --target-left: 50%;
      --target-top: 13%;
      --word-delay: 1080ms;
      --float-delay: 1740ms;
    }

    .context-word:nth-of-type(2) {
      --target-left: 80%;
      --target-top: 32%;
      --word-delay: 1230ms;
      --float-delay: 1890ms;
    }

    .context-word:nth-of-type(3) {
      --target-left: 82%;
      --target-top: 58%;
      --word-delay: 1380ms;
      --float-delay: 2040ms;
    }

    .context-word:nth-of-type(4) {
      --target-left: 68%;
      --target-top: 78%;
      --word-delay: 1530ms;
      --float-delay: 2190ms;
    }

    .context-word:nth-of-type(5) {
      --target-left: 34%;
      --target-top: 77%;
      --word-delay: 1680ms;
      --float-delay: 2340ms;
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

    :host(.is-revealed) .context-word:nth-of-type(1) .context-word__label {
      animation: float-context-a 5.6s ease-in-out var(--float-delay) infinite;
    }

    :host(.is-revealed) .context-word:nth-of-type(2) .context-word__label {
      animation: float-context-b 6.2s ease-in-out var(--float-delay) infinite;
    }

    :host(.is-revealed) .context-word:nth-of-type(3) .context-word__label {
      animation: float-context-c 5.9s ease-in-out var(--float-delay) infinite;
    }

    :host(.is-revealed) .context-word:nth-of-type(4) .context-word__label {
      animation: float-context-b 6.6s ease-in-out var(--float-delay) infinite;
    }

    :host(.is-revealed) .context-word:nth-of-type(5) .context-word__label {
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

    @media (max-width: 560px) {
      :host {
        margin: 1.5rem 0;
      }

      .diagram {
        gap: 0.875rem;
        grid-template-columns: 1fr;
        justify-items: center;
        padding: 0.5rem 0;
      }

      .node {
        width: min(7rem, 42vw);
      }

      .connector {
        height: 4.5rem;
        justify-content: center;
        min-height: 4.5rem;
        width: 2rem;
      }

      .connector__line {
        height: calc(100% - 0.625rem);
        transform: scaleY(0);
        transform-origin: top center;
        width: 2px;
      }

      .connector__head {
        border-left: 0.4rem solid transparent;
        border-right: 0.4rem solid transparent;
        border-top: 0.65rem solid currentColor;
        border-bottom: 0;
        left: 50%;
        position: absolute;
        top: calc(100% - 0.65rem);
        transform: translate(-50%, -0.4rem);
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

      .context-word {
        font-size: clamp(0.68rem, 3vw, 0.82rem);
        max-width: 5.75rem;
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
        font-size: 10pt;
      }

      .connector__line,
      .connector__head,
      .context-word,
      .context-word__label {
        animation: none !important;
        transition: none !important;
      }

      .connector__line {
        transform: scaleX(1);
      }

      .connector__head {
        border: 0;
        opacity: 1;
        transform: translateX(0);
      }

      .connector__head::before {
        content: "→";
        display: block;
        font-size: 11pt;
        font-weight: 800;
        line-height: 1;
      }

      .context-system {
        width: 176pt;
      }

      .context-word {
        font-size: 7.2pt;
        left: var(--target-left);
        max-width: 54pt;
        opacity: 1;
        top: var(--target-top);
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .connector__line,
      .connector__head,
      .context-word {
        transition: none;
      }

      :host(.is-revealed) .context-word__label {
        animation: none;
      }
    }
  </style>
  <div
    class="diagram"
    role="img"
    aria-label="Human context moves from You toward GenAI, while physical context, social dynamic, emotion, cultural reflexes, and informal language remain around GenAI as contextual signals it cannot fully see."
  >
    <div class="node">You</div>
    <div class="connector" aria-hidden="true">
      <span class="connector__line"></span>
      <span class="connector__head"></span>
    </div>
    <div class="context-system">
      <div class="context-field" aria-hidden="true"></div>
      <div class="genai-core" aria-hidden="true">GenAI</div>
      <span class="context-word"><span class="context-word__label">Physical<br />Context</span></span>
      <span class="context-word"><span class="context-word__label">Social<br />Dynamic</span></span>
      <span class="context-word"><span class="context-word__label">Emotion</span></span>
      <span class="context-word"><span class="context-word__label">Cultural<br />Reflexes</span></span>
      <span class="context-word"><span class="context-word__label">Informal<br />Language</span></span>
    </div>
  </div>
`;

type DragState = {
  container: HTMLElement;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  returnTimer?: number;
  word: HTMLElement;
};

class GenAIContextDiagram extends HTMLElement {
  private activeDrag?: DragState;
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
    this.stopDragTracking();
  }

  private reveal() {
    this.classList.add("is-revealed");
  }

  private handlePointerDown = (event: Event) => {
    const pointerEvent = event as PointerEvent;

    if (!this.classList.contains("is-revealed") || pointerEvent.button !== 0) {
      return;
    }

    const target = pointerEvent.target as Element | null;
    const word = target?.closest<HTMLElement>(".context-word");
    const container = target?.closest<HTMLElement>(".context-system");

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
    drag.word.classList.add("is-returning");
    drag.word.style.left = "";
    drag.word.style.top = "";

    drag.returnTimer = window.setTimeout(() => {
      drag.word.classList.remove("is-returning");
    }, 460);

    this.activeDrag = undefined;
  };

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

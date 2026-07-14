const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --axis-hot-x: 50%;
      --axis-hot-y: 50%;
      --quadrant-accent: var(--color-accent, #4b4bc3);
      --quadrant-accent-3: var(--color-accent-3, #d6a9ac);
      --quadrant-bg: var(--color-bg, #ffffff);
      --quadrant-text: var(--color-text, #111111);
      --quadrant-muted: var(--color-muted, #5d5d5d);
      --quadrant-surface: var(--color-surface, #f7f7f7);
      --quadrant-border: var(--color-border, #d8d8d8);
      --quadrant-assist-highlight: var(--color-yellow-1, #F3EDCE);
      --quadrant-assist-highlight-end: var(--color-yellow-2, #F5E49C);
      --quadrant-human-highlight: var(--color-red-1, #FDE9EC);
      --quadrant-human-highlight-end: var(--color-red-2, #F793A7);
      --quadrant-human-label: var(--color-red-5, #2C030F);
      --quadrant-automate-highlight: var(--color-green-1, #E2F4E4);
      --quadrant-automate-highlight-end: var(--color-green-2, #A5D9AC);
      --quadrant-automate-label: var(--color-green-5, #29392B);
      --quadrant-guided-highlight: var(--color-orange-1, #FBEBDF);
      --quadrant-guided-highlight-end: var(--color-orange-2, #F5C29C);
      --quadrant-guided-label: var(--color-orange-5, #533114);
      --quadrant-assist-label: var(--color-yellow-5, #695616);
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
      aspect-ratio: 16 / 11;
      background: var(--quadrant-bg);
      min-height: 22rem;
      position: relative;
      width: 100%;
    }

    .axis {
      color: var(--quadrant-text);
      display: block;
      opacity: 0.92;
      position: absolute;
      transition: transform 820ms cubic-bezier(0.2, 0.8, 0.2, 1);
      z-index: 1;
    }

    .axis--x {
      background:
        radial-gradient(
          circle at var(--axis-hot-x) 50%,
          var(--quadrant-accent-3) 0,
          color-mix(in srgb, var(--quadrant-accent-3) 64%, var(--quadrant-accent)) 16%,
          var(--quadrant-accent) 44%
        );
      height: 4px;
      left: 3%;
      top: 50%;
      transform: scaleX(0);
      transform-origin: center;
      width: 90%;
    }

    .axis--y {
      background:
        radial-gradient(
          circle at 50% var(--axis-hot-y),
          var(--quadrant-accent-3) 0,
          color-mix(in srgb, var(--quadrant-accent-3) 64%, var(--quadrant-accent)) 16%,
          var(--quadrant-accent) 44%
        );
      height: 88%;
      left: 50%;
      top: 6%;
      transform: scaleY(0);
      transform-origin: center;
      width: 4px;
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
      background: var(--quadrant-accent);
      clip-path: polygon(100% 0, 0 50%, 100% 100%);
      height: 1.1rem;
      left: -0.95rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.95rem;
    }

    .axis--x::after {
      background: var(--quadrant-accent);
      clip-path: polygon(0 0, 100% 50%, 0 100%);
      height: 1.1rem;
      right: -0.95rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.95rem;
    }

    .axis--y::before {
      background: var(--quadrant-accent);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      height: 0.95rem;
      left: 50%;
      top: -0.95rem;
      transform: translateX(-50%);
      width: 1.1rem;
    }

    .axis--y::after {
      background: var(--quadrant-accent);
      bottom: -0.95rem;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      height: 0.95rem;
      left: 50%;
      transform: translateX(-50%);
      width: 1.1rem;
    }

    .axis-label {
      -webkit-text-stroke: 0.22rem var(--quadrant-bg);
      background: transparent;
      color: var(--quadrant-muted);
      font-size: var(--text-small);
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1.15;
      opacity: 0;
      padding: 0;
      paint-order: stroke fill;
      pointer-events: none;
      position: absolute;
      text-align: center;
      text-shadow:
        0 0 1px var(--quadrant-bg),
        0 1px 1px var(--quadrant-bg),
        1px 0 1px var(--quadrant-bg),
        0 -1px 1px var(--quadrant-bg),
        -1px 0 1px var(--quadrant-bg);
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
      font-size: var(--text-small);
      right: 0;
      top: calc(50% - 2rem);
      transform: translate(0.2rem, -0.15rem);
      width: min(10rem, 27%);
    }

    .zone {
      appearance: none;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm, 0.25rem);
      box-sizing: border-box;
      color: inherit;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      height: 38%;
      min-height: 0;
      opacity: 0.92;
      overflow: hidden;
      padding: clamp(0.5rem, 2vw, 1.25rem);
      position: absolute;
      text-align: left;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        opacity 180ms ease;
      width: 44%;
      z-index: 3;
    }

    .zone:focus-visible {
      outline: none;
    }

    .zone:hover,
    .zone.is-open,
    :host(.has-selected-phase) .zone {
      background:
        linear-gradient(
          135deg,
          var(--zone-highlight) 0%,
          color-mix(in srgb, var(--zone-highlight) 68%, var(--zone-highlight-end)) 100%
        );
      border-color: transparent;
    }

    .zone--assist {
      --zone-highlight: var(--quadrant-assist-highlight);
      --zone-highlight-end: var(--quadrant-assist-highlight-end);
      --zone-label-color: var(--quadrant-assist-label);
      left: 3%;
      top: 9%;
    }

    .zone--human {
      --zone-highlight: var(--quadrant-human-highlight);
      --zone-highlight-end: var(--quadrant-human-highlight-end);
      --zone-label-color: var(--quadrant-human-label);
      left: 53%;
      top: 9%;
    }

    .zone--automate {
      --zone-highlight: var(--quadrant-automate-highlight);
      --zone-highlight-end: var(--quadrant-automate-highlight-end);
      --zone-label-color: var(--quadrant-automate-label);
      left: 3%;
      top: 53%;
    }

    .zone--guided {
      --zone-highlight: var(--quadrant-guided-highlight);
      --zone-highlight-end: var(--quadrant-guided-highlight-end);
      --zone-label-color: var(--quadrant-guided-label);
      left: 53%;
      top: 53%;
    }

    .zone__title {
      color: var(--zone-label-color, var(--quadrant-muted));
      display: block;
      font-size: var(--text-small);
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
      font-size: var(--text-small);
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

    :host(.is-people-scenarios) .zone {
      background:
        linear-gradient(
          135deg,
          var(--zone-highlight) 0%,
          color-mix(in srgb, var(--zone-highlight) 68%, var(--zone-highlight-end)) 100%
        );
      border-color: transparent;
      cursor: default;
      pointer-events: none;
    }

    :host(.is-people-scenarios) .zone__title {
      font-size: clamp(var(--text-small), 2.4vw, var(--text-base));
      opacity: 1;
      transform: none;
    }

    :host(.is-people-scenarios) .zone__criteria,
    :host(.is-people-scenarios) .phase-label-layer,
    :host(.is-people-scenarios) .phase-control {
      display: none;
    }

    .phase-label-layer {
      inset: 0;
      pointer-events: none;
      position: absolute;
      z-index: 6;
    }

    .phase-label {
      background: var(--phase-label-bg, #595959);
      border: 1px solid color-mix(in srgb, var(--phase-label-bg, #595959) 82%, var(--quadrant-bg));
      border-radius: 999px;
      box-sizing: border-box;
      color: #ffffff;
      cursor: grab;
      font-size: var(--text-small);
      font-weight: 500;
      left: var(--label-left);
      letter-spacing: 0;
      line-height: 1.16;
      max-width: 46%;
      max-height: 0.8rem;
      opacity: 0;
      overflow: hidden;
      padding: 0;
      pointer-events: auto;
      position: absolute;
      text-align: left;
      top: var(--label-top);
      touch-action: none;
      transform: translate(-50%, -50%) scale(0.92);
      transition:
        opacity 340ms ease var(--label-delay),
        left 620ms cubic-bezier(0.16, 1, 0.3, 1) var(--label-delay),
        top 620ms cubic-bezier(0.16, 1, 0.3, 1) var(--label-delay),
        transform 620ms cubic-bezier(0.16, 1, 0.3, 1) var(--label-delay),
        width 680ms cubic-bezier(0.16, 1, 0.3, 1) var(--expand-delay, 0ms),
        max-height 680ms cubic-bezier(0.16, 1, 0.3, 1) var(--expand-delay, 0ms),
        padding 680ms cubic-bezier(0.16, 1, 0.3, 1) var(--expand-delay, 0ms),
        border-radius 680ms cubic-bezier(0.16, 1, 0.3, 1) var(--expand-delay, 0ms),
        filter 520ms ease var(--expand-delay, 0ms);
      user-select: none;
      will-change: width, max-height, padding, border-radius, filter;
      width: 0.8rem;
    }

    .phase-label[data-zone="assist"] {
      --phase-label-bg: var(--quadrant-assist-label);
    }

    .phase-label[data-zone="human"] {
      --phase-label-bg: var(--quadrant-human-label);
    }

    .phase-label[data-zone="automate"] {
      --phase-label-bg: var(--quadrant-automate-label);
    }

    .phase-label[data-zone="guided"] {
      --phase-label-bg: var(--quadrant-guided-label);
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
      max-height: 7rem;
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
      filter: blur(0.18rem);
      opacity: 0;
      transform: translateY(0.22rem) scale(0.985);
      transition:
        opacity 460ms ease calc(var(--expand-delay, 0ms) + 180ms),
        filter 520ms ease calc(var(--expand-delay, 0ms) + 140ms),
        transform 560ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--expand-delay, 0ms) + 140ms);
      white-space: normal;
      will-change: opacity, filter, transform;
    }

    .phase-label.is-expanded .phase-label__text,
    .phase-label.is-dragging .phase-label__text,
    .phase-label.is-returning .phase-label__text {
      filter: blur(0);
      opacity: 1;
      transform: translateY(0);
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

    .diagram-download {
      align-items: center;
      backdrop-filter: blur(0.35rem);
      background: color-mix(in srgb, var(--quadrant-bg) 88%, transparent);
      border: 1px solid var(--quadrant-border);
      border-radius: 50%;
      bottom: 0.65rem;
      color: var(--quadrant-text);
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
      background: var(--quadrant-bg);
      border-color: var(--quadrant-accent);
      transform: translateY(-0.1rem);
    }

    .diagram-download:focus-visible {
      outline: 2px solid var(--quadrant-accent);
      outline-offset: 2px;
    }

    .diagram-download::after {
      background: var(--quadrant-text);
      border-radius: 0.25rem;
      bottom: calc(100% + 0.45rem);
      color: var(--quadrant-bg);
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

    :host([phase]) .phase-control {
      display: none;
    }

    .phase-control__label {
      color: var(--quadrant-muted);
      font-size: var(--text-small);
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
      font-size: var(--text-small);
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
        min-height: 35rem;
      }

      .axis--x {
        left: 3%;
        width: 90%;
      }

      .axis--y {
        height: 88%;
        top: 6%;
      }

      .axis-label--x {
        font-size: var(--text-small);
        right: 0;
        width: 7rem;
      }

      .zone {
        height: 38%;
        padding: 0.75rem;
        width: 46%;
      }

      .zone--assist,
      .zone--automate {
        left: 2%;
      }

      .zone--human,
      .zone--guided {
        left: 52%;
      }

      .zone__title {
        font-size: var(--text-small);
      }

      .phase-label {
        font-size: var(--text-tiny);
        height: 0.7rem;
        max-width: 42%;
        width: 0.7rem;
      }

      .phase-label.is-expanded,
      .phase-label.is-dragging,
      .phase-label.is-returning {
        height: auto;
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
        height: 3pt;
        transform: scaleX(1);
      }

      .axis--y {
        transform: scaleY(1);
        width: 3pt;
      }

      .axis::before,
      .axis::after,
      .axis-label {
        opacity: 1;
      }

      .axis::before,
      .axis::after {
        border: 0;
        display: block;
      }

      .axis--x::before {
        background: var(--quadrant-accent);
        clip-path: polygon(100% 0, 0 50%, 100% 100%);
        height: 8pt;
        left: -7pt;
        top: 50%;
        transform: translateY(-50%);
        width: 7pt;
      }

      .axis--x::after {
        background: var(--quadrant-accent);
        clip-path: polygon(0 0, 100% 50%, 0 100%);
        height: 8pt;
        right: -7pt;
        top: 50%;
        transform: translateY(-50%);
        width: 7pt;
      }

      .axis--y::before {
        background: var(--quadrant-accent);
        clip-path: polygon(50% 0, 100% 100%, 0 100%);
        height: 7pt;
        left: 50%;
        top: -7pt;
        transform: translateX(-50%);
        width: 8pt;
      }

      .axis--y::after {
        background: var(--quadrant-accent);
        bottom: -7pt;
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        height: 7pt;
        left: 50%;
        transform: translateX(-50%);
        width: 8pt;
      }

      .axis-label--y {
        transform: translate(-50%, 0);
      }

      .axis-label--x {
        transform: translate(0, 0);
      }

      .zone {
        background: #ffffff;
        border-color: #bdbdbd;
        color: #000000;
        cursor: default;
        gap: 0.24rem;
        height: 34%;
        min-height: 34%;
        opacity: 1;
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
        color: #000000;
        font-size: var(--text-tiny);
      }

      .zone__criteria {
        color: #000000;
        font-size: var(--text-tiny);
        gap: 0.08rem;
        line-height: 1.12;
      }

      .axis-label {
        -webkit-text-stroke: 0;
        color: #000000;
        text-shadow: none;
      }

      .phase-label {
        animation: none !important;
        background: #ffffff;
        border: 1px solid #666666;
        border-radius: 5px;
        color: #000000;
        font-size: var(--text-tiny);
        max-height: none;
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

      .diagram-download {
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
      <a
        class="diagram-download"
        data-diagram-download
        data-tooltip="download diagram"
        href="/images/print/ai-quadrant-default.png"
        download="ai-quadrant-default.png"
        aria-label="Download diagram"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3Zm-5 16h12v2H6v-2Z" />
        </svg>
      </a>
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

const phaseImageNames: Record<PhaseId, string> = {
  none: "ai-quadrant-default.png",
  planning: "ai-quadrant-planning.png",
  "data-collection": "ai-quadrant-data-collection.png",
  analysis: "ai-quadrant-data-analysis.png",
  reporting: "ai-quadrant-reporting.png",
  "knowledge-management": "ai-quadrant-knowledge-management.png",
};

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
      left: "74%",
      top: "39%",
      width: "18rem",
      zone: "human",
    },
    {
      text: "Create the right sampling strategy",
      left: "74%",
      top: "58%",
      width: "21rem",
      zone: "guided",
    },
    {
      text: "Identify research method",
      left: "74%",
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
  "data-collection": [
    {
      text: "Desk Research",
      left: "24%",
      top: "20%",
      width: "16rem",
      zone: "assist",
    },
    {
      text: "Participant Recruitment",
      left: "28%",
      top: "30%",
      width: "16rem",
      zone: "assist",
    },
    {
      text: "Survey collection",
      left: "24%",
      top: "40%",
      width: "16rem",
      zone: "assist",
    },
    {
      text: "On-field translation",
      left: "28%",
      top: "49%",
      width: "16rem",
      zone: "assist",
    },
    {
      text: "Interview process",
      left: "72%",
      top: "40%",
      width: "17rem",
      zone: "human",
    },
    {
      text: "Data source determination",
      left: "72%",
      top: "71%",
      width: "18rem",
      zone: "guided",
    },
    {
      text: "Transcript creation",
      left: "26%",
      top: "78%",
      width: "16rem",
      zone: "automate",
    },
  ],
  analysis: [
    {
      text: "Define cluster & theme",
      left: "24%",
      top: "22%",
      width: "17rem",
      zone: "assist",
    },
    {
      text: "Finding suitable quotes",
      left: "28%",
      top: "34%",
      width: "17rem",
      zone: "assist",
    },
    {
      text: "Form insight statements",
      left: "24%",
      top: "46%",
      width: "17rem",
      zone: "assist",
    },
    {
      text: "Rephrase insight statement",
      left: "74%",
      top: "10%",
      width: "18rem",
      zone: "human",
    },
    {
      text: "Prioritize themes",
      left: "78%",
      top: "18%",
      width: "16rem",
      zone: "human",
    },
    {
      text: "Curating seeds for insights",
      left: "74%",
      top: "26%",
      width: "18rem",
      zone: "human",
    },
    {
      text: "Defining rules for data cleansing",
      left: "78%",
      top: "34%",
      width: "19rem",
      zone: "human",
    },
    {
      text: "Prioritize insights",
      left: "74%",
      top: "42%",
      width: "16rem",
      zone: "human",
    },
    {
      text: "Generate & cluster themes",
      left: "24%",
      top: "60%",
      width: "18rem",
      zone: "automate",
    },
    {
      text: "Identify anomalies",
      left: "28%",
      top: "70%",
      width: "16rem",
      zone: "automate",
    },
    {
      text: "Running data cleansing",
      left: "24%",
      top: "80%",
      width: "17rem",
      zone: "automate",
    },
    {
      text: "Uncover motivations",
      left: "28%",
      top: "90%",
      width: "16rem",
      zone: "automate",
    },
    {
      text: "Ideate on interpretation angles",
      left: "74%",
      top: "64%",
      width: "19rem",
      zone: "guided",
    },
    {
      text: "Determine cluster & theme",
      left: "76%",
      top: "80%",
      width: "18rem",
      zone: "guided",
    },
  ],
  reporting: [
    {
      text: "Generating image",
      left: "24%",
      top: "28%",
      width: "16rem",
      zone: "assist",
    },
    {
      text: "Ideate visual structure",
      left: "28%",
      top: "42%",
      width: "17rem",
      zone: "assist",
    },
    {
      text: "Presenting the report",
      left: "74%",
      top: "18%",
      width: "17rem",
      zone: "human",
    },
    {
      text: "Decide hook & main insights",
      left: "78%",
      top: "28%",
      width: "19rem",
      zone: "human",
    },
    {
      text: "Develop the narrative arc / skeleton",
      left: "74%",
      top: "38%",
      width: "21rem",
      zone: "human",
    },
    {
      text: "Select the narration and report format",
      left: "26%",
      top: "66%",
      width: "21rem",
      zone: "automate",
    },
    {
      text: "Recommendation wording",
      left: "28%",
      top: "82%",
      width: "18rem",
      zone: "automate",
    },
    {
      text: "Rewrite / rephrase",
      left: "74%",
      top: "68%",
      width: "17rem",
      zone: "guided",
    },
    {
      text: "Reframe to specific audience",
      left: "78%",
      top: "82%",
      width: "19rem",
      zone: "guided",
    },
  ],
  "knowledge-management": [
    {
      text: "Curating the insights",
      left: "24%",
      top: "32%",
      width: "17rem",
      zone: "assist",
    },
    {
      text: "Suggest related insights",
      left: "28%",
      top: "45%",
      width: "18rem",
      zone: "assist",
    },
    {
      text: "Interpret multiple insights",
      left: "74%",
      top: "18%",
      width: "19rem",
      zone: "human",
    },
    {
      text: "Synthesize data",
      left: "78%",
      top: "28%",
      width: "16rem",
      zone: "human",
    },
    {
      text: "Validating",
      left: "74%",
      top: "38%",
      width: "14rem",
      zone: "human",
    },
    {
      text: "Tagging, classification",
      left: "24%",
      top: "64%",
      width: "18rem",
      zone: "automate",
    },
    {
      text: "Construct knowledge framework",
      left: "28%",
      top: "76%",
      width: "20rem",
      zone: "automate",
    },
    {
      text: "Archiving",
      left: "24%",
      top: "88%",
      width: "14rem",
      zone: "automate",
    },
    {
      text: "Find data",
      left: "74%",
      top: "68%",
      width: "14rem",
      zone: "guided",
    },
  ],
};

class AIQuadrantDiagram extends HTMLElement {
  private activePhase: PhaseId = "none";
  private activeLabelDrag?: PhaseLabelDragState;
  private axisAnimationFrame = 0;
  private axisCurrentX = 50;
  private axisCurrentY = 50;
  private axisTargetX = 50;
  private axisTargetY = 50;
  private hoveredZone?: PhaseZone;
  private observer?: IntersectionObserver;
  private toggledZone?: PhaseZone;

  static get observedAttributes() {
    return ["phase", "variant"];
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
    this.shadowRoot?.querySelector(".quadrant__canvas")?.addEventListener("pointermove", this.handleAxisPointerMove);
    this.shadowRoot?.querySelector(".quadrant__canvas")?.addEventListener("pointerleave", this.handleAxisPointerLeave);
    this.renderPhaseLabels(this.getConfiguredPhase() ?? "none");
    this.applyVariant();

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
    this.shadowRoot?.querySelector(".quadrant__canvas")?.removeEventListener("pointermove", this.handleAxisPointerMove);
    this.shadowRoot?.querySelector(".quadrant__canvas")?.removeEventListener("pointerleave", this.handleAxisPointerLeave);
    this.stopAxisPointerAnimation();
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
    this.applyVariant();
  }

  private applyVariant() {
    const isPeopleScenarios = this.getAttribute("variant") === "people-scenarios";
    const quadrant = this.shadowRoot?.querySelector<HTMLElement>(".quadrant");
    const yAxisLabel = this.shadowRoot?.querySelector<HTMLElement>(".axis-label--y");
    const xAxisLabel = this.shadowRoot?.querySelector<HTMLElement>(".axis-label--x");
    const downloadLink = this.shadowRoot?.querySelector<HTMLAnchorElement>("[data-diagram-download]");
    const zones = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".zone");
    const zoneTitles = this.shadowRoot?.querySelectorAll<HTMLElement>(".zone__title");
    const defaultTitles = [
      "Assist Zone",
      "Human Only Zone",
      "Automate Zone",
      "Guided Interpretation Zone",
    ];
    const scenarioTitles = [
      "Practical AI at Scale",
      "Accelerated AI Transformation",
      "Cautious AI Landscape",
      "Untapped AI Potential",
    ];

    this.classList.toggle("is-people-scenarios", isPeopleScenarios);

    if (quadrant) {
      quadrant.setAttribute(
        "aria-label",
        isPeopleScenarios
          ? "AI ecosystem scenario quadrant. Company and client adoption of AI increases upward; AI progress in the ecosystem increases to the right."
          : "AI research responsibility quadrant. Task complexity increases upward; context and judgment sensitivity increase to the right. Select a project phase to map task labels into the quadrant.",
      );
    }

    if (yAxisLabel) {
      yAxisLabel.textContent = isPeopleScenarios ? "Company/Client adoption to AI" : "Task Complexity";
    }

    if (xAxisLabel) {
      xAxisLabel.textContent = isPeopleScenarios
        ? "AI Progress in the ecosystem"
        : "Context / Judgment Sensitivity";
    }

    zoneTitles?.forEach((title, index) => {
      title.textContent = (isPeopleScenarios ? scenarioTitles : defaultTitles)[index] ?? "";
    });

    zones?.forEach((zone) => {
      zone.disabled = isPeopleScenarios;
      zone.setAttribute("aria-expanded", "false");
    });

    if (downloadLink && isPeopleScenarios) {
      downloadLink.href = "/images/print/ai-scenario-quadrant.png";
      downloadLink.download = "ai-scenario-quadrant.png";
    }
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

  private handleAxisPointerMove = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const canvas = pointerEvent.currentTarget as HTMLElement | null;

    if (!canvas || pointerEvent.pointerType === "touch") {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((pointerEvent.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((pointerEvent.clientY - rect.top) / Math.max(rect.height, 1)) * 100;

    this.axisTargetX = this.clamp(x, 0, 100);
    this.axisTargetY = this.clamp(y, 0, 100);
    this.startAxisPointerAnimation();
  };

  private handleAxisPointerLeave = () => {
    this.axisTargetX = 50;
    this.axisTargetY = 50;
    this.startAxisPointerAnimation();
  };

  private startAxisPointerAnimation() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.axisCurrentX = this.axisTargetX;
      this.axisCurrentY = this.axisTargetY;
      this.updateAxisPointerVariables();
      return;
    }

    if (!this.axisAnimationFrame) {
      this.axisAnimationFrame = window.requestAnimationFrame(this.animateAxisPointer);
    }
  }

  private animateAxisPointer = () => {
    this.axisCurrentX += (this.axisTargetX - this.axisCurrentX) * 0.16;
    this.axisCurrentY += (this.axisTargetY - this.axisCurrentY) * 0.16;
    this.updateAxisPointerVariables();

    if (
      Math.abs(this.axisTargetX - this.axisCurrentX) < 0.08
      && Math.abs(this.axisTargetY - this.axisCurrentY) < 0.08
    ) {
      this.axisCurrentX = this.axisTargetX;
      this.axisCurrentY = this.axisTargetY;
      this.updateAxisPointerVariables();
      this.axisAnimationFrame = 0;
      return;
    }

    this.axisAnimationFrame = window.requestAnimationFrame(this.animateAxisPointer);
  };

  private updateAxisPointerVariables() {
    this.style.setProperty("--axis-hot-x", `${this.axisCurrentX.toFixed(2)}%`);
    this.style.setProperty("--axis-hot-y", `${this.axisCurrentY.toFixed(2)}%`);
  }

  private stopAxisPointerAnimation() {
    if (!this.axisAnimationFrame) {
      return;
    }

    window.cancelAnimationFrame(this.axisAnimationFrame);
    this.axisAnimationFrame = 0;
  }

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
    this.syncDownloadLink(phase);
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

  private syncDownloadLink(phase: PhaseId) {
    const link = this.shadowRoot?.querySelector<HTMLAnchorElement>("[data-diagram-download]");

    if (!link) {
      return;
    }

    const filename = phaseImageNames[phase];
    link.href = `/images/print/${filename}`;
    link.download = filename;
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

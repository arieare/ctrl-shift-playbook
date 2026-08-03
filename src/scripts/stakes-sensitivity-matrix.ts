export {};

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --matrix-accent: var(--color-accent, #4b4bc3);
      --matrix-accent-2: var(--color-accent-2, #7164bc);
      --matrix-accent-3: var(--color-accent-3, #d5a7aa);
      --matrix-bg: var(--color-bg, #ffffff);
      --matrix-border: var(--color-border, #d8d8d8);
      --matrix-text: var(--color-text, #343131);
      display: block;
      margin: 2rem 0;
    }

    :host(.is-exporting) {
      margin: 0;
      max-width: none;
      width: 75rem;
    }

    .diagram {
      color: var(--matrix-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      padding: 0.25rem 0 3.25rem;
      position: relative;
    }

    table {
      border-collapse: separate;
      border-spacing: 0.2rem 0.3rem;
      table-layout: fixed;
      width: calc(100% + 0.4rem);
      margin-inline: -0.2rem;
    }

    th,
    td {
      border: 0;
      font-family: var(--font-sans, system-ui, sans-serif);
      hyphens: none;
      text-align: center;
    }

    thead th,
    tbody th {
      background: transparent;
      color: color-mix(in srgb, var(--matrix-accent) 72%, var(--matrix-text));
      font-size: 0.6rem;
      font-weight: 650;
      letter-spacing: 0.075em;
      line-height: 1.15;
      text-transform: uppercase;
    }

    thead th {
      padding: 0 0.25rem 0.55rem;
    }

    col.matrix-row-label-column {
      width: 16%;
    }

    tbody th {
      padding: 0.7rem 0.6rem 0.7rem 0;
      text-align: right;
      white-space: nowrap;
    }

    td {
      background: var(--cell-bg);
      border-radius: 0.65rem;
      box-sizing: border-box;
      color: var(--cell-text);
      height: clamp(3.25rem, 6vw, 4rem);
      overflow: hidden;
      padding: 0.75rem 0.5rem;
      position: relative;
      transform: translateY(0.65rem) scale(0.985);
      opacity: 0;
      transition: background 150ms ease, color 150ms ease;
    }

    td::after {
      border: 1px solid transparent;
      border-radius: inherit;
      content: "";
      inset: 0;
      pointer-events: none;
      position: absolute;
      transition: border-color 150ms ease;
    }

    td:hover,
    td:focus-visible {
      background: var(--cell-hover-bg);
      outline: none;
    }

    td:hover::after,
    td:focus-visible::after {
      border-color: var(--cell-outline);
    }

    td strong {
      font-size: clamp(0.6rem, 0.9vw, 0.7rem);
      font-weight: 780;
      line-height: 1;
    }

    td[data-result="light"] {
      --cell-bg: var(--color-surface, #f7f7f7);
      --cell-hover-bg: color-mix(in srgb, var(--matrix-accent) 12%, var(--matrix-bg));
      --cell-outline: var(--matrix-border);
      --cell-text: var(--matrix-text);
    }

    td[data-result="standard"] {
      --cell-bg: color-mix(in srgb, var(--matrix-accent) 16%, var(--matrix-bg));
      --cell-hover-bg: color-mix(in srgb, var(--matrix-accent) 24%, var(--matrix-bg));
      --cell-outline: var(--matrix-accent);
      --cell-text: color-mix(in srgb, var(--matrix-accent) 72%, var(--matrix-text));
    }

    td[data-result="elevated"] {
      --cell-bg: color-mix(in srgb, var(--matrix-accent-2) 24%, var(--matrix-bg));
      --cell-hover-bg: color-mix(in srgb, var(--matrix-accent-2) 34%, var(--matrix-bg));
      --cell-outline: var(--matrix-accent-2);
      --cell-text: color-mix(in srgb, var(--matrix-accent-2) 72%, var(--matrix-text));
    }

    td[data-result="critical"] {
      --cell-bg: color-mix(in srgb, var(--matrix-accent-3) 42%, var(--matrix-bg));
      --cell-hover-bg: color-mix(in srgb, var(--matrix-accent-3) 56%, var(--matrix-bg));
      --cell-outline: var(--matrix-accent-3);
      --cell-text: color-mix(in srgb, var(--matrix-accent-3) 58%, var(--matrix-text));
    }

    :host(.is-revealed) td,
    :host(.is-static-view) td {
      animation: reveal-cell 440ms cubic-bezier(0.2, 0.75, 0.2, 1) forwards;
      animation-delay: calc(var(--reveal-index) * 85ms);
    }

    :host(.is-static-view) td,
    :host(.is-exporting) td {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .diagram-download,
    .diagram-reveal {
      align-items: center;
      appearance: none;
      backdrop-filter: blur(0.35rem);
      background: color-mix(in srgb, var(--matrix-bg) 88%, transparent);
      border: 1px solid var(--matrix-border);
      border-radius: 50%;
      bottom: 0.4rem;
      color: var(--matrix-text);
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
      background: var(--matrix-bg);
      border-color: var(--matrix-accent);
      transform: translateY(-0.1rem);
    }

    .diagram-download:focus-visible,
    .diagram-reveal:focus-visible {
      outline: 2px solid var(--matrix-accent);
      outline-offset: 2px;
    }

    .diagram-download::after,
    .diagram-reveal::after {
      background: var(--matrix-text);
      border-radius: 0.25rem;
      bottom: calc(100% + 0.45rem);
      color: var(--matrix-bg);
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
      background: var(--matrix-accent);
      border-color: var(--matrix-accent);
      color: var(--matrix-bg);
    }

    :host(.is-exporting) .diagram-download,
    :host(.is-exporting) .diagram-reveal {
      display: none;
    }

    @keyframes reveal-cell {
      from {
        opacity: 0;
        transform: translateY(0.65rem) scale(0.985);
      }

      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (min-width: 561px) {
      tbody th {
        padding-inline: 0.75rem 0.6rem;
      }
    }

    @media (max-width: 560px) {
      :host {
        margin-block: 1.5rem;
      }

      .diagram {
        padding-bottom: 2.85rem;
      }

      table {
        border-spacing: 0.12rem 0.2rem;
        margin-inline: -0.12rem;
        width: calc(100% + 0.24rem);
      }

      thead th,
      tbody th {
        font-size: 0.44rem;
        letter-spacing: 0.025em;
      }

      thead th {
        padding-inline: 0.1rem;
      }

      col.matrix-row-label-column {
        width: 3.7rem;
      }

      thead th span,
      tbody th span {
        display: block;
        white-space: nowrap;
      }

      tbody th {
        padding-right: 0.3rem;
      }

      td {
        border-radius: 0.45rem;
        height: 3.15rem;
        padding: 0.35rem 0.15rem;
      }

      td strong {
        font-size: 0.56rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      td {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }

    @media print {
      :host {
        display: none;
      }
    }
  </style>

  <section class="diagram" aria-label="Project standard by stakes and sensitivity">
    <table>
      <colgroup>
        <col class="matrix-row-label-column">
        <col span="3">
      </colgroup>
      <thead>
        <tr>
          <th aria-hidden="true"></th>
          <th scope="col"><span>Sensitivity</span> <span>low</span></th>
          <th scope="col"><span>Sensitivity</span> <span>medium</span></th>
          <th scope="col"><span>Sensitivity</span> <span>high</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row"><span>Stakes</span> <span>high</span></th>
          <td data-result="elevated" style="--reveal-index: 6" tabindex="0"><strong>Elevated</strong></td>
          <td data-result="elevated" style="--reveal-index: 7" tabindex="0"><strong>Elevated</strong></td>
          <td data-result="critical" style="--reveal-index: 8" tabindex="0"><strong>Critical</strong></td>
        </tr>
        <tr>
          <th scope="row"><span>Stakes</span> <span>medium</span></th>
          <td data-result="standard" style="--reveal-index: 3" tabindex="0"><strong>Standard</strong></td>
          <td data-result="standard" style="--reveal-index: 4" tabindex="0"><strong>Standard</strong></td>
          <td data-result="elevated" style="--reveal-index: 5" tabindex="0"><strong>Elevated</strong></td>
        </tr>
        <tr>
          <th scope="row"><span>Stakes</span> <span>low</span></th>
          <td data-result="light" style="--reveal-index: 0" tabindex="0"><strong>Light</strong></td>
          <td data-result="standard" style="--reveal-index: 1" tabindex="0"><strong>Standard</strong></td>
          <td data-result="elevated" style="--reveal-index: 2" tabindex="0"><strong>Elevated</strong></td>
        </tr>
      </tbody>
    </table>

    <button
      class="diagram-reveal"
      data-diagram-reveal
      data-tooltip="reveal"
      type="button"
      aria-label="Reveal all matrix content"
      aria-pressed="false"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 5c5.3 0 9.27 4.11 10.5 6.17a1.6 1.6 0 0 1 0 1.66C21.27 14.89 17.3 19 12 19S2.73 14.89 1.5 12.83a1.6 1.6 0 0 1 0-1.66C2.73 9.11 6.7 5 12 5Zm0 2c-4.13 0-7.43 3.08-8.55 5C4.57 13.92 7.87 17 12 17s7.43-3.08 8.55-5C19.43 10.08 16.13 7 12 7Zm0 1.75A3.25 3.25 0 1 1 12 15.25 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 12 13.25 1.25 1.25 0 0 0 12 10.75Z"></path>
      </svg>
    </button>

    <a
      class="diagram-download"
      data-tooltip="download diagram"
      href="/images/print/stakes-sensitivity-matrix.svg"
      download="stakes-sensitivity-matrix.svg"
      aria-label="Download diagram"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M11 4a1 1 0 1 1 2 0v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"></path>
      </svg>
    </a>
  </section>
`;

class StakesSensitivityMatrix extends HTMLElement {
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

    const shouldReveal = !this.classList.contains("is-static-view");
    this.setStaticView(shouldReveal);

    if (!shouldReveal) {
      this.classList.remove("is-revealed");
      requestAnimationFrame(() => this.classList.add("is-revealed"));
    }
  };

  private setStaticView(isStatic: boolean) {
    const button = this.shadowRoot?.querySelector<HTMLButtonElement>("[data-diagram-reveal]");

    this.classList.toggle("is-static-view", isStatic);
    this.classList.add("is-revealed");
    button?.setAttribute("aria-pressed", String(isStatic));
    button?.setAttribute("aria-label", isStatic ? "Replay matrix reveal" : "Reveal all matrix content");
    button?.setAttribute("data-tooltip", isStatic ? "replay" : "reveal");
  }
}

if (!customElements.get("stakes-sensitivity-matrix")) {
  customElements.define("stakes-sensitivity-matrix", StakesSensitivityMatrix);
}

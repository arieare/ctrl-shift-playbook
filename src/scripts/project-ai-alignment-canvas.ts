import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --canvas-bg: var(--color-bg, #ffffff);
      --canvas-border: var(--color-border, #d8d8d8);
      --canvas-muted: var(--color-muted, #5d5d5d);
      --canvas-surface: var(--color-surface, #f7f7f7);
      --canvas-text: var(--color-text, #111111);
      display: block;
      margin: 2rem 0;
    }

    .canvas {
      border-top: 1px solid var(--canvas-border);
      color: var(--canvas-text);
      font-family: var(--font-sans, system-ui, sans-serif);
      padding-top: 1rem;
    }

    .canvas__header {
      align-items: baseline;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem 0.75rem;
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: 1rem;
      line-height: 1.2;
      margin: 0;
    }

    .version {
      color: var(--canvas-muted);
      font-size: 0.875rem;
      font-weight: 700;
    }

    .lede {
      color: var(--canvas-text);
      flex-basis: 100%;
      font-size: 0.9375rem;
      line-height: 1.35;
      margin: 0;
    }

    .lede em,
    .hint {
      color: var(--canvas-muted);
      font-style: italic;
    }

    .canvas-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.9rem 0 1.25rem;
    }

    button {
      border: 0;
      border-radius: var(--radius-sm, 0.25rem);
      cursor: pointer;
      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      min-height: 2.4rem;
      padding: 0 0.9rem;
    }

    .button-primary {
      background: var(--canvas-text);
      color: var(--canvas-bg);
    }

    .button-secondary {
      background: var(--canvas-bg);
      box-shadow: inset 0 0 0 1px var(--canvas-border);
      color: var(--canvas-text);
    }

    .canvas-form {
      display: grid;
      gap: 1.25rem;
    }

    fieldset {
      border: 0;
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding: 0;
    }

    legend {
      color: var(--canvas-text);
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.2;
      padding: 0;
    }

    legend span {
      margin-right: 0.45rem;
    }

    .field-grid {
      display: grid;
      gap: 0.9rem 1rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    label,
    .field-label {
      color: var(--canvas-muted);
      display: grid;
      font-size: 0.8125rem;
      font-weight: 700;
      gap: 0.25rem;
      letter-spacing: 0;
      line-height: 1.2;
    }

    input[type="text"],
    textarea {
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--canvas-border);
      border-radius: 0;
      color: var(--canvas-text);
      font: inherit;
      font-size: 0.95rem;
      min-height: 2rem;
      padding: 0.25rem 0;
      resize: vertical;
      width: 100%;
    }

    textarea {
      line-height: 1.35;
      min-height: 4rem;
    }

    input:focus-visible,
    textarea:focus-visible {
      outline: 2px solid var(--canvas-text);
      outline-offset: 2px;
    }

    .sentence {
      align-items: end;
      display: grid;
      gap: 0.5rem;
      grid-template-columns: auto minmax(8rem, 1fr) auto minmax(6rem, 0.45fr);
    }

    .sentence span {
      font-size: 1.05rem;
      line-height: 1.25;
    }

    .choice-stack {
      display: grid;
      gap: 0.45rem;
    }

    .choice {
      align-items: baseline;
      color: var(--canvas-text);
      display: flex;
      font-size: 0.95rem;
      font-weight: 500;
      gap: 0.55rem;
      text-transform: none;
    }

    .choice input {
      accent-color: var(--canvas-text);
      inline-size: 1rem;
      margin: 0;
    }

    .posture-wrap {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      font-size: 0.9rem;
      min-width: 42rem;
      width: 100%;
    }

    th,
    td {
      border: 1px solid var(--canvas-border);
      padding: 0.55rem;
      text-align: left;
      vertical-align: middle;
    }

    th {
      background: var(--canvas-surface);
      color: var(--canvas-text);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .phase-name {
      font-weight: 800;
      width: 9rem;
    }

    .posture-choice {
      text-align: center;
      width: 5rem;
    }

    .posture-choice input {
      accent-color: var(--canvas-text);
      margin: 0;
    }

    .posture-note input {
      border-bottom: 0;
      min-height: 1.5rem;
      padding: 0;
    }

    .line-list {
      display: grid;
      gap: 0.45rem;
    }

    .commitments {
      display: grid;
      gap: 0.45rem;
    }

    @media (max-width: 700px) {
      .field-grid,
      .sentence {
        grid-template-columns: 1fr;
      }

      .sentence span {
        font-size: 1rem;
      }
    }

    @media print {
      :host {
        break-inside: avoid;
        display: block;
        margin: 0;
        page-break-inside: avoid;
      }

      .canvas {
        border-top: 1px solid #cccccc;
        font-size: 7.4pt;
        padding-top: 5pt;
      }

      .canvas__header {
        gap: 2pt 6pt;
        margin-bottom: 5pt;
      }

      h3 {
        font-size: 11pt;
      }

      .version {
        font-size: 8pt;
      }

      .lede {
        font-size: 7.4pt;
        line-height: 1.2;
      }

      .canvas-actions {
        display: none !important;
      }

      .canvas-form {
        gap: 5pt;
      }

      fieldset {
        break-inside: avoid;
        gap: 3pt;
        page-break-inside: avoid;
      }

      legend {
        font-size: 7.8pt;
        line-height: 1.1;
      }

      legend span {
        margin-right: 3pt;
      }

      .hint {
        display: none;
      }

      .field-grid {
        gap: 4pt 7pt;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      label,
      .field-label {
        font-size: 6.4pt;
        gap: 1pt;
        line-height: 1.1;
      }

      input[type="text"],
      textarea {
        border-bottom-color: #bdbdbd;
        font-size: 7.2pt;
        min-height: 11pt;
        padding: 1pt 0;
      }

      textarea {
        line-height: 1.15;
        min-height: 22pt;
      }

      .sentence {
        gap: 3pt;
        grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 0.45fr);
      }

      .sentence span {
        font-size: 7.6pt;
        line-height: 1.1;
      }

      .choice-stack,
      .line-list,
      .commitments {
        gap: 2pt;
      }

      .choice {
        font-size: 7pt;
        gap: 4pt;
        line-height: 1.1;
      }

      .choice input {
        inline-size: 7pt;
      }

      .posture-wrap {
        overflow: visible;
      }

      table {
        font-size: 6.7pt;
        min-width: 0;
      }

      th,
      td {
        padding: 2.5pt;
      }

      th {
        font-size: 6.3pt;
      }

      .phase-name {
        width: 48pt;
      }

      .posture-choice {
        width: 32pt;
      }

      .posture-choice input {
        transform: scale(0.72);
        transform-origin: center;
      }

      .posture-note input {
        min-height: 9pt;
      }
    }
  </style>

  <section class="canvas" aria-labelledby="alignment-canvas-title">
    <div class="canvas__header">
      <h3 id="alignment-canvas-title">Project AI Alignment Canvas</h3>
      <span class="version">v1.0</span>
      <p class="lede">
        The agreement between researcher and stakeholder on how AI will be used in this project.
        <em>Drafted by the research lead. Reviewed at kickoff. Re-open if scope changes.</em>
      </p>
    </div>

    <div class="canvas-actions" aria-label="Canvas actions">
      <button class="button-primary" type="button" data-download-canvas>Download Canvas</button>
      <button class="button-secondary" type="button" data-clear-canvas>Clear Canvas</button>
    </div>

    <form class="canvas-form" data-canvas-form>
      <fieldset>
        <legend><span>1</span>Project Identity</legend>
        <div class="field-grid">
          <label>Project name<input name="projectName" type="text" autocomplete="off"></label>
          <label>Date / version<input name="dateVersion" type="text" autocomplete="off"></label>
          <label>Research lead<input name="researchLead" type="text" autocomplete="off"></label>
          <label>Stakeholder lead<input name="stakeholderLead" type="text" autocomplete="off"></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>2</span>The Decision This Research Unlocks</legend>
        <p class="hint">One sentence. If this can't be filled, the project shouldn't start.</p>
        <div class="sentence">
          <span>This research will inform</span>
          <input name="decisionWhat" type="text" aria-label="Decision informed by this research">
          <span>by</span>
          <input name="decisionBy" type="text" aria-label="Decision deadline or action">
        </div>
      </fieldset>

      <fieldset>
        <legend><span>3</span>Sensitivity Level</legend>
        <p class="hint">Researcher proposes. Stakeholder confirms or escalates.</p>
        <div class="choice-stack">
          <label class="choice"><input name="sensitivity" type="radio" value="Standard"> <span>Standard — <em>routine decision, low stakes, non-sensitive participants</em></span></label>
          <label class="choice"><input name="sensitivity" type="radio" value="Elevated"> <span>Elevated — <em>meaningful business decision, or moderately sensitive context</em></span></label>
          <label class="choice"><input name="sensitivity" type="radio" value="Critical"> <span>Critical — <em>high-stakes decision, vulnerable participants, or external exposure</em></span></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>4</span>AI Posture By Phase</legend>
        <p class="hint">Tick one mode per phase. Notes capture the specific use.</p>
        <div class="posture-wrap">
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Human only</th>
                <th>AI assists</th>
                <th>AI automates</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody data-posture-rows></tbody>
          </table>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>5</span>What We Will Not Use AI For On This Project</legend>
        <p class="hint">Specific to this project — not a generic list. 3 to 5 items.</p>
        <div class="line-list">
          <input name="notUse1" type="text" aria-label="AI will not be used for item 1">
          <input name="notUse2" type="text" aria-label="AI will not be used for item 2">
          <input name="notUse3" type="text" aria-label="AI will not be used for item 3">
        </div>
      </fieldset>

      <fieldset>
        <legend><span>6</span>Stakeholder Commitments</legend>
        <p class="hint">Initialed by the stakeholder lead at kickoff.</p>
        <div class="commitments">
          <label class="choice"><input name="commitmentNoExternal" type="checkbox"> <span>I will not feed deliverables into external LLMs without consulting the research lead.</span></label>
          <label class="choice"><input name="commitmentRaiseConcerns" type="checkbox"> <span>I will raise concerns about AI usage during the project, not after.</span></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>7</span>Disclosure Statement Draft</legend>
        <p class="hint">The exact sentence that will appear in the final deliverable's methodology note. Drafted now — not at the end.</p>
        <textarea name="disclosure" aria-label="Disclosure statement draft"></textarea>
      </fieldset>
    </form>
  </section>
`;

type CanvasData = {
  commitments: {
    noExternal: boolean;
    raiseConcerns: boolean;
  };
  dateVersion: string;
  decisionBy: string;
  decisionWhat: string;
  disclosure: string;
  notUses: string[];
  posture: Record<string, { mode: string; notes: string }>;
  projectName: string;
  researchLead: string;
  sensitivity: string;
  stakeholderLead: string;
};

type PdfContext = {
  accent: ReturnType<typeof rgb>;
  black: ReturnType<typeof rgb>;
  bold: PDFFont;
  font: PDFFont;
  gray: ReturnType<typeof rgb>;
  lightAccent: ReturnType<typeof rgb>;
  lightGray: ReturnType<typeof rgb>;
  page: PDFPage;
};

const phases = [
  "Planning",
  "Data Collection",
  "Analysis",
  "Synthesis",
  "Reporting",
  "Knowledge Mgmt",
];

const postureModes = [
  { label: "Human only", value: "humanOnly" },
  { label: "AI assists", value: "aiAssists" },
  { label: "AI automates", value: "aiAutomates" },
];

const text = (value: FormDataEntryValue | null) => String(value ?? "").trim();

class ProjectAIAlignmentCanvas extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    this.renderPostureRows();
    this.shadowRoot?.querySelector("[data-download-canvas]")?.addEventListener("click", () => {
      void this.downloadPdf();
    });
    this.shadowRoot?.querySelector("[data-clear-canvas]")?.addEventListener("click", () => {
      this.clearCanvas();
    });
  }

  private renderPostureRows() {
    const tbody = this.shadowRoot?.querySelector<HTMLTableSectionElement>("[data-posture-rows]");

    if (!tbody || tbody.childElementCount > 0) {
      return;
    }

    phases.forEach((phase) => {
      const key = phase.toLowerCase().replaceAll(" ", "-");
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="phase-name">${phase}</td>
        ${postureModes
          .map((mode) => `
            <td class="posture-choice">
              <input name="posture-${key}" type="radio" value="${mode.value}" aria-label="${phase}: ${mode.label}">
            </td>
          `)
          .join("")}
        <td class="posture-note">
          <input name="posture-note-${key}" type="text" aria-label="${phase} notes">
        </td>
      `;
      tbody.append(row);
    });
  }

  private getData(): CanvasData {
    const form = this.shadowRoot?.querySelector<HTMLFormElement>("[data-canvas-form]");
    const data = new FormData(form ?? undefined);

    return {
      commitments: {
        noExternal: data.get("commitmentNoExternal") === "on",
        raiseConcerns: data.get("commitmentRaiseConcerns") === "on",
      },
      dateVersion: text(data.get("dateVersion")),
      decisionBy: text(data.get("decisionBy")),
      decisionWhat: text(data.get("decisionWhat")),
      disclosure: text(data.get("disclosure")),
      notUses: [text(data.get("notUse1")), text(data.get("notUse2")), text(data.get("notUse3"))],
      posture: Object.fromEntries(phases.map((phase) => {
        const key = phase.toLowerCase().replaceAll(" ", "-");

        return [
          phase,
          {
            mode: text(data.get(`posture-${key}`)),
            notes: text(data.get(`posture-note-${key}`)),
          },
        ];
      })),
      projectName: text(data.get("projectName")),
      researchLead: text(data.get("researchLead")),
      sensitivity: text(data.get("sensitivity")),
      stakeholderLead: text(data.get("stakeholderLead")),
    };
  }

  private clearCanvas() {
    this.shadowRoot?.querySelector<HTMLFormElement>("[data-canvas-form]")?.reset();
  }

  private async downloadPdf() {
    const data = this.getData();
    const bytes = await createCanvasPdf(data);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const blob = new Blob([buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "project-ai-alignment-canvas.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }
}

const drawText = (
  { page, font, black }: PdfContext,
  value: string,
  x: number,
  y: number,
  size = 9,
  maxWidth?: number,
) => {
  if (!value) {
    return;
  }

  if (!maxWidth) {
    page.drawText(value, { color: black, font, size, x, y });
    return;
  }

  wrapText(value, font, size, maxWidth).slice(0, 3).forEach((line, index) => {
    page.drawText(line, { color: black, font, size, x, y: y - index * (size + 2) });
  });
};

const drawSectionTitle = ({ page, bold, accent }: PdfContext, number: string, title: string, y: number) => {
  page.drawText(`${number}  ${title}`, {
    color: accent,
    font: bold,
    size: 13,
    x: 32,
    y,
  });
};

const drawLineField = (
  ctx: PdfContext,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) => {
  const { page, bold, gray, lightGray } = ctx;

  page.drawText(label, { color: gray, font: bold, size: 7.5, x, y: y + 14 });
  page.drawLine({
    color: lightGray,
    end: { x: x + width, y },
    start: { x, y },
    thickness: 1,
  });
  drawText(ctx, value, x, y + 3, 9, width - 4);
};

const drawCheckbox = (ctx: PdfContext, checked: boolean, x: number, y: number, size = 8) => {
  const { page, black } = ctx;

  page.drawRectangle({
    borderColor: black,
    borderWidth: 0.8,
    height: size,
    width: size,
    x,
    y,
  });

  if (checked) {
    page.drawLine({
      color: black,
      end: { x: x + size - 1.5, y: y + size - 1.5 },
      start: { x: x + 1.5, y: y + 1.5 },
      thickness: 1.1,
    });
    page.drawLine({
      color: black,
      end: { x: x + size - 1.5, y: y + 1.5 },
      start: { x: x + 1.5, y: y + size - 1.5 },
      thickness: 1.1,
    });
  }
};

const drawHint = ({ page, font, gray }: PdfContext, value: string, y: number) => {
  page.drawText(value, { color: gray, font, size: 8.5, x: 32, y });
};

const wrapText = (value: string, font: PDFFont, size: number, maxWidth: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
};

const createCanvasPdf = async (data: CanvasData) => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ctx: PdfContext = {
    accent: rgb(0.06, 0.06, 0.06),
    black: rgb(0.06, 0.06, 0.06),
    bold,
    font,
    gray: rgb(0.43, 0.43, 0.43),
    lightAccent: rgb(0.96, 0.96, 0.96),
    lightGray: rgb(0.82, 0.82, 0.82),
    page,
  };

  page.drawText("Project AI Alignment Canvas", {
    color: ctx.black,
    font: bold,
    size: 24,
    x: 32,
    y: 800,
  });
  page.drawText("v1.0", { color: ctx.gray, font: bold, size: 12, x: 368, y: 804 });
  page.drawText("The agreement between researcher and stakeholder on how AI will be used in this project.", {
    color: ctx.black,
    font,
    size: 10,
    x: 32,
    y: 783,
  });
  page.drawText("Drafted by the research lead. Reviewed at kickoff. Re-open if scope changes.", {
    color: ctx.gray,
    font,
    size: 9.5,
    x: 32,
    y: 770,
  });
  page.drawLine({
    color: ctx.lightGray,
    end: { x: 563, y: 755 },
    start: { x: 32, y: 755 },
    thickness: 1,
  });

  drawSectionTitle(ctx, "1", "PROJECT IDENTITY", 732);
  drawLineField(ctx, "PROJECT NAME", data.projectName, 32, 696, 250);
  drawLineField(ctx, "DATE / VERSION", data.dateVersion, 315, 696, 248);
  drawLineField(ctx, "RESEARCH LEAD", data.researchLead, 32, 662, 250);
  drawLineField(ctx, "STAKEHOLDER LEAD", data.stakeholderLead, 315, 662, 248);

  drawSectionTitle(ctx, "2", "THE DECISION THIS RESEARCH UNLOCKS", 632);
  drawHint(ctx, "One sentence. If this can't be filled, the project shouldn't start.", 618);
  page.drawText("This research will inform", { color: ctx.black, font, size: 12, x: 32, y: 598 });
  drawLineField(ctx, "", data.decisionWhat, 176, 594, 252);
  page.drawText("by", { color: ctx.black, font, size: 12, x: 438, y: 598 });
  drawLineField(ctx, "", data.decisionBy, 456, 594, 107);

  drawSectionTitle(ctx, "3", "SENSITIVITY LEVEL", 562);
  drawHint(ctx, "Researcher proposes. Stakeholder confirms or escalates.", 548);
  [
    ["Standard", "routine decision, low stakes, non-sensitive participants"],
    ["Elevated", "meaningful business decision, or moderately sensitive context"],
    ["Critical", "high-stakes decision, vulnerable participants, or external exposure"],
  ].forEach(([label, description], index) => {
    const y = 527 - index * 17;

    drawCheckbox(ctx, data.sensitivity === label, 36, y, 8);
    page.drawText(label, { color: ctx.black, font, size: 11, x: 52, y: y - 1 });
    page.drawText(`— ${description}`, { color: ctx.gray, font, size: 10, x: 105, y: y - 1 });
  });

  drawSectionTitle(ctx, "4", "AI POSTURE BY PHASE", 468);
  drawHint(ctx, 'Tick one mode per phase. Notes capture the specific use (e.g., "AI clusters themes; human curates seeds").', 454);
  drawPostureTable(ctx, data, 32, 256);

  drawSectionTitle(ctx, "5", "WHAT WE WILL NOT USE AI FOR ON THIS PROJECT", 228);
  drawHint(ctx, "Specific to this project — not a generic list. 3 to 5 items.", 214);
  data.notUses.forEach((value, index) => {
    drawLineField(ctx, "", value, 36, 195 - index * 18, 440);
  });

  drawSectionTitle(ctx, "6", "STAKEHOLDER COMMITMENTS", 130);
  drawHint(ctx, "Initialed by the stakeholder lead at kickoff.", 116);
  drawCheckbox(ctx, data.commitments.noExternal, 36, 94, 8);
  drawText(ctx, "I will not feed deliverables into external LLMs without consulting the research lead.", 52, 93, 10, 470);
  drawCheckbox(ctx, data.commitments.raiseConcerns, 36, 74, 8);
  drawText(ctx, "I will raise concerns about AI usage during the project, not after.", 52, 73, 10, 470);

  drawSectionTitle(ctx, "7", "DISCLOSURE STATEMENT DRAFT", 42);
  drawText(ctx, data.disclosure, 32, 26, 8.5, 520);

  return pdf.save();
};

const drawPostureTable = (ctx: PdfContext, data: CanvasData, x: number, y: number) => {
  const { page, accent, black, bold, lightAccent, lightGray } = ctx;
  const colWidths = [108, 64, 64, 74, 221];
  const rowHeight = 24;
  const headerHeight = 20;
  const headers = ["PHASE", "HUMAN ONLY", "AI ASSISTS", "AI AUTOMATES", "NOTES"];
  let currentX = x;

  page.drawRectangle({
    color: lightAccent,
    height: headerHeight,
    width: colWidths.reduce((sum, width) => sum + width, 0),
    x,
    y: y + phases.length * rowHeight,
  });

  headers.forEach((header, index) => {
    page.drawText(header, { color: accent, font: bold, size: 8, x: currentX + 5, y: y + phases.length * rowHeight + 7 });
    currentX += colWidths[index];
  });

  for (let index = 0; index <= phases.length + 1; index += 1) {
    const lineY = y + index * rowHeight;

    page.drawLine({
      color: lightGray,
      end: { x: x + colWidths.reduce((sum, width) => sum + width, 0), y: lineY },
      start: { x, y: lineY },
      thickness: 0.8,
    });
  }

  currentX = x;
  colWidths.forEach((width) => {
    page.drawLine({
      color: lightGray,
      end: { x: currentX, y: y + phases.length * rowHeight + headerHeight },
      start: { x: currentX, y },
      thickness: 0.8,
    });
    currentX += width;
  });
  page.drawLine({
    color: lightGray,
    end: { x: currentX, y: y + phases.length * rowHeight + headerHeight },
    start: { x: currentX, y },
    thickness: 0.8,
  });

  phases.forEach((phase, index) => {
    const rowY = y + (phases.length - index - 1) * rowHeight;
    const posture = data.posture[phase] ?? { mode: "", notes: "" };

    page.drawText(phase, { color: black, font: bold, size: 9.5, x: x + 6, y: rowY + 8 });
    postureModes.forEach((mode, modeIndex) => {
      const cellX = x + colWidths[0] + colWidths.slice(1, modeIndex + 1).reduce((sum, width) => sum + width, 0);

      drawCheckbox(ctx, posture.mode === mode.value, cellX + colWidths[modeIndex + 1] / 2 - 4, rowY + 8, 8);
    });
    drawText(ctx, posture.notes, x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 6, rowY + 8, 8, colWidths[4] - 12);
  });
};

if (!customElements.get("project-ai-alignment-canvas")) {
  customElements.define("project-ai-alignment-canvas", ProjectAIAlignmentCanvas);
}

export {};

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { getPdfTypeScale, type PdfTypeScale } from "./pdf-type-scale";
import { createCanvasPdf, type CanvasData } from "./project-ai-alignment-canvas";

type PdfColor = ReturnType<typeof rgb>;

type PdfTheme = {
  accent: PdfColor;
  accentSoft: PdfColor;
  bg: PdfColor;
  border: PdfColor;
  muted: PdfColor;
  surface: PdfColor;
  text: PdfColor;
};

type PdfContext = {
  bold: PDFFont;
  bodyFont: PDFFont;
  font: PDFFont;
  page: PDFPage;
  pageNumber: number;
  pdf: PDFDocument;
  theme: PdfTheme;
  type: PdfTypeScale;
  y: number;
};

type PhaseId = "none" | "planning" | "data-collection" | "analysis" | "reporting" | "knowledge-management";
type PhaseZone = "assist" | "human" | "automate" | "guided";

const pageWidth = 595.28;
const pageHeight = 841.89;
const marginX = 54;
const marginTop = 58;
const marginBottom = 54;
const contentWidth = pageWidth - marginX * 2;

const phaseNames: Record<PhaseId, string> = {
  analysis: "Analysis & Meaning Making",
  "data-collection": "Data Collection",
  "knowledge-management": "Knowledge Management",
  none: "Default Map",
  planning: "Planning Phase",
  reporting: "Reporting",
};

const zoneContent: Record<PhaseZone, { criteria: string[]; title: string }> = {
  assist: {
    criteria: ["Medium risk", "Safe with senior supervision"],
    title: "Assist Zone",
  },
  automate: {
    criteria: ["Low risk", "Safe for all levels"],
    title: "Automate Zone",
  },
  guided: {
    criteria: ["High risk", "Senior judgment required"],
    title: "Guided Interpretation Zone",
  },
  human: {
    criteria: ["Critical human judgment", "No AI involvement"],
    title: "Human Only Zone",
  },
};

const zoneLayout: Record<PhaseZone, { left: number; top: number }> = {
  assist: { left: 0.07, top: 0.15 },
  automate: { left: 0.07, top: 0.56 },
  guided: { left: 0.54, top: 0.56 },
  human: { left: 0.54, top: 0.15 },
};

const planningLabels = [
  { left: 0.24, text: "Enrich the external context understanding", top: 0.3, width: 118 },
  { left: 0.72, text: "Understand the brief and objectives", top: 0.27, width: 128 },
  { left: 0.68, text: "Identify timeline and budget", top: 0.39, width: 112 },
  { left: 0.68, text: "Create the right sampling strategy", top: 0.58, width: 124 },
  { left: 0.64, text: "Identify research method", top: 0.7, width: 106 },
  { left: 0.72, text: "Developing survey questions/interview guides", top: 0.81, width: 148 },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseCssColor = (value: string, fallback: string): PdfColor => {
  const color = value.trim() || fallback;
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  const rgba = color.match(/^rgba?\(([^)]+)\)$/i);

  if (hex) {
    const raw = hex[1].length === 3
      ? hex[1].split("").map((character) => `${character}${character}`).join("")
      : hex[1];
    const numeric = Number.parseInt(raw, 16);

    return rgb(
      ((numeric >> 16) & 255) / 255,
      ((numeric >> 8) & 255) / 255,
      (numeric & 255) / 255,
    );
  }

  if (rgba) {
    const [red = "0", green = "0", blue = "0"] = rgba[1].split(",").map((part) => part.trim());

    return rgb(
      clamp(Number.parseFloat(red) / 255, 0, 1),
      clamp(Number.parseFloat(green) / 255, 0, 1),
      clamp(Number.parseFloat(blue) / 255, 0, 1),
    );
  }

  return parseCssColor(fallback, "#000000");
};

const getTheme = (): PdfTheme => {
  const styles = window.getComputedStyle(document.documentElement);

  return {
    accent: parseCssColor(styles.getPropertyValue("--color-accent"), "#4849c4"),
    accentSoft: parseCssColor(styles.getPropertyValue("--color-accent-3"), "#d5a7aa"),
    bg: parseCssColor(styles.getPropertyValue("--color-bg"), "#fefdfb"),
    border: parseCssColor(styles.getPropertyValue("--color-border"), "#d8d8d8"),
    muted: parseCssColor(styles.getPropertyValue("--color-muted"), "#5d5d5d"),
    surface: parseCssColor(styles.getPropertyValue("--color-surface"), "#f7f7f7"),
    text: parseCssColor(styles.getPropertyValue("--color-text"), "#343131"),
  };
};

const mixColor = (from: PdfColor, to: PdfColor, amount: number) => {
  const t = clamp(amount, 0, 1);

  return rgb(
    from.red + (to.red - from.red) * t,
    from.green + (to.green - from.green) * t,
    from.blue + (to.blue - from.blue) * t,
  );
};

const normalizePdfText = (value: string) => value
  .replace(/\u00a0/g, " ")
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/[–—]/g, "-")
  .replace(/[•·]/g, "-")
  .replace(/[🔴🟠🟡🟢]/gu, "")
  .replace(/\s+/g, " ")
  .trim();

const wrapText = (value: string, font: PDFFont, size: number, maxWidth: number) => {
  const words = normalizePdfText(value).split(/\s+/).filter(Boolean);
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

  return lines;
};

const addPage = (ctx: PdfContext) => {
  ctx.page = ctx.pdf.addPage([pageWidth, pageHeight]);
  ctx.pageNumber += 1;
  ctx.y = pageHeight - marginTop;
  ctx.page.drawRectangle({
    color: ctx.theme.bg,
    height: pageHeight,
    width: pageWidth,
    x: 0,
    y: 0,
  });
};

const ensureSpace = (ctx: PdfContext, needed: number) => {
  if (ctx.y - needed < marginBottom) {
    addPage(ctx);
  }
};

const drawTextBlock = (
  ctx: PdfContext,
  value: string,
  options: {
    color?: PdfColor;
    font?: PDFFont;
    indent?: number;
    lineHeight?: number;
    maxLines?: number;
    size?: number;
    spacingAfter?: number;
    width?: number;
  } = {},
) => {
  const size = options.size ?? ctx.type.base;
  const lineHeight = options.lineHeight ?? size * 1.42;
  const indent = options.indent ?? 0;
  const width = options.width ?? contentWidth - indent;
  const font = options.font ?? ctx.bodyFont;
  const lines = wrapText(value, font, size, width).slice(0, options.maxLines);
  const height = Math.max(lines.length, 1) * lineHeight + (options.spacingAfter ?? 8);

  ensureSpace(ctx, height);
  lines.forEach((line, index) => {
    ctx.page.drawText(line, {
      color: options.color ?? ctx.theme.text,
      font,
      size,
      x: marginX + indent,
      y: ctx.y - index * lineHeight,
    });
  });
  ctx.y -= height;
};

const drawHeading = (ctx: PdfContext, value: string, level: 1 | 2 | 3) => {
  const size = level === 1 ? ctx.type.h4 : level === 2 ? ctx.type.h5 : ctx.type.h6;
  const spacingBefore = level === 1 ? 10 : 14;
  const spacingAfter = level === 1 ? 16 : 10;

  ensureSpace(ctx, spacingBefore + size * 2);
  ctx.y -= spacingBefore;
  drawTextBlock(ctx, value, {
    color: level === 1 ? ctx.theme.accent : ctx.theme.text,
    font: ctx.bold,
    lineHeight: size * 1.18,
    size,
    spacingAfter,
  });
};

const drawList = (ctx: PdfContext, list: HTMLOListElement | HTMLUListElement) => {
  Array.from(list.children).forEach((child, index) => {
    if (!(child instanceof HTMLLIElement)) {
      return;
    }

    const marker = list instanceof HTMLOListElement ? `${index + 1}.` : "-";

    drawTextBlock(ctx, `${marker} ${child.textContent ?? ""}`, {
      font: ctx.bodyFont,
      indent: 14,
      lineHeight: ctx.type.base * 1.38,
      size: ctx.type.base,
      spacingAfter: 4,
      width: contentWidth - 14,
    });
  });
  ctx.y -= 4;
};

const drawTable = (ctx: PdfContext, table: HTMLTableElement) => {
  const rows = Array.from(table.rows);
  const columnCount = Math.max(...rows.map((row) => row.cells.length), 1);
  const columnWidth = contentWidth / columnCount;
  const fontSize = columnCount > 4 ? ctx.type.tiny : ctx.type.small;
  const lineHeight = fontSize * 1.25;

  ensureSpace(ctx, 24);

  rows.forEach((row, rowIndex) => {
    const cellLines = Array.from(row.cells).map((cell) => {
      const font = cell.tagName.toLowerCase() === "th" || rowIndex === 0 ? ctx.bold : ctx.font;

      return {
        font,
        lines: wrapText(cell.textContent ?? "", font, fontSize, columnWidth - 8).slice(0, 7),
      };
    });
    const rowHeight = Math.max(22, ...cellLines.map((cell) => cell.lines.length * lineHeight + 10));

    ensureSpace(ctx, rowHeight + 2);

    let x = marginX;
    Array.from(row.cells).forEach((cell, cellIndex) => {
      const isHeader = cell.tagName.toLowerCase() === "th" || rowIndex === 0;

      ctx.page.drawRectangle({
        borderColor: ctx.theme.border,
        borderWidth: 0.6,
        color: isHeader ? ctx.theme.surface : ctx.theme.bg,
        height: rowHeight,
        width: columnWidth,
        x,
        y: ctx.y - rowHeight,
      });
      cellLines[cellIndex].lines.forEach((line, lineIndex) => {
        ctx.page.drawText(line, {
          color: ctx.theme.text,
          font: cellLines[cellIndex].font,
          size: fontSize,
          x: x + 4,
          y: ctx.y - 10 - lineIndex * lineHeight,
        });
      });
      x += columnWidth;
    });

    ctx.y -= rowHeight;
  });
  ctx.y -= 12;
};

const drawGradientAxis = (
  ctx: PdfContext,
  start: { x: number; y: number },
  end: { x: number; y: number },
  orientation: "horizontal" | "vertical",
) => {
  const segments = 54;
  const thickness = 5.2;

  for (let index = 0; index < segments; index += 1) {
    const from = index / segments;
    const to = (index + 1) / segments;
    const center = (from + to) / 2;
    const edgeAmount = clamp(Math.abs(center - 0.5) / 0.43, 0, 1);
    const color = mixColor(ctx.theme.accentSoft, ctx.theme.accent, edgeAmount);

    if (orientation === "horizontal") {
      ctx.page.drawLine({
        color,
        end: { x: start.x + (end.x - start.x) * to, y: start.y },
        start: { x: start.x + (end.x - start.x) * from, y: start.y },
        thickness,
      });
    } else {
      ctx.page.drawLine({
        color,
        end: { x: start.x, y: start.y + (end.y - start.y) * to },
        start: { x: start.x, y: start.y + (end.y - start.y) * from },
        thickness,
      });
    }
  }
};

const drawQuadrantDiagram = (ctx: PdfContext, phase: PhaseId) => {
  const diagramHeight = 292;
  const diagramWidth = contentWidth;

  ensureSpace(ctx, diagramHeight + 24);
  ctx.y -= 8;

  const x = marginX;
  const y = ctx.y - diagramHeight;
  const centerX = x + diagramWidth * 0.5;
  const centerY = y + diagramHeight * 0.5;
  const axisX1 = x + diagramWidth * 0.08;
  const axisX2 = x + diagramWidth * 0.88;
  const axisY1 = y + diagramHeight * 0.1;
  const axisY2 = y + diagramHeight * 0.9;

  ctx.page.drawRectangle({
    color: ctx.theme.bg,
    height: diagramHeight,
    width: diagramWidth,
    x,
    y,
  });

  (Object.keys(zoneLayout) as PhaseZone[]).forEach((zone) => {
    const layout = zoneLayout[zone];
    const zoneWidth = diagramWidth * 0.38;
    const zoneHeight = diagramHeight * 0.34;
    const zoneX = x + diagramWidth * layout.left;
    const zoneY = y + diagramHeight - diagramHeight * layout.top - zoneHeight;
    const content = zoneContent[zone];

    ctx.page.drawRectangle({
      borderColor: mixColor(ctx.theme.accent, ctx.theme.bg, 0.78),
      borderWidth: 0.7,
      color: mixColor(ctx.theme.accent, ctx.theme.bg, 0.94),
      height: zoneHeight,
      width: zoneWidth,
      x: zoneX,
      y: zoneY,
    });
    ctx.page.drawText(content.title, {
      color: ctx.theme.muted,
      font: ctx.bold,
      size: ctx.type.small,
      x: zoneX + 9,
      y: zoneY + zoneHeight - 17,
    });
    content.criteria.forEach((line, index) => {
      ctx.page.drawText(line, {
        color: ctx.theme.text,
        font: ctx.font,
        size: ctx.type.tiny,
        x: zoneX + 9,
        y: zoneY + zoneHeight - 32 - index * 10.5,
      });
    });
  });

  drawGradientAxis(ctx, { x: axisX1, y: centerY }, { x: axisX2, y: centerY }, "horizontal");
  drawGradientAxis(ctx, { x: centerX, y: axisY1 }, { x: centerX, y: axisY2 }, "vertical");
  ctx.page.drawSvgPath("M 0 6 L 13 0 L 13 12 Z", { color: ctx.theme.accent, x: axisX1 - 16, y: centerY - 6 });
  ctx.page.drawSvgPath("M 0 0 L 13 6 L 0 12 Z", { color: ctx.theme.accent, x: axisX2 + 3, y: centerY - 6 });
  ctx.page.drawSvgPath("M 0 0 L 12 0 L 6 13 Z", { color: ctx.theme.accent, x: centerX - 6, y: axisY1 - 16 });
  ctx.page.drawSvgPath("M 6 0 L 12 13 L 0 13 Z", { color: ctx.theme.accent, x: centerX - 6, y: axisY2 + 3 });

  ctx.page.drawText("Task Complexity", {
    color: ctx.theme.muted,
    font: ctx.bold,
    size: ctx.type.tiny,
    x: centerX - 31,
    y: y + diagramHeight - 17,
  });
  drawTextBlockAt(ctx, "Context / Judgment Sensitivity", axisX2 - 82, centerY + 19, 84, ctx.type.tiny, ctx.bold, ctx.theme.muted);

  if (phase === "planning") {
    planningLabels.forEach((label) => {
      const labelLines = wrapText(label.text, ctx.font, ctx.type.tiny, label.width - 10).slice(0, 3);
      const labelHeight = Math.max(18, labelLines.length * ctx.type.tiny * 1.2 + 9);
      const labelX = clamp(x + diagramWidth * label.left - label.width / 2, x + 8, x + diagramWidth - label.width - 8);
      const labelY = clamp(y + diagramHeight - diagramHeight * label.top - labelHeight / 2, y + 8, y + diagramHeight - labelHeight - 8);

      ctx.page.drawRectangle({
        borderColor: rgb(0.3, 0.3, 0.3),
        borderWidth: 0.6,
        color: rgb(0.35, 0.35, 0.35),
        height: labelHeight,
        width: label.width,
        x: labelX,
        y: labelY,
      });
      labelLines.forEach((line, index) => {
        ctx.page.drawText(line, {
          color: rgb(1, 1, 1),
          font: ctx.font,
          size: ctx.type.tiny,
          x: labelX + 5,
          y: labelY + labelHeight - 11 - index * ctx.type.tiny * 1.2,
        });
      });
    });
  }

  ctx.y = y - 18;
};

const drawTextBlockAt = (
  ctx: PdfContext,
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  font: PDFFont,
  color: PdfColor,
) => {
  wrapText(value, font, size, width).slice(0, 3).forEach((line, index) => {
    ctx.page.drawText(line, {
      color,
      font,
      size,
      x,
      y: y - index * (size * 1.25),
    });
  });
};

const drawContextDiagram = (ctx: PdfContext) => {
  const height = 168;
  const topY = ctx.y;
  const nodeY = topY - 86;
  const youX = marginX + 60;
  const centerX = marginX + contentWidth - 118;

  ensureSpace(ctx, height + 20);
  ctx.y -= 12;

  ctx.page.drawCircle({ borderColor: ctx.theme.text, borderWidth: 1.4, color: ctx.theme.bg, size: 34, x: youX, y: nodeY });
  ctx.page.drawText("You", { color: ctx.theme.text, font: ctx.bold, size: ctx.type.small, x: youX - 11, y: nodeY - 4 });
  ctx.page.drawLine({
    color: ctx.theme.muted,
    end: { x: centerX - 82, y: nodeY },
    start: { x: youX + 38, y: nodeY },
    thickness: 1.8,
  });
  ctx.page.drawSvgPath("M 0 0 L 12 6 L 0 12 Z", { color: ctx.theme.muted, x: centerX - 82, y: nodeY - 6 });
  ctx.page.drawCircle({ borderColor: ctx.theme.text, borderWidth: 1.4, color: ctx.theme.surface, size: 78, x: centerX, y: nodeY });
  ctx.page.drawCircle({ borderColor: ctx.theme.text, borderWidth: 1.2, color: ctx.theme.bg, size: 34, x: centerX, y: nodeY });
  ctx.page.drawText("GenAI", { color: ctx.theme.text, font: ctx.bold, size: ctx.type.small, x: centerX - 18, y: nodeY - 4 });

  [
    ["Physical Context", 0, 58],
    ["Social Dynamic", 66, 30],
    ["Emotion", 72, -14],
    ["Cultural Reflexes", 28, -60],
    ["Informal Language", -42, -58],
  ].forEach(([label, dx, dy]) => {
    drawTextBlockAt(ctx, String(label), centerX + Number(dx) - 30, nodeY + Number(dy), 64, ctx.type.tiny, ctx.bold, ctx.theme.text);
  });

  ctx.y -= height;
};

const emptyCanvasData = (): CanvasData => ({
  commitments: {
    noExternal: false,
    raiseConcerns: false,
  },
  dateVersion: "",
  decisionBy: "",
  decisionWhat: "",
  disclosure: "",
  notUses: ["", "", ""],
  posture: {},
  projectName: "",
  researchLead: "",
  sensitivity: "",
  stakeholderLead: "",
});

const drawAlignmentCanvasPreview = async (ctx: PdfContext) => {
  if (ctx.y < pageHeight - marginTop) {
    addPage(ctx);
  }

  const canvasPdf = await createCanvasPdf(emptyCanvasData());
  const [embeddedPage] = await ctx.pdf.embedPdf(canvasPdf, [0]);
  const scale = Math.min(contentWidth / embeddedPage.width, (pageHeight - marginTop - marginBottom) / embeddedPage.height);
  const width = embeddedPage.width * scale;
  const height = embeddedPage.height * scale;
  const x = marginX + (contentWidth - width) / 2;
  const y = pageHeight - marginTop - height;

  ctx.page.drawPage(embeddedPage, {
    height,
    width,
    x,
    y,
  });
  ctx.y = y - 8;
};

const drawElement = async (ctx: PdfContext, element: HTMLElement): Promise<void> => {
  const tag = element.tagName.toLowerCase();
  const customQuadrant = element.querySelector<HTMLElement>("ai-quadrant-diagram");
  const customContext = element.querySelector<HTMLElement>("genai-context-diagram");

  if (tag === "ai-quadrant-diagram" || customQuadrant) {
    const quadrant = tag === "ai-quadrant-diagram" ? element : customQuadrant;
    const phase = (quadrant?.getAttribute("phase") ?? "none") as PhaseId;

    drawQuadrantDiagram(ctx, phaseNames[phase] ? phase : "none");
    return;
  }

  if (tag === "genai-context-diagram" || customContext) {
    drawContextDiagram(ctx);
    return;
  }

  if (tag === "project-ai-alignment-canvas") {
    await drawAlignmentCanvasPreview(ctx);
    return;
  }

  if (tag === "p" && element.children.length === 1 && element.firstElementChild instanceof HTMLElement) {
    await drawElement(ctx, element.firstElementChild);
    return;
  }

  if (tag === "h2" || tag === "h3") {
    drawHeading(ctx, element.textContent ?? "", tag === "h2" ? 2 : 3);
    return;
  }

  if (tag === "p") {
    drawTextBlock(ctx, element.textContent ?? "");
    return;
  }

  if (tag === "ul" || tag === "ol") {
    drawList(ctx, element as HTMLUListElement | HTMLOListElement);
    return;
  }

  if (tag === "table") {
    drawTable(ctx, element as HTMLTableElement);
    return;
  }

  if (tag === "blockquote") {
    ensureSpace(ctx, 36);
    ctx.page.drawRectangle({
      color: mixColor(ctx.theme.accentSoft, ctx.theme.bg, 0.82),
      height: 1,
      width: contentWidth,
      x: marginX,
      y: ctx.y + 4,
    });
    drawTextBlock(ctx, element.textContent ?? "", {
      color: ctx.theme.muted,
      indent: 12,
      lineHeight: ctx.type.h6 * 1.28,
      size: ctx.type.h6,
      spacingAfter: 10,
      width: contentWidth - 18,
    });
    return;
  }

  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      await drawElement(ctx, child);
    }
  }
};

const drawToc = (ctx: PdfContext, sections: HTMLElement[]) => {
  drawHeading(ctx, "Table of Contents", 1);

  sections.forEach((section, index) => {
    const title = section.querySelector(".playbook-section__header h2")?.textContent?.trim() ?? section.id;
    const headings = Array.from(section.querySelectorAll<HTMLHeadingElement>(".playbook-section__body h2"));

    drawTextBlock(ctx, `${index + 1}. ${title}`, {
      font: ctx.bold,
      lineHeight: ctx.type.base * 1.25,
      size: ctx.type.base,
      spacingAfter: 3,
    });
    headings.forEach((heading) => {
      drawTextBlock(ctx, heading.textContent ?? "", {
        color: ctx.theme.muted,
        indent: 16,
        lineHeight: ctx.type.small * 1.25,
        size: ctx.type.small,
        spacingAfter: 2,
      });
    });
    ctx.y -= 5;
  });
};

const createPlaybookPdf = async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.TimesRoman);
  const firstPage = pdf.addPage([pageWidth, pageHeight]);
  const ctx: PdfContext = {
    bodyFont,
    bold,
    font,
    page: firstPage,
    pageNumber: 1,
    pdf,
    theme: getTheme(),
    type: getPdfTypeScale(),
    y: pageHeight - marginTop,
  };
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-playbook-section]"));

  ctx.page.drawRectangle({
    color: ctx.theme.bg,
    height: pageHeight,
    width: pageWidth,
    x: 0,
    y: 0,
  });
  drawToc(ctx, sections);

  for (const section of sections) {
    addPage(ctx);
    const title = section.querySelector(".playbook-section__header h2")?.textContent?.trim() ?? section.id;
    const summary = section.querySelector(".playbook-section__header p")?.textContent?.trim();
    const body = section.querySelector<HTMLElement>(".playbook-section__body");

    drawHeading(ctx, title, 1);
    if (summary) {
      drawTextBlock(ctx, summary, {
        color: ctx.theme.muted,
        size: ctx.type.base,
        spacingAfter: 16,
      });
    }
    for (const child of Array.from(body?.children ?? [])) {
      if (child instanceof HTMLElement && child.tagName.toLowerCase() !== "hr") {
        await drawElement(ctx, child);
      }
    }
  }

  return pdf.save();
};

export const downloadPlaybookPdf = async () => {
  const bytes = await createPlaybookPdf();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "ctrl-shift-playbook.pdf";
  link.click();
  URL.revokeObjectURL(url);
};

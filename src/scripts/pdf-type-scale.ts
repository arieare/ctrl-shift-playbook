export type PdfTypeScale = {
  base: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  hero: number;
  small: number;
  tiny: number;
};

const cssPxToPdfPt = 0.75;

const fallbackRemScale = {
  base: 1,
  h1: 3.815,
  h2: 3.052,
  h3: 2.441,
  h4: 1.953,
  h5: 1.563,
  h6: 1.25,
  small: 0.8,
  tiny: 0.64,
};

const parseCssLengthToPdfPt = (value: string, rootPx: number, fallbackRem: number) => {
  const trimmed = value.trim();
  const numeric = Number.parseFloat(trimmed);

  if (!Number.isFinite(numeric)) {
    return fallbackRem * rootPx * cssPxToPdfPt;
  }

  if (trimmed.endsWith("rem")) {
    return numeric * rootPx * cssPxToPdfPt;
  }

  if (trimmed.endsWith("px")) {
    return numeric * cssPxToPdfPt;
  }

  if (trimmed.endsWith("pt")) {
    return numeric;
  }

  return numeric * rootPx * cssPxToPdfPt;
};

export const getPdfTypeScale = (): PdfTypeScale => {
  const styles = window.getComputedStyle(document.documentElement);
  const rootPx = Number.parseFloat(styles.fontSize) || 20;
  const fromToken = (name: string, fallbackRem: number) => {
    return parseCssLengthToPdfPt(styles.getPropertyValue(name), rootPx, fallbackRem);
  };

  const h1 = fromToken("--text-h1", fallbackRemScale.h1);

  return {
    base: fromToken("--text-base", fallbackRemScale.base),
    h1,
    h2: fromToken("--text-h2", fallbackRemScale.h2),
    h3: fromToken("--text-h3", fallbackRemScale.h3),
    h4: fromToken("--text-h4", fallbackRemScale.h4),
    h5: fromToken("--text-h5", fallbackRemScale.h5),
    h6: fromToken("--text-h6", fallbackRemScale.h6),
    hero: h1,
    small: fromToken("--text-small", fallbackRemScale.small),
    tiny: fromToken("--text-tiny", fallbackRemScale.tiny),
  };
};

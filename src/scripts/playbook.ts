import "./ai-quadrant-diagram";
import { confirmDownload } from "./download-confirm";
import "./genai-context-diagram";
import { downloadPlaybookPdf } from "./playbook-pdf";
import "./project-ai-alignment-canvas";

const printButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-print-button]"));
const hero = document.querySelector<HTMLElement>("[data-hero]");
const siteHeader = document.querySelector<HTMLElement>("[data-site-header]");
const playbookShell = document.querySelector<HTMLElement>("#playbook");
const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-playbook-section]"));
const interactiveTables = Array.from(document.querySelectorAll<HTMLTableElement>(".playbook-section__body table"));
const primaryButtons = Array.from(document.querySelectorAll<HTMLElement>(".button:not(.button--secondary)"));
const searchForm = document.querySelector<HTMLFormElement>("[data-site-search]");
const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
const searchResults = document.querySelector<HTMLElement>("[data-search-results]");
const glowInitializedButtons = new WeakSet<HTMLElement>();
const tocLinks = new Map(
  Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]")).map((link) => [
    link.dataset.tocLink,
    link,
  ]),
);
const tocItems = new Map(
  Array.from(document.querySelectorAll<HTMLElement>(".toc__item")).flatMap((item) => {
    const link = item.querySelector<HTMLAnchorElement>("[data-toc-link]");

    return link?.dataset.tocLink ? [[link.dataset.tocLink, item] as const] : [];
  }),
);
const tocHeadingLinks = new Map<string, HTMLAnchorElement>();

type ReaderPage = {
  elements: HTMLElement[];
  hash: string;
  headingIds: string[];
  label: string;
  primaryHeadingId?: string;
  section: HTMLElement;
  sectionId: string;
  sectionTitle: string;
};

type SearchItem = {
  hash: string;
  headingId?: string;
  pageIndex: number;
  sectionLabel: string;
  text: string;
  title: string;
};

const slugifyHeading = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeSearchText = (value: string) => {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
};

const createSearchSnippet = (text: string, query: string) => {
  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);
  const matchIndex = normalizedQuery ? normalizedText.indexOf(normalizedQuery) : -1;
  const start = matchIndex >= 0 ? Math.max(matchIndex - 64, 0) : 0;
  const snippet = text.replace(/\s+/g, " ").trim().slice(start, start + 160);

  return `${start > 0 ? "..." : ""}${snippet}${start + snippet.length < text.length ? "..." : ""}`;
};

const clearTableHighlight = (table: HTMLTableElement) => {
  table
    .querySelectorAll(".is-table-row-highlight, .is-table-column-highlight, .is-table-cell-highlight")
    .forEach((cell) => {
      cell.classList.remove(
        "is-table-row-highlight",
        "is-table-column-highlight",
        "is-table-cell-highlight",
      );
    });
};

const highlightTableCell = (cell: HTMLTableCellElement) => {
  const table = cell.closest("table");
  const row = cell.parentElement;

  if (!(table instanceof HTMLTableElement) || !(row instanceof HTMLTableRowElement)) {
    return;
  }

  const columnIndex = cell.cellIndex;

  clearTableHighlight(table);
  Array.from(row.cells).forEach((rowCell) => rowCell.classList.add("is-table-row-highlight"));
  Array.from(table.rows).forEach((tableRow) => {
    tableRow.cells[columnIndex]?.classList.add("is-table-column-highlight");
  });
  cell.classList.add("is-table-cell-highlight");
};

interactiveTables.forEach((table) => {
  table.classList.add("is-interactive-table");

  table.querySelectorAll<HTMLTableCellElement>("th, td").forEach((cell) => {
    cell.tabIndex = 0;
  });

  table.addEventListener("pointerover", (event) => {
    const cell = (event.target as Element | null)?.closest<HTMLTableCellElement>("th, td");

    if (!cell || !table.contains(cell)) {
      return;
    }

    highlightTableCell(cell);
  });

  table.addEventListener("pointerout", (event) => {
    const nextTarget = event.relatedTarget as Node | null;

    if (!nextTarget || !table.contains(nextTarget)) {
      clearTableHighlight(table);
    }
  });

  table.addEventListener("focusin", (event) => {
    const cell = (event.target as Element | null)?.closest<HTMLTableCellElement>("th, td");

    if (cell && table.contains(cell)) {
      highlightTableCell(cell);
    }
  });

  table.addEventListener("focusout", (event) => {
    const nextTarget = event.relatedTarget as Node | null;

    if (!nextTarget || !table.contains(nextTarget)) {
      clearTableHighlight(table);
    }
  });
});

const initializePrimaryButtonGlow = (button: HTMLElement) => {
  if (glowInitializedButtons.has(button)) {
    return;
  }

  glowInitializedButtons.add(button);

  let animationFrame = 0;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  const setGlowPosition = (x: number, y: number) => {
    button.style.setProperty("--button-glow-x", `${x}px`);
    button.style.setProperty("--button-glow-y", `${y}px`);
  };

  const getRestPosition = () => {
    const rect = button.getBoundingClientRect();

    return {
      x: rect.width,
      y: 0,
    };
  };

  const animateGlow = () => {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    setGlowPosition(currentX, currentY);

    if (Math.abs(targetX - currentX) < 0.2 && Math.abs(targetY - currentY) < 0.2) {
      currentX = targetX;
      currentY = targetY;
      setGlowPosition(currentX, currentY);
      animationFrame = 0;
      return;
    }

    animationFrame = window.requestAnimationFrame(animateGlow);
  };

  const moveGlowTo = (x: number, y: number) => {
    targetX = x;
    targetY = y;

    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(animateGlow);
    }
  };

  const resetGlow = () => {
    const restPosition = getRestPosition();

    moveGlowTo(restPosition.x, restPosition.y);
  };

  const restPosition = getRestPosition();

  currentX = restPosition.x;
  currentY = restPosition.y;
  targetX = restPosition.x;
  targetY = restPosition.y;
  setGlowPosition(currentX, currentY);

  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();

    moveGlowTo(event.clientX - rect.left, event.clientY - rect.top);
  });
  button.addEventListener("pointerleave", resetGlow);
  button.addEventListener("blur", resetGlow);
  button.addEventListener("focus", resetGlow);
};

primaryButtons.forEach(initializePrimaryButtonGlow);

printButtons.forEach((button) => button.addEventListener("click", async () => {
  const shouldDownload = await confirmDownload();

  if (!shouldDownload) {
    return;
  }

  const originalLabel = button.innerHTML;

  button.disabled = true;
  button.textContent = "Preparing PDF...";
  try {
    await downloadPlaybookPdf();
  } finally {
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
}));

let updateSiteHeader = () => { };

if (siteHeader) {
  updateSiteHeader = () => {
    const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
    const playbookTop = playbookShell?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
    const isVisible = !hero || heroBottom <= 0 || playbookTop <= window.innerHeight * 0.5;

    siteHeader.classList.toggle("is-visible", isVisible);
    siteHeader.setAttribute("aria-hidden", String(!isVisible));
  };

  window.addEventListener("scroll", updateSiteHeader, { passive: true });
  window.addEventListener("resize", updateSiteHeader);
  updateSiteHeader();
}

const setActiveSection = (id: string) => {
  tocLinks.forEach((link, linkId) => {
    const isActive = linkId === id;

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
    link.classList.toggle("is-active", isActive);
  });
  tocItems.forEach((item, itemId) => {
    const isExpanded = itemId === id;
    const sublist = item.querySelector<HTMLOListElement>(".toc__sublist");

    item.classList.toggle("is-expanded", isExpanded);
    if (sublist && sublist.childElementCount > 0) {
      sublist.hidden = !isExpanded;
    }
  });
};

const setActiveHeading = (id?: string) => {
  tocHeadingLinks.forEach((link, linkId) => {
    const isActive = linkId === id;

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
    link.classList.toggle("is-active", isActive);
  });
};

sections.forEach((section) => {
  const sublist = document.querySelector<HTMLOListElement>(`[data-toc-sublist="${section.id}"]`);

  if (!sublist) {
    return;
  }

  const headings = Array.from(section.querySelectorAll<HTMLHeadingElement>(".playbook-section__body h2"));

  headings.forEach((heading, index) => {
    const label = heading.textContent?.trim();

    if (!label) {
      return;
    }

    const id = `${section.id}-${slugifyHeading(label) || "heading"}-${index + 1}`;
    const item = document.createElement("li");
    const link = document.createElement("a");
    const depth = heading.tagName.toLowerCase();

    heading.id = id;
    heading.dataset.tocHeading = id;
    item.className = "toc__subitem";
    link.className = `toc__sublink toc__sublink--${depth}`;
    link.href = `#${id}`;
    link.dataset.tocHeadingLink = id;
    link.textContent = label;
    item.append(link);
    sublist.append(item);
    tocHeadingLinks.set(id, link);
  });

  if (sublist.childElementCount > 0) {
    tocItems.get(section.id)?.classList.add("has-subitems");
  }
});

const readerPages: ReaderPage[] = [];
const readerPageByHash = new Map<string, { headingId?: string; pageIndex: number }>();

sections.forEach((section) => {
  const body = section.querySelector<HTMLElement>(".playbook-section__body");
  const sectionTitle = section.querySelector(".playbook-section__header h2")?.textContent?.trim()
    ?? section.id;

  if (!body) {
    return;
  }

  let pageElements: HTMLElement[] = [];
  let sectionPageNumber = 1;

  const commitPage = () => {
    if (pageElements.length === 0) {
      return;
    }

    const headings = pageElements.flatMap((element) => {
      const nestedHeadings = Array.from(element.querySelectorAll<HTMLElement>("[data-toc-heading]"));

      return element.matches("[data-toc-heading]")
        ? [element, ...nestedHeadings]
        : nestedHeadings;
    });
    const primaryHeading = headings[0];
    const generatedHash = `${section.id}-page-${sectionPageNumber}`;
    const hash = sectionPageNumber === 1
      ? section.id
      : primaryHeading?.dataset.tocHeading ?? generatedHash;
    const label = primaryHeading?.textContent?.trim()
      ?? sectionTitle;
    const pageIndex = readerPages.length;

    if (!primaryHeading && sectionPageNumber > 1) {
      pageElements[0].id ||= generatedHash;
    }

    const scrollTargetId = primaryHeading?.dataset.tocHeading
      ?? (!primaryHeading && sectionPageNumber > 1 ? generatedHash : undefined);

    pageElements.forEach((element) => {
      element.dataset.readerPageElement = hash;
    });

    readerPages.push({
      elements: pageElements,
      hash,
      headingIds: headings.flatMap((heading) => heading.dataset.tocHeading ? [heading.dataset.tocHeading] : []),
      label,
      primaryHeadingId: scrollTargetId,
      section,
      sectionId: section.id,
      sectionTitle,
    });

    readerPageByHash.set(hash, { headingId: scrollTargetId, pageIndex });
    if (sectionPageNumber === 1) {
      readerPageByHash.set(section.id, { pageIndex });
    }
    headings.forEach((heading) => {
      if (heading.dataset.tocHeading) {
        readerPageByHash.set(heading.dataset.tocHeading, {
          headingId: heading.dataset.tocHeading,
          pageIndex,
        });
      }
    });

    pageElements = [];
    sectionPageNumber += 1;
  };

  Array.from(body.children).forEach((child) => {
    if (child instanceof HTMLHRElement) {
      child.remove();
      commitPage();
      return;
    }

    if (child instanceof HTMLElement) {
      pageElements.push(child);
    }
  });

  commitPage();
});

if (readerPages.length > 0) {
  let activeReaderPageIndex = 0;
  const readerNav = document.createElement("nav");
  const previousButton = document.createElement("button");
  const nextButton = document.createElement("button");
  const pageMeta = document.createElement("span");
  const pageStatus = document.createElement("span");
  const sectionTitle = document.createElement("span");
  const sectionStack = document.querySelector<HTMLElement>(".section-stack");

  readerNav.className = "reader-nav";
  readerNav.setAttribute("aria-label", "Reader pagination");
  previousButton.className = "button button--secondary";
  previousButton.type = "button";
  previousButton.textContent = "Previous";
  nextButton.className = "button";
  nextButton.type = "button";
  nextButton.textContent = "Next";
  initializePrimaryButtonGlow(nextButton);
  pageMeta.className = "reader-nav__meta";
  pageStatus.className = "reader-nav__status";
  pageStatus.setAttribute("aria-live", "polite");
  sectionTitle.className = "reader-nav__section-title";
  pageMeta.append(pageStatus, sectionTitle);
  readerNav.append(pageMeta, previousButton, nextButton);
  sectionStack?.insertAdjacentElement("afterend", readerNav);

  const updateReaderNav = () => {
    previousButton.disabled = activeReaderPageIndex === 0;
    nextButton.disabled = activeReaderPageIndex === readerPages.length - 1;
    pageStatus.textContent = `${activeReaderPageIndex + 1} / ${readerPages.length}`;
    sectionTitle.textContent = readerPages[activeReaderPageIndex]?.sectionTitle ?? "";
  };

  const setHash = (hash: string, replace: boolean) => {
    const nextUrl = `${window.location.pathname}${window.location.search}#${hash}`;

    if (replace) {
      window.history.replaceState(null, "", nextUrl);
      return;
    }

    window.history.pushState(null, "", nextUrl);
  };

  const clearHeroFromViewport = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;

        if (heroBottom > 0) {
          const previousScrollBehavior = document.documentElement.style.scrollBehavior;

          document.documentElement.style.scrollBehavior = "auto";
          window.scrollBy(0, heroBottom + 1);
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        }
        window.requestAnimationFrame(updateSiteHeader);
      });
    });
  };

  const getCssPixelValue = (name: string) => {
    const value = window.getComputedStyle(document.documentElement).getPropertyValue(name);

    return Number.parseFloat(value) || 0;
  };

  const scrollToReaderTarget = (target: HTMLElement) => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const stickyHeaderHeight = siteHeader?.getBoundingClientRect().height
      || getCssPixelValue("--sticky-header-height");
    const mainContentOffset = playbookShell
      ? Number.parseFloat(window.getComputedStyle(playbookShell).paddingTop) || 0
      : getCssPixelValue("--space-4");
    const scrollOffset = stickyHeaderHeight + mainContentOffset;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - scrollOffset;

    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({
      top: Math.max(targetTop, 0),
    });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  };

  const activateReaderPage = (
    pageIndex: number,
    options: { headingId?: string; replaceHash?: boolean; scroll?: boolean; updateHash?: boolean } = {},
  ) => {
    const nextIndex = Math.min(Math.max(pageIndex, 0), readerPages.length - 1);
    const activePage = readerPages[nextIndex];
    const activeHeadingId = options.headingId ?? activePage.primaryHeadingId;

    activeReaderPageIndex = nextIndex;
    sections.forEach((section) => {
      section.hidden = section !== activePage.section;
    });
    readerPages.forEach((page, index) => {
      page.elements.forEach((element) => {
        element.hidden = index !== nextIndex;
        element.classList.toggle("is-reader-page-active", index === nextIndex);
      });
    });
    setActiveSection(activePage.sectionId);
    setActiveHeading(activeHeadingId);
    updateReaderNav();

    if (options.updateHash) {
      setHash(options.headingId ?? activePage.hash, Boolean(options.replaceHash));
    }

    if (options.scroll) {
      const target = activeHeadingId ? document.getElementById(activeHeadingId) : activePage.section;

      if (target) {
        scrollToReaderTarget(target);
      }
      clearHeroFromViewport();
    }
  };

  const activateHash = (hash: string, options: { replaceHash?: boolean; scroll?: boolean } = {}) => {
    const entry = readerPageByHash.get(hash);

    if (!entry) {
      return false;
    }

    activateReaderPage(entry.pageIndex, {
      headingId: entry.headingId,
      replaceHash: options.replaceHash,
      scroll: options.scroll,
      updateHash: false,
    });
    return true;
  };

  const closeSearchResults = () => {
    if (!searchResults || !searchInput) {
      return;
    }

    searchResults.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
  };

  const openSearchResults = () => {
    if (!searchResults || !searchInput) {
      return;
    }

    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  };

  const searchItems: SearchItem[] = readerPages.map((page, pageIndex) => {
    const sectionLabel = tocLinks.get(page.sectionId)?.textContent?.trim()
      ?? page.section.querySelector(".playbook-section__header h2")?.textContent?.trim()
      ?? page.sectionId;
    const sectionIntro = page.section.querySelector(".playbook-section__header")?.textContent?.trim() ?? "";
    const text = [sectionLabel, page.label, sectionIntro, ...page.elements.map((element) => element.textContent?.trim() ?? "")]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      hash: page.hash,
      headingId: page.primaryHeadingId,
      pageIndex,
      sectionLabel,
      text,
      title: page.label,
    };
  });

  const runSearch = (query: string) => {
    const normalizedQuery = normalizeSearchText(query);
    const terms = normalizedQuery.split(" ").filter(Boolean);

    if (terms.length === 0) {
      return [];
    }

    return searchItems
      .map((item) => {
        const normalizedText = normalizeSearchText(item.text);
        const normalizedTitle = normalizeSearchText(`${item.sectionLabel} ${item.title}`);
        const matchesAllTerms = terms.every((term) => normalizedText.includes(term));

        if (!matchesAllTerms) {
          return null;
        }

        const titleMatch = normalizedTitle.includes(normalizedQuery) ? 2 : 0;
        const earlyMatch = Math.max(0, 1 - normalizedText.indexOf(terms[0]) / Math.max(normalizedText.length, 1));

        return {
          item,
          score: titleMatch + earlyMatch,
        };
      })
      .filter((result): result is { item: SearchItem; score: number } => Boolean(result))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((result) => result.item);
  };

  let currentSearchResults: SearchItem[] = [];

  const renderSearchResults = () => {
    if (!searchInput || !searchResults) {
      return;
    }

    const query = searchInput.value;

    searchResults.replaceChildren();
    currentSearchResults = runSearch(query);

    if (!query.trim()) {
      closeSearchResults();
      return;
    }

    if (currentSearchResults.length === 0) {
      const empty = document.createElement("span");

      empty.className = "site-search__empty";
      empty.textContent = "No results";
      searchResults.append(empty);
      openSearchResults();
      return;
    }

    currentSearchResults.forEach((item) => {
      const link = document.createElement("a");
      const title = document.createElement("span");
      const section = document.createElement("span");
      const snippet = document.createElement("span");

      link.className = "site-search__result";
      link.href = `#${item.headingId ?? item.hash}`;
      title.className = "site-search__result-title";
      title.textContent = item.title;
      section.className = "site-search__result-section";
      section.textContent = item.sectionLabel;
      snippet.className = "site-search__result-snippet";
      snippet.textContent = createSearchSnippet(item.text, query);
      link.append(title, section, snippet);
      searchResults.append(link);
    });
    openSearchResults();
  };

  if (searchForm && searchInput && searchResults) {
    const shortcutHint = searchForm.querySelector<HTMLElement>(".site-search__shortcut");
    const navigatorWithUserAgentData = window.navigator as Navigator & {
      userAgentData?: { platform?: string };
    };
    const platform = navigatorWithUserAgentData.userAgentData?.platform ?? window.navigator.userAgent;
    const isMacPlatform = /mac|iphone|ipad|ipod/i.test(platform);

    if (shortcutHint) {
      shortcutHint.textContent = isMacPlatform ? "⌘K" : "Ctrl K";
    }

    const dismissSearchIfOutside = (target: EventTarget | null) => {
      if (target instanceof Node && searchForm.contains(target)) {
        return;
      }
      closeSearchResults();
    };

    searchInput.addEventListener("input", renderSearchResults);
    searchInput.addEventListener("focus", renderSearchResults);
    searchForm.addEventListener("focusout", (event) => {
      window.setTimeout(() => {
        dismissSearchIfOutside(event.relatedTarget);
      });
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearchResults();
        searchInput.blur();
      }
    });
    searchForm.addEventListener("submit", (event) => {
      const firstResult = currentSearchResults[0];

      event.preventDefault();
      if (!firstResult) {
        return;
      }

      activateReaderPage(firstResult.pageIndex, {
        headingId: firstResult.headingId,
        scroll: true,
        updateHash: true,
      });
      closeSearchResults();
      searchInput.blur();
    });
    searchResults.addEventListener("click", () => {
      closeSearchResults();
      searchInput.blur();
    });
    document.addEventListener("pointerdown", (event) => dismissSearchIfOutside(event.target), { capture: true });
    document.addEventListener("mousedown", (event) => dismissSearchIfOutside(event.target), { capture: true });
    document.addEventListener("touchstart", (event) => dismissSearchIfOutside(event.target), { capture: true });
    window.addEventListener("hashchange", closeSearchResults);
    window.addEventListener("popstate", closeSearchResults);
    window.addEventListener("keydown", (event) => {
      const target = event.target;
      const isEditing = target instanceof Element
        ? Boolean(target.closest("input, textarea, select, [contenteditable='true']"))
        : false;
      const isSearchShortcut = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);

      if (event.key === "Escape" && !searchResults.hidden) {
        event.preventDefault();
        closeSearchResults();
        searchInput.blur();
        return;
      }

      if (!isSearchShortcut || isEditing || event.altKey || event.shiftKey) {
        return;
      }

      event.preventDefault();
      searchInput.focus();
      searchInput.select();
      renderSearchResults();
    });
  }

  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = link?.hash.slice(1);

    if (!link || !hash || !readerPageByHash.has(hash)) {
      return;
    }

    const entry = readerPageByHash.get(hash);

    event.preventDefault();
    if (entry) {
      activateReaderPage(entry.pageIndex, {
        headingId: entry.headingId,
        scroll: true,
        updateHash: true,
      });
    }
  });

  previousButton.addEventListener("click", () => {
    const previousPage = readerPages[activeReaderPageIndex - 1];

    if (previousPage) {
      activateReaderPage(activeReaderPageIndex - 1, {
        scroll: true,
        updateHash: true,
      });
    }
  });

  nextButton.addEventListener("click", () => {
    const nextPage = readerPages[activeReaderPageIndex + 1];

    if (nextPage) {
      activateReaderPage(activeReaderPageIndex + 1, {
        scroll: true,
        updateHash: true,
      });
    }
  });

  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const isFormTarget = target instanceof Element
      ? target.closest("input, textarea, select, button, [contenteditable='true']")
      : null;

    if (isFormTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (event.key === "ArrowLeft" && activeReaderPageIndex > 0) {
      event.preventDefault();
      activateReaderPage(activeReaderPageIndex - 1, {
        scroll: true,
        updateHash: true,
      });
    }

    if (event.key === "ArrowRight" && activeReaderPageIndex < readerPages.length - 1) {
      event.preventDefault();
      activateReaderPage(activeReaderPageIndex + 1, {
        scroll: true,
        updateHash: true,
      });
    }
  });

  const activateCurrentHash = () => {
    const currentHash = window.location.hash.slice(1);

    if (currentHash) {
      activateHash(currentHash, { scroll: true });
      return;
    }

    activateReaderPage(0, { scroll: true });
  };

  window.addEventListener("hashchange", activateCurrentHash);
  window.addEventListener("popstate", activateCurrentHash);
  window.addEventListener("load", () => {
    if (window.location.hash) {
      activateCurrentHash();
    }
  }, { once: true });

  const initialHash = window.location.hash.slice(1);

  if (initialHash && activateHash(initialHash, { scroll: true })) {
    updateReaderNav();
    window.setTimeout(activateCurrentHash, 0);
    window.setTimeout(activateCurrentHash, 250);
    window.setTimeout(activateCurrentHash, 750);
    window.setTimeout(activateCurrentHash, 1200);
  } else {
    activateReaderPage(0);
  }
} else if (sections.length > 0) {
  const updateActiveSection = () => {
    const activationLine = window.innerHeight * 0.25;
    const activeSection = sections.reduce((current, section) => {
      return section.getBoundingClientRect().top <= activationLine ? section : current;
    }, sections[0]);
    const activeHeading = Array.from(activeSection.querySelectorAll<HTMLElement>("[data-toc-heading]")).reduce<HTMLElement | undefined>(
      (current, heading) => {
        return heading.getBoundingClientRect().top <= activationLine ? heading : current;
      },
      undefined,
    );

    setActiveSection(activeSection.id);
    setActiveHeading(activeHeading?.dataset.tocHeading);
  };

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();
}

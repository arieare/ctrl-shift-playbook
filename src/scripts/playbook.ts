import "./ai-quadrant-diagram";
import "./genai-context-diagram";
import "./project-ai-alignment-canvas";

const printButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-print-button]"));
const hero = document.querySelector<HTMLElement>("[data-hero]");
const siteHeader = document.querySelector<HTMLElement>("[data-site-header]");
const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-playbook-section]"));
const interactiveTables = Array.from(document.querySelectorAll<HTMLTableElement>(".playbook-section__body table"));
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
};

const slugifyHeading = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

printButtons.forEach((button) => button.addEventListener("click", () => {
  window.print();
}));

if (siteHeader) {
  const updateSiteHeader = () => {
    const isVisible = !hero || hero.getBoundingClientRect().bottom <= 0;

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

  const headings = Array.from(section.querySelectorAll<HTMLHeadingElement>(".playbook-section__body h2, .playbook-section__body h3"));

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
      ?? section.querySelector(".playbook-section__header h2")?.textContent?.trim()
      ?? `Page ${readerPages.length + 1}`;
    const pageIndex = readerPages.length;

    if (!primaryHeading && sectionPageNumber > 1) {
      pageElements[0].id ||= generatedHash;
    }

    pageElements.forEach((element) => {
      element.dataset.readerPageElement = hash;
    });

    readerPages.push({
      elements: pageElements,
      hash,
      headingIds: headings.flatMap((heading) => heading.dataset.tocHeading ? [heading.dataset.tocHeading] : []),
      label,
      primaryHeadingId: primaryHeading?.dataset.tocHeading,
      section,
      sectionId: section.id,
    });

    readerPageByHash.set(hash, { pageIndex });
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
  const pageStatus = document.createElement("span");
  const sectionStack = document.querySelector<HTMLElement>(".section-stack");

  readerNav.className = "reader-nav";
  readerNav.setAttribute("aria-label", "Reader pagination");
  previousButton.className = "button button--secondary";
  previousButton.type = "button";
  previousButton.textContent = "Previous";
  nextButton.className = "button";
  nextButton.type = "button";
  nextButton.textContent = "Next";
  pageStatus.className = "reader-nav__status";
  pageStatus.setAttribute("aria-live", "polite");
  readerNav.append(previousButton, pageStatus, nextButton);
  sectionStack?.insertAdjacentElement("afterend", readerNav);

  const updateReaderNav = () => {
    previousButton.disabled = activeReaderPageIndex === 0;
    nextButton.disabled = activeReaderPageIndex === readerPages.length - 1;
    pageStatus.textContent = `${activeReaderPageIndex + 1} / ${readerPages.length}`;
  };

  const setHash = (hash: string, replace: boolean) => {
    const nextUrl = `${window.location.pathname}${window.location.search}#${hash}`;

    if (replace) {
      window.history.replaceState(null, "", nextUrl);
      return;
    }

    window.history.pushState(null, "", nextUrl);
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

      target?.scrollIntoView({ block: "start" });
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

  const initialHash = window.location.hash.slice(1);

  if (initialHash && activateHash(initialHash, { scroll: true })) {
    updateReaderNav();
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

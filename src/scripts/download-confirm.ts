type DownloadConfirmationOptions = {
  confirmLabel?: string;
  message?: string;
  title?: string;
};

export const confirmDownload = ({
  confirmLabel = "Download PDF",
  message = "This will generate the full playbook as a PDF file.",
  title = "Download PDF?",
}: DownloadConfirmationOptions = {}) => {
  if (typeof HTMLDialogElement === "undefined") {
    return Promise.resolve(window.confirm(message));
  }

  return new Promise<boolean>((resolve) => {
    const dialog = document.createElement("dialog");

    dialog.className = "pdf-confirm";
    dialog.innerHTML = `
      <form method="dialog" class="pdf-confirm__panel">
        <h2 class="pdf-confirm__title">${title}</h2>
        <p class="pdf-confirm__copy">${message}</p>
        <div class="pdf-confirm__actions">
          <button class="button button--secondary" type="submit" value="cancel">Cancel</button>
          <button class="button" type="submit" value="download">${confirmLabel}</button>
        </div>
      </form>
    `;

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close("cancel");
      }
    });
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "download");
      dialog.remove();
    }, { once: true });

    document.body.append(dialog);
    dialog.showModal();
  });
};

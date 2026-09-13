import { MESSAGE_ACTIONS } from "../../utils/messaging.js";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message;

  switch (action) {
    case MESSAGE_ACTIONS.DOWNLOAD_THUMBNAIL:
      handleDownloadRequest(payload)
        .then((downloadId) => sendResponse({ success: true, downloadId }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        );

      return true;

    default:
      console.warn(`[Background] Aksi tidak dikenali: ${action}`);
      return false;
  }
});

async function handleDownloadRequest({ url, filename }) {
  if (!url || !filename) {
    throw new Error('Payload unduhan harus menyertakan "url" dan "filename".');
  }

  const sanitizedFilename = filename.replace(/[/\\?%*:|"<>]/g, "_");

  const downloadId = await browser.downloads.download({
    url: url,
    filename: sanitizedFilename,
    saveAs: false,
  });

  return downloadId;
}

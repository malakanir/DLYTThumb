/**
 * @file background.js
 * Handling pengunduhan berkas via browser.downloads API.
 */

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Pesan diterima:", message.action);

  if (message.action === "DOWNLOAD_THUMBNAIL") {
    handleDownloadRequest(message.payload)
      .then((downloadId) => {
        console.log("[Background] Unduhan berhasil dipicu, ID:", downloadId);
        sendResponse({ success: true, downloadId });
      })
      .catch((error) => {
        console.error("[Background] Unduhan gagal:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Wajib untuk async sendResponse
  }
  return false;
});

async function handleDownloadRequest({ url, filename }) {
  if (!url || !filename) {
    throw new Error("Payload unduhan tidak lengkap.");
  }

  const sanitizedFilename = filename.replace(/[/\\?%*:|"<>]/g, "_");
  let downloadUrl = url;
  let createdObjectUrl = null;

  // Jika berupa Data URL (base64), konversi ke Blob Object URL di lingkup extension
  if (url.startsWith("data:")) {
    const response = await fetch(url);
    const blob = await response.blob();
    createdObjectUrl = URL.createObjectURL(blob);
    downloadUrl = createdObjectUrl;
  }

  try {
    const downloadId = await browser.downloads.download({
      url: downloadUrl,
      filename: sanitizedFilename,
      saveAs: false,
    });
    return downloadId;
  } finally {
    // Bersihkan Blob URL dari memori RAM setelah 10 detik
    if (createdObjectUrl) {
      setTimeout(() => URL.revokeObjectURL(createdObjectUrl), 10000);
    }
  }
}

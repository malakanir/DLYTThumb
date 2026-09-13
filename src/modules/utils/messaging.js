export async function sendToBakgroung(action, payload = {}) {
  try {
    return await browser.runtime.sendMessage({ action, payload });
  } catch (error) {
    console.error(
      "[Messaging] Error sending message to background (${action}):",
      error,
    );
  }
}

export async function sendToActiveTab(action, payload = {}) {
  try {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("Tidak ada tab aktif yang ditemukan.");
    }

    return await browser.tabs.sendMessage(activeTab.id, { action, payload });
  } catch (error) {
    console.error(
      `[Messaging] Gagal mengirim pesan ke Active Tab (${action}):`,
      error,
    );
    throw error;
  }
}s
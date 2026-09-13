import { FallbackFetcher } from "../../modules/fetcher/FallbackFetcher.js";
import { CanvasProcessor } from "../../modules/processor/CanvasProcessor.js";
import { StorageManager } from "../../modules/storage/StorageManager.js";
import { sendToBackground, MESSAGE_ACTIONS } from "../../utils/messaging.js";

export class UIInjector {
  static BUTTON_ID = "yt-thumb-download-btn";

  constructor() {
    this.fetcher = new FallbackFetcher();
    this.processor = new CanvasProcessor();
  }

  async inject(videoId, isShorts = false) {
    this.removeButton();

    const targetContainer = await this._waitForContainer(isShorts);
    if (!targetContainer) {
      console.warn("[YT-Thumb] Target container DOM tidak ditemukan.");
      return;
    }

    const button = this._createButtonElement(videoId, isShorts);
    targetContainer.appendChild(button);
  }

  removeButton() {
    const existingBtn = document.getElementById(UIInjector.BUTTON_ID);
    if (existingBtn) {
      existingBtn.remove();
    }
  }

  _createButtonElement(videoId, isShorts) {
    const btn = document.createElement("button");
    btn.id = UIInjector.BUTTON_ID;
    btn.className = isShorts ? "yt-thumb-btn-shorts" : "yt-thumb-btn-watch";
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" class="yt-thumb-icon">
        <path fill="currentColor" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>
      </svg>
      <span>${isShorts ? "" : "Thumbnail"}</span>
    `;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this._handleDownloadClick(btn, videoId);
    });

    return btn;
  }

  async _handleDownloadClick(buttonEl, videoId) {
    const originalText = buttonEl.querySelector("span")?.textContent || "";

    try {
      buttonEl.disabled = true;
      if (originalText)
        buttonEl.querySelector("span").textContent = "Memproses...";

      const settings = await StorageManager.getSettings();

      const img = await this.fetcher.fetchBestThumbnail(videoId);
      const blob = await this.processor.process(img, settings);
      const objectUrl = URL.createObjectURL(blob);

      // 3. Kirim perintah simpan ke Background Script
      await sendToBackground(MESSAGE_ACTIONS.DOWNLOAD_THUMBNAIL, {
        url: objectUrl,
        filename: `yt-thumbnail-${videoId}.${settings.format}`,
      });

      if (originalText) buttonEl.querySelector("span").textContent = "Selesai!";
    } catch (error) {
      console.error("[YT-Thumb] Gagal mengunduh thumbnail:", error);
      if (originalText) buttonEl.querySelector("span").textContent = "Gagal!";
    } finally {
      setTimeout(() => {
        buttonEl.disabled = false;
        if (originalText)
          buttonEl.querySelector("span").textContent = originalText;
      }, 2000);
    }
  }

  _waitForContainer(isShorts, maxRetries = 10) {
    return new Promise((resolve) => {
      let attempts = 0;

      const check = () => {
        let container = null;

        if (isShorts) {
          container =
            document.querySelector(
              "ytd-reel-video-renderer[is-active] #actions #items",
            ) || document.querySelector("ytd-shorts #actions #items");
        } else {
          container =
            document.querySelector(
              "#above-the-fold #top-level-buttons-computed",
            ) || document.querySelector("#owner #subscribe-button");
        }

        if (container) {
          resolve(container);
        } else if (attempts < maxRetries) {
          attempts++;
          setTimeout(check, 400); 
        } else {
          resolve(null);
        }
      };

      check();
    });
  }
}

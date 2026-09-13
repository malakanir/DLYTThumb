/**
 * @file content.bundle.js
 * Standalone Content Script (Tanpa ES Modules / tanpa import-export).
 */
(function () {
  // 1. UrlParser Module
  class UrlParser {
    static YOUTUBE_REGEX =
      /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    static extractVideoId(url) {
      if (!url || typeof url !== "string") return null;
      const match = url.match(UrlParser.YOUTUBE_REGEX);
      return match ? match[1] : null;
    }

    static isShorts(url) {
      return !!(url && url.includes("/shorts/"));
    }
  }

  // 2. Messaging Helper
  const MESSAGE_ACTIONS = { DOWNLOAD_THUMBNAIL: "DOWNLOAD_THUMBNAIL" };

  async function sendToBackground(action, payload = {}) {
    return await browser.runtime.sendMessage({ action, payload });
  }

  // 3. StorageManager Module
  class StorageManager {
    static DEFAULT_SETTINGS = { format: "jpg", scale: 1.0, quality: 0.9 };

    static async getSettings() {
      try {
        const data = await browser.storage.local.get("userSettings");
        return {
          ...StorageManager.DEFAULT_SETTINGS,
          ...(data.userSettings || {}),
        };
      } catch (e) {
        return StorageManager.DEFAULT_SETTINGS;
      }
    }
  }

  // 4. FallbackFetcher Module
  class FallbackFetcher {
    static QUALITIES = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];
    static BASE_URL = "https://i.ytimg.com/vi";

    async fetchBestThumbnail(videoId) {
      for (const quality of FallbackFetcher.QUALITIES) {
        const url = `${FallbackFetcher.BASE_URL}/${videoId}/${quality}.jpg`;
        const img = await this._loadImage(url);
        if (img && img.naturalWidth > 120) return img;
      }
      throw new Error(`Thumbnail tidak ditemukan: ${videoId}`);
    }

    _loadImage(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    }
  }

  // 5. CanvasProcessor Module
  class CanvasProcessor {
    constructor() {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
    }

    async process(img, { format = "jpg", scale = 1.0, quality = 0.9 } = {}) {
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      this.canvas.width = w;
      this.canvas.height = h;

      this.ctx.clearRect(0, 0, w, h);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";
      this.ctx.drawImage(img, 0, 0, w, h);

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "webp"
            ? "image/webp"
            : "image/jpeg";
      return new Promise((resolve) =>
        this.canvas.toBlob(resolve, mimeType, quality),
      );
    }
  }

  // 6. UIInjector Module
  (function () {
    console.log("[YT-Thumb] Content Script Active");

    // Helper Konversi Blob ke DataURL (Base64)
    function blobToDataURL(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // 1. UrlParser Module
    class UrlParser {
      static YOUTUBE_REGEX =
        /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      static extractVideoId(url) {
        if (!url || typeof url !== "string") return null;
        const match = url.match(UrlParser.YOUTUBE_REGEX);
        return match ? match[1] : null;
      }
      static isShorts(url) {
        return !!(url && url.includes("/shorts/"));
      }
    }

    // 2. Messaging Helper
    const MESSAGE_ACTIONS = { DOWNLOAD_THUMBNAIL: "DOWNLOAD_THUMBNAIL" };
    async function sendToBackground(action, payload = {}) {
      return await browser.runtime.sendMessage({ action, payload });
    }

    // 3. StorageManager Module
    class StorageManager {
      static DEFAULT_SETTINGS = { format: "jpg", scale: 1.0, quality: 0.9 };
      static async getSettings() {
        try {
          const data = await browser.storage.local.get("userSettings");
          return {
            ...StorageManager.DEFAULT_SETTINGS,
            ...(data.userSettings || {}),
          };
        } catch (e) {
          return StorageManager.DEFAULT_SETTINGS;
        }
      }
    }

    // 4. FallbackFetcher Module
    class FallbackFetcher {
      static QUALITIES = [
        "maxresdefault",
        "sddefault",
        "hqdefault",
        "mqdefault",
      ];
      static BASE_URL = "https://i.ytimg.com/vi";

      async fetchBestThumbnail(videoId) {
        for (const quality of FallbackFetcher.QUALITIES) {
          const url = `${FallbackFetcher.BASE_URL}/${videoId}/${quality}.jpg`;
          const img = await this._loadImage(url);
          if (img && img.naturalWidth > 120) return img;
        }
        throw new Error(`Thumbnail tidak ditemukan: ${videoId}`);
      }

      _loadImage(url) {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      }
    }

    // 5. CanvasProcessor Module
    class CanvasProcessor {
      constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
      }

      async process(img, { format = "jpg", scale = 1.0, quality = 0.9 } = {}) {
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = "high";
        this.ctx.drawImage(img, 0, 0, w, h);

        const mimeType =
          format === "png"
            ? "image/png"
            : format === "webp"
              ? "image/webp"
              : "image/jpeg";
        return new Promise((resolve) =>
          this.canvas.toBlob(resolve, mimeType, quality),
        );
      }
    }

    // 6. UIInjector Module
    class UIInjector {
      static BUTTON_ID = "yt-thumb-download-btn";

      constructor() {
        this.fetcher = new FallbackFetcher();
        this.processor = new CanvasProcessor();
      }

      async inject(videoId, isShorts = false) {
        this.removeButton();
        const container = await this._waitForContainer(isShorts);
        if (!container) return;

        const button = this._createButton(videoId, isShorts);
        container.appendChild(button);
      }

      removeButton() {
        const el = document.getElementById(UIInjector.BUTTON_ID);
        if (el) el.remove();
      }

      _createButton(videoId, isShorts) {
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

          const span = btn.querySelector("span");
          const oldText = span ? span.textContent : "";

          try {
            btn.disabled = true;
            if (span) span.textContent = "Memproses...";

            const settings = await StorageManager.getSettings();
            const img = await this.fetcher.fetchBestThumbnail(videoId);
            const blob = await this.processor.process(img, settings);

            // Konversi Blob ke DataURL (Base64)
            const dataUrl = await blobToDataURL(blob);

            // Kirim ke Background Script
            const response = await sendToBackground(
              MESSAGE_ACTIONS.DOWNLOAD_THUMBNAIL,
              {
                url: dataUrl,
                filename: `yt-thumbnail-${videoId}.${settings.format}`,
              },
            );

            if (response && response.success) {
              if (span) span.textContent = "Selesai!";
            } else {
              console.error(
                "[YT-Thumb] Gagal dari background:",
                response?.error,
              );
              if (span) span.textContent = "Gagal!";
            }
          } catch (err) {
            console.error("[YT-Thumb] Error proses:", err);
            if (span) span.textContent = "Gagal!";
          } finally {
            setTimeout(() => {
              btn.disabled = false;
              if (span) span.textContent = oldText;
            }, 2000);
          }
        });

        return btn;
      }

      _waitForContainer(isShorts, retries = 10) {
        return new Promise((resolve) => {
          let count = 0;
          const check = () => {
            const container = isShorts
              ? document.querySelector(
                  "ytd-reel-video-renderer[is-active] #actions #items",
                ) || document.querySelector("ytd-shorts #actions #items")
              : document.querySelector(
                  "#above-the-fold #top-level-buttons-computed",
                ) || document.querySelector("#owner #subscribe-button");

            if (container) resolve(container);
            else if (count < retries) {
              count++;
              setTimeout(check, 400);
            } else resolve(null);
          };
          check();
        });
      }
    }

    // 7. Core Execution
    const injector = new UIInjector();
    let lastVideoId = null;

    function handlePageChange() {
      const currentUrl = window.location.href;
      const videoId = UrlParser.extractVideoId(currentUrl);

      if (!videoId) {
        injector.removeButton();
        lastVideoId = null;
        return;
      }

      if (videoId === lastVideoId) return;
      lastVideoId = videoId;
      injector.inject(videoId, UrlParser.isShorts(currentUrl));
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handlePageChange);
    } else {
      handlePageChange();
    }

    window.addEventListener("yt-navigate-finish", handlePageChange);

    let prevUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== prevUrl) {
        prevUrl = location.href;
        handlePageChange();
      }
    }).observe(document.querySelector("head") || document.body, {
      childList: true,
      subtree: true,
    });
  })();

  // 7. Core Execution Flow
  const injector = new UIInjector();
  let lastVideoId = null;

  function handlePageChange() {
    const currentUrl = window.location.href;
    const videoId = UrlParser.extractVideoId(currentUrl);

    if (!videoId) {
      injector.removeButton();
      lastVideoId = null;
      return;
    }

    if (videoId === lastVideoId) return;
    lastVideoId = videoId;
    injector.inject(videoId, UrlParser.isShorts(currentUrl));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handlePageChange);
  } else {
    handlePageChange();
  }

  window.addEventListener("yt-navigate-finish", handlePageChange);

  let prevUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== prevUrl) {
      prevUrl = location.href;
      handlePageChange();
    }
  }).observe(document.querySelector("head") || document.body, {
    childList: true,
    subtree: true,
  });
})();

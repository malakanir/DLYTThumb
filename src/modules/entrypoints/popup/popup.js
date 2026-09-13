/**
 * @file popup.js
 * Kontroler UI Popup yang menghubungkan user interface dengan Core Business Logic.
 */

import { UrlParser } from "../../modules/parser/UrlParser.js";
import { StorageManager } from "../../modules/storage/StorageManager.js";
import { FallbackFetcher } from "../../modules/fetcher/FallbackFetcher.js";
import { CanvasProcessor } from "../../modules/processor/CanvasProcessor.js";
import { sendToBackground, MESSAGE_ACTIONS } from "../../utils/messaging.js";

document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const previewImg = document.getElementById("thumbnailPreview");
  const spinner = document.getElementById("loadingSpinner");
  const errorMsg = document.getElementById("errorMessage");
  const downloadForm = document.getElementById("downloadForm");
  const downloadBtn = document.getElementById("downloadBtn");
  const formatSelect = document.getElementById("formatSelect");
  const scaleSelect = document.getElementById("scaleSelect");
  const qualityRange = document.getElementById("qualityRange");
  const qualityVal = document.getElementById("qualityVal");
  const qualityGroup = document.getElementById("qualityGroup");
  const badge = document.getElementById("videoTypeBadge");

  const fetcher = new FallbackFetcher();
  const processor = new CanvasProcessor();
  let currentLoadedImage = null;
  let currentVideoId = null;

  // 1. Muat Preferensi Pengguna & Set Form State
  const settings = await StorageManager.getSettings();
  formatSelect.value = settings.format;
  scaleSelect.value = settings.scale.toString();
  qualityRange.value = settings.quality.toString();
  qualityVal.textContent = `${Math.round(settings.quality * 100)}%`;
  toggleQualityVisibility(settings.format);

  // 2. Deteksi Tab Aktif & Ekstrak ID Video
  try {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    currentVideoId = UrlParser.extractVideoId(activeTab?.url || "");

    if (!currentVideoId) {
      throw new Error("Tab aktif bukan halaman video YouTube.");
    }

    badge.textContent = UrlParser.isShorts(activeTab.url) ? "Shorts" : "Video";

    // 3. Ambil Thumbnail Resolusi Terbaik
    currentLoadedImage = await fetcher.fetchBestThumbnail(currentVideoId);
    previewImg.src = currentLoadedImage.src;

    spinner.classList.add("hidden");
    previewImg.classList.remove("hidden");
    downloadBtn.disabled = false;
  } catch (err) {
    spinner.classList.add("hidden");
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
  }

  // 4. Event Listeners untuk UI Form
  formatSelect.addEventListener("change", (e) => {
    const format = e.target.value;
    toggleQualityVisibility(format);
    StorageManager.saveSettings({ format });
  });

  scaleSelect.addEventListener("change", (e) => {
    StorageManager.saveSettings({ scale: parseFloat(e.target.value) });
  });

  qualityRange.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    qualityVal.textContent = `${Math.round(val * 100)}%`;
  });

  qualityRange.addEventListener("change", (e) => {
    StorageManager.saveSettings({ quality: parseFloat(e.target.value) });
  });

  // 5. Eksekusi Unduh Saat Form Disubmit
  downloadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentLoadedImage || !currentVideoId) return;

    downloadBtn.disabled = true;
    downloadBtn.textContent = "Memproses...";

    try {
      const format = formatSelect.value;
      const scale = parseFloat(scaleSelect.value);
      const quality = parseFloat(qualityRange.value);

      // Process Canvas
      const blob = await processor.process(currentLoadedImage, {
        format,
        scale,
        quality,
      });
      const objectUrl = URL.createObjectURL(blob);

      // Kirim pesan unduh ke Background Script
      await sendToBackground(MESSAGE_ACTIONS.DOWNLOAD_THUMBNAIL, {
        url: objectUrl,
        filename: `yt-thumbnail-${currentVideoId}.${format}`,
      });

      downloadBtn.textContent = "Berhasil!";
      setTimeout(() => {
        downloadBtn.textContent = "Unduh Thumbnail";
        downloadBtn.disabled = false;
      }, 1500);
    } catch (error) {
      console.error("Gagal mengunduh:", error);
      downloadBtn.textContent = "Gagal Mengunduh";
      downloadBtn.disabled = false;
    }
  });

  function toggleQualityVisibility(format) {
    // PNG bersifat lossless, sembunyikan slider kualitas
    if (format === "png") {
      qualityGroup.classList.add("hidden");
    } else {
      qualityGroup.classList.remove("hidden");
    }
  }
});

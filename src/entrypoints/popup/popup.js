/**
 * @file popup.js
 * Kontroler UI Popup YouTube (Bulletproof / Dynamic Import)
 */

// KITA HAPUS SEMUA IMPORT DI ATAS UNTUK MENCEGAH SILENT ERROR
// UI akan dirender langsung tanpa menunggu file modul lain!

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[Popup] Script berjalan, mencari tab aktif...");

  const previewImg = document.getElementById("thumbnailPreview");
  const spinner = document.getElementById("loadingSpinner");
  const errorMsg = document.getElementById("errorMessage");
  const downloadForm = document.getElementById("downloadForm");
  const downloadBtn = document.getElementById("downloadBtn");
  const formatSelect = document.getElementById("formatSelect");
  const scaleSelect = document.getElementById("scaleSelect");
  const qualityRange = document.getElementById("qualityRange");
  const qualityVal = document.getElementById("qualityVal");
  const badge = document.getElementById("videoTypeBadge");

  let currentVideoId = null;
  let videoTitle = "";

  // 1. Helper Bawaan (Tanpa ketergantungan modul eksternal)
  const extractVideoId = (url) => {
    const match = url?.match(
      /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  };

  function hideSpinnerShowPreview() {
    if (spinner) spinner.classList.add("hidden");
    if (previewImg) previewImg.classList.remove("hidden");
    if (downloadBtn) downloadBtn.disabled = false;
  }

  function showError(msg) {
    if (spinner) spinner.classList.add("hidden");
    if (previewImg) previewImg.classList.add("hidden");
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.remove("hidden");
    }
  }

  // 2. Deteksi Tab Aktif & Tampilkan Preview (Langsung Dieksekusi)
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs && tabs[0];

    if (!activeTab || !activeTab.url) {
      throw new Error("Tab tidak terdeteksi. Buka halaman video YouTube.");
    }

    currentVideoId = extractVideoId(activeTab.url);

    if (!currentVideoId) {
      throw new Error("Halaman ini bukan video atau Shorts YouTube.");
    }

    if (activeTab.title) {
      videoTitle = activeTab.title
        .replace(/- YouTube$/, "")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .trim();
    }

    if (badge) {
      badge.textContent = activeTab.url.includes("/shorts/")
        ? "Shorts"
        : "Video";
    }

    // Tampilkan gambar instan
    previewImg.onload = () => hideSpinnerShowPreview();
    previewImg.onerror = () => showError("Gagal memuat gambar dari CDN.");
    previewImg.src = `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`;
  } catch (err) {
    console.error("[Popup Error]:", err);
    showError(err.message || "Error tidak diketahui saat memuat UI.");
  }

  // 3. Event Listener Form Biasa
  if (qualityRange && qualityVal) {
    qualityRange.addEventListener("input", (e) => {
      qualityVal.textContent = `${Math.round(e.target.value * 100)}%`;
    });
  }

  // 4. Eksekusi Unduh (Menggunakan Dynamic Import)
  if (downloadForm) {
    downloadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentVideoId) return;

      downloadBtn.disabled = true;
      downloadBtn.textContent = "Memuat sistem...";

      try {
        // DYNAMIC IMPORT: Modul logika baru dimuat JIKA tombol ditekan.
        // Jika ada error missing '.js' pada modul, pesan errornya akan langsung terlihat di tombol.
        const { FallbackFetcher } =
          await import("../../modules/fetcher/FallbackFetcher.js");
        const { CanvasProcessor } =
          await import("../../modules/processor/CanvasProcessor.js");
        const { sendToBackground, MESSAGE_ACTIONS } =
          await import("../../modules/utils/messaging.js");

        downloadBtn.textContent = "Memproses Gambar...";

        const format = formatSelect ? formatSelect.value : "jpg";
        const scale = scaleSelect ? parseFloat(scaleSelect.value) : 1.0;
        const quality = qualityRange ? parseFloat(qualityRange.value) : 0.9;

        const fetcher = new FallbackFetcher();
        const processor = new CanvasProcessor();

        // Ambil gambar & proses canvas
        const fullResImage = await fetcher.fetchBestThumbnail(currentVideoId);
        const blob = await processor.process(fullResImage, {
          format,
          scale,
          quality,
        });

        // Konversi Blob ke Base64 DataURL
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const dataUrl = reader.result;
          const filename = videoTitle
            ? `${videoTitle}_[${currentVideoId}].${format}`
            : `yt-thumbnail-${currentVideoId}.${format}`;

          // Kirim ke background.js
          const response = await sendToBackground(
            MESSAGE_ACTIONS.DOWNLOAD_THUMBNAIL,
            { url: dataUrl, filename },
          );

          if (response && response.success) {
            downloadBtn.textContent = "Berhasil Terunduh!";
          } else {
            downloadBtn.textContent = "Gagal Mengunduh";
          }
          setTimeout(() => {
            downloadBtn.textContent = "Unduh Thumbnail";
            downloadBtn.disabled = false;
          }, 2000);
        };
      } catch (error) {
        console.error("[Unduh Error]:", error);
        downloadBtn.textContent = "Modul Error (Cek Console)";
        setTimeout(() => {
          downloadBtn.textContent = "Unduh Thumbnail";
          downloadBtn.disabled = false;
        }, 3000);
      }
    });
  }
});

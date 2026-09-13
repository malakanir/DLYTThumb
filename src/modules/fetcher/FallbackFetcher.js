/**
 * @file FallbackFetcher.js
 * Fetcher thumbnail berbasis Fetch API & Blob Object URL.
 */

export class FallbackFetcher {
  static QUALITIES = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];
  static BASE_URL = "https://i.ytimg.com/vi";

  async fetchBestThumbnail(videoId) {
    for (const quality of FallbackFetcher.QUALITIES) {
      const url = `${FallbackFetcher.BASE_URL}/${videoId}/${quality}.jpg`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          // YouTube mengembalikan gambar placeholder 120px jika resolusi tinggi tidak ada (ukuran < 2KB)
          if (blob.size > 2000) {
            return await this._blobToImage(blob);
          }
        }
      } catch (e) {
        console.warn(`[Fetcher] Gagal memuat resolusi ${quality}:`, e);
      }
    }
    throw new Error(`Thumbnail tidak ditemukan untuk ID: ${videoId}`);
  }

  _blobToImage(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => resolve(img);
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Gagal merender gambar thumbnail."));
      };
      img.src = objectUrl;
    });
  }
}

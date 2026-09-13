export class FallbackFetcher {
    static QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];

    async fetchBestThumbnail(videoId) {
        for (const quality of FallbackFetcher.QUALITIES) {
            const url = `${FallbackFetcher.BASE_URL}/${videoId}/${quality}.jpg`;
            const img = await this.loadImage(url);

            if (img && img.naturalWidth > 120) {
                return img;
            }
        }
            throw new Error(
              "Tidak dapat memuat thumbnail untuk video ID: ${videoId}",
            );
    }

    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Gagal memuat gambar dari URL: ${url}`));
            img.src = url;
        });
    }
}
# DLYTThumb — YouTube Video & Shorts Thumbnail Downloader

**DLYTThumb** adalah browser extension (Manifest V3) untuk Firefox yang memungkinkan pengunduhan thumbnail video YouTube biasa dan Shorts dalam resolusi tinggi secara mudah. Seluruh proses pengolahan gambar berjalan **100% client-side** tanpa ketergantungan pada server backend eksternal.

---

## 🌟 Fitur Utama

- **100% Client-Side Sandbox:** Mengolah dan merender gambar langsung di browser menggunakan HTML5 Canvas API.
- **Dukungan Full YouTube & Shorts:** Otomatis mendeteksi ID video serta judul dari DOM halaman video biasa maupun YouTube Shorts.
- **Injeksi UI Seamless:** Menambahkan tombol unduh langsung di samping tombol aksi native YouTube (sejajar dengan tombol *Like/Share*).
- **Konversi Format:** Mendukung pengekspor gambar ke format **JPG**, **PNG** (*lossless*), dan **WebP** (*lightweight*).
- **Kustomisasi Dimensi & Kualitas:** Opsi pengubahan skala resolusi (100%, 75%, 50%) dan *slider* tingkat kompresi kualitas gambar.
- **Sanitasi Nama File Otomatis:** Menamai berkas berdasarkan judul asli video YouTube + ID video yang aman untuk sistem berkas (misal: `Judul_Video_[dQw4w9WgXcQ].jpg`).

---

## 🛠️ Teknologi yang Digunakan

- **Browser Extension Standard:** WebExtensions Manifest V3 (Firefox Gecko Engine)
- **Core APIs:** HTML5 Canvas, Fetch API, Firefox `browser.downloads`, `browser.storage`
- **Testing Framework:** [Vitest](https://vitest.dev/) + `jsdom` untuk simulasi perenderan DOM

---

## 📁 Struktur Proyek

```text
DLYTThumb/
├── assets/
│   ├── icons/                  # Ikon ekstensi (16x16, 48x48, 128x128)
│   └── styles/
│       ├── injected.css        # Styling tombol injeksi di YouTube & Shorts
│       └── popup.css           # Styling tampilan UI Popup
├── src/
│   ├── entrypoints/
│   │   ├── background/
│   │   │   └── background.js   # Background script untuk eksekusi Downloads API
│   │   ├── content/
│   │   │   └── content.bundle.js # Standalone content script (DOM Injector & Observer)
│   │   └── popup/
│   │       ├── popup.html      # Tampilan UI Popup ekstensi
│   │       └── popup.js        # Kontroler logika UI Popup
│   ├── modules/
│   │   ├── fetcher/            # Fetcher thumbnail dengan mekanisme fallback resolusi
│   │   ├── parser/             # Parser URL dan pemutus tipe halaman (Shorts/Watch)
│   │   ├── processor/          # Canvas processor untuk resizing & konversi format
│   │   └── storage/            # Manager penyimpanan preferensi pengguna
│   └── utils/
│       └── messaging.js        # Abstraksi komunikasi inter-process (IPC)
├── tests/
│   ├── CanvasProcessor.test.js # Unit test untuk pemprosesan canvas
│   └── UrlParser.test.js       # Unit test untuk ekstraksi URL YouTube
├── manifest.json               # Konfigurasi ekstensi Firefox MV3
├── package.json
└── README.md
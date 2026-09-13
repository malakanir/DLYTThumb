import { JpegStrategy } from "./strategies/JpegStrategy";
import { PngStrategy } from "./strategies/PngStrategy";
import { WebpStrategy } from "./strategies/WebpStrategy";

export class CanvasProcessor {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");

    this.strategies = {
        jpg: new JpegStrategy(),
        jpeg: new JpegStrategy(),
        png: new PngStrategy(),
        webp: new WebpStrategy(),
    };
  }

  async process(img, {format = "jpg", scale = 1.0, quality = 0.9} = {}) {
    const strategy = this.strategies[format.toLowerCase()];

    if (!strategy) {
      throw new Error(`Format ${format} tidak didukung`);
    }

    const targetWidth = Math.round(img.naturalWidth * scale);
    const targetHeight = Math.round(img.naturalHeight * scale);
    
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;

    this.context.drawImage(img, 0, 0, targetWidth, targetHeight);
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = "high";

    this.context.drawImage(img, 0, 0, targetWidth, targetHeight);

    return await strategy.process(this.canvas, quality);
  }
}
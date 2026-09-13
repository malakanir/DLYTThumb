import { JpegStrategy } from "./strategies/JpegStrategy.js";
import { PngStrategy } from './strategies/PngStrategy.js';
import { WebpStrategy } from './strategies/WebpStrategy.js';

export class CanvasProcessor {
  constructor() {
    this.strategies = {
      jpg: new JpegStrategy(),
      png: new PngStrategy(),
       webp: new WebpStrategy()
    };

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
  }

  async process(image, options = {}) {
    const format = options.format || "jpg";
    const scale = options.scale || 1.0;
    const quality = options.quality || 0.9;

    const strategy = this.strategies[format];
    if (!strategy) {
      throw new Error(`Format tidak didukung: ${format}`);
    }

    const w = Math.round(image.naturalWidth * scale);
    const h = Math.round(image.naturalHeight * scale);

    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
    this.ctx.drawImage(image, 0, 0, w, h);

    return await strategy.encode(this.canvas, quality);
  }
}

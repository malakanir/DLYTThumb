import { FormatStrategy } from "./FormatStrategy.js";

export class WebpStrategy extends FormatStrategy {
  async encode(canvas, quality = 0.8) {
    return new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
  }
}
import { FormatStrategy } from "./FormatStrategy.js";

export class PngStrategy extends FormatStrategy {
  async encode(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }
}
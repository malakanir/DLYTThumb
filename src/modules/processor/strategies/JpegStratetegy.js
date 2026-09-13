import {FormatStrategy} from './FormatStrategy.js';

export class JpegStrategy extends FormatStrategy {
    async encode(canvas, quality = 0.9) {
        return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality));
    }
}
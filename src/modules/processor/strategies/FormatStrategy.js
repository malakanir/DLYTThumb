export class FormatStrategy {
    async encode(canvas, quality){
        throw new Error('Method encode() harus diimplementasikan oleh subclass');
    }
}
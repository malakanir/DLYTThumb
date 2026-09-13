import { describe, it, expect, beforeEach, vi } from "vitest";
import { CanvasProcessor } from "../src/modules/processor/CanvasProcessor.js";

describe("CanvasProcessor", () => {
  let processor;
  let mockImage;

  beforeEach(() => {
    processor = new CanvasProcessor();

    // Mock HTMLImageElement
    mockImage = {
      naturalWidth: 1920,
      naturalHeight: 1080,
    };

    // Mock Canvas Context 2D
    const mockContext = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "low",
    };

    // Stubbing HTMLCanvasElement methods yang tidak ada secara native di Node/JSDom
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockContext,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      (callback, type, quality) => {
        // Return mock Blob
        callback(
          new Blob(["mock-binary-data"], { type: type || "image/jpeg" }),
        );
      },
    );
  });

  it("harus berhasil memproses gambar dengan skala bawaan (1.0)", async () => {
    const blob = await processor.process(mockImage, { format: "jpg" });

    expect(processor.canvas.width).toBe(1920);
    expect(processor.canvas.height).toBe(1080);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/jpeg");
  });

  it("harus menghitung dimensi canvas secara tepat saat dilakukan scaling (0.5)", async () => {
    await processor.process(mockImage, { scale: 0.5, format: "jpg" });

    expect(processor.canvas.width).toBe(960);
    expect(processor.canvas.height).toBe(540);
  });

  it('harus menggunakan strategy PNG saat format "png" dipilih', async () => {
    const blob = await processor.process(mockImage, { format: "png" });

    expect(blob.type).toBe("image/png");
  });

  it('harus menggunakan strategy WebP saat format "webp" dipilih', async () => {
    const blob = await processor.process(mockImage, {
      format: "webp",
      quality: 0.8,
    });

    expect(blob.type).toBe("image/webp");
  });

  it("harus melemparkan error jika format tidak didukung", async () => {
    await expect(
      processor.process(mockImage, { format: "gif" }),
    ).rejects.toThrow("Format 'gif' tidak didukung.");
  });
});

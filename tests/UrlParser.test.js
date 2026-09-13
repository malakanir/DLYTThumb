import { describe, it, expect } from "vitest";
import { UrlParser } from "../src/modules/parser/UrlParser.js";

describe("UrlParser", () => {
  const VALID_ID = "dQw4w9WgXcQ";

  describe("extractVideoId()", () => {
    it("harus mengekstrak ID dari URL video biasa", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(UrlParser.extractVideoId(url)).toBe(VALID_ID);
    });

    it("harus mengekstrak ID dari URL video biasa dengan parameter tambahan", () => {
      const url =
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=123&index=1";
      expect(UrlParser.extractVideoId(url)).toBe(VALID_ID);
    });

    it("harus mengekstrak ID dari URL YouTube Shorts", () => {
      const url = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
      expect(UrlParser.extractVideoId(url)).toBe(VALID_ID);
    });

    it("harus mengekstrak ID dari URL Embed YouTube", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(UrlParser.extractVideoId(url)).toBe(VALID_ID);
    });

    it("harus mengekstrak ID dari domain singkat youtu.be", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(UrlParser.extractVideoId(url)).toBe(VALID_ID);
    });

    it("harus mengembalikan null untuk URL non-YouTube atau string tidak valid", () => {
      expect(UrlParser.extractVideoId("https://google.com")).toBeNull();
      expect(UrlParser.extractVideoId("invalid-string")).toBeNull();
      expect(UrlParser.extractVideoId("")).toBeNull();
      expect(UrlParser.extractVideoId(null)).toBeNull();
      expect(UrlParser.extractVideoId(undefined)).toBeNull();
    });
  });

  describe("isShorts()", () => {
    it("harus mengembalikan true untuk URL Shorts", () => {
      const url = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
      expect(UrlParser.isShorts(url)).toBe(true);
    });

    it("harus mengembalikan false untuk URL video standar", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(UrlParser.isShorts(url)).toBe(false);
    });

    it("harus mengembalikan false untuk input invalid", () => {
      expect(UrlParser.isShorts(null)).toBe(false);
      expect(UrlParser.isShorts("")).toBe(false);
    });
  });
});

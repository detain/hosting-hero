import { describe, expect, it } from "vitest";
import { decodePng, encodePng, hexToRgba, paintRect, pixelAt, rgba, solidRgba } from "../png.ts";

describe("png codec", () => {
  it("round-trips an RGBA image byte-exactly", () => {
    const original = paintRect(solidRgba(8, 8, rgba(10, 20, 30, 255)), 2, 2, 3, 3, rgba(200, 100, 0, 128));
    const decoded = decodePng(encodePng(original));
    expect([decoded.width, decoded.height]).toEqual([8, 8]);
    expect(Buffer.compare(Buffer.from(decoded.pixels), Buffer.from(original.pixels))).toBe(0);
  });

  it("is deterministic: identical input ⇒ identical bytes (no timestamps, fixed deflate)", () => {
    const image = solidRgba(64, 64, hexToRgba("#39424d"));
    expect(Buffer.compare(Buffer.from(encodePng(image)), Buffer.from(encodePng(image)))).toBe(0);
  });

  it("detects bit rot via chunk CRC", () => {
    const bytes = Uint8Array.from(encodePng(solidRgba(4, 4, rgba(1, 2, 3, 4))));
    const idatDataStart = 8 + 4 + 4 + 13 + 4 + 4; // sig + IHDR(len+type+data) + crc + IDAT(len+type)
    bytes[idatDataStart] = (bytes[idatDataStart] as number) ^ 0xff;
    expect(() => decodePng(bytes)).toThrow(/CRC mismatch/);
  });

  it("rejects a non-PNG buffer", () => {
    expect(() => decodePng(new Uint8Array([1, 2, 3, 4]))).toThrow(/PNG signature/);
  });

  it("paintRect refuses to escape the canvas", () => {
    expect(() => paintRect(solidRgba(4, 4, rgba(0, 0, 0, 255)), 3, 3, 2, 2, rgba(1, 1, 1, 255))).toThrow(RangeError);
  });

  it("hexToRgba parses #rrggbb and refuses anything else", () => {
    expect(hexToRgba("#ff8000")).toEqual(rgba(255, 128, 0));
    for (const bad of ["#fff", "red", "#gggggg", ""]) {
      expect(() => hexToRgba(bad), bad).toThrow(RangeError);
    }
  });

  it("pixelAt reads back what was painted", () => {
    const image = paintRect(solidRgba(16, 16, rgba(0, 0, 0, 255)), 4, 4, 8, 8, rgba(9, 9, 9, 255));
    expect(pixelAt(image, 5, 5)).toEqual(rgba(9, 9, 9, 255));
    expect(pixelAt(image, 0, 0)).toEqual(rgba(0, 0, 0, 255));
  });
});

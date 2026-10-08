/**
 * Minimal deterministic PNG codec (RGBA 8-bit truecolor, filter type 0).
 *
 * Why hand-rolled: the placeholder-kit generator must run in CI with zero
 * extra native deps (sharp stays packer-side inside @assetpack/core), and the
 * kit conformance tests must be able to READ back pixels to prove the bleed
 * corner markers survived the write. Node's zlib keeps the IDAT small; no
 * tIME/tEXt chunks ⇒ byte-identical output across runs.
 */
import { deflateSync, inflateSync } from "node:zlib";

export interface RgbaImage {
  readonly width: number;
  readonly height: number;
  /** row-major, 4 bytes per pixel */
  readonly pixels: Uint8Array;
}

export interface RgbaColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

export function rgba(r: number, g: number, b: number, a = 255): RgbaColor {
  return { r, g, b, a };
}

/** Parse "#rrggbb" (the kit.json hue format) into a color. Fails loud. */
export function hexToRgba(hex: string): RgbaColor {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) {
    throw new RangeError(`not a #rrggbb hex: "${hex}"`);
  }
  const value = Number.parseInt(match[1] as string, 16);
  return rgba((value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff);
}

export function solidRgba(width: number, height: number, color: RgbaColor): RgbaImage {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = color.r;
    pixels[i + 1] = color.g;
    pixels[i + 2] = color.b;
    pixels[i + 3] = color.a;
  }
  return { width, height, pixels };
}

export function paintRect(image: RgbaImage, x: number, y: number, w: number, h: number, color: RgbaColor): RgbaImage {
  if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > image.width || y + h > image.height) {
    throw new RangeError(`paintRect (${x},${y} ${w}x${h}) escapes ${image.width}x${image.height}`);
  }
  const pixels = Uint8Array.from(image.pixels);
  for (let row = y; row < y + h; row += 1) {
    for (let col = x; col < x + w; col += 1) {
      const at = (row * image.width + col) * 4;
      pixels[at] = color.r;
      pixels[at + 1] = color.g;
      pixels[at + 2] = color.b;
      pixels[at + 3] = color.a;
    }
  }
  return { width: image.width, height: image.height, pixels };
}

export function pixelAt(image: RgbaImage, x: number, y: number): RgbaColor {
  const at = (y * image.width + x) * 4;
  return rgba(
    image.pixels[at] as number,
    image.pixels[at + 1] as number,
    image.pixels[at + 2] as number,
    image.pixels[at + 3] as number,
  );
}

/* ─────────────────────────────── writing ─────────────────────────────── */

export function encodePng(image: RgbaImage): Buffer {
  const raw = new Uint8Array(image.height * (1 + image.width * 4));
  for (let row = 0; row < image.height; row += 1) {
    const rowStart = row * (1 + image.width * 4);
    raw[rowStart] = 0; // filter type 0 (None): deterministic, decodable everywhere
    raw.set(image.pixels.subarray(row * image.width * 4, (row + 1) * image.width * 4), rowStart + 1);
  }
  const chunks: Buffer[] = [
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdrBody(image.width, image.height)),
    chunk("IDAT", deflateSync(Buffer.from(raw), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ];
  return Buffer.concat(chunks);
}

function ihdrBody(width: number, height: number): Buffer {
  const body = Buffer.alloc(13);
  body.writeUInt32BE(width, 0);
  body.writeUInt32BE(height, 4);
  body[8] = 8; // bit depth
  body[9] = 6; // color type: truecolor with alpha
  body[10] = 0; // deflate
  body[11] = 0; // adaptive filtering off (every row uses filter 0)
  body[12] = 0; // no interlace
  return body;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/* ─────────────────────────────── reading ─────────────────────────────── */

export function decodePng(bytes: Uint8Array): RgbaImage {
  const view = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.length < 8 || view.subarray(0, 8).compare(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) !== 0) {
    throw new RangeError("decodePng: missing PNG signature");
  }
  let offset = 8;
  let width = -1;
  let height = -1;
  const idatParts: Buffer[] = [];
  while (offset < view.length) {
    const length = view.readUInt32BE(offset);
    const type = view.subarray(offset + 4, offset + 8).toString("latin1");
    const data = view.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = view.readUInt32BE(offset + 8 + length);
    if (crc32(Buffer.concat([view.subarray(offset + 4, offset + 8), data])) !== expectedCrc) {
      throw new RangeError(`decodePng: CRC mismatch in ${type} chunk`);
    }
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) {
        throw new RangeError("decodePng: only 8-bit truecolor RGBA is supported");
      }
    } else if (type === "IDAT") {
      idatParts.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  if (width < 0 || height < 0) throw new RangeError("decodePng: no IHDR");
  const inflated = inflateSync(Buffer.concat(idatParts));
  const stride = 1 + width * 4;
  if (inflated.length !== height * stride) {
    throw new RangeError(`decodePng: unexpected raw length ${inflated.length}`);
  }
  const pixels = new Uint8Array(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const filter = inflated[row * stride] as number;
    if (filter !== 0) {
      throw new RangeError(`decodePng: filter type ${filter} unsupported (writer emits only 0)`);
    }
    inflated.copy(pixels, row * width * 4, row * stride + 1, row * stride + 1 + width * 4);
  }
  return { width, height, pixels };
}

/* ─────────────────────────────── crc32 ───────────────────────────────── */

const CRC_TABLE: Uint32Array = buildCrcTable();

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

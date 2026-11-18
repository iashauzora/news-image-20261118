// "The World in a Day" — news-image entry for Wednesday 18 November 2026.
//
// The entry is the front page beside this file: entry.png, a one-page
// newspaper summing up the day's six verified world stories (the design
// source lives in design/front-page.html). This program's only job is to
// deliver those exact bytes to the output, unchanged, on every run:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const GATE_LIMIT_BYTES = 1_048_576; // the gate's 1 MiB cap on the image file
const GATE_LIMIT_SIDE = 1024; // and its cap on each side, in pixels
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const source = new URL('./entry.png', import.meta.url);

// Read the page once and refuse to ship anything the gate would reject:
// a truncated or swapped file fails here instead of at the scorer.
const page = readFileSync(source);
if (page.length > GATE_LIMIT_BYTES) {
  throw new Error(`entry.png is ${page.length} bytes, over the 1 MiB gate limit`);
}
if (!PNG_SIGNATURE.every((byte, i) => page[i] === byte)) {
  throw new Error('entry.png does not start with the PNG signature');
}
// The IHDR chunk follows the 8-byte signature: width and height are the
// big-endian 32-bit fields at offsets 16 and 20.
const width = page.readUInt32BE(16);
const height = page.readUInt32BE(20);
if (width > GATE_LIMIT_SIDE || height > GATE_LIMIT_SIDE) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate limit`);
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.png');
copyFileSync(source, target);
console.log(`entry.png: ${width}x${height}, ${page.length} bytes -> ${target}`);

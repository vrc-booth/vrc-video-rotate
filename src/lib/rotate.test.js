import assert from 'node:assert/strict';
import test from 'node:test';
import { rotateMp4 } from './rotate.js';

const box = (type, ...parts) => {
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(8);
  head.writeUInt32BE(8 + body.length);
  head.write(type, 4, 'latin1');
  return Buffer.concat([head, body]);
};

// tkhd v0: matrix at body offset 40, width/height (16.16) right after it.
const tkhd = () => {
  const body = Buffer.alloc(84);
  body.writeUInt32BE(1920 << 16, 76);
  body.writeUInt32BE(1080 << 16, 80);
  return box('tkhd', body);
};
const hdlr = (handler) => box('hdlr', Buffer.alloc(8), Buffer.from(handler, 'latin1'), Buffer.alloc(12));
const trak = (handler) => box('trak', tkhd(), box('mdia', hdlr(handler)));

const sample = () => new Blob([box('ftyp', Buffer.from('isom')), box('moov', trak('vide'), trak('soun')), box('mdat', Buffer.alloc(16))]);

const matrices = async (blob) => {
  const bytes = Buffer.from(await blob.arrayBuffer());
  const result = [];
  for (let at = bytes.indexOf('tkhd'); at !== -1; at = bytes.indexOf('tkhd', at + 1)) {
    result.push(Array.from({ length: 9 }, (_, i) => bytes.readInt32BE(at + 4 + 40 + i * 4)));
  }
  return result;
};

test('90° rewrites only the video track matrix and keeps the size', async () => {
  const input = sample();
  const output = await rotateMp4(input, 90);
  assert.equal(output.size, input.size);
  const [video, audio] = await matrices(output);
  assert.deepEqual(video, [0, 0x10000, 0, -0x10000, 0, 0, 1080 << 16, 0, 0x40000000]);
  assert.deepEqual(audio, Array(9).fill(0));
});

test('0° restores the identity matrix', async () => {
  const [video] = await matrices(await rotateMp4(await rotateMp4(sample(), 270), 0));
  assert.deepEqual(video, [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000]);
});

test('non-MP4 input is rejected', async () => {
  await assert.rejects(rotateMp4(new Blob([Buffer.from('not a video file')]), 90));
});

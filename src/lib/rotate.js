const ONE = 0x10000;

const fourcc = (view, at) =>
  String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));

function* boxes(view, start, end) {
  while (start + 8 <= end) {
    let size = view.getUint32(start);
    let header = 8;
    if (size === 1) {
      size = Number(view.getBigUint64(start + 8));
      header = 16;
    } else if (size === 0) {
      size = end - start;
    }
    if (size < header || start + size > end) throw new Error('Malformed MP4 box');
    yield { type: fourcc(view, start + 4), body: start + header, end: start + size };
    start += size;
  }
}

const child = (view, box, type) => box && [...boxes(view, box.body, box.end)].find((b) => b.type === type);

async function findMoov(file) {
  let pos = 0;
  while (pos + 8 <= file.size) {
    const head = new DataView(await file.slice(pos, pos + 16).arrayBuffer());
    let size = head.getUint32(0);
    if (size === 1) size = Number(head.getBigUint64(8));
    else if (size === 0) size = file.size - pos;
    if (fourcc(head, 4) === 'moov') return [pos, pos + size];
    if (size < 8) break;
    pos += size;
  }
  throw new Error('No moov box: not an MP4/MOV file');
}

// [a, b, c, d, tx, ty] in 16.16 fixed point; w, h are tkhd width/height (also 16.16).
function matrix(degrees, w, h) {
  switch (degrees) {
    case 90: return [0, ONE, -ONE, 0, h, 0];
    case 180: return [-ONE, 0, 0, -ONE, w, h];
    case 270: return [0, -ONE, ONE, 0, 0, w];
    default: return [ONE, 0, 0, ONE, 0, 0];
  }
}

/**
 * Sets the display rotation (clockwise degrees: 0, 90, 180, 270) of every video track
 * by rewriting the tkhd matrix. Frames are not re-encoded and the file size is unchanged.
 */
export async function rotateMp4(file, degrees) {
  const [moovStart, moovEnd] = await findMoov(file);
  const moov = new Uint8Array(await file.slice(moovStart, moovEnd).arrayBuffer());
  const view = new DataView(moov.buffer);
  const root = boxes(view, 0, moov.length).next().value;

  let videoTracks = 0;
  for (const trak of boxes(view, root.body, root.end)) {
    if (trak.type !== 'trak') continue;
    const tkhd = child(view, trak, 'tkhd');
    const hdlr = child(view, child(view, trak, 'mdia'), 'hdlr');
    if (!tkhd || !hdlr || fourcc(view, hdlr.body + 8) !== 'vide') continue;

    const at = tkhd.body + (view.getUint8(tkhd.body) === 1 ? 52 : 40);
    const [a, b, c, d, tx, ty] = matrix(degrees, view.getUint32(at + 36), view.getUint32(at + 40));
    [a, b, 0, c, d, 0, tx, ty, 0x40000000].forEach((v, i) => view.setInt32(at + i * 4, v));
    videoTracks++;
  }
  if (!videoTracks) throw new Error('No video track');

  return new Blob([file.slice(0, moovStart), moov, file.slice(moovEnd)], { type: file.type || 'video/mp4' });
}

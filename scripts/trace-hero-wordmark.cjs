// Preserve the existing wordmark silhouette as scalable SVG geometry.
const fs = require('node:fs');
const zlib = require('node:zlib');
const source = fs.readFileSync('public/images/home/kitsune-wordmark-textured.png');
const width = source.readUInt32BE(16), height = source.readUInt32BE(20);
if (source[24] !== 8 || source[25] !== 6) throw new Error('Expected 8-bit RGBA source');
const chunks = [];
for (let at = 8; at < source.length;) {
  const length = source.readUInt32BE(at), type = source.toString('ascii', at + 4, at + 8);
  if (type === 'IDAT') chunks.push(source.subarray(at + 8, at + 8 + length));
  at += length + 12;
}
const raw = zlib.inflateSync(Buffer.concat(chunks)), pixels = Buffer.alloc(width * height * 4);
const stride = width * 4;
const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)];
  for (let x = 0; x < stride; x++) {
    const at = y * stride + x, a = x >= 4 ? pixels[at - 4] : 0;
    const b = y ? pixels[at - stride] : 0, c = y && x >= 4 ? pixels[at - stride - 4] : 0;
    const predictor = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
    pixels[at] = (raw[y * (stride + 1) + x + 1] + predictor) & 255;
  }
}
const inside = (x, y) => x >= 0 && y >= 0 && x < width && y < height && pixels[(y * width + x) * 4 + 3] >= 128;
const edges = new Map();
const key = (p) => p.join(',');
const edge = (a, b) => edges.set(key(a), b);
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  if (!inside(x, y)) continue;
  if (!inside(x, y - 1)) edge([x,y], [x+1,y]);
  if (!inside(x + 1, y)) edge([x+1,y], [x+1,y+1]);
  if (!inside(x, y + 1)) edge([x+1,y+1], [x,y+1]);
  if (!inside(x - 1, y)) edge([x,y+1], [x,y]);
}
const contours = [];
while (edges.size) {
  const first = edges.keys().next().value, points = [first.split(',').map(Number)];
  let current = first;
  while (edges.has(current)) {
    const next = edges.get(current); edges.delete(current); current = key(next);
    if (current === first) break;
    points.push(next);
  }
  if (points.length > 100) contours.push(points);
}
const distance = (p, a, b) => {
  const dx = b[0]-a[0], dy = b[1]-a[1], length = dx*dx + dy*dy;
  const t = length ? Math.max(0, Math.min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)) : 0;
  return Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy);
};
function simplify(points, tolerance = 1.5) {
  let max = tolerance, index = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distance(points[i], points[0], points[points.length-1]);
    if (d > max) { max = d; index = i; }
  }
  if (index < 0) return [points[0], points[points.length-1]];
  return [...simplify(points.slice(0,index+1), tolerance).slice(0,-1), ...simplify(points.slice(index), tolerance)];
}
const round = n => Number(n.toFixed(2));
const pair = p => p.map(round).join(' ');
const lerp = (a,b,t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t];
const paths = contours.map(contour => {
  const left = Math.min(...contour.map(p => p[0]));
  const curvedLetter = left > 200 && left < 365;
  // Remove single-pixel chips from the small raster without moving the main
  // corners or proportions of the lettering.
  const points = contour.map((point, i) => {
    const neighbors = [-2,-1,0,1,2].map(offset => contour[(i+offset+contour.length)%contour.length]);
    const weights = [1,4,6,4,1];
    return [0,1].map(axis => neighbors.reduce((sum,p,j) => sum+p[axis]*weights[j],0)/16);
  });
  const far = points.reduce((best,p,i) => Math.hypot(p[0]-points[0][0],p[1]-points[0][1]) > best.d ? {i,d:Math.hypot(p[0]-points[0][0],p[1]-points[0][1])} : best, {i:0,d:0}).i;
  const outline = [...simplify(points.slice(0,far+1)).slice(0,-1), ...simplify([...points.slice(far),points[0]]).slice(0,-1)];
  // Round only shallow turns; keep the deliberate letter corners intact.
  const segments = outline.map((p,i) => {
    const prev = outline[(i+outline.length-1)%outline.length], next = outline[(i+1)%outline.length];
    const a = [p[0]-prev[0],p[1]-prev[1]], b = [next[0]-p[0],next[1]-p[1]];
    const cosine = (a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b));
    return curvedLetter && cosine > 0.4 ? {entry:lerp(prev,p,.5), p, exit:lerp(p,next,.5)} : {entry:p,p,exit:p};
  });
  return 'M '+pair(segments[0].exit)+' '+segments.slice(1).concat(segments[0]).map(s => 'L '+pair(s.entry)+' Q '+pair(s.p)+' '+pair(s.exit)).join(' ')+' Z';
});
if (paths.length !== 7) throw new Error(`Expected 7 letters, found ${paths.length}`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="582" height="229" viewBox="0 0 582 229">
  <defs>
    <filter id="paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".08 .09" numOctaves="3" seed="17" result="fibers"/>
      <feColorMatrix in="fibers" type="matrix" values="0 0 0 0 .43 0 0 0 0 .32 0 0 0 0 .19 0 0 0 .15 0" result="grain"/>
      <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="clipped"/></feMerge>
    </filter>
  </defs>
  <g fill="#f0e5cd" filter="url(#paper)">
${paths.map(d => '    <path d="'+d+'"/>').join('\n')}
  </g>
</svg>\n`;
fs.writeFileSync('public/images/home/kitsune-wordmark-vector.svg',svg);
console.log(`Traced ${paths.length} original letters into scalable outlines (${svg.length} bytes).`);

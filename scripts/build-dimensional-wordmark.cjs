// Add sign-like depth to the original vector lettering without redrawing it.
const fs = require('node:fs');
const source = fs.readFileSync('public/images/home/kitsune-hero-lockup.svg', 'utf8');
const paths = source.match(/<path\b[^>]*\/>/g);
const subtitle = source.match(/<text\b[^>]*>[^<]*<\/text>/)?.[0];
if (paths?.length !== 7 || !subtitle) throw new Error('Unexpected wordmark structure');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="537" height="229" viewBox="8 8 537 229">
  <defs>
    <g id="letters">${paths.join('\n')}</g>
    <linearGradient id="face" x1="0" y1="0" x2=".3" y2="1">
      <stop stop-color="#f6ebd3"/>
      <stop offset=".45" stop-color="#eee0be"/>
      <stop offset="1" stop-color="#e5d5b3"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#bd9860"/>
      <stop offset=".55" stop-color="#806039"/>
      <stop offset="1" stop-color="#4b3521"/>
    </linearGradient>
    <linearGradient id="bevel" x1="0" y1="0" x2=".5" y2="1">
      <stop stop-color="#fff9e8"/>
      <stop offset=".5" stop-color="#ddc99e"/>
      <stop offset="1" stop-color="#9d8051"/>
    </linearGradient>
    <filter id="shadow" x="-15%" y="-20%" width="140%" height="160%">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".08 .09" numOctaves="3" seed="17"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .43 0 0 0 0 .32 0 0 0 0 .19 0 0 0 .1 0"/>
      <feComposite in2="SourceAlpha" operator="in"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode/></feMerge>
    </filter>
  </defs>
  <use href="#letters" transform="translate(2 3)" fill="#080907" opacity=".35" filter="url(#shadow)"/>
  <g fill="url(#edge)" stroke="#806640" stroke-width=".2" stroke-linejoin="round">
${Array.from({ length: 4 }, (_, i) => { const step = (4 - i) * .4; return `    <use href="#letters" transform="translate(${step} ${step * 1.2})"/>`; }).join('\n')}
  </g>
  <use href="#letters" fill="url(#face)" stroke="url(#bevel)" stroke-width=".35" stroke-linejoin="round" filter="url(#grain)"/>
  ${subtitle}
</svg>\n`;
fs.writeFileSync('public/images/home/kitsune-hero-lockup-dimensional.svg', svg);

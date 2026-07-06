import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'

const IMG = 'public/assets/images'
const FONTS = '/tmp/claude-1000/-home-deepanshumalik-deepanshu-malik-github-io/90b3aa16-8c9d-4534-bf6a-6a17c3f21625/scratchpad'
const fontFiles = [
  `${FONTS}/font-cbb86b.ttf`,
  `${FONTS}/font-709b47.ttf`,
  `${FONTS}/font-e75d0a.ttf`,
  `${FONTS}/font-da9080.ttf`,
]

function render(svg, width) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Bricolage Grotesque' },
  })
  return r.render().asPng()
}

/* ——— favicons ——— */
const faviconSvg = readFileSync(`${IMG}/favicon.svg`, 'utf8')
const appleSvg = faviconSvg.replace('rx="14"', 'rx="0"') // iOS applies its own mask

writeFileSync(`${IMG}/favicon-96x96.png`, render(faviconSvg, 96))
writeFileSync(`${IMG}/apple-touch-icon.png`, render(appleSvg, 180))
writeFileSync(`${IMG}/web-app-manifest-192x192.png`, render(faviconSvg, 192))
writeFileSync(`${IMG}/web-app-manifest-512x512.png`, render(faviconSvg, 512))
for (const s of [16, 32, 48]) writeFileSync(`/tmp/fav-${s}.png`, render(faviconSvg, s))
console.log('favicons rendered')

/* ——— LinkedIn cover: 1584×396 authored, rendered @2x ——— */
const C = {
  bg: '#191410', bg2: '#1d1712', line: '#3d3225', soft: '#2e251a',
  text: '#ede2ce', muted: '#a3907a', faint: '#6f6152',
  copper: '#d4772b', copperHi: '#e99a55', ok: '#8cb271',
}
const nodes = [120, 456, 792, 1128, 1464]
const labels = ['', 'CLASSIFY', 'RETRIEVE', 'ORCHESTRATE', 'DISPATCH']

const cover = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1584 396">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.bg2}"/><stop offset="1" stop-color="${C.bg}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.copperHi}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${C.copperHi}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1584" height="396" fill="url(#bg)"/>

  <!-- hairline frame with dimension ticks -->
  <rect x="24" y="24" width="1536" height="348" fill="none" stroke="${C.soft}" stroke-width="1"/>
  <line x1="24" y1="18" x2="24" y2="30" stroke="${C.soft}"/><line x1="1560" y1="18" x2="1560" y2="30" stroke="${C.soft}"/>

  <!-- large decorative node, left (sits behind profile-photo zone) -->
  <g transform="rotate(45 300 180)" opacity="0.55">
    <rect x="190" y="70" width="220" height="220" fill="none" stroke="${C.soft}" stroke-width="2"/>
    <rect x="220" y="100" width="160" height="160" fill="none" stroke="${C.soft}" stroke-width="1"/>
  </g>
  <g transform="rotate(45 300 180)">
    <rect x="286" y="166" width="28" height="28" fill="none" stroke="${C.copper}" stroke-width="3"/>
  </g>
  <circle cx="300" cy="180" r="5" fill="${C.copperHi}"/>

  <!-- mono annotation, top-left, clear of photo zone -->
  <text x="56" y="66" font-family="IBM Plex Mono" font-size="15" font-weight="500" letter-spacing="3" fill="${C.faint}">DEEPANSHU.SYSTEM · OPERATIONAL SINCE 2021</text>

  <!-- pipeline bus along the bottom -->
  <line x1="24" y1="330" x2="1560" y2="330" stroke="${C.line}" stroke-width="1.5"/>
  ${nodes.map((x, i) => `
    <g transform="rotate(45 ${x} 330)"><rect x="${x - 7}" y="323" width="14" height="14" fill="${C.bg}" stroke="${i === 0 ? C.copper : C.muted}" stroke-width="${i === 0 ? 2.5 : 1.5}"/></g>
    ${labels[i] ? `<text x="${x}" y="360" font-family="IBM Plex Mono" font-size="12" font-weight="500" letter-spacing="2" fill="${C.faint}" text-anchor="middle">${labels[i]}</text>` : ''}`).join('')}
  <!-- packets in flight -->
  <circle cx="600" cy="330" r="22" fill="url(#glow)"/><rect x="592" y="326" width="16" height="8" fill="${C.copper}"/>
  <circle cx="960" cy="330" r="22" fill="url(#glow)"/><rect x="952" y="326" width="16" height="8" fill="${C.copper}"/>
  <circle cx="1300" cy="330" r="18" fill="url(#glow)"/><rect x="1294" y="326" width="12" height="8" fill="${C.copper}"/>

  <!-- text block: right of the profile-photo safe zone -->
  <text x="620" y="118" font-family="IBM Plex Mono" font-size="19" font-weight="500" letter-spacing="4" fill="${C.muted}">AI PRACTICE LEAD · PRODUCTION GENAI SYSTEMS</text>
  <text x="614" y="192" font-family="Bricolage Grotesque" font-size="62" font-weight="800" letter-spacing="-1.5" fill="${C.text}">I ship AI systems</text>
  <text x="614" y="258" font-family="Bricolage Grotesque" font-size="62" font-weight="800" letter-spacing="-1.5" fill="${C.text}">that <tspan fill="${C.copper}">survive production.</tspan></text>
  <text x="620" y="300" font-family="IBM Plex Mono" font-size="17" font-weight="400" letter-spacing="2" fill="${C.faint}">PYTHON · FASTAPI · AWS · KUBERNETES (CKA)</text>
  <circle cx="1262" cy="294" r="4" fill="${C.ok}"/>
  <text x="1276" y="300" font-family="IBM Plex Mono" font-size="17" font-weight="500" letter-spacing="1" fill="${C.copperHi}">deepanshu-malik.github.io</text>
</svg>`

writeFileSync(`${IMG}/linkedin-cover.png`, render(cover, 3168))
console.log('linkedin cover rendered @3168x792')

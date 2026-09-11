import sharp from 'sharp'

const scallops = [0, 1, 2, 3, 4, 5]
const hem = scallops.map(() => 'q -13.67 13 -27.33 0').join(' ')
const awningPath = `M 90 76 H 254 V 100 ${hem} Z`

const stripes = scallops
  .map(
    (i) =>
      `<rect x="${90 + i * 27.34}" y="76" width="27.4" height="36" fill="${
        i % 2 === 0 ? 'url(#ps-awning)' : '#ffffff'
      }"/>`,
  )
  .join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 236" width="680" height="472">
<rect width="340" height="236" fill="#fcfdff"/>
<defs>
  <linearGradient id="ps-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#eaf1fd"/></linearGradient>
  <linearGradient id="ps-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#dfe9fb"/></linearGradient>
  <linearGradient id="ps-awning" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2f8bff"/><stop offset="100%" stop-color="#0058de"/></linearGradient>
  <linearGradient id="ps-bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#8ec3ff"/><stop offset="100%" stop-color="#0064f0"/></linearGradient>
  <linearGradient id="ps-leaf" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#2f9c5c"/><stop offset="100%" stop-color="#4cc07c"/></linearGradient>
  <linearGradient id="ps-door" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2b3a58"/><stop offset="100%" stop-color="#1b2740"/></linearGradient>
  <clipPath id="ps-awning-clip"><path d="${awningPath}"/></clipPath>
</defs>

<g transform="rotate(-7 256 72)">
  <rect x="192" y="16" width="126" height="112" rx="15" fill="#ffffff"/>
  <rect x="192" y="16" width="126" height="112" rx="15" fill="none" stroke="#dce8fd" stroke-width="1.5"/>
  <text x="208" y="42" fill="#7c8ba5" font-size="12" font-weight="600" font-family="sans-serif">Payments</text>
  <rect x="240" y="86" width="14" height="22" rx="4" fill="url(#ps-bar)" opacity="0.5"/>
  <rect x="258" y="74" width="14" height="34" rx="4" fill="url(#ps-bar)" opacity="0.7"/>
  <rect x="276" y="62" width="14" height="46" rx="4" fill="url(#ps-bar)" opacity="0.88"/>
  <rect x="294" y="48" width="14" height="60" rx="4" fill="url(#ps-bar)"/>
  <path d="M236 100 C 262 96 276 74 302 48" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
  <path d="M236 100 C 262 96 276 74 302 48" fill="none" stroke="#0064f0" stroke-width="3" stroke-linecap="round"/>
  <path d="M289 46 L 305 45 L 302 60" fill="none" stroke="#0064f0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>

<ellipse cx="168" cy="212" rx="104" ry="11" fill="#0064f0" opacity="0.09"/>
<rect x="76" y="196" width="188" height="16" rx="8" fill="#e2ebf9"/>
<rect x="80" y="194" width="180" height="7" rx="3.5" fill="#f2f7ff"/>

<rect x="96" y="102" width="150" height="96" rx="5" fill="url(#ps-body)"/>
<rect x="232" y="102" width="14" height="96" fill="#e6eefc" opacity="0.55"/>

<rect x="84" y="62" width="176" height="15" rx="7.5" fill="url(#ps-roof)"/>
<rect x="88" y="62" width="168" height="6" rx="3" fill="#ffffff"/>

<g clip-path="url(#ps-awning-clip)">${stripes}</g>
<path d="${awningPath}" fill="none" stroke="#cfe0fb" stroke-width="1.2"/>

<rect x="142" y="136" width="38" height="62" rx="5" fill="url(#ps-door)"/>
<rect x="147" y="141" width="10" height="52" rx="4" fill="#ffffff" opacity="0.07"/>
<circle cx="174" cy="168" r="2.1" fill="#9db2d4"/>
<rect x="137" y="194" width="48" height="7" rx="3.5" fill="#dae4f5"/>

<rect x="196" y="134" width="40" height="34" rx="6" fill="#c2dcff"/>
<rect x="196" y="134" width="40" height="34" rx="6" fill="none" stroke="#9ac6ff" stroke-width="1.6"/>
<path d="M216 134 V168 M196 151 H236" stroke="#ffffff" stroke-width="3"/>

<path d="M120 174 C 111 160 112 145 121 134 C 129 146 128 162 120 174 Z" fill="url(#ps-leaf)"/>
<path d="M119 175 C 108 168 101 155 103 143 C 114 149 121 163 119 175 Z" fill="url(#ps-leaf)" opacity="0.88"/>
<path d="M121 175 C 132 169 139 157 137 145 C 126 151 119 163 121 175 Z" fill="url(#ps-leaf)" opacity="0.72"/>
<path d="M108 176 H134 L130 198 H112 Z" fill="#dee6f4"/>
<rect x="105" y="171" width="32" height="8" rx="4" fill="#eef3fc"/>
</svg>`

await sharp(Buffer.from(svg)).png().toFile('scripts/shop-preview.png')
console.log('wrote scripts/shop-preview.png')

import sharp from 'sharp'

const src = 'public/paylo_applogo.png'

function circleSvg(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  )
}

async function roundIcon(size, out) {
  await sharp(src)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: circleSvg(size), blend: 'dest-in' }])
    .png()
    .toFile(out)
}

await roundIcon(32, 'public/favicon-32.png')
await roundIcon(64, 'public/favicon.png')
await roundIcon(180, 'public/apple-touch-icon.png')
await roundIcon(192, 'public/pwa-192x192.png')
await roundIcon(512, 'public/pwa-512x512.png')

const bg = await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 0, g: 100, b: 240, alpha: 1 },
  },
})
  .png()
  .toBuffer()

const inner = await sharp(src).resize(400, 400, { fit: 'cover' }).png().toBuffer()
const roundedInner = await sharp(inner)
  .composite([{ input: circleSvg(400), blend: 'dest-in' }])
  .png()
  .toBuffer()

await sharp(bg)
  .composite([{ input: roundedInner, gravity: 'centre' }])
  .png()
  .toFile('public/pwa-512x512-maskable.png')

// Circular SVG favicon for crisp browser tabs
const svgIcon = await sharp('public/favicon.png').resize(64, 64).png().toBuffer()
const b64 = svgIcon.toString('base64')
await sharp(Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs><clipPath id="c"><circle cx="32" cy="32" r="32"/></clipPath></defs>
    <image href="data:image/png;base64,${b64}" width="64" height="64" clip-path="url(#c)"/>
  </svg>`,
))
  // keep also a simple round svg referencing png path for browsers
  .png()
  .toFile('public/favicon-round-preview.png')

console.log('round favicon + icons ready')

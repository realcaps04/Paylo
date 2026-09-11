import sharp from 'sharp'

const src = 'public/paylo-logo-source.png'
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

let minX = info.width
let minY = info.height
let maxX = 0
let maxY = 0

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4
    if (data[i] + data[i + 1] + data[i + 2] > 30) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}

const cx = Math.round((minX + maxX) / 2)
const cy = Math.round((minY + maxY) / 2)
const side = Math.max(maxX - minX + 1, maxY - minY + 1) + 12
let left = Math.round(cx - side / 2)
let top = Math.round(cy - side / 2)
left = Math.max(0, Math.min(left, info.width - side))
top = Math.max(0, Math.min(top, info.height - side))

console.log({ cx, cy, side, left, top })

await sharp(src)
  .extract({ left, top, width: side, height: side })
  .resize(1024, 1024)
  .png()
  .toFile('public/paylo_applogo.png')

function circleSvg(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  )
}

async function roundIcon(size, out) {
  await sharp('public/paylo_applogo.png')
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

const inset = await sharp('public/paylo_applogo.png').resize(400, 400).png().toBuffer()
await sharp(bg)
  .composite([{ input: inset, gravity: 'centre' }])
  .png()
  .toFile('public/pwa-512x512-maskable.png')

console.log('accurate logo assets ready')

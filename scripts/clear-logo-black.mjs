import sharp from 'sharp'

async function clearBlack(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] + data[i + 1] + data[i + 2] < 24) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 0
    }
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(path)
}

await clearBlack('public/paylo_applogo.png')

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

console.log('cleared black corners + regenerated icons')

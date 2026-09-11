import sharp from 'sharp'

const path = 'public/paylo_applogo.png'
const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info

function idx(x, y) {
  return (y * w + x) * 4
}

function isOpaque(i) {
  return data[i + 3] > 200
}

function isWhite(i) {
  return data[i] > 185 && data[i + 1] > 185 && data[i + 2] > 185
}

function isLikelyShadow(i) {
  // Darker blue cast: blue-dominant but dimmer than clean sky blue
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  if (!isOpaque(i) || isWhite(i)) return false
  if (b < 160) return false
  if (b <= r + 40) return false
  // Clean blues tend to have higher green relative to red; shadows crush green/brightness
  const L = (r + g + b) / 3
  return L < 118 && g < 110
}

// Sample clean blue (opaque, not white, not shadow) near edges for a linear gradient fit
const samples = []
for (let y = 0; y < h; y += 4) {
  for (let x = 0; x < w; x += 4) {
    const i = idx(x, y)
    if (!isOpaque(i) || isWhite(i) || isLikelyShadow(i)) continue
    samples.push([x, y, data[i], data[i + 1], data[i + 2]])
  }
}

// Fit R,G,B = a + b*x + c*y via least squares
function fitChannel(ch) {
  let n = 0
  let sx = 0
  let sy = 0
  let sz = 0
  let sxx = 0
  let syy = 0
  let sxy = 0
  let sxz = 0
  let syz = 0
  for (const s of samples) {
    const x = s[0]
    const y = s[1]
    const z = s[2 + ch]
    n++
    sx += x
    sy += y
    sz += z
    sxx += x * x
    syy += y * y
    sxy += x * y
    sxz += x * z
    syz += y * z
  }
  // Solve 3x3: [n sx sy; sx sxx sxy; sy sxy syy] * [a,b,c] = [sz, sxz, syz]
  const A = [
    [n, sx, sy],
    [sx, sxx, sxy],
    [sy, sxy, syy],
  ]
  const B = [sz, sxz, syz]
  // Gaussian elimination
  for (let col = 0; col < 3; col++) {
    let piv = col
    for (let r = col + 1; r < 3; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r
    ;[A[col], A[piv]] = [A[piv], A[col]]
    ;[B[col], B[piv]] = [B[piv], B[col]]
    const div = A[col][col] || 1
    for (let c = col; c < 3; c++) A[col][c] /= div
    B[col] /= div
    for (let r = 0; r < 3; r++) {
      if (r === col) continue
      const f = A[r][col]
      for (let c = col; c < 3; c++) A[r][c] -= f * A[col][c]
      B[r] -= f * B[col]
    }
  }
  return B // [a,b,c]
}

const fr = fitChannel(0)
const fg = fitChannel(1)
const fb = fitChannel(2)

function pred(x, y, f) {
  return Math.max(0, Math.min(255, Math.round(f[0] + f[1] * x + f[2] * y)))
}

let replaced = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = idx(x, y)
    if (!isOpaque(i) || isWhite(i)) continue
    if (!isLikelyShadow(i)) {
      // also catch mid-tone long shadows: much darker than predicted
      const pr = pred(x, y, fr)
      const pg = pred(x, y, fg)
      const pb = pred(x, y, fb)
      const dG = pg - data[i + 1]
      const dL = (pr + pg + pb) / 3 - (data[i] + data[i + 1] + data[i + 2]) / 3
      if (!(dL > 18 && dG > 12 && data[i + 2] > data[i] + 40)) continue
    }
    data[i] = pred(x, y, fr)
    data[i + 1] = pred(x, y, fg)
    data[i + 2] = pred(x, y, fb)
    replaced++
  }
}

await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(path)

function circleSvg(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  )
}

async function roundIcon(size, out) {
  await sharp(path)
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

const inset = await sharp(path).resize(400, 400).png().toBuffer()
await sharp(bg)
  .composite([{ input: inset, gravity: 'centre' }])
  .png()
  .toFile('public/pwa-512x512-maskable.png')

console.log({ samples: samples.length, replaced })

import sharp from 'sharp'

const src = 'public/paylo_applogo.png'
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info

// The icon is a blue squircle with a white ribbon "P". Anything that is not
// blue background (and not transparent) belongs to the glyph.
const inset = Math.round(w * 0.08)
const mask = new Uint8Array(w * h)
for (let y = inset; y < h - inset; y++) {
  for (let x = inset; x < w - inset; x++) {
    const p = y * w + x
    const i = p * 4
    if (data[i + 3] < 250) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (b - r > 70 && b > 120) continue
    if ((r + g + b) / 3 < 70) continue
    mask[p] = 1
  }
}

// Flood fill the outside so interior fold shading stays part of the glyph.
const outside = new Uint8Array(w * h)
const stack = []
for (let x = inset; x < w - inset; x++) {
  stack.push(x + inset * w, x + (h - inset - 1) * w)
}
for (let y = inset; y < h - inset; y++) {
  stack.push(y * w + inset, y * w + w - inset - 1)
}
while (stack.length) {
  const p = stack.pop()
  if (outside[p] || mask[p]) continue
  outside[p] = 1
  const x = p % w
  const y = (p - x) / w
  if (x > 0) stack.push(p - 1)
  if (x < w - 1) stack.push(p + 1)
  if (y > 0) stack.push(p - w)
  if (y < h - 1) stack.push(p + w)
}
for (let y = inset; y < h - inset; y++) {
  for (let x = inset; x < w - inset; x++) {
    const p = y * w + x
    if (!mask[p] && !outside[p]) mask[p] = 1
  }
}

let minX = w
let minY = h
let maxX = 0
let maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (!mask[y * w + x]) continue
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
}

const pad = 4
const left = Math.max(0, minX - pad)
const top = Math.max(0, minY - pad)
const gw = Math.min(w - left, maxX - minX + 1 + pad * 2)
const gh = Math.min(h - top, maxY - minY + 1 + pad * 2)

// Paint the glyph with the brand gradient, keeping the ribbon's fold shading.
const out = Buffer.alloc(gw * gh * 4)
const topColor = [43, 134, 255]
const bottomColor = [0, 84, 221]

for (let y = 0; y < gh; y++) {
  for (let x = 0; x < gw; x++) {
    const sp = (y + top) * w + (x + left)
    const o = (y * gw + x) * 4
    if (!mask[sp]) continue
    const si = sp * 4
    const t = Math.min(1, Math.max(0, (x / gw) * 0.35 + (y / gh) * 0.65))
    const lum = (data[si] + data[si + 1] + data[si + 2]) / 3 / 255
    const shade = Math.min(1, Math.max(0.82, lum))
    for (let c = 0; c < 3; c++) {
      out[o + c] = Math.round((topColor[c] + (bottomColor[c] - topColor[c]) * t) * shade)
    }
    out[o + 3] = 255
  }
}

const glyph = sharp(out, { raw: { width: gw, height: gh, channels: 4 } })
const targetH = 512
await glyph
  .resize({ height: targetH })
  .png()
  .toFile('public/paylo-p-glyph.png')

console.log({ bbox: { minX, minY, maxX, maxY }, glyph: { gw, gh } })

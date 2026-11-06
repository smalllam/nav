import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const visuals = read('data/visual-assets.json')
const merchants = read('data/merchants.json')
const meta = read('data/vps-meta.json')
const db = read('data/db.json')
const publicRoot = path.resolve('public')
const files = new Set()
function asset(file) {
  assert.match(file, /^\/assets\/(merchants|resources|flags)\/[a-z0-9.-]+$/)
  const resolved = path.resolve(publicRoot, '.' + file)
  assert(resolved.startsWith(publicRoot + path.sep))
  const bytes = fs.readFileSync(resolved)
  assert(bytes.length > 80 && bytes.length <= 2_000_000, file)
  if (file.endsWith('.svg')) {
    const svg = bytes.toString('utf8')
    assert(svg.includes('<svg'), file)
    assert(!/<(?:script|foreignObject|iframe)\b|\bon\w+\s*=|(?:href\s*=\s*["']\s*(?:https?:|\/\/|javascript:))|url\(\s*["']?(?:https?:|\/\/)/i.test(svg), file)
  }
  files.add(resolved)
  return createHash('sha256').update(bytes).digest('hex')
}
assert.deepEqual(Object.keys(visuals.merchants).sort(), merchants.map(m => m.id).sort())
for (const group of ['merchants', 'resources']) for (const [id, entry] of Object.entries(visuals[group])) {
  assert(entry.sourcePage && /^https?:\/\//.test(entry.sourcePage), id)
  if (entry.path) {
    assert.equal(asset(entry.path), entry.sha256, id)
    assert(entry.sourceUrl && entry.kind, id)
    assert(!/\/images\/partner\/|\/tld_logos\/|qlogo\.cn|logo_veepee_|\/hero-display\.jpg/.test(entry.sourceUrl), id)
  }
}
assert.deepEqual(Object.keys(visuals.resources).sort(), ['digvps', 'nodeseek', 'vpslog'])
for (const country of meta.countries) assert(visuals.flags[country.iso2], country.iso2)
for (const iso of ['HK', 'MO', 'EU']) assert(visuals.flags[iso], iso)
for (const file of Object.values(visuals.flags)) asset(file)
assert.match(fs.readFileSync('public' + visuals.flagLicense, 'utf8'), /MIT License/)
// Every country-plan heading resolves to the same merchant used by the catalog.
const items = db.flatMap(r => r.nav.flatMap(c => c.nav.flatMap(g => g.nav))).filter(i => i.vps)
for (const item of items) {
  const name = item.name.startsWith('Uzumaru / Uzuma') ? 'Uzumaru / Uzuma' : item.name.replace(/（.*?）/g, '').trim()
  assert(merchants.some(m => m.name === name || m.aliases.includes(name)), item.name)
}
const realLogos = Object.values(visuals.merchants).filter(x => x.path).length
assert(realLogos >= 270)
console.log(`Visual assets passed: ${realLogos}/${merchants.length} merchant icons, 3 community brands, ${Object.keys(visuals.flags).length} flag/region icons, ${items.length} plan-to-merchant matches, ${files.size} local files.`)

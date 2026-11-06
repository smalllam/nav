import fs from 'node:fs'
import assert from 'node:assert/strict'
import { buildDirectory, writeDirectory, displayLabel } from './build-directory.mjs'

const directory = writeDirectory()
assert.deepEqual(directory, buildDirectory())
const raw = JSON.parse(fs.readFileSync('data/merchants.json', 'utf8'))
assert.equal(directory.merchants.length, 310)
for (const m of directory.merchants) {
  const original = raw.find(r => r.id === m.id)
  for (const field of ['url', 'countries', 'plans', 'nat', 'aliases', 'aliasIds']) assert.deepEqual(m[field], original[field])
  assert.deepEqual(m.payments, original.payments.map(displayLabel))
  assert.deepEqual(m.offeredRegions, original.offeredRegions.map(displayLabel))
  for (const field of ['review', 'sources', 'checkedAt', 'status']) assert(!(field in m))
}
const plans = db => db.flatMap(r => r.nav.flatMap(c => c.nav.flatMap(g => g.nav))).filter(i => i.vps)
const before = plans(JSON.parse(fs.readFileSync('data/db.json', 'utf8'))), after = plans(directory.db)
assert.equal(after.length, 538)
for (let i = 0; i < after.length; i++) {
  for (const key of ['country', 'nat', 'unavailable', 'buyUrl']) assert.deepEqual(after[i].vps[key], before[i].vps[key])
  assert.equal(after[i].url, before[i].url)
  for (const key of ['sources', 'checkedAt', 'stock', 'qualified', 'location']) assert(!(key in after[i].vps))
}
assert.equal(directory.meta.countries.length, 195)
assert.deepEqual(directory.merchants.find(m => m.id === 'alice-networks').offeredRegions, ['中国香港', '日本 · 东京', '美国 · 盐湖城'])
assert(!/本轮|未实购|待核|核验来源|sourceScope|successfulRecipientCount/.test(JSON.stringify(directory)))
console.log('Public directory passed: 310 merchant destinations, 538 product destinations, 195 country filters, payment and NAT mappings preserved.')

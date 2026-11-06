import fs from 'node:fs'
import assert from 'node:assert/strict'
import { writeSEO, writeTemplate } from './util.mjs'
import { buildMerchants } from './build-merchants.mjs'
const db = JSON.parse(fs.readFileSync('data/db.json'))
const meta = JSON.parse(fs.readFileSync('data/vps-meta.json'))
const items = db.flatMap(r => r.nav.flatMap(c => c.nav.flatMap(g => g.nav)))
const merchants = JSON.parse(fs.readFileSync('data/merchants.json'))
assert.deepEqual(merchants, buildMerchants(db, JSON.parse(fs.readFileSync('data/merchants-extra.json')), JSON.parse(fs.readFileSync('data/merchant-discovery.json'))))
assert.equal(new Set(merchants.map(m => m.id)).size, merchants.length)
assert.equal(merchants.reduce((n,m) => n + m.plans, 0), items.length)
assert.equal(merchants.filter(m => m.name.includes('Uzumaru')).length, 1)
assert(merchants.some(m => m.name === 'AVA') && merchants.some(m => m.name === 'AVANETCO'))
assert.equal(merchants.filter(m => m.name.includes('BuyVM')).length, 1)
for (const m of merchants) {
  for (const link of [m.url, ...m.sources]) {
    const url = new URL(link)
    assert(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password)
    assert(!/[?&](aff|ref|invite|affid|aff_code)=/i.test(link), `Referral link in new merchant index: ${link}`)
    assert(!link.includes('web.telegram.org') && !link.includes('t.me/c/'))
  }
  if (m.status === 'lead') assert(!m.payments.length && !m.countries.length && !m.plans && !m.nat)
  if (m.status === 'official') assert(m.sources.length > 0)
}
assert.equal(merchants.find(m => m.id === 'aethertech').nat, true)
assert.equal(meta.countries.length, 195)
assert.equal(new Set(meta.countries.map(c => c.iso2)).size, 195)
assert.equal(new Set(items.filter(i => i.vps.qualified).map(i => i.vps.country)).size, meta.coverage.qualified)
assert.equal(new Set(items.map(i => i.vps.country)).size, meta.coverage.countriesWithLeads)
assert.equal(new Set(items.map(i => `${i.vps.country}:${i.name}:${i.url}`)).size, items.length)
for (const item of items) {
  assert(meta.countries.some(c => c.iso2 === item.vps.country))
  for (const link of [item.url, item.vps.buyUrl, ...item.vps.sources].filter(Boolean)) {
    const url = new URL(link)
    assert(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password)
  }
  if (item.vps.qualified) assert(item.vps.paymentConfirmed && /USDT|支付宝/.test(item.vps.payment))
}
const find = (country, provider) => items.find(i => i.vps.country === country && i.name === provider)
assert.equal(find('MC', 'Monaco Cloud（付款待核）').vps.kind, '当地部署声明')
assert.equal(find('MC', 'h2.nexus').vps.kind, 'GeoIP')
assert.equal(find('MC', 'VPS Shell').vps.kind, '地点待核')
assert.equal(find('KP', 'ByteVirt').vps.qualified, false)
assert.equal(find('KP', 'ByteVirt').vps.unavailable, true)
const settings = { openSEO: true, loading: 'none', loadingCode: '', title: 'VPS', description: '', keywords: '', favicon: '' }
const seo = writeSEO([{ name: '<script>test</script>', desc: '$19/month + $2 fee' }], { settings })
const html = writeTemplate({ html: '<!-- nav.seo-start --><!-- nav.seo-end -->', settings, seoTemplate: seo })
assert(html.includes('$19/month + $2 fee'))
assert(!html.includes('<script>test</script>'))
console.log(`VPS audit passed: ${items.length} entries, ${meta.coverage.qualified} qualified countries, public URLs and critical location/stock regressions checked.`)

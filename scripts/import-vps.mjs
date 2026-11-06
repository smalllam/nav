import fs from 'node:fs'
import crypto from 'node:crypto'

const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/import-vps.mjs <全球国家覆盖核验.json>')
const raw = fs.readFileSync(source)
const { coverage, countries } = JSON.parse(raw)
const regions = { Asia: '亚洲', Europe: '欧洲', Africa: '非洲', Americas: '美洲', Oceania: '大洋洲' }
const safeUrl = value => {
  if (!value) return ''
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid public URL')
  return url.href
}
const tree = []
let id = 0
for (const c of countries) {
  let region = tree.find(r => r.title === regions[c.region])
  if (!region) tree.push(region = { title: regions[c.region] || c.region, nav: [] })
  const options = c.options.map(o => {
    const qualified = Boolean(o.locationConfirmed && (o.paymentConfirmed ?? true) && /USDT|支付宝/.test(o.payment) && o.payment !== '待核' && o.publicProductEntry)
    const geoip = /geoip/i.test(o.locationClaimKind || '') || /^GeoIP[：:]|WARP|GeoIP IPv4|远程.*出口/i.test(o.locationType) || o.provider === 'h2.nexus'
    const kind = !o.locationConfirmed ? '地点待核' : geoip ? 'GeoIP' : '当地部署声明'
    const nat = /NAT|共享.?IPv4|LXC/i.test(o.locationType + ' ' + o.priceNote + ' ' + o.stock)
    return {
      id: ++id, name: o.provider, url: safeUrl(o.url || o.buyUrl), icon: '', createdAt: '2026-11-06 14:00',
      desc: [o.locationType, o.priceNote, o.payment, o.stock].filter(Boolean).join(' · '),
      breadcrumb: [region.title, c.zh, 'VPS / 云服务器'], tags: [],
      vps: {
        country: c.iso2, qualified, kind, nat, payment: o.payment || '待核',
        paymentConfirmed: o.paymentConfirmed ?? /USDT|支付宝/.test(o.payment),
        location: o.locationType || '地点待核', price: o.priceNote || '价格待核',
        stock: o.stock || '库存待核', unavailable: /0 Available|0库存|售罄|尚未开放下单|无库存/.test(o.stock || ''), buyUrl: safeUrl(o.buyUrl),
        sources: [...new Set([o.paymentSource, o.locationSource, o.termsSource, o.historicalHostSource].filter(Boolean))].map(safeUrl),
        checkedAt: o.checkedAt || '2026-11-06',
      },
    }
  })
  region.nav.push({ title: c.zh, nav: [{ title: 'VPS / 云服务器', nav: options }] })
}
const meta = {
  checkedAt: '2026-11-06', sourceSHA256: crypto.createHash('sha256').update(raw).digest('hex'), coverage,
  countries: countries.map(c => ({ iso2: c.iso2, name: c.name, zh: c.zh, region: regions[c.region] || c.region, aliases: c.aliases, qualified: c.countedTowardTarget, status: c.status })),
}
fs.writeFileSync('data/db.json', JSON.stringify(tree, null, 2) + '\n')
fs.writeFileSync('data/vps-meta.json', JSON.stringify(meta, null, 2) + '\n')
console.log(JSON.stringify({ countries: countries.length, options: id, providers: new Set(countries.flatMap(c => c.options.map(o => o.provider))).size, coverage }))

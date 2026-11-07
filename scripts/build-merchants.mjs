import fs from 'node:fs'

// Only public display fields belong in the published catalog.
export function buildMerchants(db, extra, discovery = [], verification = { records: [] }) {
  const groups = new Map()
  const items = db.flatMap(r => r.nav.flatMap(c => c.nav.flatMap(g => g.nav))).filter(i => i.vps)
  for (const i of items) {
    const name = i.name.startsWith('Uzumaru / Uzuma') ? 'Uzumaru / Uzuma' : i.name.replace(/（.*?）/g, '').trim()
    const id = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
    if (!groups.has(id)) groups.set(id, { id, name, url: i.url, category: 'VPS', status: 'research', desc: '已整理对应国家的产品、地点、支付和库存资料，可继续查看国家套餐。', sources: [], countries: [], payments: [], plans: 0, nat: false, checkedAt: '2026-11-06' })
    const m = groups.get(id)
    m.plans++
    m.countries.push(i.vps.country)
    if (i.vps.paymentConfirmed) for (const p of ['支付宝', 'USDT']) if (i.vps.payment.includes(p)) m.payments.push(p)
    m.sources.push(i.url)
    m.nat ||= i.vps.nat
  }
  for (const e of extra) {
    const m = { ...e, countries: [], payments: [], plans: 0, nat: !!e.nat, checkedAt: '2026-11-06' }
    if (groups.has(m.id)) throw new Error(`Duplicate merchant: ${m.id}`)
    groups.set(m.id, m)
  }
  const identity = name => name.replace(/（.*?）|\(.*?\)/g, '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
  const host = url => new URL(url).hostname.replace(/^(www|my|billing|portal|portals|client|clients|clientarea|manage|manager|account|area|financeiro|members|cloud|cp|dash|dashboard|panel|store|idc)\./, '')
  const aliases = { buyvm: ['frantech'], hytron: ['hytron'], lisahost: ['lisahost'], greencloud: ['greencloud'] }
  for (const d of discovery) {
    const existing = [...groups.values()].find(m => host(m.url) === host(d.url) || identity(m.name) === identity(d.name) || (aliases[m.id] || []).includes(identity(d.name)) || (d.name.includes('BuyVM') && m.id === 'buyvm'))
    if (existing) { existing.sources.push(d.source); continue }
    const id = 'lead-' + host(d.url).replace(/[^a-z0-9]+/g, '-')
    groups.set(id, { id, name: d.name, url: d.url, category: '商家线索', status: 'lead', desc: '第三方目录收录的商家入口；当前 VPS 产品、支付方式、地点和库存尚待官网核实。', sources: [d.source], countries: [], payments: [], plans: 0, nat: false, checkedAt: '2026-11-06' })
  }
  // These are manually reviewed facts. Extraction matches never grant verification.
  for (const v of verification.records.filter(v => !v.mergedInto)) {
    const m = groups.get(v.id)
    if (!m) throw new Error(`Unknown verification target: ${v.id}`)
    const { sourceName, ...fields } = v
    groups.set(v.id, { ...m, ...fields, aliases: [...new Set([...(m.aliases || []), ...(fields.aliases || []), ...(sourceName && sourceName !== v.name ? [sourceName] : [])])] })
  }
  for (const v of verification.records.filter(v => v.mergedInto)) {
    const alias = groups.get(v.id), target = groups.get(v.mergedInto)
    if (!alias || !target || alias.plans) throw new Error(`Invalid merchant merge: ${v.id}`)
    target.aliases = [...(target.aliases || []), alias.name]
    target.aliasIds = [...(target.aliasIds || []), alias.id]
    target.sources.push(...v.sources)
    groups.delete(v.id)
  }
  return [...groups.values()].map(m => ({ ...m, review: m.review || null, offeredRegions: m.offeredRegions || [], aliases: m.aliases || [], aliasIds: m.aliasIds || [], countries: [...new Set(m.countries)], payments: [...new Set(m.payments)], sources: [...new Set(m.sources)] })).sort((a,b) => a.name.localeCompare(b.name, 'zh-CN'))
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/build-merchants.mjs')) {
  const merchants = buildMerchants(JSON.parse(fs.readFileSync('data/db.json')), JSON.parse(fs.readFileSync('data/merchants-extra.json')), JSON.parse(fs.readFileSync('data/merchant-discovery.json')), JSON.parse(fs.readFileSync('data/merchant-verification.json')))
  fs.writeFileSync('data/merchants.json', JSON.stringify(merchants, null, 2) + '\n')
  console.log(`Merchant catalog: ${merchants.length} records; ${merchants.filter(m => m.review?.complete).length} complete public checks; ${merchants.filter(m => m.status === 'lead').length} product checks pending.`)
}

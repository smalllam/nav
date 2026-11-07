import fs from 'node:fs'

const read = file => JSON.parse(fs.readFileSync(`data/${file}.json`, 'utf8'))
const write = (file, value) => fs.writeFileSync(`data/${file}.json`, JSON.stringify(value, null, 2) + '\n')
const name = value => value.replace(/（[^）]*(?:待核|付款待|地点待)[^）]*）/g, '').trim()
export const displayLabel = value => value.replace(/[，、]?(?:其他)?币种待核|品牌待核|具体国家待核|[，、]?实体位置待核|\s*原始实测/g, '').replace(/（\s*）/g, '').trim()

export function buildDirectory() {
  const source = read('merchants'), meta = read('vps-meta'), assets = read('visual-assets')
  const countries = meta.countries.map(({ iso2, zh, name, aliases, region }) => ({ iso2, zh, name, aliases, region }))
  const regionNames = new Map(countries.map(c => [c.iso2, c.zh]))
  const merchants = source.map(m => {
    const regions = m.offeredRegions.map(displayLabel)
    const product = m.nat ? 'VPS 与 NAT 云服务器' : m.category === '云平台' ? '云计算与虚拟服务器' : 'VPS 云服务器'
    const generic = /本轮|核查|核实|已核|待核|依据|资料|官网|分项|原始实测|来源|整理|所列|合并为|合并展示|同一商家|匿名结账/.test(m.desc)
    const desc = generic ? (regions.length ? `提供${regions.slice(0, 3).map(r => r.split(' · ')[0]).filter((r, i, a) => a.indexOf(r) === i).join('、')}${regions.length > 3 ? '等地区' : '地区'}的${product}。` : `提供${product}。`) : m.desc
    return {
      id: m.id, name: name(m.name), url: m.url, category: m.category === '商家线索' ? 'VPS' : m.category,
      desc, countries: m.countries, payments: m.payments.map(displayLabel), plans: m.plans, nat: m.nat,
      offeredRegions: regions, aliases: m.aliases, aliasIds: m.aliasIds,
    }
  })
  const db = read('db')
  for (const r of db) for (const c of r.nav) for (const g of c.nav) for (const item of g.nav) {
    if (!item.vps) continue
    const v = item.vps, originalName = item.name.startsWith('Uzumaru / Uzuma') ? 'Uzumaru / Uzuma' : item.name.replace(/（.*?）/g, '').trim()
    const merchant = merchants.find(m => m.name === name(originalName) || m.aliases.includes(originalName))
    const payments = merchant?.payments.length ? merchant.payments : v.paymentConfirmed ? ['支付宝', 'USDT'].filter(p => v.payment.includes(p)) : []
    let price = v.price.split(/[；。\n]/)[0].replace(/（[^）]*(?:报价|页面|后台|公开|本轮|确认|核实|来源|原始)[^）]*）/g, '').replace(/^(?:页面最低套餐候选|公开旧款报价|公开参考报价|公开价|候选套餐)\s*/, '').trim()
    if (/待核|待询|逐国|尚未|未确认|未找到|核实|核验/.test(price)) price = '查看套餐报价'
    const kind = v.kind === 'GeoIP' ? 'GeoIP' : v.nat ? 'NAT' : 'VPS'
    item.name = name(item.name)
    item.desc = `${regionNames.get(v.country)} · ${kind} · ${price}`
    item.vps = { country: v.country, kind, nat: v.nat, price, payments, payment: payments.length ? payments.join('、') : '查看商家支付选项', unavailable: v.unavailable, buyUrl: v.buyUrl }
  }
  const visuals = { merchants: {}, resources: {}, flags: assets.flags }
  for (const group of ['merchants', 'resources']) for (const [id, a] of Object.entries(assets[group])) visuals[group][id] = { path: a.path, ...(a.theme ? { theme: a.theme } : {}) }
  return { merchants, db, meta: { countries }, visuals }
}

export function writeDirectory() {
  const directory = buildDirectory()
  for (const [key, value] of Object.entries(directory)) write(`directory-${key}`, value)
  return directory
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/build-directory.mjs')) writeDirectory()

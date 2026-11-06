import fs from 'node:fs'
import assert from 'node:assert/strict'
import { writeSEO, writeTemplate } from './util.mjs'
import { buildMerchants } from './build-merchants.mjs'
const db = JSON.parse(fs.readFileSync('data/db.json'))
const meta = JSON.parse(fs.readFileSync('data/vps-meta.json'))
const items = db.flatMap(r => r.nav.flatMap(c => c.nav.flatMap(g => g.nav)))
const merchants = JSON.parse(fs.readFileSync('data/merchants.json'))
const verification = JSON.parse(fs.readFileSync('data/merchant-verification.json'))
const extra = JSON.parse(fs.readFileSync('data/merchants-extra.json'))
const discovery = JSON.parse(fs.readFileSync('data/merchant-discovery.json'))
assert.deepEqual(merchants, buildMerchants(db, extra, discovery, verification))
const originalLeads = buildMerchants(db, extra, discovery).filter(m => m.status === 'lead')
assert.equal(originalLeads.length, 222)
assert.deepEqual(new Set(verification.records.map(m => m.id)), new Set(originalLeads.map(m => m.id)))
assert.equal(verification.records.filter(m => m.mergedInto).length, 2)
assert.equal(merchants.length, 306)
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
  if (m.status === 'lead') assert(!m.plans && !m.countries.length && !m.review?.product)
  if (m.status === 'official') assert(m.sources.length > 0)
  if (m.review) {
    assert(m.sources.length > 0 && !m.plans && !m.countries.length)
    assert.equal(m.review.payments, m.payments.length > 0)
    assert.equal(m.review.regions, m.offeredRegions.length > 0)
    assert.equal(m.review.complete, !!(m.review.website && m.review.product && m.review.payments && m.review.regions))
    assert.equal(m.review.pending.length === 0, m.review.complete)
  }
}
const reviewed = merchants.filter(m => m.review)
assert.equal(reviewed.filter(m => m.review.product).length, 220)
assert.equal(reviewed.filter(m => m.review.complete).length, 213)
assert.equal(reviewed.filter(m => m.nat).length, 21)
const merchant = text => merchants.find(m => m.name.includes(text))
assert(merchant('Vision Cloud').review.complete)
assert.deepEqual(merchant('Vision Cloud').payments, ['支付宝', '微信支付', 'USDT']) // Actual anonymous checkout radio options.
assert.deepEqual(merchant('Vision Cloud').offeredRegions, ['中国香港', '新加坡', '日本 · 东京', '美国 · 洛杉矶', '美国 · 盐湖城', '中国台湾 · 台北']) // Concrete VPS titles; the legacy us-lax-performance slug now means Salt Lake City, not LAX.
assert(!merchant('Vision Cloud').payments.includes('PayPal'))
assert(merchant('AaITR').nat && merchant('雨云').nat && merchant('喵云').nat)
assert.equal(merchant('EDGENAT').nat, false) // A brand name is not a NAT product.
assert.equal(merchant('七牛').nat, false) // NAT Gateway is not NAT VPS.
assert.deepEqual(merchant('TripodCloud').payments, ['PayPal', '支付宝', '微信支付']) // Current VPS payment clauses; the future-dated announcement remains excluded.
assert.deepEqual(merchant('Nolimithost').offeredRegions, ['德国 · 法兰克福', '美国 · 芝加哥', '荷兰 · Eygelshoven']) // Actual VPS product rows, not a registration country picker.
assert(merchant('Flapjacks').nat && merchant('Flapjacks').review.note.includes('IPv4 NAT 出站'))
assert(!merchant('Datapasa').offeredRegions.some(r => /巴西/.test(r))) // Coming soon.
assert(!merchant('Nuyek').payments.includes('USDT')) // A gateway's supported coins do not prove merchant acceptance.
for (const name of ['招财猫', '酷鸭', 'MEGALAYER', 'VPS 促销', 'Zhnet', 'MrVM', 'F4', 'Maple', 'Ocent', 'RedSwitches']) assert(!merchant(name)) // Explicit user removal includes all source layers.
assert.equal(merchants.filter(m => m.status === 'lead').length, 0)
for (const name of ['ASVM', 'Virtualine', 'Servps', 'ServerSpan']) assert(!merchant(name)) // User requested removal; historical evidence stays in the local case.
assert(merchant('Lain.sh').nat && merchant('Lain.sh').review.note.includes('仅 IPv6 入站'))
assert(merchant('Blend Hosting').nat && merchant('Blend Hosting').review.note.includes('3 个自定义端口映射'))
assert(merchant('SynexVM').review.product && merchant('SynexVM').review.note.includes('缺货'))
assert(merchant('RackGenius').aliases.includes('Snakecraft Hosting'))
for (const name of ['Lain.sh', 'FxTransit', 'HKGserver', 'Host4Fun', 'RackGenius', 'SynexVM']) assert.equal(merchant(name).category, 'VPS')
assert(merchant('Suda速达云').nat && merchant('Suda速达云').review.product && merchant('Suda速达云').review.note.includes('20 个预设端口'))
assert(!merchant('PortChannel Zero') && !merchants.some(m => [m.url, ...m.sources].some(u => /(?:^|\.)po0\.(?:io|com)$/.test(new URL(u).hostname)))) // Explicit user removal applies to every published entry.
assert(merchant('MoonVM').payments.includes('USDT') && merchant('MoonVM').payments.includes('支付宝') && !merchant('MoonVM').payments.includes('信用卡 / 借记卡')) // Actual anonymous preview, not footer logos.
assert.deepEqual(merchant('HostPapa').offeredRegions, ['美国 · 西部', '美国 · 东部', '加拿大', '欧洲（配置页未细分国家）']) // VPS selector, not billing country options.
assert(!merchant('Terabit').payments.includes('USDT')) // Bitcoin and Ethereum do not imply every supported coin.
assert.deepEqual(merchant('nerdscave').payments, ['PayPal']) // Original dated purchase review, not conditional payment clauses.
assert.deepEqual(merchant('cloudafra').offeredRegions, ['日本 · 东京', '新加坡']) // Only the two locations in the original dated usage report.
assert.deepEqual(merchant('AaITR').payments, ['支付宝'])
assert.deepEqual(merchant('Voluri').payments, ['支付宝', '加密货币'])
assert(merchant('Datalix').payments.includes('PayPal') && !merchant('Datalix').payments.includes('USDT')) // Explicit Storage KVM payment section, not the gateway's supported coins.
assert(merchant('VPS.Town').review.complete)
assert.deepEqual(merchant('VPS.Town').payments, ['支付宝', '微信支付'])
assert.deepEqual(merchant('VPS.Town').offeredRegions, ['中国香港'])
assert(merchant('SERVER.TW').review.product && merchant('SERVER.TW').offeredRegions.length === 4) // Concrete regional VPS rows.
for (const name of ['Kvmla', 'LaLa Net', 'UQIDC']) assert(merchant(name).payments.includes('USDT'))
assert(!merchant('UQIDC').payments.includes('PayPal') && !merchant('UQIDC').payments.includes('信用卡 / 借记卡')) // Actual preview takes priority over generic footer logos.
assert(merchant('LevelOneServers').review.note.includes('0 Available') && merchant('LevelOneServers').offeredRegions.length === 1)
assert.deepEqual(merchant('Q云').payments, ['支付宝']) // The current public catalog endpoint explicitly enables Alipay; gateway sales alone are insufficient.
assert(merchant('Braw Hosting').nat && merchant('Braw Hosting').review.note.includes('3 个自定义端口转发'))
assert(merchant('Braw Hosting').offeredRegions.includes('马来西亚（住宅 IP 地区）')) // IP region is not independent physical-location verification.
assert(merchant('cloudku').offeredRegions.includes('印度尼西亚') && merchant('cloudku').payments.includes('PayPal') && !merchant('cloudku').payments.includes('信用卡 / 借记卡')) // The official announcement explicitly disables cards.
assert(merchant('EasyHeberg').payments.includes('PayPal') && merchant('EasyHeberg').payments.includes('信用卡 / 借记卡'))
assert.deepEqual(merchant('PP-Networks').offeredRegions, ['欧洲（型号区域，具体国家待核）']) // Do not infer Germany from the legacy product URL slug.
assert(merchant('Sharktech').payments.includes('USDT') && !merchant('Sharktech').payments.includes('支付宝')) // Current Coinbase guide vs archived Alipay news.
assert(merchant('MoonVM').review.product && merchant('MoonVM').review.note.includes('缺货'))
assert(merchant('Phanes').payments.includes('支付宝') && merchant('Phanes').payments.includes('微信支付'))
assert(!merchant('Phanes').payments.includes('USDT') && !merchant('Phanes').offeredRegions.length)
assert(merchant('NMCloud（牛马云）').nat && merchant('NMCloud（牛马云）').review.note.includes('0 可用'))
assert(merchant('POKEVM').review.note.includes('0 可用'))
assert(merchant('雨云').review.note.includes('绑定微信/支付宝'))
assert(!merchant('WAlcore').payments.includes('USDT')) // Generic crypto FAQ.
assert(merchant('Hostinity').sources.includes('https://www.corenix.fr/vps'))
assert.equal(merchant('Contabo').payments.includes('USDT'), false)
assert.equal(merchant('Casbay').payments.includes('USDT'), false) // Generic crypto is insufficient.
assert(merchant('WebHorizon').offeredRegions.includes('马来西亚（新加坡线路）'))
assert(!merchant('WebHorizon').offeredRegions.includes('新加坡'))
assert(merchant('WebHorizon').sources.includes('https://clients.webhorizon.net/?/knowledgebase/article/9/payment-methods-and-paying-with-cryptocurrency/'))
assert(!merchant('WebHorizon').sources.some(url => url.includes('/=')))
assert(merchant('破云').aliases.includes('CNFaster'))
assert(merchant('蛋云').aliases.some(n => n.includes('PIGYUN')))
assert.equal(merchants.filter(m => m.name === 'CNFaster').length, 0)
assert.equal(merchants.find(m => m.id === 'aethertech').nat, true)
assert.equal(meta.countries.length, 195)
assert.equal(new Set(meta.countries.map(c => c.iso2)).size, 195)
assert.equal(new Set(items.filter(i => i.vps.qualified).map(i => i.vps.country)).size, meta.coverage.qualified)
assert.equal(meta.coverage.qualified, 149) // Merchant checks do not grant country-plan qualification.
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

// VPS directory view added to smalllam/nav; upstream notices and GPL retained.
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { websiteList } from 'src/store'
import meta from '../../../data/directory-meta.json'
import merchants from '../../../data/directory-merchants.json'
import visuals from '../../../data/directory-visuals.json'

type BrandAsset = {path: string | null; sourcePage?: string; sourceUrl?: string; kind?: string; theme?: string}

@Component({
  standalone: true,
  selector: 'app-vps-directory',
  imports: [CommonModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss', './merchants.scss'],
})
export default class VpsDirectoryComponent {
  visuals = visuals as {merchants: Record<string, BrandAsset>; resources: Record<string, BrandAsset>; flags: Record<string, string>}
  failedImages = new Set<string>()
  regionCodes: Record<string, string> = Object.fromEntries([...meta.countries.map(c => [c.zh, c.iso2]), ['中国大陆','CN'], ['中国香港','HK'], ['中国澳门','MO'], ['中国台湾','TW'], ['欧洲','EU'], ['欧洲联盟','EU'], ['阿联酋','AE']])
  meta = meta
  merchants: any[] = merchants.map(m => ({ ...m, key: 'merchant:' + m.id, domain: new URL(m.url).hostname }))
  saleRegions = [...new Set(this.merchants.flatMap(m => m.offeredRegions.map((r: string) => this.regionName(r))))].sort((a: any,b: any) => a.localeCompare(b, 'zh-CN'))
  merchantPayments = ['支付宝', 'USDT', 'PayPal', '微信支付', '信用卡 / 借记卡', '银行转账', 'Bitcoin', '加密货币']
  view = 'merchants'
  merchantResults: any[] = []
  merchantType = ''
  merchantRegion = ''
  resources = [
    {id: 'digvps', name: 'DigVPS · 商户测评', url: 'https://digvps.com/review', desc: '按商户浏览测评与收录目录，查看对应测试资料。'},
    {id: 'digvps', name: 'DigVPS · 产品探查', url: 'https://digvps.com/insight', desc: '按配置、支付、IP 属性、线路与延迟查找产品；部分功能需订阅。'},
    {id: 'nodeseek', name: 'NodeSeek', url: 'https://www.nodeseek.com/', desc: 'VPS 社区，浏览测评、商家推广及用户讨论。'},
    {id: 'vpslog', name: 'VPSLOG', url: 'https://t.me/vpslognet', desc: 'Telegram 服务器资讯频道，了解商家与产品活动线索。'},
  ]
  countries = [...meta.countries].sort((a, b) => a.zh.localeCompare(b.zh, 'zh-CN'))
  regions = ['亚洲', '欧洲', '美洲', '非洲', '大洋洲']
  q = ''
  region = ''
  country = ''
  payment = ''
  type = ''
  favoritesOnly = false
  limit = 24
  favorites = new Set<string>()
  items: any[] = []
  results: any[] = []
  constructor() {
    for (const r of websiteList) for (const c of r.nav) for (const group of c.nav) for (const item of group.nav) {
      if (!item['vps']) continue
      const place = meta.countries.find(p => p.iso2 === item['vps'].country)
      const brandName = item.name.startsWith('Uzumaru / Uzuma') ? 'Uzumaru / Uzuma' : item.name.replace(/（.*?）/g, '').trim()
      const brand = this.merchants.find(m => m.name === brandName || m.aliases.includes(brandName))
      this.items.push({ ...item, place, merchantId: brand?.id, key: item['vps'].country + ':' + item.name + ':' + item.url })
    }
    try { this.favorites = new Set(JSON.parse(localStorage.getItem('cecil-vps-favorites') || '[]')) } catch {}
    let favoritesMigrated = false
    for (const m of this.merchants) for (const id of m.aliasIds) if (this.favorites.delete('merchant:' + id)) { this.favorites.add(m.key); favoritesMigrated = true }
    if (favoritesMigrated) try { localStorage.setItem('cecil-vps-favorites', JSON.stringify([...this.favorites])) } catch {}
    const params = new URLSearchParams(location.search)
    this.view = ['merchants','countries','resources'].includes(params.get('view') || '') ? params.get('view')! : (['region','country','type'].some(k => params.has(k)) ? 'countries' : 'merchants')
    this.merchantType = params.get('merchantType') || ''
    this.merchantRegion = params.get('merchantRegion') || ''
    for (const key of ['q', 'region', 'country', 'payment', 'type'] as const) this[key] = params.get(key) || this[key]
    this.filter()
  }
  filter() {
    this.limit = 24
    const q = this.q.toLocaleLowerCase().trim()
    this.merchantResults = this.merchants.filter(m =>
      (!q || [m.name, m.domain, m.desc, ...m.aliases, ...m.offeredRegions].join(' ').toLocaleLowerCase().includes(q)) &&
      (!this.merchantType || (this.merchantType === 'NAT' ? m.nat : m.category === this.merchantType)) &&
      (!this.merchantRegion || m.offeredRegions.some((r: string) => this.regionName(r) === this.merchantRegion)) &&
      (!this.payment || this.matchesPayment(m.payments, this.payment)) &&
      (!this.favoritesOnly || this.favorites.has(m.key)))
    this.results = this.items.filter(i => {
      const v = i.vps
      return (!q || [i.name, i.desc, i.place.zh, i.place.name, ...(i.place.aliases || [])].join(' ').toLocaleLowerCase().includes(q)) &&
        (!this.region || i.place.region === this.region) && (!this.country || v.country === this.country) &&
        (!this.payment || this.matchesPayment(v.payments, this.payment)) &&
        (!this.type || (this.type === 'NAT' ? v.nat : v.kind === this.type)) &&
        (!this.favoritesOnly || this.favorites.has(i.key))
    }).sort((a, b) => a.place.zh.localeCompare(b.place.zh, 'zh-CN') || a.name.localeCompare(b.name))
    const params = new URLSearchParams()
    if (this.view !== 'merchants' || this.payment || this.merchantRegion) params.set('view', this.view)
    if (this.merchantType && this.view !== 'countries') params.set('merchantType', this.merchantType)
    if (this.merchantRegion && this.view !== 'countries') params.set('merchantRegion', this.merchantRegion)
    for (const key of ['q', 'region', 'country', 'payment', 'type'] as const) if (this[key]) params.set(key, this[key])
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''))
  }
  selectRegion(value: string) { this.region = value; this.country = ''; this.filter() }
  switchView(view: string) { this.view = view; this.q = this.region = this.country = this.payment = this.type = this.merchantType = this.merchantRegion = ''; this.filter() }
  showPlans(m: any) { this.switchView('countries'); this.q = m.name; this.filter() }
  reset() { this.q = this.region = this.country = this.payment = this.type = this.merchantType = this.merchantRegion = ''; this.favoritesOnly = false; this.filter() }
  regionName(r: string) { return r.split(' · ')[0].replace(/（.*?）/g, '') }
  matchesPayment(methods: string[], p: string) {
    if (p === '加密货币') return methods.some(x => /加密|USDT|Bitcoin|Ethereum|Monero|Litecoin|TRON|USDC|BNB/i.test(x))
    if (p === '支付宝') return methods.some(x => x.startsWith('支付宝'))
    if (p === '信用卡 / 借记卡') return methods.some(x => /信用卡|借记卡|Visa|Mastercard/i.test(x))
    if (p === '银行转账') return methods.some(x => x.startsWith('银行转账'))
    return methods.includes(p)
  }
  preview(values: string[]) { return values.slice(0, 5).join('、') + (values.length > 5 ? ` 等 ${values.length} 项` : '') }
  previewRegions(values: string[]): string[] { return values.slice(0, 5) }
  toggleFavorite(item: any) {
    this.favorites.has(item.key) ? this.favorites.delete(item.key) : this.favorites.add(item.key)
    try { localStorage.setItem('cecil-vps-favorites', JSON.stringify([...this.favorites])) } catch {}
    if (this.favoritesOnly) this.filter()
  }
  logo(id: string, group: 'merchants' | 'resources' = 'merchants') {
    const path = this.visuals[group][id]?.path
    return path && !this.failedImages.has(path) ? path : null
  }
  logoDark(id: string) { return this.visuals.merchants[id]?.theme === 'dark' && !!this.logo(id) }
  flag(iso: string) { const path = this.visuals.flags[iso]; return path && !this.failedImages.has(path) ? path : null }
  regionFlag(region: string) { return this.flag(this.regionCodes[this.regionName(region)]) }
  imageFailed(path: string) { this.failedImages.add(path) }
  initials(name: string) { return name.replace(/（.*?）|\(.*?\)/g, '').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '').slice(0, 2).toUpperCase() || '·' }
  get providerCount() { return this.merchants.length }
  get resultCountries() { return new Set(this.results.map(i => i.vps.country)).size }
  track(_: number, i: any) { return i.key }
}

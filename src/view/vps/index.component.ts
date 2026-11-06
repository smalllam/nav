// VPS directory view added to smalllam/nav; upstream notices and GPL retained.
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { websiteList } from 'src/store'
import meta from '../../../data/vps-meta.json'
import merchants from '../../../data/merchants.json'

@Component({
  standalone: true,
  selector: 'app-vps-directory',
  imports: [CommonModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss', './merchants.scss'],
})
export default class VpsDirectoryComponent {
  meta = meta
  merchants: any[] = merchants.map(m => ({ ...m, key: 'merchant:' + m.id, domain: new URL(m.url).hostname }))
  saleRegions = [...new Set(this.merchants.flatMap(m => m.offeredRegions.map((r: string) => this.regionName(r))))].sort((a: any,b: any) => a.localeCompare(b, 'zh-CN'))
  merchantPayments = ['支付宝', 'USDT', 'PayPal', '微信支付', '信用卡 / 借记卡', '银行转账', 'Bitcoin', '加密货币']
  view = 'merchants'
  merchantResults: any[] = []
  merchantType = ''
  merchantRegion = ''
  merchantStage = ''
  resources = [
    {name: 'DigVPS · 商户测评', url: 'https://digvps.com/review', desc: '按商户浏览测评与收录目录，查看对应测试资料。'},
    {name: 'DigVPS · 产品探查', url: 'https://digvps.com/insight', desc: '按配置、支付、IP 属性、线路与延迟查找产品；部分功能需订阅。'},
    {name: 'NodeSeek', url: 'https://www.nodeseek.com/', desc: 'VPS 社区，浏览测评、商家推广及用户讨论。'},
    {name: 'VPSLOG', url: 'https://t.me/vpslognet', desc: 'Telegram 服务器资讯频道，了解商家与产品活动线索。'},
  ]
  countries = [...meta.countries].sort((a, b) => a.zh.localeCompare(b.zh, 'zh-CN'))
  regions = ['亚洲', '欧洲', '美洲', '非洲', '大洋洲']
  q = ''
  region = ''
  country = ''
  payment = ''
  type = ''
  status = 'all'
  favoritesOnly = false
  limit = 24
  favorites = new Set<string>()
  items: any[] = []
  results: any[] = []
  constructor() {
    for (const r of websiteList) for (const c of r.nav) for (const group of c.nav) for (const item of group.nav) {
      if (!item['vps']) continue
      const place = meta.countries.find(p => p.iso2 === item['vps'].country)
      this.items.push({ ...item, place, key: item['vps'].country + ':' + item.name + ':' + item.url })
    }
    try { this.favorites = new Set(JSON.parse(localStorage.getItem('cecil-vps-favorites') || '[]')) } catch {}
    let favoritesMigrated = false
    for (const m of this.merchants) for (const id of m.aliasIds) if (this.favorites.delete('merchant:' + id)) { this.favorites.add(m.key); favoritesMigrated = true }
    if (favoritesMigrated) try { localStorage.setItem('cecil-vps-favorites', JSON.stringify([...this.favorites])) } catch {}
    const params = new URLSearchParams(location.search)
    this.view = ['merchants','leads','countries','resources'].includes(params.get('view') || '') ? params.get('view')! : (['region','country','payment','type','status'].some(k => params.has(k)) ? 'countries' : 'merchants')
    this.merchantType = params.get('merchantType') || ''
    this.merchantRegion = params.get('merchantRegion') || ''
    this.merchantStage = params.get('merchantStage') || ''
    for (const key of ['q', 'region', 'country', 'payment', 'type', 'status'] as const) this[key] = params.get(key) || this[key]
    this.filter()
  }
  filter() {
    this.limit = 24
    const q = this.q.toLocaleLowerCase().trim()
    this.merchantResults = this.merchants.filter(m =>
      (this.view === 'leads' ? m.status === 'lead' : m.status !== 'lead') &&
      (!q || [m.name, m.domain, m.desc, ...m.aliases, ...m.offeredRegions, m.review?.note || ''].join(' ').toLocaleLowerCase().includes(q)) &&
      (!this.merchantType || (this.merchantType === 'NAT' ? m.nat : m.category === this.merchantType)) &&
      (!this.merchantRegion || m.offeredRegions.some((r: string) => this.regionName(r) === this.merchantRegion)) &&
      (!this.merchantStage || (this.merchantStage === 'complete' ? m.review?.complete : m.review && !m.review.complete)) &&
      (!this.payment || this.matchesPayment(m.payments, this.payment)) &&
      (!this.favoritesOnly || this.favorites.has(m.key)))
    this.results = this.items.filter(i => {
      const v = i.vps
      return (!q || [i.name, i.desc, i.place.zh, i.place.name, ...(i.place.aliases || [])].join(' ').toLocaleLowerCase().includes(q)) &&
        (!this.region || i.place.region === this.region) && (!this.country || v.country === this.country) &&
        (!this.payment || (v.payment.includes(this.payment) && v.paymentConfirmed)) &&
        (!this.type || (this.type === 'NAT' ? v.nat : v.kind === this.type)) &&
        (this.status === 'all' || (this.status === 'verified' ? v.qualified : !v.qualified)) &&
        (!this.favoritesOnly || this.favorites.has(i.key))
    }).sort((a, b) => Number(b.vps.qualified) - Number(a.vps.qualified) || a.place.zh.localeCompare(b.place.zh, 'zh-CN') || a.name.localeCompare(b.name))
    const params = new URLSearchParams()
    if (this.view !== 'merchants' || this.payment || this.merchantRegion || this.merchantStage) params.set('view', this.view)
    if (this.merchantType && this.view !== 'countries') params.set('merchantType', this.merchantType)
    if (this.merchantRegion && this.view !== 'countries') params.set('merchantRegion', this.merchantRegion)
    if (this.merchantStage && this.view !== 'countries') params.set('merchantStage', this.merchantStage)
    for (const key of ['q', 'region', 'country', 'payment', 'type', 'status'] as const) if (this[key] && !(key === 'status' && this[key] === 'all')) params.set(key, this[key])
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''))
  }
  selectRegion(value: string) { this.region = value; this.country = ''; this.filter() }
  switchView(view: string) { this.view = view; this.q = this.region = this.country = this.payment = this.type = this.merchantType = this.merchantRegion = this.merchantStage = ''; this.status = 'all'; this.filter() }
  showPlans(m: any) { this.switchView('countries'); this.q = m.name; this.filter() }
  reset() { this.q = this.region = this.country = this.payment = this.type = this.merchantType = this.merchantRegion = this.merchantStage = ''; this.status = 'all'; this.favoritesOnly = false; this.filter() }
  regionName(r: string) { return r.split(' · ')[0].replace(/（.*?）/g, '') }
  matchesPayment(methods: string[], p: string) {
    if (p === '加密货币') return methods.some(x => /加密|USDT|Bitcoin|Ethereum|Monero|Litecoin|TRON|USDC|BNB/i.test(x))
    if (p === '支付宝') return methods.some(x => x.startsWith('支付宝'))
    if (p === '信用卡 / 借记卡') return methods.some(x => /信用卡|借记卡|Visa|Mastercard/i.test(x))
    return methods.includes(p)
  }
  preview(values: string[]) { return values.slice(0, 5).join('、') + (values.length > 5 ? ` 等 ${values.length} 项` : '') }
  toggleFavorite(item: any) {
    this.favorites.has(item.key) ? this.favorites.delete(item.key) : this.favorites.add(item.key)
    try { localStorage.setItem('cecil-vps-favorites', JSON.stringify([...this.favorites])) } catch {}
    if (this.favoritesOnly) this.filter()
  }
  flag(iso: string) { return String.fromCodePoint(...[...iso].map(c => 127397 + c.charCodeAt(0))) }
  get providerCount() { return this.merchants.length }
  get reviewedCount() { return this.merchants.filter(m => m.status !== 'lead').length }
  get leadCount() { return this.merchants.filter(m => m.status === 'lead').length }
  get completeCount() { return this.merchants.filter(m => m.review?.complete).length }
  get resultCountries() { return new Set(this.results.map(i => i.vps.country)).size }
  track(_: number, i: any) { return i.key }
}

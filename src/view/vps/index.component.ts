// VPS directory view added to smalllam/nav; upstream notices and GPL retained.
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { websiteList } from 'src/store'
import meta from '../../../data/vps-meta.json'

@Component({
  standalone: true,
  selector: 'app-vps-directory',
  imports: [CommonModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class VpsDirectoryComponent {
  meta = meta
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
    const params = new URLSearchParams(location.search)
    for (const key of ['q', 'region', 'country', 'payment', 'type', 'status'] as const) this[key] = params.get(key) || this[key]
    this.filter()
  }
  filter() {
    this.limit = 24
    const q = this.q.toLocaleLowerCase().trim()
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
    for (const key of ['q', 'region', 'country', 'payment', 'type', 'status'] as const) if (this[key] && !(key === 'status' && this[key] === 'all')) params.set(key, this[key])
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''))
  }
  selectRegion(value: string) { this.region = value; this.country = ''; this.filter() }
  reset() { this.q = this.region = this.country = this.payment = this.type = ''; this.status = 'all'; this.favoritesOnly = false; this.filter() }
  toggleFavorite(item: any) {
    this.favorites.has(item.key) ? this.favorites.delete(item.key) : this.favorites.add(item.key)
    try { localStorage.setItem('cecil-vps-favorites', JSON.stringify([...this.favorites])) } catch {}
    if (this.favoritesOnly) this.filter()
  }
  flag(iso: string) { return String.fromCodePoint(...[...iso].map(c => 127397 + c.charCodeAt(0))) }
  get providerCount() { return new Set(this.items.map(i => i.name)).size }
  get resultCountries() { return new Set(this.results.map(i => i.vps.country)).size }
  track(_: number, i: any) { return i.key }
}

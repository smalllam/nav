# Cecil VPS 导航

基于 smalllam/nav 的 Angular 静态导航站，新增 VPS 专用视图，保留上游代码与许可证。默认桌面和手机首页均为 VPS 目录。

正式访问地址：[nav.iipa.cc](https://nav.iipa.cc/)。Cloudflare Workers 自定义域名已绑定，配置由 `wrangler.jsonc` 的 custom_domain 路由保留。

数据快照：2026-11-06，共 321 条商家记录。本轮逐项检查原来的 237 条待核线索：188 条取得明确 VPS / NAT 产品依据，其中 48 条的官网身份、支付及所列地区资料齐备；140 条产品已核但支付或地区仍有缺项；47 条当前产品待核；2 条迁移旧品牌合并展示。188 条中 15 条有明确 NAT 产品。另有原先 47 家国家资料与 39 家官网产品记录。原有 538 条国家套餐、195 国索引和 149 国公开依据齐备的口径保持。商家收录不等同于实购、实时库存或质量验收。

## 运行与部署

```sh
npm ci
npm run check:vps
npm run build
npm run preview:workers
```

Cloudflare Workers 使用 `wrangler.jsonc`，静态目录 `dist/browser`，开启 SPA 导航回退。可以在已登录的本机运行 `npm run deploy:workers`。Worker 名称为 `cecil-vps-nav`，自定义域名为 `nav.iipa.cc`。

Git 构建部署时选择分支 `feat/cecil-vps-workers`，构建命令 `npm ci && npm run check:vps && npm run build`，部署命令 `npx wrangler deploy`。

## 维护数据

`data/db.json` 为上游三级导航树，层级为大洲 → 国家 → VPS 分类。每个站点保留上游名称、链接、描述，新增 `vps` 字段保存价格原文、支付方式、位置声明、来源、库存与核验状态。`data/vps-meta.json` 是国家索引和核验快照；不自动爬取商家或检测生产节点。

从既有研究案卷重新导入时运行 `node scripts/import-vps.mjs <全球国家覆盖核验.json绝对路径>`，再运行审核与构建。导入器仅复制允许公开的展示字段，不发布原始案卷、询证草稿、凭据或诊断日志。人工编辑 VPS 扩展字段后同步核验覆盖统计；上游 `/system` 管理页可继续编辑基础导航字段，扩展字段在 JSON 中维护。

筛选支持大洲、国家、中英文关键词、支付宝 / USDT、当地部署声明 / GeoIP / NAT、核验状态；筛选条件保存在 URL。收藏仅保存在当前浏览器，无账户或跨设备同步。

商家索引由 `scripts/build-merchants.mjs` 生成到 `data/merchants.json`：国家树生成已有商家，`data/merchants-extra.json` 保存新增官网核验及人工线索，`data/merchant-discovery.json` 保存 DigVPS 公开目录中的名称、入口和来源。`data/merchant-verification.json` 保存本轮 237 条原始线索的逐项人工复核结果、日期、事实来源与迁移合并关系；该文件是后续维护入口，生成器不从关键词自动推断支付、地区或 NAT。导入时去除推广参数，仅收录事实字段，不搬运测评正文、评分、评论或私人频道内容。缺项逐字段待核，商家的 `offeredRegions` 与国家套餐资格分开，不参与国家覆盖统计。每次修改基础资料后运行 `npm run check:vps` 重新生成并审计。

商家视图支持已核售卖地区、支付、NAT 与本轮资料齐备度筛选，条件可通过 URL 分享。所列支付与地区为本轮确认的部分选项，并非穷举；付款币种、账单地区、资格与产品库存可能限制实际选择。通用 Crypto、支付网关名称或稳定币不自动记为 USDT；NAT Gateway、IPv6-only 或名称含 NAT 均不足以证明 NAT VPS。登录、浏览器验证、证书错误、维护页面和动态库存无法读取时保留待核说明。

官网公告确认的品牌迁移：艾云 / CNFaster 合并为破云 BreaCloud，PIGYun 迁至蛋云 Danyun；旧记录 ID 与名称作为别名保留检索和收藏兼容。AaIT 更新为 AaITR。WebHorizon 的 Singapore 产品按官方文档标作马来西亚柔佛、新加坡路由，避免将出口地当成物理机房。

测评与社区入口包含 DigVPS 测评、DigVPS 探查、NodeSeek 和 VPSLOG；部分外部功能需要订阅。站点不自动爬取或定时检测这些商家。

构建中修正了上游 SEO 模板替换对 `$19` 等金额的误解析，并对 SEO 文本转义，避免将目录描述作为 HTML 执行。

## 项目选择

`smalllam/nav` 已有三级分类、搜索、主题和管理页面，可直接静态构建部署。`smalllam/fre123-nav` 使用 Nuxt，亦可通过静态生成放到 Workers，但基础数据更偏展示卡片，针对本目录需要补充的维护功能更多。本实现选择前者，并保留其 GPL-3.0 许可证及原作者声明。许可证文本见 `LICENSE`。

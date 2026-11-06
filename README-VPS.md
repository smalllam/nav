# Cecil VPS 导航

基于 smalllam/nav 的 Angular 静态导航站，新增 VPS 专用视图，保留上游代码与许可证。默认桌面和手机首页均为 VPS 目录。

正式访问地址：[nav.iipa.cc](https://nav.iipa.cc/)。Cloudflare Workers 自定义域名已绑定，配置由 `wrangler.jsonc` 的 custom_domain 路由保留。

数据快照：2026-11-06，共 321 条商家记录。原 237 条待核线索中：219 条取得明确 VPS / NAT 产品依据，其中 154 条的官网身份、支付及所列地区资料齐备；65 条产品已核但支付或地区仍有缺项；16 条当前产品待核；2 条迁移旧品牌合并展示。219 条中 20 条有明确 NAT 产品。另有原先 47 家国家资料与 39 家官网产品记录。原有 538 条国家套餐、195 国索引和 149 国公开依据齐备的口径保持。商家收录不等同于实购、实时库存或质量验收。

第二轮针对 140 条资料缺项和 47 条产品待核继续检查，82 家取得新字段：新增 20 家产品、62 家支付、37 家地区确认，新增 59 家资料齐备。每条保留官方来源和分项状态。Flapjacks 部分 LXC 为 IPv6 入站、IPv4 NAT 出站，不承诺映射端口；MoonVM 台湾及部分香港套餐读取时缺货；DataPasa 的巴西节点标注 Coming soon，未计为当前地区。雨云国际卡通过绑定微信/支付宝扫码，云闪付需人工入账。仅找到独服、托管管理或开发预览页的记录继续保留待核。

第三轮针对 101 条资料缺项和 27 条产品待核逐家公开检索，30 家取得新字段：新增 6 家产品、16 家支付、17 家地区确认，新增 22 家资料齐备。Lain.sh 东京 NAT 仅支持 IPv6 入站、共享 IPv4；Blend Hosting 的 ISP Linux 套餐提供 3 个映射端口；SynexVM 香港 VDS 读取时缺货。Snakecraft Hosting 原入口现转向 RackGenius，保留旧名称检索。官网停用、证书异常、浏览器验证、登录入口或仅独服/教程的记录继续保留待核。

第四轮针对 85 条资料缺项和 21 条产品待核逐家继续检索，21 家取得新字段：新增 4 家产品、13 家支付、8 家地区确认，新增 15 家资料齐备。JuHost、iHostART、PortChannel Zero 新商店和速达云 NAT 已取得具体产品依据。速达云日本 NAT 为动态共享 IPv4、20 个端口、每日 04:00 换 IP，存在使用及退款限制；FlowVPS 和 MoonVM 的支付来自匿名公开结算预览，未填个人资料、接受条款或提交订单。HostPapa 和 SparkedHost 的地区读取 VPS 专门的配置选项。仅有隐私政策中的泛泛支付信息、网关名称或账单地址国家列表时，仍保留相应缺项。

第五轮针对 74 条资料缺项和 17 条产品待核逐家继续检索，12 家取得新字段：新增 1 家产品、7 家支付、5 家地区确认，新增 9 家资料齐备。SERVER.TW 官方目录取得台湾、香港、新加坡与美国的具体 VPS 套餐；UQIDC 地区读取具体商品，支付读取匿名结算预览，临时购物车已清空。Kvmla 的支付宝 / USDT、LaLa Net 的历史 USDT 公告及 DDPS 等官方付款条款均附来源与适用限制。Blend 的美国地点为通用 VPS 指南声明，LevelOneServers 达拉斯仅对应读取到的 12TB 型号且缺货，不推广到全部 NAT 或 VPS 型号。产品入口停用、证书异常、仅独服、教程或登录页的 16 家继续保留待核。

第六轮复查 66 条资料缺项和 16 条产品待核，4 家取得新字段：EasyHeberg 匿名结算预览补入 PayPal 与银行卡，Cloudku 补入印度尼西亚，PP-Networks 补入 KVM-EUROPE 型号的欧洲区域声明，Braw Hosting 补入马来西亚住宅 IP 地区及 3 个端口转发的 NAT 依据。住宅 IP / 网络区域不独立证明物理机房国家；未用账单地址国家列表补地区。LevelOneServers 另取得当前 KVM-2GB 达拉斯配置选项，12TB 存储款缺货不概括全部产品。临时购物车已清空，未填个人资料、接受条款或提交订单；16 家产品仍未取得新的当前商品依据。

## 运行与部署

第七轮复查剩余 65 条资料缺项与 16 条产品待核入口。Phanes 当前 1GB 云服务器的匿名结算预览补入银行卡、加密货币、微信支付、支付宝及 iDEAL；通用加密货币不推定为 USDT，地区仍待核。NMCloud 台湾 HINET NAT2、POKEVM 香港及 Reprise 的对应分类读取时缺货，保留产品依据并注明范围。Airnode 配置要求 root 密码，未填写凭据或继续。当前仍有 65 条资料缺项、16 条产品待核；没有通过猜测缩减待核数。

商家卡片与国家套餐复用本地品牌图标，现取得 279 / 321 家商家的官网图标或官网链接的官方频道头像，另有 42 家暂用名称缩写。3 个社区品牌图标覆盖 DigVPS 测评 / 探查、NodeSeek、VPSLOG 4 个入口。国家与售卖地区使用本地 SVG，覆盖原 195 国索引，并补充港澳与欧盟图标；宽泛区域不强行配某个国家。图像加载失败自动显示名称缩写或 ISO 代码。

`data/visual-assets.json` 记录各品牌图标的公开来源、用途及 SHA-256；图像只作品牌识别，商标权归各权利人。国旗素材取自 [flag-icons 7.5.0](https://github.com/lipis/flag-icons)，采用 MIT 许可证，完整授权保留在 `public/assets/flags/LICENSE`。页面从本地静态文件加载，使用显式尺寸和懒加载；补充图标不改变商家资料、库存或国家套餐资格。

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

# Cecil VPS 导航

访问 [nav.iipa.cc](https://nav.iipa.cc/)。

浏览全球 VPS、云平台和 NAT 服务商，按地区、产品类型与支付方式筛选，收藏常用商家，或从国家目录进入具体套餐。测评与社区栏目提供独立资讯入口。

站点使用 Cecil 客户端品牌图，覆盖站头、浏览器图标与移动设备收藏图标。当前目录含 310 家商家、538 个套餐入口和 195 个国家索引。

## 本地运行

```sh
npm install
npm run check:vps
npm run build
npm run preview:workers
```

Cloudflare Workers 项目为 `cecil-vps-nav`，自定义域名由 `wrangler.jsonc` 配置。推送 `feat/cecil-vps-workers` 分支后由现有 Cloudflare 构建流程发布。

## 数据维护

- `data/merchants-extra.json`、`data/merchant-discovery.json` 和 `data/merchant-verification.json` 为商家维护数据。
- `data/db.json` 为国家套餐维护数据。
- `data/visual-assets.json` 记录商家、社区与地区图标。
- `scripts/build-merchants.mjs` 汇总商家目录；`scripts/build-directory.mjs` 生成访客界面使用的 `data/directory-*.json`。
- `scripts/verify-directory.mjs` 检查目录目的地址、支付与地区映射，并验证对外字段范围。

修改维护数据后运行检查与构建。图片放在 `public/assets`，Cecil 品牌图位于 `public/assets/branding/cecil-logo.png`。

## 开源

基于 [smalllam/nav](https://github.com/smalllam/nav) 的 Angular 导航项目，保留上游代码声明与许可证。授权范围见仓库 `LICENSE`。

# Cecil VPS 导航

基于 smalllam/nav 的 Angular 静态导航站，新增 VPS 专用视图，保留上游代码与许可证。默认桌面和手机首页均为 VPS 目录。

数据快照：2026-11-06，48 家商家、538 条国家套餐、195 国索引；149 国有公开地点声明、支付宝或 USDT 依据及采购入口齐备的条目。公开信息核验不等同于实购、库存或质量验收。

## 运行与部署

```sh
npm ci
npm run check:vps
npm run build
npm run preview:workers
```

Cloudflare Workers 使用 `wrangler.jsonc`，静态目录 `dist/browser`，开启 SPA 导航回退。可以在 Cloudflare 控制台上传此目录，或在已登录的本机运行 `npm run deploy:workers`。Worker 名称为 `cecil-vps-nav`，不会修改其他 Worker、DNS 或现有节点。

Git 构建部署时选择分支 `feat/cecil-vps-workers`，构建命令 `npm ci && npm run check:vps && npm run build`，部署命令 `npx wrangler deploy`。

## 维护数据

`data/db.json` 为上游三级导航树，层级为大洲 → 国家 → VPS 分类。每个站点保留上游名称、链接、描述，新增 `vps` 字段保存价格原文、支付方式、位置声明、来源、库存与核验状态。`data/vps-meta.json` 是国家索引和核验快照；不自动爬取商家或检测生产节点。

从既有研究案卷重新导入时运行 `node scripts/import-vps.mjs <全球国家覆盖核验.json绝对路径>`，再运行审核与构建。导入器仅复制允许公开的展示字段，不发布原始案卷、询证草稿、凭据或诊断日志。人工编辑 VPS 扩展字段后同步核验覆盖统计；上游 `/system` 管理页可继续编辑基础导航字段，扩展字段在 JSON 中维护。

筛选支持大洲、国家、中英文关键词、支付宝 / USDT、当地部署声明 / GeoIP / NAT、核验状态；筛选条件保存在 URL。收藏仅保存在当前浏览器，无账户或跨设备同步。

构建中修正了上游 SEO 模板替换对 `$19` 等金额的误解析，并对 SEO 文本转义，避免将目录描述作为 HTML 执行。

## 项目选择

`smalllam/nav` 已有三级分类、搜索、主题和管理页面，可直接静态构建部署。`smalllam/fre123-nav` 使用 Nuxt，亦可通过静态生成放到 Workers，但基础数据更偏展示卡片，针对本目录需要补充的维护功能更多。本实现选择前者，并保留其 GPL-3.0 许可证及原作者声明。许可证文本见 `LICENSE`。

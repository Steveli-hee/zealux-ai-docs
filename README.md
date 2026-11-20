# 项目文档 Wiki

本仓库是静态文档站，包含两部分内容：

| 目录 | 内容 | 说明 |
|---|---|---|
| `source/` | 76 篇原始 Markdown 文档 | **文档源文件**，直接在 GitHub 上点开即可阅读（GitHub 会自动渲染 md）；以后更新内容改这里 |
| `p/` + `assets/` + `index.html` | 构建生成的 HTML 静态站点 | 供 GitHub Pages 部署，浏览器访问的是这些页面，**不要手动编辑** |

## 在线访问

GitHub Pages 开启后访问：<https://steveli-hee.github.io/zealux-ai-docs/>

## 本地重新构建（内容更新后）

在工作区 `docs-site/` 下执行：

```bash
node build.mjs     # 从源目录重新生成站点
node deploy.mjs    # 构建 + 推送到 GitHub（Pages 会自动更新）
```

构建脚本源目录：`C:\file\.qoder\repowiki\zh\content`

## 功能

侧边栏章节导航 · 全站搜索（Ctrl+K）· 497 张 Mermaid 图表 · 代码高亮 · 深色模式 · 移动端适配

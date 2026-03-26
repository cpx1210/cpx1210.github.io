# cpx1210 // CTF Notebook

一个基于 Astro 的个人 CTF 博客与知识库站点，内容以 Markdown / MDX 为中心，适合长期积累 writeup、学习笔记、工具记录和比赛复盘。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 内容目录

- `src/content/notes/`: 学习笔记、工具记录、踩坑总结
- `src/content/contests/`: 比赛复盘、单题 writeup

## 新增一篇笔记

直接创建一个 `.md` 或 `.mdx` 文件到 `src/content/notes/`：

```md
---
title: Example Note
description: 一句话描述这篇文章。
pubDate: 2026-03-26
updatedDate: 2026-03-26
tags:
  - web
  - ssti
category: web
draft: false
cover:
series:
difficulty: medium
featured: false
---

# 标题

正文内容。
```

## 新增一篇比赛文章

直接创建一个 `.md` 或 `.mdx` 文件到 `src/content/contests/`：

```md
---
title: Example Contest Review
description: 赛事复盘简介。
pubDate: 2026-03-26
updatedDate: 2026-03-26
tags:
  - ctf
  - web
category: contest
draft: false
series:
contestName: ExampleCTF 2026
contestDate: 2026-03-25
teamName: solo
rank: "10 / 500"
challengeType: web
eventSlug: examplectf-2026
difficulty: medium
featured: true
---

# 比赛信息

正文内容。
```

## 部署

仓库推送到 `main` 后，GitHub Actions 会自动构建并部署到 GitHub Pages。

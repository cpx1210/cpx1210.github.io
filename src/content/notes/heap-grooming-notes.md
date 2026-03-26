---
title: Heap Grooming Notes
description: 一个长期维护的 pwn 学习笔记模板，用于记录 glibc、堆布局和调试时的稳定结论。
pubDate: 2026-03-20
updatedDate: 2026-03-25
tags:
  - pwn
  - heap
  - glibc
category: pwn
draft: false
series: pwn-lab
difficulty: medium
featured: true
---

# 为什么单独做这篇记录

很多堆题在赛中是“会做过一次”，但隔几周就忘掉了触发条件和调试顺序。把这类内容沉淀成长期笔记，比只保留一次性 writeup 更有价值。

## 适合长期记录的内容

- 版本差异，例如 `glibc 2.31` 和 `glibc 2.35` 的常见行为变化。
- 稳定调试步骤，例如先看 chunk 边界、再看 bins、最后看利用原语。
- 常用断点、pwndbg 命令、脚本模板。

## 建议正文结构

1. 题型识别
2. 关键保护
3. 原语来源
4. 利用链推导
5. 调试日志
6. 复盘结论

## 命令片段

```bash
checksec ./chall
pwndbg> bins
pwndbg> heap
```

## 后续扩展

你可以直接把新的 `.md` 或 `.mdx` 文件放进 `src/content/notes/`，推送后 GitHub Actions 会自动构建并上线。

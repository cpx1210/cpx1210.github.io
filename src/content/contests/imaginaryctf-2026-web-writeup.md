---
title: ImaginaryCTF 2026 Web Writeup
description: 以单题 writeup 的形式记录模板注入题的分析路径、payload 尝试与赛后总结。
pubDate: 2026-03-23
updatedDate: 2026-03-25
tags:
  - ctf
  - web
  - ssti
category: writeup
draft: false
series: ictf-2026
contestName: ImaginaryCTF 2026
contestDate: 2026-03-15
teamName: solo
rank: "42 / 1200"
challengeType: web
eventSlug: imaginaryctf-2026
difficulty: medium
featured: false
---

# 题目概览

这是一道典型的模板注入题。赛中第一步不是写 payload，而是先确认：

- 渲染引擎是什么
- 模板表达式是否真的执行
- 错误回显有没有被吃掉

## 分析顺序

1. 先找最短探针，例如 `{{7*7}}`
2. 再判断过滤点是在输入前、渲染前还是输出前
3. 最后再决定走对象链、沙箱逃逸还是文件读取

## 踩坑记录

赛中一度把问题误判成纯 XSS，导致测试方向偏了十几分钟。这个结论值得留在长期知识库里，因为误判路径往往比 payload 本身更能帮助以后提速。

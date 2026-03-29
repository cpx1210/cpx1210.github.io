---
title: 微信小程序逆向入门：本地包定位、解包与开发者工具查看
description: 记录一次微信小程序逆向入门流程，包括本地缓存包定位、使用 WeDeCode 解包反编译，以及导入微信开发者工具继续分析。
pubDate: 2026-03-29
updatedDate: 2026-03-29
tags:
  - wechat
  - miniapp
  - reverse
  - wedecode
  - unpack
category: reverse
draft: false
series: 小程序逆向练手记
difficulty: easy
featured: false
---
# 微信小程序逆向入门：本地包定位、解包与开发者工具查看

这篇笔记主要记录一次比较基础的微信小程序逆向流程，目标是先找到本地缓存包，再完成解包和反编译，最后导入微信开发者工具继续分析业务逻辑。

## 一、寻找微信小程序本地位置

微信小程序的本地缓存目录默认位于：

```text
C:\Users\用户名\AppData\Roaming\Tencent\xwechat\radium\users\2edb2375e73333b6dddba496f0a90a20\applet\packages
```

实际操作时，把路径里的“用户名”替换成自己电脑当前登录用户的用户名即可。

进入该目录后，可以结合文件夹的最近修改时间，判断哪个目录对应当前正在分析的小程序。

## 二、解包并反编译小程序

这里使用 `WeDeCode` 对小程序进行解包和反编译。

![image-20260329153612474](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202603291536540.png)

工具既可以自动扫描，也可以手动选择目录。

如果手动选择，通常需要定位到小程序的 `appid` 目录这一层，例如：

```text
wx0eb9b2ad77321adb
```

选中这一层目录后执行解包和反编译，得到后续可供查看的源码结构。

## 三、使用微信开发者工具继续分析

解包完成后，可以打开微信开发者工具加载反编译后的内容，继续查看页面、接口与业务逻辑。

![image-20260329154403494](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202603291544563.png)

到这里，基础准备工作就完成了，后续就可以针对具体页面逻辑、接口请求或加密实现做进一步分析。

---
title: 某 App 360脱壳、抓包、DES算法复现与协议伪造实战
description: 一篇安卓逆向学习记录，覆盖 360 脱壳、抓包分析、DES 加密复现以及网络协议伪造请求。
pubDate: 2025-12-20
updatedDate: 2026-03-26
tags:
  - android
  - reverse
  - des
  - protocol
  - unpack
  - frida
  - jadx
category: reverse
draft: false
series: 安卓逆向练手记
difficulty: medium
featured: false
---
# 安卓逆向实战：某 App 360脱壳、加密协议还原与请求伪造全记录（学习记录贴）

## 前言

“这是我第一篇关于 App 逆向的学习笔记，属于是一篇新手学习记录帖，文中可能存在术语使用不当或逻辑描述不够精炼的地方，还请各位前辈多多指正。

本篇主要记录了我对某 App 发包协议的分析过程，从抓包数据分析、加密逻辑定位到最后的 Python 代码复现。

## 一、抓包

打开小黄鸟（Reqable），启动app

![image-20251219200554159](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192005529.png)

输入11位手机号码，点击发送验证码，查看小黄鸟的抓包结果

![image-20251219200754669](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192007871.png)

发现数据包里有一个Encrypt参数，这就是我们本次复现的目标

## 二、脱壳

我这里选择用ApkCheckPack来查壳

结果为：

```
===================== 加固特征扫描结果 =====================
[加固特征]
    Sopath  360加固 -> assets/libjiagu.so
    Soname  360加固 -> assets/libjiagu.so
    Soname  360加固 -> assets/libjiagu.so
    Soname  360加固 -> assets/libjiagu_a64.so
    Soname  360加固 -> assets/libjiagu_x64.so
    Soname  360加固 -> assets/libjiagu_x86.so
    Other  360加固 -> assets/.appkey
   Soregex  360加固 -> assets/libjiagu_a64.so
   Soregex  360加固 -> assets/libjiagu_x64.so
   Soregex  360加固 -> assets/libjiagu_x86.so
    Soname  阿里聚安全 -> lib/armeabi/libsgmain.so
    Soname  阿里聚安全 -> lib/armeabi/libsgsecuritybody.so
    Soname  阿里加固 -> lib/armeabi/libsgmain.so
    Soname  阿里加固 -> lib/armeabi/libsgsecuritybody.so

===================== 安全检测特征扫描结果 =====================

===================== 第三方SDK特征扫描结果 =====================

[360]
    360 加固 -> assets/libjiagu.so
    360 加固 -> assets/libjiagu_a64.so
    360 加固 -> assets/libjiagu_x64.so
    360 加固 -> assets/libjiagu_x86.so

[Alibaba]
    阿里聚安全 -> lib/armeabi/libsgmain.so
    阿里聚安全 -> lib/armeabi/libsgnocaptcha.so
    阿里聚安全 -> lib/armeabi/libsgsecuritybody.so
```

结果说明我们这个app真正的壳是360加固的，其它的壳只是第三方SDK中的壳

这里我们使用frida-dexdump脱壳，可以看到脱壳结果为一堆dex文件

![image-20251219201354665](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192013733.png)

把整个文件夹丢进Jadx，得到结果：

![image-20251219201457653](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192014733.png)

## 三、算法复现

我们要先找到生成Encrypt参数的地方，按惯例先来搜索大法

![image-20251219201722799](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192017884.png)

可以发现在com.dodnew.online.http类下有多个出现Encrypt的地方，这也是构造http请求的地方，点进去查看一下，发现一个关键函数addRequestMap
![image-20251219202153940](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192021997.png)

```
String strEncodeDesMap = RequestUtil.encodeDesMap(RequestUtil.paraMap(map, Config.BASE_APPEND, "sign"), this.desKey, this.desIV);
```

这个方法中有一个关键语句是strEncodeDesMap，应该是在拼接字符串，分析一下

·参数1：RequestUtil.paraMap(map, Config.BASE_APPEND, "sign")

·参数2：this.desKey

·参数3：this.desIV

我们通过hook encodeDesMap搞清楚这三个参数都是什么，写出hook脚本：

```
Java.perform(function(){
    var RU=Java.use("com.dodonew.online.http.RequestUtil");
    RU.encodeDesMap.overload('java.lang.String', 'java.lang.String', 'java.lang.String').implementation = function(a,b,c){
        console.log("RequestUtil.paraMap(map, Config.BASE_APPEND, sign) = " + a);
        console.log("this.desKey = " + b);
        console.log("this.desIV" + c);
        var r = this.encodeDesMap(a,b,c);
        return r;
    }
})
```

得到结果为

```
RequestUtil.paraMap(map, Config.BASE_APPEND, “sign”) = {"phone":"11111111111","sign":"DE8E45BF23365EB43FCD2A21BFD8FA6C","timeStamp":"1766147735492"}

this.desKey = 65102933

this.desIV = 32028092
```

·通过hook结果，我们可以发现其中的deskey、desIV、BASE_APPEND都是硬编码

·RequestUtil.paraMap(map, Config.BASE_APPEND, "sign") 的结果是由手机号，一个动态的sign，以及时间戳构成的

现在我们的目标比较明确了，就是找到sign的生成逻辑，先看看paraMap方法

![image-20251219204507151](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192045246.png)

hook一下看看参数，写出hook脚本

```
    RU.paraMap.overload('java.util.Map', 'java.lang.String', 'java.lang.String').implementation = function(d,e,f){
        var HashMap = Java.use("java.util.HashMap");
        console.log("map = " + Java.cast(d, HashMap).toString());
        console.log("str = " + e);
        console.log("str2 = " + f);
        var rr = this.paraMap(d,e,f);
        return rr;
    }
```

结果为：

```
map = {timeStamp=1766151217885, phone=11111111111}
str = sdlkjsdljf0j2fsjk
str2 = sign
```

可以发现手机号和时间戳已经被加入map里了，那么这里就是生成sign并放入map的地方，再次看paraMap函数，发现里面有一行：

```
map.put(str2, Utils.md5(sb.toString()).toUpperCase());
```

说明这里使用了md5的加密方式，点进去看发现是标准md5，总结一下流程

sign 生成全过程复现：

输入数据为：

· map: {"timeStamp": "1766151217885", "phone": "11111111111"}

· str (Salt): "sdlkjsdljf0j2fsjk"

· str2 (Key Name): "sign"

### **第一步：格式化并放入 List**

代码逻辑：遍历 Map，拼接成 key=value 格式放入 arrayList。

phone=11111111111

timeStamp=1766151217885

### **第二步：字典排序 (ASCII Sort)**

代码逻辑：Collections.sort(arrayList);
按首字母排序：

phone=11111111111 (p 开头)

timeStamp=1766151217885 (t 开头)
（这时候phone会与timeStamp交换位置）

### **第三步：拼接字符串 (最关键的一步)**

```
for (int i = 0; i < arrayList.size(); i++) {
    sb.append((String) arrayList.get(i)); // 放入键值对
    sb.append(C1792a.f1657b);             // 放入连接符 "&"
}
sb.append("key=" + str);                  // 放入盐值
```

**拼接过程：**

加入第1个：phone=11111111111 + &

加入第2个：timeStamp=1766151217885 + &

加入盐值：key=sdlkjsdljf0j2fsjk

**最终待加密字符串 (sb.toString())：**

```
phone=11111111111&timeStamp=1766151217885&key=sdlkjsdljf0j2fsjk
```

### **第四步：MD5 加密并转大写**

代码逻辑：Utils.md5(sb.toString()).toUpperCase()

phone=11111111111&timeStamp=1766151217885&key=sdlkjsdljf0j2fsjk

MD5 (32位小写)：2dbf5ffa76fef475d202d84827ee6a90

转大写：2DBF5FFA76FEF475D202D84827EE6A90

对比一下我们之前hook得到的sign的值，发现完全一致，我们成功得到了动态sign的计算方法

现在我们回到这个语句

```
RequestUtil.encodeDesMap(RequestUtil.paraMap(map, Config.BASE_APPEND, "sign"), this.desKey, this.desIV);
```

来看看它最外层的函数encodeDesMap是什么逻辑

![image-20251219222038229](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512192220441.png)

发现里面调用了DesSecurity和encrypt64方法，分别点进去看，具体的功能为：

把我们得到的包含phone的json字符串转字节，进行标准DES加密，再进行base64编码

需要注意的点就是deskey我们看到的那个硬编码字符串，而是它MD5后的前8位

有了这些信息，我们可以得到最终的算法复现脚本

```
import time
import hashlib
from Crypto.Cipher import DES
from Crypto.Util.Padding import pad
import base64
import json

#初始化参数
phone = "11111111111"
timestamp = str(int(time.time() * 1000))
key = "sdlkjsdljf0j2fsjk"
deskey = "65102933"
desIV = "32028092"


def cal_sign(phone,timestamp,key):
    str = "phone=" + phone + "&" + "timeStamp=" + timestamp + "&" + "key=" + key
    print(str)
    md5_object = hashlib.md5()
    md5_object.update(str.encode())
    sign = md5_object.hexdigest().upper()
    return sign

sign = cal_sign(phone, timestamp, key)
payload_dict= {
    "phone": phone,
    "sign": sign,
    # "sign":"",
    "timeStamp": timestamp
    # "timeStamp":"",
}
json_payload = json.dumps(payload_dict, separators=(',', ':'))
# 对deskey与desiv进行处理
key_hash = hashlib.md5(deskey.encode()).digest()
real_key = key_hash[:8]
real_iv = desIV.encode()[:8]

# 填充与加密
cipher = DES.new(real_key, DES.MODE_CBC, real_iv)
padded_data = pad(json_payload.encode(), DES.block_size)

#执行加密
encrypted_bytes = cipher.encrypt(padded_data)

# base64编码
final_result = base64.b64encode(encrypted_bytes).decode()

print(f"最终结果 (Encrypt): \n{final_result}")

```

来测试一下我们写的对不对，打开抓包软件，hook paraMap方法打印三个参数，然后把这三个参数放进脚本里进行加密计算，看看与抓包得到的密文是否一致

![image-20251220001446510](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512200014611.png)

计算一下

![image-20251220001545172](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512200015304.png)

与抓包结果对比

![image-20251220001636849](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512200016080.png)

完全一致！我们已经得到了这个密文的生成方式了

## 五、协议复现

我们可以用python的request库来伪造请求，用time库来获取时间戳，脚本运行结果如下图

![image-20251220003032883](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512200030960.png)

发现返回的也是加密后的数据，写一个解密脚本：先base64解码再DES解密再去填充即可

解析结果为：

![image-20251220003513070](https://cpx3124004200.oss-cn-guangzhou.aliyuncs.com/test/202512200035142.png)

以上就是我作为逆向小白的第一篇实战笔记。由于是初次尝试记录，文中的思路和表述难免会有不成熟的地方，甚至可能存在一些逻辑上谬误，还请各位圈内的大佬们多多包容，不吝赐教。

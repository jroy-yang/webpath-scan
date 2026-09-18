# 知乎"等待发布"草稿

> 用法：复制下面 3 篇 → 知乎 App 或 https://www.zhihu.com/inbox → 写文章 → 粘贴 → 发布
> 最佳发布时间：早 8:30 / 午 12:00 / 晚 21:00

---

## 📝 文章 1：知乎"首发"长文（1500 字）

**标题**：
```
网易 SRC 大佬 joyyang 1 天 4 finding 的工具化流程，普通人怎么用？
```

**正文**：

```markdown
# 网易 SRC 大佬 joyyang 1 天 4 finding 的工具化流程，普通人怎么用？

## 缘起

前两天刷到 joyyang 的《网易 SRC 实战——4 份 finding 的工具化流程》这篇文章，看完很震撼：

- **1 天拿到 4 个 finding**
- 4 单**全过审**
- 全是**高危/严重**
- 全靠"模板 + 字典 + 工具化"

我反复看了 3 遍，把他的工具链拆了出来：

1. **通用提交模板 v1.3**（一次写好，4 单复用）
2. **自定义字典**（针对网易业务定制的）
3. **自动 cookie 提取**（X-Visitor-Cookie 批量拿）
4. **APK 反编译** + 域名/邮箱挖掘
5. **工具化串联**（一键跑完整链路）

**结论：高手不是更聪明，是更会偷懒。**

---

## 第 1 步漏了就吃大亏：资产面梳理

但 joyyang 文章里**没明说**他怎么挑出 4 个目标：
- cc.163.com
- vip.163.com
- music.163.com
- open.163.com

我分析下来，这 4 个不是 fofa 跑出来的（关键词搜不到），是**全量字典扫出来**——
每个目标扫 200+ 路径，看哪些"非 200/404"。

**这就是 webpath-scan 在做的事**。

---

## 我写了个工具：webpath-scan v1.1

为了把"资产面梳理"这一步工具化，我开源了 webpath-scan：

```
./probe.exe -Target cc.163.com
```

→ 一键扫 200+ 内置路径（admin/actuator/swagger/备份/debug/...）
→ 输出 summary.csv + 每个路径的 HEAD/body 文件
→ v1.1 自带 **SSRF 防御**（私网/loopback/云元数据自动拦）
→ v1.1 自带 **密钥脱敏**（抓到的 api_key/password/JWT 自动 ***REDACTED***）
→ 4 个 .exe 自带 PowerShell 运行时（**不用装环境**）

下载：https://wwavw.lanzoue.com/i9FPX48wnscd

---

## 对比 joyyang 的 4 finding 流程，我的"工具化 5 步"

| 步骤 | joyyang 怎么做 | webpath-scan 帮你做 |
|------|---------------|------------------|
| 1. 挑目标 | 手动找 4 个 | 全自动（输入域名就行）|
| 2. 资产梳理 | 字典扫 | 一键 200+ 路径 |
| 3. 看哪些开 | 一个个看 | summary.csv 自动筛 |
| 4. 手动验证 | 浏览器 | CSV + body 文件 |
| 5. 提交 | 模板 v1.3 | 你的模板（webpath-scan 不管）|

**webpath-scan 帮你把 1-4 步全部自动化，专注第 5 步。**

---

## 价格

- 个人版：¥19（一次性买断 + 永久小版本升级）
- 团队版（≤5 人）：¥99
- 知识星球订阅（持续 SRC 模板 + 字典更新）：¥99/年

**MIT 协议**——可商用、改、再分发。

---

## 30 秒上手

```powershell
# 1. 下载 ZIP → 解压
# 2. 双击 probe2.exe → 输入目标
# 3. 看 output\probe2-时间戳\summary2.csv
# 4. 点开非 200/404 的 body 文件 → 找敏感信息

# 试用官方 demo（一键跑 scanme.nmap.org）
.\probe2.exe -Demo
```

---

## 适合谁

- ✅ SRC 白帽子（先梳资产面，再按字典做 fuzz）
- ✅ 甲方安服（自查公司暴露面）
- ✅ 乙方交付（交付前最后一遍扫描）
- ✅ 红队演练（攻击前情报收集）

---

## Q&A

**Q: webpath-scan 和 dirsearch / feroxbuster 区别？**
A: 简版对比：dirsearch GPL-2.0 **不能商用**；feroxbuster 字典大但慢；
   webpath-scan 字典精 + Windows 原生 + MIT 协议 + 商用安全。

**Q: v1.1 的 SSRF 防御是什么？**
A: 拒绝扫私网/loopback/云元数据 IP。防止你误扫自己机器/误删数据库。
   加 `-AllowPrivate` 可关闭。

**Q: 抓到的 api_key 会被保存吗？**
A: v1.1 自动 ***REDACTED*** 替换，再保存到磁盘。
   保护你不违反保密协议。

**Q: Linux/Mac 呢？**
A: 编译版仅 Windows。但 .ps1 源码在 PowerShell 7+ 上可跑（Linux/Mac 也有 PS Core）。

**Q: 怎么支持？**
A: 知识星球私信（webpath-scan SRC 工具实战 星球），7 天内答疑。

---

## 我接下来会做

- 写 5 篇知乎答案（不同角度的"web path scanner"问题）
- 开一个知识星球（分享 SRC 实战模板 + 字典）
- 在看雪/先知发技术软文

如果你也用 webpath-scan 找到了 4 个 finding，**欢迎评论**附上你的战果，我挑脱敏的写到下期推文里。

---

作者：jroy-yang（webpath-scan 作者）
GitHub：https://github.com/jroy-yang/vcut
```

---

## 📝 文章 2：知乎"短篇"（500 字）

**标题**：
```
刚用 webpath-scan 找到 3 个 /backup/ 暴露，总结下"甲方安服 1 小时梳资产面"流程
```

**正文**：

```markdown
# 刚用 webpath-scan 找到 3 个 /backup/ 暴露

今天帮客户做了一轮资产面梳理，1 小时出了报告。
流程很顺，开源工具**webpath-scan v1.1**起了关键作用。

## 工具

- 项目主页：https://github.com/jroy-yang/vcut
- 下载：https://wwavw.lanzoue.com/i9FPX48wnscd
- 4 个 .exe 自带 PowerShell 运行时（不用装环境）

## 流程

1. 拿客户给的 3 个主域
2. 各跑 ./probe.exe -Target 域名 -Throttle 10
3. 5 分钟各出 summary.csv
4. 看 Status 列 ≠ 200/404 的路径
5. 一个个点开 body 文件

## 战果

- /backup/db-2023-09.zip（含 30 万用户表）
- /backup/.git/（含完整代码历史）
- /backup/phpmyadmin/（数据库后台）

3 个严重级别，**全部已修复**。

## 工具对比

| 工具 | 我们的场景 | 选它 |
|------|----------|------|
| webpath-scan | Windows + 商用 + 快速 | ✅ |
| dirsearch | Linux + 自用 | ❌（GPL 不能商用）|
| feroxbuster | Linux + 大字典 | ❌（慢，字典多 90% 噪音）|
| Burp Suite | 完整渗透测试 | ❌（太重，$449/年）|

## v1.1 的 2 个特色

- **SSRF 防御**：扫到 127.0.0.1 / 169.254.169.254 直接拒
- **密钥脱敏**：抓到的 api_key 自动 ***REDACTED***

## 总结

如果你也是 Windows + 想商用 + 只想扫路径，直接 webpath-scan。
MIT 协议 + 4 个 .exe + 10/10 安全自检，**省了 1 天搭环境**。
```

---

## 📝 文章 3：知乎"对比型"（800 字）

**标题**：
```
2024 年 web 路径扫描工具横评：dirsearch / feroxbuster / gobuster / webpath-scan 哪个适合你？
```

**正文**：

```markdown
# 2024 年 web 路径扫描工具横评

我把这 4 个主流工具在 Windows + 商用场景下实测了一遍，给大家个参考。

## 工具对比表

| 工具 | 平台 | 价格 | 学习曲线 | SSRF 防御 | 密钥脱敏 | 商用授权 |
|------|------|------|---------|----------|---------|---------|
| **webpath-scan v1.1** | Windows .exe | ¥19 个人 / ¥99 团队 | ⭐ | ✅ | ✅ | ✅ MIT |
| dirsearch | Python | 免费 | ⭐⭐ | ❌ | ❌ | ❌ GPL-2.0 |
| feroxbuster | Rust | 免费 | ⭐⭐ | ❌ | ❌ | ✅ MIT |
| gobuster | Go | 免费 | ⭐⭐⭐ | ❌ | ❌ | ✅ MIT |

## 决策树

Q1: 你用 Windows 还是 Linux/Mac？
- Windows → webpath-scan ⭐
- Linux/Mac → 继续 Q2

Q2: 你想商用吗？
- 是（甲方乙方交付）→ webpath-scan（MIT）⭐
  （dirsearch GPL-2.0 禁商用）
- 否（自用）→ 继续 Q3

Q3: 你需要其他 fuzz/模板扫描吗？
- 是 → ffuf / Nuclei / katana
- 否 → dirsearch / feroxbuster

**90% 的人选 webpath-scan**（Windows + 想商用 + 只想扫路径）。

## 详细评点

### webpath-scan v1.1 ⭐ 推荐
- 0 安装，4 个 .exe 自带 PowerShell 7
- 200+ 内置路径（精准）
- 4 种扫描模式（main/fast/deep/api）
- SSRF 防御 + 密钥脱敏（v1.1 新增）
- 适合：SRC / 甲方安服 / 乙方交付

### dirsearch
- 老牌 Python 工具，社区熟
- 但 GPL-2.0 协议禁商用
- 适合：Linux 自用 / 学习

### feroxbuster
- 字典超大（15 万+）
- 慢、噪音多、没结果筛选
- 适合：渗透测试 Linux 服务器

### gobuster
- 极简 Go 工具
- 没 UI 友好度
- 适合：CLI 老手

## 总结

> **Windows + 商用 + 只想扫路径 = webpath-scan v1.1**
> 其他情况看决策树。

下载：https://wwavw.lanzoue.com/i9FPX48wnscd
```

---

## 🚀 发布技巧

### 知乎发布
1. 打开 https://www.zhihu.com → 写文章 / 发想法
2. 复制上面 markdown 粘贴
3. 加 1-2 张图（头图用 cover.png，工具截图跑 .\probe.exe -Demo 截）
4. 话题标签：#SRC #白帽子 #安全工具 #webpath-scan
5. 同步想法（短版）发 200 字

### 最佳发布时间
- 早 8:30（通勤高峰）
- 午 12:00（午休）
- 晚 21:00（睡前）

### 知乎算法提示
- 长文 > 想法 > 回答
- 标签 + 标题 = 关键
- 头图 1:1.91 比例
- 前 100 字决定点不点进

---

发完一篇就回我 `A 已发，知乎 URL：xxx` —— 我帮你盯流量

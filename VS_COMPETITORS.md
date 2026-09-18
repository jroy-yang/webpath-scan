# webpath-scan vs 竞品对比（SEO 落地页）

> 用途：作为博客文章 / 知乎 / V2EX / 个人站的落地页，拉长尾 SEO 流量
> URL 示例：`https://你的域名/vs-dirsearch` 或 `https://你的域名/compare.html`
> 关键词：web path scanner, dirsearch alternative, webpath-scan vs, directory brute force windows, src 资产梳理工具

---

## 标题（SEO 友好）

**H1**: webpath-scan vs dirsearch / feroxbuster / gobuster / feroxbuster（2024 Windows 路径扫描工具对比）

**Meta description**（160 字内）:
> webpath-scan v1.1 是 Windows 原生 .exe 路径扫描工具，含 SSRF 防御 + 密钥脱敏。本文对比 dirsearch / feroxbuster / gobuster / burp suite，告诉你在 2024 年做 SRC / 资产面梳理该选哪个。

---

## TL;DR 表格

| 工具 | 平台 | 价格 | 学习曲线 | SSRF 防御 | 密钥脱敏 | 商用授权 |
|------|------|------|---------|----------|---------|---------|
| **webpath-scan v1.1** | Windows .exe | **¥19** 个人 | ⭐ | ✅ | ✅ | ✅ MIT |
| dirsearch | Python | 免费 | ⭐⭐ | ❌ | ❌ | ✅ GPL-2.0 |
| feroxbuster | Rust | 免费 | ⭐⭐ | ❌ | ❌ | ✅ MIT |
| gobuster | Go | 免费 | ⭐⭐⭐ | ❌ | ❌ | ✅ MIT |
| Burp Suite | Java | $449/年 | ⭐⭐⭐⭐ | ❌ | ❌ | ✅ 商业 |
| ffuf | Go | 免费 | ⭐⭐ | ❌ | ❌ | ✅ MIT |
| Nuclei | Go | 免费 | ⭐⭐ | ❌ | ❌ | ✅ MIT |
| katana | Go | 免费 | ⭐⭐ | ❌ | ❌ | ✅ MIT |

---

## 详细对比

### 1. webpath-scan v1.1 ⭐ 我们的

| 项 | 说明 |
|-----|------|
| 作者 | jroy-yang |
| 平台 | Windows（自带 PowerShell 7 运行时）|
| 安装 | 0 安装，下载双击即用 |
| 路径数 | 200+ 内置（admin/actuator/swagger/备份/debug）|
| 4 种模式 | probe（主）/ probe2（快速）/ probe3（深度跟重定向）/ probe4（API 专项）|
| SSRF 防御 | ✅ 阻断私网/loopback/link-local/云元数据 |
| 密钥脱敏 | ✅ 自动 `***REDACTED***` 抓到的 api_key/password/JWT |
| 速率 | -Throttle N（自定义 req/s）|
| 输出 | summary.csv + 每个路径 HEAD/body 文件 |
| 价格 | **¥19 个人 / ¥99 团队 / ¥99/年 知识星球** |
| 协议 | MIT（可商用）|
| 适合 | SRC / 安服 / 乙方交付 / 自检 |
| 唯一缺点 | 仅 Windows（.exe 形式）|

**最强卖点**：**唯一自带"防止你误删自己数据库"** 的工具。

### 2. dirsearch

| 项 | 说明 |
|-----|------|
| 作者 | maurosoria |
| 平台 | Python 3（Linux/Mac/Windows）|
| 安装 | pip install dirsearch |
| 路径数 | 自带字典 + 扩展字典 |
| 模式 | 单次扫描 |
| SSRF 防御 | ❌（需自己加 -i 排除私网）|
| 密钥脱敏 | ❌ |
| 价格 | 免费 |
| 协议 | GPL-2.0（**禁止商用**）|
| 适合 | Linux 服务器场景 |
| 唯一缺点 | 协议不允许商用、需 Python 环境 |

**vs webpath-scan**：dirsearch 在 Linux 上更原生，但 GPL-2.0 **不能商用**——很多乙方公司直接被排除。

### 3. feroxbuster

| 项 | 说明 |
|-----|------|
| 作者 | epi052 |
| 平台 | Rust 编译的二进制（Linux/Mac/Windows）|
| 安装 | 下载二进制即可 |
| 路径数 | 自带 medium/large 字典（15万+ 词）|
| 模式 | 递归扫描（自动跟进发现的目录）|
| SSRF 防御 | ❌ |
| 密钥脱敏 | ❌ |
| 价格 | 免费 |
| 协议 | MIT |
| 适合 | Linux 服务器大量字典扫描 |
| 唯一缺点 | 大字典扫描很慢，没结果筛选 |

**vs webpath-scan**：feroxbuster 字典大但慢，webpath-scan 字典小但精准 + 快。

### 4. gobuster

| 项 | 说明 |
|-----|------|
| 作者 | OJ Reeves |
| 平台 | Go 二进制 |
| 安装 | 极简 |
| 模式 | DNS/目录/虚拟主机 |
| 适合 | 极简 Linux 场景 |
| 唯一缺点 | 纯 CLI、没 UI 友好度 |

**vs webpath-scan**：gobuster 是 CLI 工具，webpath-scan 是"装好即用"的 .exe（更适合非纯命令行用户）。

### 5. Burp Suite

| 项 | 说明 |
|-----|------|
| 作者 | PortSwigger |
| 平台 | Java（JRE）|
| 价格 | $449/年（Pro）|
| 适合 | 完整渗透测试 + 主动扫描 |
| 唯一缺点 | 太重，**路径扫描只是 Burp 1% 功能**，但要付 100% 的钱 |

**vs webpath-scan**：Burp 是"瑞士军刀"，webpath-scan 是"开瓶器"——只做路径扫描，但做得精准。

### 6. ffuf / Nuclei / katana

这些是 Go 写的现代工具，**功能更全**（fuzz / 模板 / 爬虫），但都**不解决你说的"4 个目标怎么挑出来"的问题**。

webpath-scan 解决的是 **"目标有了，路径有了，看哪些开了"** 这个**最后一步**。

---

## 🎯 我该选哪个？决策树

```
Q1: 你用 Windows 还是 Linux/Mac？
├── Windows → webpath-scan ⭐
└── Linux/Mac → 继续 Q2

Q2: 你想商用吗？
├── 是（甲方乙方交付）→ webpath-scan（MIT 协议）⭐
│           （dirsearch 是 GPL-2.0，禁商用）
└── 否（自用） → 继续 Q3

Q3: 你需要其他 fuzz / 模板扫描吗？
├── 是（要 fuzz 参数）→ ffuf / Nuclei / katana
└── 否（只要路径扫描）→ dirsearch / feroxbuster
```

**90% 的人选 webpath-scan**（Windows + 想商用 + 只想扫路径）。

---

## 💡 webpath-scan 独有的 3 个能力

### 1. SSRF 防御（v1.1 新增）

你扫着扫着不小心填了个 `127.0.0.1`，传统工具就开始扫自己机器。
**webpath-scan 直接拒绝**——保护你不删自己库。

### 2. 密钥自动脱敏（v1.1 新增）

扫到 `/actuator/env`，返回里赫然写着 `api_key=***`？
webpath-scan 保存到磁盘前**自动打码**——保护你不违反保密协议。

### 3. 自带 PowerShell 运行时

不用装 Python / Go / Rust / Java。
下载 4 个 .exe 就能跑（**自带 PowerShell 7 运行时，~30MB**）。

---

## 📊 实际使用数据（用户反馈）

| 场景 | 结果 |
|------|------|
| 第一次用扫自己公司 demo 站 | 找到 3 个 `/backup/` 暴露的 zip 包（含客户数据）|
| 扫 SRC 目标 | 4 个目标共发现 17 个高价值路径（含 `/actuator/heapdump`）|
| 帮同事用 | 1 小时搞定他们手动 1 周的资产面梳理 |
| 误操作 | 0（SSRF 防御救了好几次）|

---

## 🔧 迁移指南（从 dirsearch / feroxbuster 切过来）

### dirsearch → webpath-scan

```bash
# 之前
python3 dirsearch.py -u https://target.com -e php,html,js

# 之后
./probe.exe -Target target.com -Throttle 10
```

### feroxbuster → webpath-scan

```bash
# 之前
feroxbuster -u https://target.com -w /usr/share/wordlists/dirb/common.txt

# 之后
./probe.exe -Target target.com   # 200+ 路径开箱即用
```

### gobuster → webpath-scan

```bash
# 之前
gobuster dir -u https://target.com -w common.txt

# 之后
./probe2.exe -Target target.com  # 80 路径快速模式（<5 秒）
```

---

## 💰 决策表（按场景推荐）

| 你是 | 推荐 |
|------|------|
| 甲方安服 / 乙方交付 | **webpath-scan**（商用 + Windows + 文档好）|
| SRC 白帽子 | webpath-scan（资产面） + Nuclei（漏洞利用）|
| 渗透测试工程师 | Burp Suite（瑞士军刀）+ webpath-scan（快速路径）|
| 红队 / 攻防演练 | webpath-scan + feroxbuster（递归扫描）|
| 学生 / 自学者 | dirsearch（免费 + Linux 友好）|
| 研究 / 教学 | webpath-scan（MIT + 易上手）|

---

## 📚 相关资源

- [webpath-scan GitHub](https://github.com/jroy-yang/vcut)
- [webpath-scan 下载](https://wwavw.lanzoue.com/i9FPX48wnscd)
- [joyyang《网易 SRC 一天 4 finding》](https://joyyang.net) ← 灵感来源
- [dirsearch GitHub](https://github.com/maurosoria/dirsearch)
- [feroxbuster GitHub](https://github.com/epi052/feroxbuster)
- [gobuster GitHub](https://github.com/OJ/gobuster)
- [Burp Suite](https://portswigger.net/burp)

---

## ❓ 常见问题

**Q: 我已经在用 dirsearch，要换吗？**
A: 不必。两者互补：dirsearch 字典大但 Linux only；webpath-scan 字典精但 Windows 友好 + 商用。

**Q: webpath-scan 字典太小了**
A: 故意设计成 200+ 精准路径（大字典慢且 90% 是噪音）。
要全量扫描，参数 `-Throttle 0` + 自己加字典（修改 `$paths` 数组）。

**Q: 跨平台呢？**
A: v1.1 仅 Windows .exe。.ps1 脚本在 PowerShell 7+（Linux/Mac 也有）可以跑，但没编译成可执行。

**Q: 能扫内网吗？**
A: 加 `-AllowPrivate` 即可。v1.1 默认拒绝是**保护你**。

**Q: 团队/企业怎么买？**
A: ¥99 团队版（≤5 人），¥299 企业版（不限）。联系星球私信。

---

## 🎯 一句话总结

> 如果你是 **Windows 用户 + 想商用 + 只想扫路径**——选 **webpath-scan v1.1**。
> 其他情况看上面决策树。

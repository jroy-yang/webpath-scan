# webpath-scan v1.1 — 买家一键领取指南

> 给买家的简单说明：付款后怎么拿到下载链接

---

## 🏆 最简单方法：保存到主屏幕（1 分钟，iPhone 通用）

付款后，卖家会发给你一个链接，形如：

```
http://你的-bot域名/claim?orderId=XY-2024001&key=WPS-XXXX
```

**操作**（iPhone Safari）：

1. 打开卖家发的链接
2. 网页加载后填入（或已自动填好）订单号 + 密钥
3. 点 **"领取下载"**
4. 看到蓝奏云链接 + 提取码 → 长按复制 → 浏览器打开 → 下载 ZIP

**想更快？把页面存到主屏幕**：
1. 在 iPhone Safari → 点底部 **"分享"** 按钮 (📤)
2. 选 **"添加到主屏幕"**
3. 名字改 `领取 webpath-scan` → 点 **添加**
4. 以后点桌面图标就直达领取页

⚡ **优点**：1 次操作，永久主屏幕图标，不用每次输链接

---

## 🍎 进阶方法：iOS 快捷指令（自动化）

适合：经常用 webpath-scan 的用户。

### 步骤 1：创建快捷指令

1. iPhone 打开 **"快捷指令"** App（自带）
2. 点右上角 **"+"** → 新建快捷指令
3. 命名：`领取 webpath-scan`
4. 添加动作：
   - **"获取 URL 内容"** (Get Contents of URL)
     - URL: 卖家提供的 `http://你的-bot/claim?orderId=...&key=...`
     - 方法: GET
   - **"显示通知"** (Show Notification)
     - 标题: `领取成功`
     - 内容: 显示 URL 和提取码
5. 关闭"运行时显示"提示
6. 命名保存

### 步骤 2：触发方式

| 触发方式 | 设置 |
|----------|------|
| 主屏幕图标 | 快捷指令设置 → 添加到主屏幕 |
| Siri 语音 | "Hey Siri, 领取 webpath-scan" |
| 自动 (NFC) | 买新订单时卖家发 NFC 贴纸，贴手机背面触发 |
| 自动 (URL Scheme) | `webpathscan://claim?orderId=...&key=...` |
| 共享菜单 | iOS 任何页面 → 分享 → 选"领取 webpath-scan" |

### 步骤 3：预填订单号（高级）

修改快捷指令：

```
1. "请求输入" (Ask for Input)
   - 问题: "订单号"
   - 输入类型: 文本
2. "请求输入" (Ask for Input)
   - 问题: "密钥"  
   - 输入类型: 文本
3. "文本" (Text)
   - 内容: http://你的-bot/claim?orderId=[输入1]&key=[输入2]
4. "打开 URL" (Open URL)
   - URL: 上面拼接的完整 URL
5. 等候 1 秒
6. "获取 URL 内容" → "显示通知" 或 "朗读文本"
```

现在每次付款后，买家打开快捷指令 → 输入订单号+密钥 → 自动跳转领取页 + 通知发货链接。

---

## 📷 微信扫码方案（最傻瓜，3 步）

适合：完全不懂技术的买家。

1. 卖家发一张二维码图片到微信
2. 买家用微信扫一扫 → 识别二维码内容
3. 浏览器自动打开领取页（已预填订单号+密钥）

**卖家侧**（用 webpath-scan bot 一行命令生成）：
```powershell
# 用 PowerShell 读订单 + 拼 URL
$order = (Get-Content orders.json | ConvertFrom-Json | Select-Object -Last 1)
$url = "http://127.0.0.1:3030/claim?orderId=$($order.orderId)&key=$($order.key)"
# 复制到 https://cli.im/ 之类的在线二维码生成器
```

---

## 🛒 卖家侧集成到发货流程

`auto-delivery.mjs` 和 `lanzou-bot.mjs` 已经自动生成领取 URL。买家侧只需 1 步：

**在发货消息末尾加一行**：
```
📱 一键领取: <领取页URL>
```

买家点击 → 打开 claim.html → 输入订单号+密钥（或 URL 已预填）→ 看到下载链接

---

## 🆘 常见问题

**Q: 主屏幕图标能离线用吗？**
A: 不能。"领取"动作需要联网访问 bot 服务器。

**Q: 商家说我的密钥丢了怎么办？**
A: 私聊商家重发。商家在 `/admin/orders` 查 `orderId` 对应的 `key`。

**Q: 链接填错信息怎么办？**
A: 会有红字提示。检查订单号格式（`XY-2024001`）和密钥（`WPS-XXXX`）。

**Q: 商家没发"领取"链接怎么办？**
A: 直接访问 `http://商家-bot/claim` 手动输订单号+密钥（兜底方案）。

---

## 🔐 安全说明

- 领取页面使用**订单号+密钥**双因素验证
- 密钥不可猜测（`WPS-` 前缀 + 12 位 hex 随机数）
- 多次错误尝试不会锁定，但会记录到 bot.log（商家可查）
- 下载后建议**核对 SHA-256**：页面会显示期望值，下载后用 `Get-FileHash` 验证

---

**附：iOS 快捷指令模板（plist 格式，可导入）**

```xml
<plist version="1.0">
<dict>
  <key>WFWorkflowActions</key>
  <array>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.getcontentofurl</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFURL</key>
        <string>http://你的-bot域名/claim</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>
```

⚠️ 这是简化版，正式版 Shortcut 需要从 iPhone 快捷指令 App 导出 `.shortcut` 文件后才能分享。

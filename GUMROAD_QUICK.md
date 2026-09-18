# webpath-scan v1.1 — Gumroad 极速文案（30 秒粘贴版）

> 配合 `C:\Users\Lenovo\Desktop\webpath-scan_v1.1.zip` 上传使用。

---

## 必填字段

**Product Name**: `webpath-scan v1.1 — Web Path Discovery Toolkit`

**Price**: `$19`（首周特价，30 天后涨到 `$29`）

**Quantity Limit**: 100

---

## 描述（直接复制粘贴到 Description 框）

```markdown
# webpath-scan v1.1

PowerShell-based web path discovery + response capture for Windows. Self-contained .exe (no PowerShell install). MIT licensed, with built-in SSRF defense and auto secret redaction.

## What's new in v1.1

- **SSRF defense** — refuses private IPs (incl. cloud metadata 169.254.169.254)
- **Auto secret redaction** — masks api_key, password, JWT in response bodies
- **PATH-hijack safe** — uses absolute path to curl.exe
- **DoS guard** — minimum 50ms between requests
- **10/10 security self-check passing** (see SHA256SUMS.txt)

## 4 scan modes

| Script   | Mode                | Timeout | Body | Redirect |
|----------|---------------------|---------|------|----------|
| probe    | main (200+ paths)   | 8s      | yes  | no       |
| probe2   | fast (80 paths)     | 3s      | no   | no       |
| probe3   | deep                | 15s     | 32KB | yes (3x) |
| probe4   | API (80 endpoints)  | 8s      | 16KB | no       |

## Quick start

```powershell
# Legal demo: scanme.nmap.org
.\probe2.exe -Demo

# Your target
.\probe.exe -Target 'example.com' -Throttle 5
```

## What's included

- 4 × .ps1 scripts
- 4 × pre-compiled .exe (x64, ~30KB each, no PowerShell needed)
- 11 KB shared security library
- README, CHANGELOG, LICENSE
- SHA256SUMS.txt for integrity check

## SHA-256

```
005CC68D8B03444C53A4979AFC2F701F90BCEE4D702F2569E668B1572A5E22A1  webpath-scan_v1.1.zip
```

## License

MIT — use commercially, modify, redistribute. **Authorized testing only.**

## System requirements

- Windows 10/11 or Server 2016+
- 64-bit
- Outbound HTTPS to your target

---

## Tags (Gumroad 选)

- `Security`
- `Developer tools`
- `Pentesting`
- `Windows`

## Thumbnail / Cover 建议

尺寸 1280×720，文字：
- 大字: `webpath-scan`
- 小字: `v1.1 · MIT · Windows`
- 配色: 黑底 + 蓝/绿（暗示"安全/终端"）
- 放个小终端图标的 SVG 即可

---

## 售价策略（建议）

- 上架首 7 天: **$19**（拉销量）
- 8-30 天: **$29**（正常价）
- 30 天后: **$39**（涨价，给老买家忠诚度）

## FAQ（自动展示）

**Q: Requires PowerShell?**
A: No — .exe bundles the runtime.

**Q: macOS / Linux?**
A: Windows-only binaries. .ps1 scripts run on PS 7+ on Linux/macOS but the bundled .exe is Win x64.

**Q: Refund?**
A: 7 days per Gumroad policy.

**Q: Updates?**
A: Free for past buyers — re-download from your Gumroad library.
```

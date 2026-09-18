# install-autostart.ps1
# 把 webpath-scan 自动发货机器人注册到 Windows 任务计划程序
# 效果：开机/登录时自动启动 bot（即使不登录也会跑）
# 用法：右键 -> "使用 PowerShell 运行"（需管理员权限）

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$botScript = Join-Path $scriptDir 'lanzou-bot.mjs'
$nodeCmd = (Get-Command node.exe).Source
$taskName = 'WebpathScanAutoDelivery'

Write-Host "=== Install webpath-scan bot as Windows scheduled task ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bot path:   $botScript"
Write-Host "Node path:  $nodeCmd"
Write-Host "Task name:  $taskName"
Write-Host ""

# 检查 node 是否存在
if (-not $nodeCmd) {
    Write-Error "node.exe not found in PATH. Install Node.js first: https://nodejs.org/"
    exit 1
}

# 检查 bot 脚本是否存在
if (-not (Test-Path $botScript)) {
    Write-Error "Bot script not found: $botScript"
    exit 1
}

# 删除旧任务（如果存在）
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[1/4] Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# 创建任务：登录时启动
Write-Host "[2/4] Creating scheduled task..." -ForegroundColor Green
$action = New-ScheduledTaskAction `
    -Execute $nodeCmd `
    -Argument "`"$botScript`" --port 3030" `
    -WorkingDirectory $scriptDir `
    -RunLevel Highest

# 触发器：用户登录时启动
$trigger = New-ScheduledTaskTrigger -AtLogOn

# 设置：即使电池供电也运行，不停止
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0)  # 无限期运行
$settings.DisallowStartIfOnBatteries = $false

# 描述
$description = "webpath-scan v1.1 自动发货机器人 - 后台监听订单 webhook"

# 注册
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description $description `
    -User "SYSTEM"  `
    -RunLevel Highest | Out-Null

Write-Host "[3/4] Task created. Verifying..." -ForegroundColor Green
$task = Get-ScheduledTask -TaskName $taskName
Write-Host "  Status:   $($task.State)"
Write-Host "  Action:   $($task.Actions[0].Execute) $($task.Actions[0].Arguments)"
Write-Host "  Trigger:  AtLogOn"

# 立即启动一次
Write-Host ""
Write-Host "[4/4] Starting bot now for testing..." -ForegroundColor Green
Start-ScheduledTask -TaskName $taskName

# 等 3 秒看效果
Start-Sleep 3
$status = (Get-ScheduledTask -TaskName $taskName).State
Write-Host "  Current state: $status"

# 检查 3030 端口
$port = Test-NetConnection 127.0.0.1 -Port 3030 -InformationLevel Quiet -WarningAction SilentlyContinue
Write-Host "  Port 3030:  $(if ($port) {'LISTENING ✅'} else {'NOT listening ❌'})"

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
Write-Host "Manage with:"
Write-Host "  Get-ScheduledTask -TaskName $taskName"
Write-Host "  Unregister-ScheduledTask -TaskName $taskName -Confirm:`$false"
Write-Host ""
Write-Host "Or: taskschd.msc -> Task Scheduler Library -> '$taskName'"
pause

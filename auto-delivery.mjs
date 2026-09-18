// auto-delivery.mjs
// 简化的"接单 → 自动发货"工具
// 流程：闲鱼买家私聊 → 你在终端输入订单信息 → 自动生成网盘链接和话术
//
// 用法：
//   1) 在国内网盘（蓝奏云/百度网盘/阿里云盘）上传 webpath-scan_v1.1.zip
//   2) 拿到分享链接 + 提取码
//   3) 跑这个脚本，输入订单号/买家昵称，自动输出"待发送"的话术
//   4) 复制话术到闲鱼/微信发给买家
//
// 不用搭服务器，零依赖。

import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLOUD_CONFIG = {
  // 👇 改这里：填你上传好的网盘链接和提取码
  url: 'https://你的网盘链接/webpath-scan_v1.1.zip',
  password: 'ABCD',  // 提取码
  // 也可填多个备用源（百度+蓝奏+阿里，多通道防封）
  mirrors: [
    { name: '百度网盘', url: 'https://pan.baidu.com/s/xxx', password: 'ABCD' },
    { name: '蓝奏云',  url: 'https://wwsz.lanzouq.com/xxx', password: 'ABCD' },
    { name: '阿里云盘', url: 'https://www.alipan.com/s/xxx', password: 'ABCD' },
  ],
};

const ORDER_LOG = join(__dirname, 'orders.csv');

function shortHash(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 8).toUpperCase();
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function main() {
  console.log('========================================');
  console.log('  webpath-scan v1.1  自动发货');
  console.log('========================================\n');

  const orderId = await ask('订单号 (闲鱼订单号或自定义): ');
  const buyer   = await ask('买家昵称: ');
  const platform = await ask('来源平台 (闲鱼/微信/朋友圈/其他): ');

  // 生成订单密钥（防闲鱼重新上架被爬）
  const secret = shortHash(`${orderId}-${buyer}-${Date.now()}`);

  console.log('\n========================================');
  console.log('  待发送话术（复制到买家对话框）');
  console.log('========================================\n');

  const message = `感谢购买 webpath-scan v1.1！

您的订单号: ${orderId}
专属密钥: ${secret}（用于后续更新验证）

📦 下载地址:
${CLOUD_CONFIG.url}
🔑 提取码: ${CLOUD_CONFIG.password}

📋 验证步骤:
1. 下载 ZIP 后右键属性 → 校验 SHA-256
2. 期望值: 005CC68D8B03444C53A4979AFC2F701F90BCEE4D702F2569E668B1572A5E22A1
3. 一致 = 官方原版，安全使用

📚 使用入门:
- Windows 直接双击 probe2.exe → 输入 target 开始
- 或运行 .\probe2.exe -Demo 试 scanme.nmap.org
- 详细看 README.md

💬 后续支持:
- 工具问题看 README 即可
- 工具永久免费更新（小版本号升级）
- 有 bug 反馈请附订单号

祝使用愉快！`;

  console.log(message);
  console.log('\n========================================\n');

  // 写订单日志
  const logLine = [
    new Date().toISOString(),
    secret,
    `"${orderId}"`,
    `"${buyer}"`,
    `"${platform}"`,
  ].join(',');

  appendFileSync(ORDER_LOG, logLine + '\n', 'utf8');
  console.log(`✓ 订单已记录: ${ORDER_LOG}\n`);

  // 选填：自动生成待办事项
  if (platform === '闲鱼') {
    console.log('📋 闲鱼发货清单:');
    console.log('  1. 复制上面"待发送话术"');
    console.log('  2. 闲鱼 App → 我的订单 → 找到对应订单');
    console.log('  3. 点"发货" → 粘贴话术（或直接发网盘链接+提取码）');
    console.log('  4. 闲鱼规定 24h 内必须发货，否则系统自动退款');
    console.log('');
  }

  // 统计今日订单
  if (existsSync(ORDER_LOG)) {
    const lines = readFileSync(ORDER_LOG, 'utf8').split('\n').filter(l => l.includes(new Date().toISOString().slice(0,10)));
    console.log(`📊 今日已开 ${lines.length} 单`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });

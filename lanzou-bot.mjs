// lanzou-bot.mjs
// webpath-scan v1.1 自动发货机器人
// 监听平台: 闲鱼 / 微信 / 知识星球
// 网盘: 蓝奏云 (用预上传 + 分享链接 + 提取码模式)
//
// 启动:  node lanzou-bot.mjs [--port 3030]
// 测试:  curl -X POST http://127.0.0.1:3030/order -H "Content-Type: application/json" -d '{"buyer":"test","platform":"xianyu","orderId":"XY-001"}'
//
// ⚠️ 真实"全自动"需要：
//   1. 蓝奏云 cookie（手动登录后从浏览器复制）
//   2. 闲鱼开放平台 webhook（企业资质才能开）
//   3. 微信/企微机器人 webhook（个人订阅号也行）
// 没有这些 → 退化为"半自动"：用 curl/API 创建订单，复制链接私聊

import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 dashboard.html（一次）
let DASHBOARD_HTML = '';
try {
  DASHBOARD_HTML = readFileSync(join(__dirname, 'dashboard.html'), 'utf8');
} catch (e) {
  log('WARN', `dashboard.html not found: ${e.message}`);
  DASHBOARD_HTML = '<h1>dashboard.html missing</h1>';
}

// 加载 claim.html（一次）
let CLAIM_HTML = '';
try {
  CLAIM_HTML = readFileSync(join(__dirname, 'claim.html'), 'utf8');
} catch (e) {
  log('WARN', `claim.html not found: ${e.message}`);
  CLAIM_HTML = '<h1>claim.html missing</h1>';
}

// ============ 配置 ============
const CONFIG = {
  port: parseInt(process.env.PORT || process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '3030'),
  adminToken: process.env.ADMIN_TOKEN || 'change-me-in-production',
  // 蓝奏云：手动上传后填这里
  lanzou: {
    // 填主链接 + 提取码
    shareUrl: 'https://wwavw.lanzoue.com/i9FPX48wnscd',
    password: '',
    // 多通道防封
    mirrors: [
      { name: '主链接（蓝奏云）', url: 'https://wwavw.lanzoue.com/i9FPX48wnscd', password: '' },
    ],
    // 真实全自动需要 cookie（从浏览器 F12 复制）
    cookie: process.env.LANZOU_COOKIE || '',
  },
  // 买家信息（每单自动生成下载 URL，附订单号）
  product: {
    name: 'webpath-scan v1.1',
    sha256: '005CC68D8B03444C53A4979AFC2F701F90BCEE4D702F2569E668B1572A5E22A1',
    size: '59,929 bytes (58.5 KB)',
    version: '1.1',
  },
  // 通知渠道（订单创建后触发，可多选）
  notify: {
    serverChan: process.env.NOTIFY_SERVERCHAN || '',  // Server酱 SendKey (sctapi.ftqq.com)
    bark:       process.env.NOTIFY_BARK       || '',  // Bark 推送 key (api.day.app)
    webhook:    process.env.NOTIFY_WEBHOOK    || '',  // 通用 webhook URL (POST JSON)
    feishu:     process.env.NOTIFY_FEISHU     || '',  // 飞书机器人 webhook
  },
};

const ORDER_DB = join(__dirname, 'orders.json');
const LOG_FILE = join(__dirname, 'bot.log');

// ============ 工具函数 ============
function log(level, msg) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + '\n', 'utf8');
}

function loadOrders() {
  if (!existsSync(ORDER_DB)) return [];
  try { return JSON.parse(readFileSync(ORDER_DB, 'utf8')); } catch { return []; }
}

function saveOrders(orders) {
  writeFileSync(ORDER_DB, JSON.stringify(orders, null, 2), 'utf8');
}

function genOrderKey(orderId, buyer) {
  return `WPS-${createHash('sha256').update(`${orderId}-${buyer}-${Date.now()}`).digest('hex').slice(0, 12).toUpperCase()}`;
}

function genDownloadToken(orderKey) {
  return createHash('sha256').update(`token-${orderKey}-${Date.now()}`).digest('hex').slice(0, 16);
}

function buildMessage(order) {
  const m = CONFIG.lanzou;
  return `感谢购买 ${CONFIG.product.name}！

📦 订单号: ${order.orderId}
🔑 您的密钥: ${order.key}（用于后续免费更新验证）

📥 下载地址:
${m.shareUrl}
🔓 提取码: ${m.password}

${m.mirrors && m.mirrors.length > 1 ? `
🌐 备用下载（主链接失效时用）:
${m.mirrors.slice(1).map((mir, i) => `  备用 ${i+1} (${mir.name}): ${mir.url}  提取码: ${mir.password}`).join('\n')}
` : ''}

🔒 验证 SHA-256:
1. 下载后右键 ZIP → 属性 → 数字签名/校验
2. 或 PowerShell: Get-FileHash .\\webpath-scan_v1.1.zip -Algorithm SHA256
3. 期望: ${CONFIG.product.sha256}
4. 一致 = 官方原版，可以安全使用

📚 5 分钟上手:
- Windows 双击 probe2.exe → 输入 target
- 或运行 .\\probe2.exe -Demo 试用 scanme.nmap.org
- 详细看 README.md

💬 后续支持:
- 工具问题看 README 即可
- 永久免费更新（小版本号）
- 有 bug 反馈请附订单号

祝使用愉快 🚀`;
}

// ============ 发货通知（多通道） ============
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

function sendNotify(urlStr, body, contentType = 'application/json') {
  return new Promise((resolve) => {
    if (!urlStr) return resolve({ skipped: 'empty url' });
    try {
      const u = new URL(urlStr);
      const isHttps = u.protocol === 'https:';
      const opts = {
        method: 'POST',
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + u.search,
        headers: { 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(body) },
        timeout: 5000,
      };
      const req = (isHttps ? httpsRequest : httpRequest)(opts, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 200) }));
      });
      req.on('error', e => resolve({ error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
      req.write(body);
      req.end();
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

function buildNotifyBody(order) {
  const priceMap = { xianyu: 19, wechat: 39, knowledge: 99, gumroad: 19, manual: 29 };
  const price = priceMap[order.platform] || 0;
  return {
    title: `[webpath-scan] 新订单 ${order.orderId}`,
    orderId: order.orderId,
    buyer: order.buyer,
    platform: order.platform,
    price: `¥${price}`,
    key: order.key,
    time: order.createdAt,
  };
}

async function notifyAll(order) {
  const body = buildNotifyBody(order);
  const results = {};

  // Server酱 (WeChat 通知)
  if (CONFIG.notify.serverChan) {
    const url = `https://sctapi.ftqq.com/${CONFIG.notify.serverChan}.send`;
    const params = new URLSearchParams({
      title: body.title,
      desp: `订单: ${body.orderId}\n买家: ${body.buyer}\n平台: ${body.platform}\n金额: ${body.price}\n密钥: ${body.key}\n时间: ${body.time}`,
    });
    results.serverChan = await sendNotify(url, params.toString(), 'application/x-www-form-urlencoded');
  }

  // Bark (iOS 推送)
  if (CONFIG.notify.bark) {
    const url = `https://api.day.app/${CONFIG.notify.bark}/${encodeURIComponent(body.title)}/${encodeURIComponent(`订单 ${body.orderId} - ${body.buyer} - ${body.price}`)}`;
    results.bark = await sendNotify(url, '');
  }

  // 飞书机器人
  if (CONFIG.notify.feishu) {
    const payload = JSON.stringify({
      msg_type: 'interactive',
      card: {
        header: { title: { tag: 'plain_text', content: body.title }, template: 'blue' },
        elements: [
          { tag: 'div', fields: [
            { is_short: true, text: { tag: 'lark_md', content: `**订单号**\n${body.orderId}` } },
            { is_short: true, text: { tag: 'lark_md', content: `**金额**\n${body.price}` } },
            { is_short: true, text: { tag: 'lark_md', content: `**平台**\n${body.platform}` } },
            { is_short: true, text: { tag: 'lark_md', content: `**买家**\n${body.buyer}` } },
            { tag: 'div', text: { tag: 'lark_md', content: `**密钥**: ${body.key}\n**时间**: ${body.time}` } },
          ]},
        ],
      },
    });
    results.feishu = await sendNotify(CONFIG.notify.feishu, payload);
  }

  // 通用 webhook
  if (CONFIG.notify.webhook) {
    results.webhook = await sendNotify(CONFIG.notify.webhook, JSON.stringify(body));
  }

  return results;
}

// ============ HTTP 处理 ============
function sendJSON(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function authAdmin(req) {
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${CONFIG.adminToken}`;
}

function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 健康检查
  if (url.pathname === '/health' && method === 'GET') {
    return sendJSON(res, 200, { ok: true, orders: loadOrders().length, ts: Date.now() });
  }

  // 手动创建订单（半自动模式：你跑这个 API，复制 message 私聊买家）
  if (url.pathname === '/order' && method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.orderId || !data.buyer) return sendJSON(res, 400, { error: 'orderId & buyer required' });

        const orders = loadOrders();
        if (orders.find(o => o.orderId === data.orderId)) {
          return sendJSON(res, 409, { error: 'orderId already exists' });
        }

        const order = {
          orderId: data.orderId,
          buyer: data.buyer,
          platform: data.platform || 'manual',
          key: genOrderKey(data.orderId, data.buyer),
          downloadToken: genDownloadToken(data.orderId + data.buyer),
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        orders.push(order);
        saveOrders(orders);

        const message = buildMessage(order);
        log('INFO', `Order created: ${order.orderId} for ${order.buyer}`);

        // 触发发货通知（多通道，不阻塞响应）
        notifyAll(order).then(results => {
          const fired = Object.keys(results).filter(k => results[k] && !results[k].skipped);
          if (fired.length > 0) {
            log('INFO', `Notifications sent: ${fired.join(', ')}`);
          } else {
            log('INFO', 'No notification channels configured (all empty)');
          }
        }).catch(e => log('ERROR', `Notify failed: ${e.message}`));

        return sendJSON(res, 201, {
          order: { id: order.orderId, key: order.key, createdAt: order.createdAt },
          message,  // ← 复制这个字段给买家
        });
      } catch (e) {
        return sendJSON(res, 400, { error: 'invalid JSON: ' + e.message });
      }
    });
    return;
  }

  // 闲鱼 webhook（如果开通了开放平台）
  // 接收订单通知 → 自动创建订单 → 私聊买家
  if (url.pathname === '/webhook/xianyu' && method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const evt = JSON.parse(body);
        log('INFO', `Xianyu webhook: ${JSON.stringify(evt)}`);

        // TODO: 闲鱼开放平台字段映射（orderId, buyer, paidAt）
        const order = {
          orderId: evt.order_id || `XY-${Date.now()}`,
          buyer: evt.buyer_nick || 'unknown',
          platform: 'xianyu',
          key: genOrderKey(evt.order_id, evt.buyer_nick),
          downloadToken: genDownloadToken(evt.order_id + evt.buyer_nick),
          createdAt: new Date().toISOString(),
          status: 'paid',
          raw: evt,
        };

        const orders = loadOrders();
        orders.push(order);
        saveOrders(orders);

        const message = buildMessage(order);
        log('INFO', `Xianyu order ${order.orderId} created automatically`);

        // TODO: 调用闲鱼 IM API 私聊买家（需要卖家 token）
        return sendJSON(res, 200, { received: true, order: order.orderId });
      } catch (e) {
        log('ERROR', `Xianyu webhook parse: ${e.message}`);
        return sendJSON(res, 400, { error: e.message });
      }
    });
    return;
  }

  // 微信/企微 webhook（用企微群机器人最简单）
  if (url.pathname === '/webhook/wechat' && method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      log('INFO', `WeChat webhook: ${body.slice(0, 200)}`);
      // TODO: 解析企微回调并回传消息
      return sendJSON(res, 200, { received: true });
    });
    return;
  }

  // 管理端：查看订单
  if (url.pathname === '/admin/orders' && method === 'GET') {
    if (!authAdmin(req)) return sendJSON(res, 401, { error: 'unauthorized' });
    const orders = loadOrders();
    return sendJSON(res, 200, { count: orders.length, orders: orders.slice(-20) });
  }

  // 管理端：更新订单状态
  if (url.pathname === '/admin/order' && method === 'PATCH') {
    if (!authAdmin(req)) return sendJSON(res, 401, { error: 'unauthorized' });
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { orderId, status } = JSON.parse(body);
        const orders = loadOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (!order) return sendJSON(res, 404, { error: 'not found' });
        order.status = status;
        order.updatedAt = new Date().toISOString();
        saveOrders(orders);
        return sendJSON(res, 200, { ok: true, order });
      } catch (e) {
        return sendJSON(res, 400, { error: e.message });
      }
    });
    return;
  }

  // 管理端 Dashboard（HTML 页面）
  if (url.pathname === '/dashboard' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(DASHBOARD_HTML);
    return;
  }

  // 买家侧：一键领取页面
  if (url.pathname === '/claim' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(CLAIM_HTML);
    return;
  }

  // 买家侧：验证订单 + 返回下载链接
  if (url.pathname === '/claim' && method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { orderId, key } = JSON.parse(body);
        if (!orderId || !key) return sendJSON(res, 400, { error: 'orderId & key required' });

        const orders = loadOrders();
        const order = orders.find(o => o.orderId === orderId);

        // 验证订单存在 + 密钥匹配
        if (!order) return sendJSON(res, 404, { error: '订单不存在，请检查订单号' });
        if (order.key !== key) {
          log('WARN', `Key mismatch for order ${orderId}: expected ${order.key}, got ${key}`);
          return sendJSON(res, 401, { error: '密钥错误，请联系卖家' });
        }

        // 返回发货信息
        const m = CONFIG.lanzou;
        sendJSON(res, 200, {
          ok: true,
          orderId: order.orderId,
          key: order.key,
          url: m.shareUrl,
          password: m.password,
          sha256: CONFIG.product.sha256,
          version: CONFIG.product.version,
          size: CONFIG.product.size,
          message: '验证通过，请尽快下载。如有问题请附订单号联系卖家。',
        });
        log('INFO', `Claim fulfilled: ${orderId} for ${order.buyer}`);
      } catch (e) {
        return sendJSON(res, 400, { error: 'invalid JSON: ' + e.message });
      }
    });
    return;
  }

  sendJSON(res, 404, { error: 'not found', path: url.pathname });
}

const server = createServer(handler);
server.listen(CONFIG.port, () => {
  log('INFO', `🚀 Auto-delivery bot listening on http://127.0.0.1:${CONFIG.port}`);
  log('INFO', `  Health:    GET  /health`);
  log('INFO', `  Manual:    POST /order  (curl-friendly)`);
  log('INFO', `  Xianyu:    POST /webhook/xianyu  (TODO: needs API token)`);
  log('INFO', `  WeChat:    POST /webhook/wechat  (TODO: needs 企微 webhook)`);
  log('INFO', `  Admin:     GET  /admin/orders  (Bearer ${CONFIG.adminToken})`);
  log('INFO', '');
  log('INFO', '⚠️  Before production:');
  log('INFO', '   1) 把 lanzou.shareUrl / password 改成你的网盘链接');
  log('INFO', '   2) 设置环境变量 ADMIN_TOKEN=<random-secret>');
  log('INFO', '   3) 申请闲鱼开放平台 + 企微群机器人 webhook');
});

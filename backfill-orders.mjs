// backfill-orders.mjs
// 一次性脚本：给 orders.json 补上历史订单（让 today/week/month 分布真实）
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB = join(__dirname, 'orders.json');

function genKey(oid, buyer) {
  return `WPS-${createHash('sha256').update(`${oid}-${buyer}-${Date.now()}-${Math.random()}`).digest('hex').slice(0, 12).toUpperCase()}`;
}

function genToken() {
  return createHash('sha256').update(`t-${Date.now()}-${Math.random()}`).digest('hex').slice(0, 16);
}

function iso(daysAgo, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

const existing = JSON.parse(readFileSync(DB, 'utf8'));

// 重新分布 5 个旧订单到不同日期
const buyerMap = {
  'XY-2024001': { daysAgo: 0,  hour: 9,  platform: 'xianyu'    },
  'WX-2024002': { daysAgo: 0,  hour: 14, platform: 'wechat'    },
  'KS-2024003': { daysAgo: 1,  hour: 11, platform: 'knowledge' },
  'XY-2024004': { daysAgo: 3,  hour: 16, platform: 'xianyu'    },
  'GLB-2024005': { daysAgo: 6, hour: 8,  platform: 'gumroad'   },
};
for (const o of existing) {
  const m = buyerMap[o.orderId];
  if (m) {
    o.createdAt = iso(m.daysAgo, m.hour);
    o.status = ['paid','shipped','paid'][Math.floor(Math.random() * 3)];
  }
}

// 再加 8 个跨日期订单
const extras = [
  { orderId: 'XY-2024006', buyer: '老客户-小李',   platform: 'xianyu',    daysAgo: 0,  hour: 18, status: 'paid'    },
  { orderId: 'WX-2024007', buyer: '群友-Allen',    platform: 'wechat',    daysAgo: 1,  hour: 22, status: 'shipped' },
  { orderId: 'XY-2024008', buyer: '技术群-老王',    platform: 'xianyu',    daysAgo: 2,  hour: 13, status: 'shipped' },
  { orderId: 'GLB-2024009', buyer: 'Red-Team-CN',   platform: 'gumroad',   daysAgo: 4,  hour: 9,  status: 'shipped' },
  { orderId: 'XY-2024010', buyer: '甲方-安服刘工',  platform: 'xianyu',    daysAgo: 7,  hour: 10, status: 'shipped' },
  { orderId: 'KS-2024011', buyer: '星球-安全老兵',  platform: 'knowledge', daysAgo: 10, hour: 15, status: 'shipped' },
  { orderId: 'XY-2024012', buyer: '乙方-交付张',    platform: 'xianyu',    daysAgo: 14, hour: 11, status: 'shipped' },
  { orderId: 'GLB-2024013', buyer: 'DE-SecOps',      platform: 'gumroad',   daysAgo: 21, hour: 16, status: 'shipped' },
];

for (const e of extras) {
  existing.push({
    orderId: e.orderId,
    buyer: e.buyer,
    platform: e.platform,
    key: genKey(e.orderId, e.buyer),
    downloadToken: genToken(),
    createdAt: iso(e.daysAgo, e.hour),
    status: e.status,
  });
}

writeFileSync(DB, JSON.stringify(existing, null, 2), 'utf8');

const now = new Date();
const today = existing.filter(o => o.createdAt.slice(0, 10) === now.toISOString().slice(0, 10));
const weekStart = (() => { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; })();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

console.log(`✓ Backfilled to ${existing.length} orders`);
console.log(`  今日:  ${today.length}`);
console.log(`  本周:  ${existing.filter(o => new Date(o.createdAt) >= weekStart).length}`);
console.log(`  本月:  ${existing.filter(o => new Date(o.createdAt) >= monthStart).length}`);
console.log(`  全部:  ${existing.length}`);

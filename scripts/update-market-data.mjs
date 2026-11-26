// Fetches the Rashi monthly price series from the Adike Naadi API and writes a compact
// snapshot to assets/data/rashi-monthly.json for the homepage chart.
// Run: node scripts/update-market-data.mjs   (Node 18+, no dependencies)
// Used daily by .github/workflows/update-market-data.yml. Only rewrites the file when the data changes.
import { readFile, writeFile } from 'node:fs/promises';

const API = 'https://ani-market-api.arecanut.workers.dev/api/v1/history/monthly';
const OUT = new URL('../assets/data/rashi-monthly.json', import.meta.url);
const FROM = '2021-01';

// The API accepts completed months only, so ask up to the previous month (IST).
function lastCompletedMonth(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const d = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function fetchJson(url, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'pramodkumargh777.github.io market-data bot' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.json();
    } catch (err) {
      if (i >= attempts) throw err;
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

const to = lastCompletedMonth();
const url = `${API}?from=${FROM}&to=${to}&variety=Rashi`;
const data = await fetchJson(url);

if (!Array.isArray(data.points) || data.points.length < 12) throw new Error(`Unexpected response from ${url}`);
const points = data.points.map((p) => [p.reporting_month, typeof p.weighted_price === 'number' && p.weighted_price > 0 ? Math.round(p.weighted_price) : null]);
for (let i = 1; i < points.length; i++) {
  if (points[i][0] <= points[i - 1][0]) throw new Error('Months are not in ascending order');
}
if (points.filter(([, v]) => v !== null).length < 12) throw new Error('Too few observed months');

let previous = null;
try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* first run */ }
if (previous && JSON.stringify(previous.points) === JSON.stringify(points)) {
  console.log(`No change: ${points.length} months, latest ${points.at(-1)[0]}`);
  process.exit(0);
}

const snapshot = {
  series: 'Rashi arecanut, Karnataka monthly price',
  variety: data.variety ?? 'Rashi',
  state: data.state ?? 'Karnataka',
  unit: 'INR/quintal',
  measure: 'AGMARKNET arrival-weighted monthly modal price',
  source: 'AGMARKNET via the Adike Naadi API',
  source_url: 'https://adikenaadi.com/monthly-trends',
  fetched_at: new Date().toISOString(),
  points,
};
await writeFile(OUT, JSON.stringify(snapshot, null, 0).replace(/\],\[/g, '],\n[') + '\n');
console.log(`Updated: ${points.length} months, ${points[0][0]} → ${points.at(-1)[0]}, latest ₹${points.at(-1)[1]}`);

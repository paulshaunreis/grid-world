import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';

type Trade = {
  seller_staff_id: string;
  buyer_staff_id: string;
  amount: number;
  currency_id: string;
  trade_type: string;
  status: string;
};

export async function mountStaffMarketActivity(app: HTMLElement) {
  if (!supabaseConfigured) return;
  const sb = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
  const [{ data: trades }, { data: wallets }] = await Promise.all([
    sb.from('grid_staff_market_trades').select('seller_staff_id,buyer_staff_id,amount,currency_id,trade_type,status').order('created_at', { ascending: false }).limit(20),
    sb.from('grid_staff_wallets').select('staff_id,balance,currency_id').eq('currency_id', 'grid').order('balance', { ascending: false }),
  ]);
  if (!trades?.length) return;

  const section = document.createElement('section');
  section.className = 'staff-market-activity';
  section.innerHTML = '<div class="eyebrow">STAFF ECONOMY · SIMULATED</div><h2>The team is already trading.</h2><p>These are internal Grid test transactions using simulated GRD allocations. They have no real-world cash value.</p>';

  const list = document.createElement('div');
  list.className = 'staff-trade-list';
  for (const trade of trades as Trade[]) {
    const row = document.createElement('article');
    row.innerHTML = '<b>' + trade.buyer_staff_id + '</b><span> bought from </span><b>' + trade.seller_staff_id + '</b><strong>' + Number(trade.amount).toLocaleString() + ' GRD</strong><small>' + trade.status + '</small>';
    list.appendChild(row);
  }
  section.appendChild(list);

  if (wallets?.length) {
    const walletBar = document.createElement('div');
    walletBar.className = 'staff-wallet-bar';
    walletBar.textContent = wallets.slice(0, 8).map((wallet) => wallet.staff_id + ': ' + Number(wallet.balance).toLocaleString() + ' GRD').join(' · ');
    section.appendChild(walletBar);
  }

  app.appendChild(section);
}

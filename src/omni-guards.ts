import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
import { diagnoseGuard, GRID_OMNI_TREE_GUARDS } from './core/GridOmniTreeGuard';

type GuardRow = {
  id: string;
  node_id: string;
  display_name: string;
  mission: string;
  status: string;
};

type DiagnosticRow = {
  guard_id: string;
  status: string;
  risk_score: number;
  recommended_action: string;
};

export async function mountOmniGuards(app: HTMLElement) {
  let guards: GuardRow[] = GRID_OMNI_TREE_GUARDS.map((guard) => ({
    id: guard.id,
    node_id: guard.nodeId,
    display_name: guard.nodeId === 'grid-omni-core' ? 'Core Sentinel' : 'Grid Omni ' + guard.serviceId,
    mission: guard.mission,
    status: 'ready',
  }));

  let diagnostics: DiagnosticRow[] = guards.map((guard) => ({
    guard_id: guard.id,
    status: 'clear',
    risk_score: 0,
    recommended_action: 'observe',
  }));

  if (supabaseConfigured) {
    const sb = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
    const [guardResult, diagnosticResult] = await Promise.all([
      sb.from('grid_omni_guards').select('id,node_id,display_name,mission,status').order('display_name'),
      sb.from('grid_omni_guard_diagnostics').select('guard_id,status,risk_score,recommended_action').order('created_at', { ascending: false }),
    ]);
    if (guardResult.data?.length) guards = guardResult.data as GuardRow[];
    if (diagnosticResult.data?.length) diagnostics = diagnosticResult.data as DiagnosticRow[];
  }

  const section = document.createElement('section');
  section.className = 'omni-tree-guards';
  section.innerHTML = '<div class="eyebrow">GRID OMNI CORE · TREE GUARDS</div><h2>Diagnosis happens before the event.</h2><p>Every Core and service node has a dedicated guard. Guards diagnose dependencies, permissions, capacity and anomaly signals before escalation.</p>';

  const tree = document.createElement('div');
  tree.className = 'omni-guard-tree';
  tree.innerHTML = '<strong>◇ Grid Omni Core</strong>' + guards
    .filter((guard) => guard.node_id !== 'grid-omni-core')
    .map((guard) => '<span>└─ ' + guard.display_name + '</span>')
    .join('');
  section.appendChild(tree);

  const grid = document.createElement('div');
  grid.className = 'omni-guard-grid';
  for (const guard of guards) {
    const diagnostic = diagnostics.find((item) => item.guard_id === guard.id);
    const card = document.createElement('article');
    card.className = 'omni-guard-card';
    card.innerHTML = '<small>GUARD · ' + (diagnostic?.status ?? guard.status).toUpperCase() + '</small>' +
      '<h3>' + guard.display_name + '</h3>' +
      '<p>' + guard.mission + '</p>' +
      '<div class="omni-guard-metrics"><span>RISK ' + (diagnostic?.risk_score ?? 0) + '</span><span>' + (diagnostic?.recommended_action ?? 'observe').toUpperCase() + '</span></div>';

    const button = document.createElement('button');
    button.textContent = 'RUN PREFLIGHT';
    button.addEventListener('click', () => {
      const definition = GRID_OMNI_TREE_GUARDS.find((item) => item.id === guard.id);
      if (!definition) return;
      const result = diagnoseGuard(definition, []);
      card.classList.remove('is-diagnosing');
      card.classList.add('is-clear');
      const metrics = card.querySelector('.omni-guard-metrics');
      if (metrics) metrics.textContent = 'RISK ' + result.riskScore + ' · ' + result.status.toUpperCase() + ' · ' + result.recommendedAction.toUpperCase();
    });
    card.appendChild(button);
    grid.appendChild(card);
  }
  section.appendChild(grid);

  const main = app.querySelector('main');
  if (main) main.insertBefore(section, main.firstElementChild);
}

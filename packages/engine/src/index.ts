import type { Workflow } from '@workflow/shared';

export interface ExecutionContext { data: Record<string, unknown>; visited: string[]; }

function interpolate(value: unknown, data: Record<string, unknown>): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(/{{\s*([^}]+)\s*}}/g, (_, key: string) => String(data[key.trim()] ?? ''));
}

export async function executeWorkflow(workflow: Workflow, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const byId = new Map(workflow.nodes.map(node => [node.id, node]));
  const outgoing = new Map<string, Workflow['edges']>();
  for (const edge of workflow.edges) outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge]);
  const starts = workflow.nodes.filter(node => node.type === 'manualTrigger' || !workflow.edges.some(edge => edge.target === node.id));
  const context: ExecutionContext = { data: { ...input }, visited: [] };
  const queue = starts.map(node => node.id);

  while (queue.length) {
    const id = queue.shift()!;
    if (context.visited.includes(id)) continue;
    const node = byId.get(id);
    if (!node) continue;
    context.visited.push(id);

    if (node.type === 'set') {
      const key = String(node.data.key ?? 'value');
      context.data[key] = interpolate(node.data.value, context.data);
    } else if (node.type === 'httpRequest') {
      const url = String(interpolate(node.data.url, context.data));
      if (!url) throw new Error(`HTTP Request node ${node.id} has no URL`);
      const response = await fetch(url, { method: String(node.data.method ?? 'GET') });
      const text = await response.text();
      try { context.data.response = JSON.parse(text); } catch { context.data.response = text; }
      context.data.statusCode = response.status;
      if (!response.ok) throw new Error(`HTTP request failed with status ${response.status}`);
    }

    for (const edge of outgoing.get(id) ?? []) {
      if (node.type === 'if') {
        const condition = Boolean(context.data[String(node.data.key ?? '')]);
        const branch = condition ? 'true' : 'false';
        if (edge.sourceHandle && edge.sourceHandle !== branch) continue;
      }
      queue.push(edge.target);
    }
  }
  return context.data;
}

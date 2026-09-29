import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { workflowSchema, type Workflow, type Execution } from '@workflow/shared';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
const workflows = new Map<string, Workflow>();
const executions = new Map<string, Execution>();

const sample: Workflow = { id: 'welcome', name: 'Welcome workflow', active: false, nodes: [{ id: 'trigger', type: 'manualTrigger', position: { x: 80, y: 100 }, data: {} }, { id: 'set', type: 'set', position: { x: 350, y: 100 }, data: { key: 'message', value: 'Hello from your workflow' } }], edges: [{ id: 'e1', source: 'trigger', target: 'set' }] };
workflows.set(sample.id, sample);

app.get('/health', async () => ({ ok: true }));
app.get('/api/workflows', async () => [...workflows.values()]);
app.get('/api/workflows/:id', async (request, reply) => { const workflow = workflows.get((request.params as { id: string }).id); return workflow ?? reply.code(404).send({ error: 'Workflow not found' }); });
app.post('/api/workflows', async (request, reply) => { const parsed = workflowSchema.safeParse({ ...(request.body as object), id: randomUUID() }); if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() }); workflows.set(parsed.data.id, parsed.data); return reply.code(201).send(parsed.data); });
app.put('/api/workflows/:id', async (request, reply) => { const id = (request.params as { id: string }).id; const parsed = workflowSchema.safeParse({ ...(request.body as object), id }); if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() }); workflows.set(id, parsed.data); return parsed.data; });
app.post('/api/workflows/:id/execute', async (request, reply) => { const workflow = workflows.get((request.params as { id: string }).id); if (!workflow) return reply.code(404).send({ error: 'Workflow not found' }); const execution: Execution = { id: randomUUID(), workflowId: workflow.id, status: 'running', startedAt: new Date().toISOString() }; executions.set(execution.id, execution); try { const output = await execute(workflow, (request.body ?? {}) as Record<string, unknown>); execution.status = 'success'; execution.output = output; } catch (error) { execution.status = 'failed'; execution.error = error instanceof Error ? error.message : String(error); } execution.finishedAt = new Date().toISOString(); return execution; });
app.get('/api/executions/:id', async (request, reply) => { const execution = executions.get((request.params as { id: string }).id); return execution ?? reply.code(404).send({ error: 'Execution not found' }); });

async function execute(workflow: Workflow, input: Record<string, unknown>) { let data: Record<string, unknown> = { ...input }; const ordered = [...workflow.nodes].sort((a, b) => a.position.x - b.position.x); for (const node of ordered) { if (node.type === 'set') data[String(node.data.key ?? 'value')] = node.data.value; if (node.type === 'httpRequest') { const response = await fetch(String(node.data.url)); data.response = await response.json().catch(() => response.text()); } if (node.type === 'if' && !Boolean(data[String(node.data.key ?? '')])) break; } return data; }

app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' }).catch((error) => { app.log.error(error); process.exit(1); });

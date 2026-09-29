import { z } from 'zod';

export const nodeTypes = ['manualTrigger', 'httpRequest', 'set', 'if'] as const;
export type NodeType = typeof nodeTypes[number];
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export const workflowNodeSchema = z.object({
  id: z.string(), type: z.enum(nodeTypes), position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()).default({})
});
export const workflowEdgeSchema = z.object({ id: z.string(), source: z.string(), target: z.string(), sourceHandle: z.string().optional() });
export const workflowSchema = z.object({ id: z.string(), name: z.string().min(1), active: z.boolean(), nodes: z.array(workflowNodeSchema), edges: z.array(workflowEdgeSchema) });
export type Workflow = z.infer<typeof workflowSchema>;
export type ExecutionStatus = 'running' | 'success' | 'failed';
export interface Execution { id: string; workflowId: string; status: ExecutionStatus; startedAt: string; finishedAt?: string; output?: unknown; error?: string; }

export const nodeCatalog: Array<{ type: NodeType; label: string; description: string }> = [
  { type: 'manualTrigger', label: 'Manual Trigger', description: 'Start a workflow manually' },
  { type: 'httpRequest', label: 'HTTP Request', description: 'Call an HTTP endpoint' },
  { type: 'set', label: 'Set Value', description: 'Add or overwrite data' },
  { type: 'if', label: 'If', description: 'Branch on a condition' }
];

# Extending the Platform

## Creating Custom Nodes

Nodes are defined in `packages/shared/src/index.ts`. To add a new node type:

### 1. Add to node types

```typescript
export const nodeTypes = ['manualTrigger', 'httpRequest', 'set', 'if', 'yourNodeType'] as const;
```

### 2. Add to node catalog

```typescript
export const nodeCatalog = [
  // existing nodes...
  { type: 'yourNodeType', label: 'Your Node', description: 'What it does' }
];
```

### 3. Implement in execution engine

In `packages/engine/src/index.ts`:

```typescript
if (node.type === 'yourNodeType') {
  // implement logic
  context.data.result = someValue;
}
```

### Example: Database Query Node

**Define:**
```typescript
export const nodeTypes = ['manualTrigger', 'httpRequest', 'set', 'if', 'databaseQuery'] as const;

export const nodeCatalog = [
  // existing...
  { type: 'databaseQuery', label: 'Database Query', description: 'Execute SQL' }
];
```

**Implement in engine:**
```typescript
if (node.type === 'databaseQuery') {
  const query = String(node.data.query);
  const connection = getConnection(); // implement
  const results = await connection.query(query);
  context.data.queryResult = results;
}
```

**Use in UI:**
The new node type is automatically available in the sidebar.

## Adding Authentication

### API key storage

Create a credentials service in `packages/credentials`:

```typescript
export interface Credential {
  id: string;
  type: 'apiKey' | 'oauth' | 'basic';
  name: string;
  secret: string; // encrypted
}

export const credentials = new Map<string, Credential>();
```

### Use in HTTP requests

```json
{
  "url": "https://api.example.com/data",
  "method": "GET",
  "credentialId": "my-api-key"
}
```

## Database Integration

Replace in-memory maps in `apps/api/src/server.ts`:

```typescript
// Before:
const workflows = new Map<string, Workflow>();

// After:
import { db } from './db';
const workflows = db.workflow; // from PostgreSQL
```

## Job Queue Integration

For scalable execution, replace inline execution with BullMQ:

```typescript
import Queue from 'bull';

const executionQueue = new Queue('workflow-execution', 'redis://localhost:6379');

app.post('/api/workflows/:id/execute', async (request, reply) => {
  // instead of:
  // await executeWorkflow(workflow, input);
  
  // queue the job:
  const job = await executionQueue.add({ workflowId: workflow.id, input }, { delay: 1000 });
  return { jobId: job.id };
});

executionQueue.process(async (job) => {
  const workflow = await getWorkflow(job.data.workflowId);
  return await executeWorkflow(workflow, job.data.input);
});
```

## Frontend Customization

### Add new node panel

In `apps/web/src/main.tsx`:

```typescript
const nodeCategories = {
  triggers: ['manualTrigger'],
  data: ['set', 'databaseQuery'],
  logic: ['if'],
  integrations: ['httpRequest']
};
```

### Custom node rendering

Create `apps/web/src/nodes` directory and implement custom React components for each node type.

# Architecture

## Request flow

The React editor loads and saves workflows through the Fastify REST API. The API validates workflow documents with Zod and passes execution requests to `packages/engine`.

## Execution engine

The engine traverses the workflow graph from trigger/root nodes. It supports:

- `manualTrigger`: starts execution
- `set`: writes a value to the execution context and supports `{{key}}` interpolation
- `httpRequest`: performs a fetch and stores `response` and `statusCode`
- `if`: routes edges whose `sourceHandle` is `true` or `false`

The current repository is intentionally in-memory. For production, introduce repositories backed by PostgreSQL and move executions to a worker queue such as BullMQ.

## API

- `GET /health`
- `GET /api/workflows`
- `POST /api/workflows`
- `GET /api/workflows/:id`
- `PUT /api/workflows/:id`
- `POST /api/workflows/:id/execute`
- `GET /api/executions/:id`

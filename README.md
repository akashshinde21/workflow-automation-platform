# Workflow Automation Platform

An n8n-inspired workflow automation MVP built with TypeScript, Fastify, React, and React Flow.

## Features

- Visual workflow editor
- HTTP Request, Manual Trigger, Set, and If nodes
- In-memory execution engine
- REST API for workflows and executions
- Docker Compose development setup

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API runs on http://localhost:3001.

## Structure

- `apps/api` - Fastify API and workflow runtime
- `apps/web` - React visual editor
- `packages/shared` - shared types and node definitions

This is an MVP foundation. Replace the in-memory repository with PostgreSQL and add a queue such as BullMQ for production workloads.

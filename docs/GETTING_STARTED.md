# Getting Started with Workflow Automation Platform

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Clone and Install

```bash
git clone -b feat/mvp-scaffold https://github.com/akashshinde21/workflow-automation-platform.git
cd workflow-automation-platform
npm install
```

## Development

### Start the development server

```bash
npm run dev
```

This starts two services:
- **API** on `http://localhost:3001`
- **Web UI** on `http://localhost:5173`

### Build for production

```bash
npm run build
```

### Type checking

```bash
npm run typecheck
```

## Using the Platform

### Web Editor

Open `http://localhost:5173` to access the visual workflow editor.

#### Creating a Workflow

1. **Load a sample**: The "Welcome workflow" is pre-loaded
2. **Add nodes** from the left sidebar:
   - **Manual Trigger**: Starts the workflow (entry point)
   - **Set Value**: Store data in variables
   - **HTTP Request**: Fetch data from APIs
   - **If**: Branch based on conditions
3. **Connect nodes** by dragging from output to input
4. **Configure nodes** by clicking them (edit `data` object)
5. **Save** with the Save button
6. **Execute** with the Execute button

### Example Workflows

#### 1. Fetch GitHub User Data

**Nodes:**
```
Manual Trigger → HTTP Request → Set Value
```

**HTTP Request config:**
```json
{
  "url": "https://api.github.com/users/akashshinde21",
  "method": "GET"
}
```

**Set Value config:**
```json
{
  "key": "username",
  "value": "{{response.login}}"
}
```

#### 2. Conditional Logic

**Nodes:**
```
Manual Trigger → Set Value → If → [True: Set Value, False: Set Value]
```

**First Set Value:**
```json
{
  "key": "score",
  "value": 85
}
```

**If node:**
```json
{
  "key": "score"
}
```

**True branch Set Value:**
```json
{
  "key": "result",
  "value": "Pass"
}
```

**False branch Set Value:**
```json
{
  "key": "result",
  "value": "Fail"
}
```

## REST API

### Get all workflows

```bash
curl http://localhost:3001/api/workflows
```

### Get a specific workflow

```bash
curl http://localhost:3001/api/workflows/welcome
```

### Create a new workflow

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workflow",
    "active": false,
    "nodes": [
      {
        "id": "trigger",
        "type": "manualTrigger",
        "position": { "x": 80, "y": 100 },
        "data": {}
      },
      {
        "id": "set",
        "type": "set",
        "position": { "x": 350, "y": 100 },
        "data": { "key": "greeting", "value": "Hello" }
      }
    ],
    "edges": [
      { "id": "e1", "source": "trigger", "target": "set" }
    ]
  }'
```

### Execute a workflow

```bash
curl -X POST http://localhost:3001/api/workflows/welcome/execute \
  -H "Content-Type: application/json" \
  -d '{"input_key": "input_value"}'
```

Response:
```json
{
  "id": "execution-uuid",
  "workflowId": "welcome",
  "status": "success",
  "startedAt": "2024-01-15T10:30:00Z",
  "finishedAt": "2024-01-15T10:30:05Z",
  "output": {
    "message": "Hello from your workflow"
  }
}
```

### Get execution status

```bash
curl http://localhost:3001/api/executions/{execution-id}
```

## Node Reference

### Manual Trigger

**Type:** `manualTrigger`  
**Purpose:** Entry point for workflow execution  
**Data:** None

### Set Value

**Type:** `set`  
**Purpose:** Store or transform data  
**Data:**
```json
{
  "key": "variable_name",
  "value": "any value or {{interpolation}}"
}
```

**Interpolation:** Use `{{key}}` to reference other variables:
```json
{
  "key": "full_name",
  "value": "{{first_name}} {{last_name}}"
}
```

### HTTP Request

**Type:** `httpRequest`  
**Purpose:** Call external APIs  
**Data:**
```json
{
  "url": "https://api.example.com/data",
  "method": "GET"
}
```

**Output:**
- `response`: Parsed JSON or text
- `statusCode`: HTTP status code

### If

**Type:** `if`  
**Purpose:** Conditional branching  
**Data:**
```json
{
  "key": "variable_to_check"
}
```

**Branching:**
- Edge with `sourceHandle: "true"` → executed if variable is truthy
- Edge with `sourceHandle: "false"` → executed if variable is falsy

## Docker

### Using Docker Compose

```bash
docker-compose up
```

This starts both API and Web services in containers.

## Next Steps

1. **Create your first workflow** in the visual editor
2. **Connect nodes** to build logic
3. **Save and execute** to test
4. **Check execution logs** in the API response
5. **Extend with custom nodes** (coming soon)

## Troubleshooting

### Port already in use

Change port in `.env`:
```
PORT=3002
```

### API not responding

Check API is running:
```bash
curl http://localhost:3001/health
```

### Build errors

Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

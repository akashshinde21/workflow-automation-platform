import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlow, Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState, type Connection, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeCatalog, type Workflow } from '@workflow/shared';
import './style.css';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
function App() { const [workflow, setWorkflow] = useState<Workflow>(); const [nodes, setNodes, onNodesChange] = useNodesState([]); const [edges, setEdges, onEdgesChange] = useEdgesState([]); const [status, setStatus] = useState('Ready');
  useEffect(() => { fetch(`${API}/api/workflows/welcome`).then(r => r.json()).then((w: Workflow) => { setWorkflow(w); setNodes(w.nodes as Node[]); setEdges(w.edges); }); }, [setNodes, setEdges]);
  const onConnect = useCallback((connection: Connection) => setEdges(es => addEdge(connection, es)), [setEdges]);
  const addNode = (type: string) => setNodes(ns => [...ns, { id: `${type}-${Date.now()}`, type: 'default', position: { x: 180 + ns.length * 40, y: 220 }, data: { label: nodeCatalog.find(n => n.type === type)?.label ?? type, ...(type === 'set' ? { key: 'value', value: 'new value' } : {}) } }]);
  const save = async () => { if (!workflow) return; setStatus('Saving...'); const updated = { ...workflow, nodes, edges }; const response = await fetch(`${API}/api/workflows/${workflow.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(updated) }); setWorkflow(await response.json()); setStatus('Saved'); };
  const execute = async () => { if (!workflow) return; setStatus('Executing...'); const response = await fetch(`${API}/api/workflows/${workflow.id}/execute`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }); const result = await response.json(); setStatus(`${result.status}${result.error ? `: ${result.error}` : ''}`); };
  return <main><header><div><h1>Workflow Studio</h1><span>{workflow?.name ?? 'Loading...'}</span></div><div className="actions"><span>{status}</span><button onClick={save}>Save</button><button className="primary" onClick={execute}>Execute</button></div></header><section className="layout"><aside><h2>Nodes</h2>{nodeCatalog.map(n => <button className="nodeButton" key={n.type} onClick={() => addNode(n.type)}><b>{n.label}</b><small>{n.description}</small></button>)}</aside><div className="canvas"><ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView><Background /><Controls /><MiniMap /></ReactFlow></div></section></main> }
createRoot(document.getElementById('root')!).render(<App />);

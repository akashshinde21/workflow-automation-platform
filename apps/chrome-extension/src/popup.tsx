import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { type Workflow } from '@workflow/shared';

interface StoredWorkflow extends Workflow {
  localStorage: boolean;
}

function Popup() {
  const [workflows, setWorkflows] = useState<StoredWorkflow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get('workflows', (result) => {
      setWorkflows(result.workflows || []);
    });
  }, []);

  const saveWorkflow = () => {
    if (!name.trim()) return;
    const newWorkflow: StoredWorkflow = {
      id: Date.now().toString(),
      name,
      active: false,
      nodes: [{ id: 'start', type: 'manualTrigger', position: { x: 80, y: 100 }, data: {} }],
      edges: [],
      localStorage: true
    };
    const updated = [...workflows, newWorkflow];
    chrome.storage.local.set({ workflows: updated });
    setWorkflows(updated);
    setName('');
    setShowForm(false);
  };

  const deleteWorkflow = (id: string) => {
    const updated = workflows.filter(w => w.id !== id);
    chrome.storage.local.set({ workflows: updated });
    setWorkflows(updated);
  };

  const openEditor = (workflow: StoredWorkflow) => {
    chrome.storage.local.set({ currentWorkflow: workflow });
    chrome.tabs.create({ url: chrome.runtime.getURL('editor.html') });
  };

  const executeWorkflow = async (workflow: StoredWorkflow) => {
    setExecuting(workflow.id);
    try {
      // Execute locally in-memory
      let data: Record<string, unknown> = {};
      for (const node of workflow.nodes) {
        if (node.type === 'set') {
          data[String(node.data.key ?? 'value')] = node.data.value;
        } else if (node.type === 'httpRequest') {
          const response = await fetch(String(node.data.url));
          data.response = await response.json().catch(() => response.text());
        }
      }
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icon-128.png'),
        title: 'Workflow Complete',
        message: `${workflow.name} executed successfully`
      });
    } catch (error) {
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icon-128.png'),
        title: 'Workflow Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Workflow Studio</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.button}>
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Workflow name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <button onClick={saveWorkflow} style={{ ...styles.button, ...styles.primaryButton }}>
            Create
          </button>
        </div>
      )}

      <div style={styles.list}>
        {workflows.length === 0 ? (
          <p style={styles.empty}>No workflows yet. Create one to get started!</p>
        ) : (
          workflows.map((workflow) => (
            <div key={workflow.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <h3 style={styles.itemTitle}>{workflow.name}</h3>
                <p style={styles.itemMeta}>{workflow.nodes.length} nodes</p>
              </div>
              <div style={styles.itemActions}>
                <button
                  onClick={() => openEditor(workflow)}
                  style={styles.smallButton}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => executeWorkflow(workflow)}
                  disabled={executing === workflow.id}
                  style={styles.smallButton}
                  title="Execute"
                >
                  {executing === workflow.id ? '⏳' : '▶️'}
                </button>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  style={styles.smallButton}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' as const, backgroundColor: '#0f172a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #263247' },
  title: { fontSize: '16px', fontWeight: '600' as const, margin: 0 },
  button: { padding: '6px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#e5e7eb', cursor: 'pointer', fontSize: '13px' },
  primaryButton: { backgroundColor: '#7c3aed', borderColor: '#8b5cf6' },
  form: { display: 'flex', gap: '8px', marginBottom: '12px' },
  input: { flex: 1, padding: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#e5e7eb', fontSize: '13px' },
  list: { flex: 1, overflowY: 'auto' as const },
  empty: { textAlign: 'center' as const, color: '#94a3b8', marginTop: '20px', fontSize: '13px' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#1e293b', marginBottom: '8px', borderRadius: '6px', border: '1px solid #263247' },
  itemInfo: { flex: 1 },
  itemTitle: { margin: 0, fontSize: '14px', fontWeight: '500' as const },
  itemMeta: { margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' },
  itemActions: { display: 'flex', gap: '6px' },
  smallButton: { padding: '4px 8px', backgroundColor: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

createRoot(document.getElementById('root')!).render(<Popup />);

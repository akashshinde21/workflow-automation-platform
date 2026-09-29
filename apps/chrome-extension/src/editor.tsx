import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { type Workflow } from '@workflow/shared';

function Editor() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [output, setOutput] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get('currentWorkflow', (result) => {
      if (result.currentWorkflow) {
        setWorkflow(result.currentWorkflow);
      }
      setLoading(false);
    });
  }, []);

  const updateWorkflow = (updated: Workflow) => {
    setWorkflow(updated);
    chrome.storage.local.set({ currentWorkflow: updated });
  };

  const executeWorkflow = async () => {
    if (!workflow) return;
    let data: Record<string, unknown> = {};
    for (const node of workflow.nodes) {
      if (node.type === 'set') {
        const value = node.data.value;
        data[String(node.data.key ?? 'value')] = value;
      } else if (node.type === 'httpRequest') {
        try {
          const response = await fetch(String(node.data.url));
          data.response = await response.json().catch(() => response.text());
          data.statusCode = response.status;
        } catch (error) {
          data.error = error instanceof Error ? error.message : 'HTTP error';
        }
      }
    }
    setOutput(data);
  };

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (!workflow) return <div style={styles.container}>No workflow found</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>{workflow.name}</h1>
        <button onClick={executeWorkflow} style={styles.executeButton}>
          ▶️ Execute
        </button>
      </header>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Nodes ({workflow.nodes.length})</h2>
          <div style={styles.nodesList}>
            {workflow.nodes.map((node) => (
              <div key={node.id} style={styles.nodeItem}>
                <strong>{node.type}</strong>
                <small>{node.id}</small>
                <pre style={styles.pre}>{JSON.stringify(node.data, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Edges ({workflow.edges.length})</h2>
          <div style={styles.nodesList}>
            {workflow.edges.length === 0 ? (
              <p style={styles.empty}>No connections</p>
            ) : (
              workflow.edges.map((edge) => (
                <div key={edge.id} style={styles.nodeItem}>
                  <span>{edge.source} → {edge.target}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {output && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Execution Output</h2>
            <pre style={styles.output}>{JSON.stringify(output, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'system-ui', color: '#e5e7eb', backgroundColor: '#0f172a', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #263247' },
  title: { margin: 0, fontSize: '24px', fontWeight: '600' as const },
  executeButton: { padding: '10px 20px', backgroundColor: '#7c3aed', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' as const },
  content: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  section: { padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #263247' },
  sectionTitle: { margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' as const, color: '#94a3b8' },
  nodesList: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  nodeItem: { padding: '8px', backgroundColor: '#0f172a', borderRadius: '4px', fontSize: '12px', border: '1px solid #334155' },
  pre: { margin: '4px 0 0 0', fontSize: '11px', backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px', overflow: 'auto' as const, maxHeight: '200px' },
  output: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' as const, maxHeight: '300px', border: '1px solid #7c3aed' },
  empty: { fontSize: '13px', color: '#94a3b8' }
};

createRoot(document.getElementById('root')!).render(<Editor />);

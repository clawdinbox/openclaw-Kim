import React from 'react';

const Page = () => {
  const kanbanData = {
    backlog: [
      { id: 1, text: 'Website MarcelMelzig.com: Finalize content' },
      { id: 2, text: 'Build Ebook PDF structure' },
    ],
    doing: [
      { id: 3, text: 'Second Brain UI improvements' },
      { id: 4, text: 'Add search to Second Brain' },
    ],
    done: [
      { id: 5, text: 'Cron repo fix (clawdinbox/openclaw-Kim)' },
      { id: 6, text: 'Base Next.js setup for Second Brain' },
    ],
  };

  return (
    <main style={{ padding: '24px', maxWidth: '980px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: 600 }}>Second Brain</h1>
      <p style={{ opacity: 0.85, marginBottom: '24px' }}>
        Your Mission Control for projects, documentation, and insights.
      </p>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Kanban</h2>
        <div className="kanban-container">
          <div className="kanban-column">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>Backlog</h3>
            {kanbanData.backlog.map(task => (
              <div key={task.id} className="kanban-card">
                {task.text}
              </div>
            ))}
          </div>
          <div className="kanban-column">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>Doing</h3>
            {kanbanData.doing.map(task => (
              <div key={task.id} className="kanban-card">
                {task.text}
              </div>
            ))}
          </div>
          <div className="kanban-column">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>Done</h3>
            {kanbanData.done.map(task => (
              <div key={task.id} className="kanban-card">
                {task.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Documents</h2>
        <p style={{ opacity: 0.85 }}>
          This section will link to your documented concepts and memory files managed via <code>/Users/clawdmm/.openclaw/workspace/documents</code> and memory logs.
        </p>
      </section>
    </main>
  );
};

export default Page;

/**
 * Loading Indicator Component
 * Built with Google Antigravity & Vertex AI
 *
 * Displays a pulsing animation while the agent is processing a response.
 */

export default function LoadingIndicator() {
  return (
    <div
      className="loading-indicator"
      role="status"
      aria-label="Thinking"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'var(--surface-variant)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        width: 'fit-content',
        border: '1px solid var(--primary-light)',
        margin: '10px 0',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 0 15px var(--primary-light)',
          animation: 'pulse-glow 2s infinite ease-in-out',
        }}
        aria-hidden="true"
      >
        ✨
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--on-surface)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          Thinking
          <span className="dots-container" style={{ display: 'flex', gap: '2px' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </span>
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-secondary)' }}>
          Processing with Vertex AI...
        </span>
      </div>
    </div>
  );
}

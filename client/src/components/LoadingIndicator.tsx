/**
 * Loading Indicator - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 */
const PHRASES = ['Thinking', 'Consulting ECI data', 'Analyzing your question', 'Preparing response'];

export default function LoadingIndicator() {
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  return (
    <div className="loading-indicator" role="status" aria-label="AI is thinking" aria-live="polite"
      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 0', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9933, #138808)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }} aria-hidden="true">
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,0.6)', position: 'absolute', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.7rem', zIndex: 1 }}>🇮🇳</span>
      </div>
      <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--outline)', borderRadius: '20px 20px 20px 4px', padding: '12px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1rem', animation: 'sparkle 1.5s ease-in-out infinite', display: 'inline-block' }} aria-hidden="true">✨</span>
        <span style={{ color: 'var(--on-surface-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{phrase}</span>
        <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (<span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`, display: 'inline-block' }} />))}
        </span>
      </div>
      <span className="sr-only">AI is processing your question...</span>
    </div>
  );
}

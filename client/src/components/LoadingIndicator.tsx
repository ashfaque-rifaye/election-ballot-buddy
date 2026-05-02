/**
 * Loading Indicator Component
 * Built with Google Antigravity & Vertex AI
 *
 * Displays a pulsing animation while the agent is processing a response.
 */
import React from 'react';

export default function LoadingIndicator() {
  return (
    <div
      className="loading-indicator"
      role="status"
      aria-label="Loading response"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '12px 16px',
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#1a73e8',
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            display: 'inline-block',
          }}
        />
      ))}
      <span className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
        Processing your question...
      </span>
    </div>
  );
}

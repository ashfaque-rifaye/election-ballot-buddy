/**
 * FAQ Card - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 */
import React, { useState } from 'react';
import { FAQCard as FAQCardType } from '@shared/types';

export default function FAQCard({ card }: { card: FAQCardType }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="faq-card" role="region" aria-label={`FAQ: ${card.question}`}
      style={{ backgroundColor: 'var(--primary-light)', borderRadius: '10px', padding: '14px 16px', margin: '8px 0', border: '1px solid var(--outline)' }}>
      <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span aria-hidden="true">❓</span>{card.question}
        </span>
        <span aria-hidden="true" style={{ transition: 'transform 200ms ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.7rem', flexShrink: 0 }}>▼</span>
      </button>
      {expanded && (
        <div role="region" aria-label="Answer" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--outline)', color: 'var(--on-surface-secondary)', lineHeight: 1.65, fontSize: '0.85rem' }}>
          {card.answer}
        </div>
      )}
    </div>
  );
}

/**
 * FAQ Card Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders an FAQ question with an expandable answer.
 * Includes ARIA labels and keyboard navigation.
 */
import React, { useState } from 'react';
import { FAQCard as FAQCardType } from '@shared/types';

interface FAQCardProps {
  card: FAQCardType;
}

export default function FAQCard({ card }: FAQCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <div
      className="faq-card"
      role="region"
      aria-label={`FAQ: ${card.question}`}
      style={{
        backgroundColor: 'var(--surface-variant)',
        backdropFilter: 'blur(8px)',
        borderRadius: '10px',
        padding: '14px 16px',
        margin: '8px 0',
        border: '1px solid var(--primary-light)',
        transition: 'all 200ms ease',
      }}
    >
      <button
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        aria-expanded={expanded}
        aria-controls="faq-answer"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          padding: 0,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span aria-hidden="true" style={{ fontSize: '0.9rem' }}>❓</span>
          {card.question}
        </span>
        <span
          aria-hidden="true"
          style={{
            transition: 'transform 200ms ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.7rem',
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>
      {expanded && (
        <div
          id="faq-answer"
          role="region"
          aria-label="Answer"
          style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid var(--outline)',
            color: 'var(--on-surface-secondary)',
            lineHeight: 1.65,
            fontSize: '0.85rem',
          }}
        >
          {card.answer}
        </div>
      )}
    </div>
  );
}

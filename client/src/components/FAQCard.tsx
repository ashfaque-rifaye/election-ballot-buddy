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
        backgroundColor: '#e8f0fe',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '8px 0',
        border: '1px solid #d2e3fc',
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
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#1a73e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{card.question}</span>
        <span aria-hidden="true">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div
          id="faq-answer"
          role="region"
          aria-label="Answer"
          style={{
            marginTop: '8px',
            color: '#3c4043',
            lineHeight: 1.6,
            fontSize: '0.875rem',
          }}
        >
          {card.answer}
        </div>
      )}
    </div>
  );
}

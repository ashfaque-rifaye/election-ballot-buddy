/**
 * Polling Location Card Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders polling station info with name, address,
 * and a link to Google Maps directions.
 */
import React from 'react';
import { PollingLocationCard as PollingLocationCardType } from '@shared/types';

interface PollingLocationCardProps {
  card: PollingLocationCardType;
}

export default function PollingLocationCard({ card }: PollingLocationCardProps) {
  return (
    <div
      className="polling-location-card"
      role="region"
      aria-label={`Polling station: ${card.name}`}
      style={{
        backgroundColor: 'var(--surface-variant)',
        backdropFilter: 'blur(8px)',
        borderRadius: '10px',
        padding: '14px 16px',
        margin: '8px 0',
        border: '1px solid rgba(255, 183, 3, 0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>📍</span>
        <strong style={{ color: 'var(--on-surface)', fontSize: '0.9rem' }}>{card.name}</strong>
      </div>
      <p style={{ color: 'var(--on-surface-secondary)', margin: '4px 0 10px 0', fontSize: '0.85rem', paddingLeft: '28px' }}>
        {card.address}
      </p>
      <a
        href={card.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get directions to ${card.name} on Google Maps`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--primary)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          paddingLeft: '28px',
        }}
        tabIndex={0}
      >
        Get Directions
        <span aria-hidden="true" style={{ fontSize: '0.75rem' }}>→</span>
      </a>
    </div>
  );
}

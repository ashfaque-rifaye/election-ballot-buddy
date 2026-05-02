/**
 * Polling Location Card Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders polling station info with name, address,
 * and a link to Google Maps directions.
 * Property 6: Card contains name, address, and maps URL.
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
        backgroundColor: '#fef7e0',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '8px 0',
        border: '1px solid #fdd663',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>📍</span>
        <strong style={{ color: '#3c4043', fontSize: '0.95rem' }}>{card.name}</strong>
      </div>
      <p
        style={{
          color: '#5f6368',
          margin: '4px 0 8px 0',
          fontSize: '0.875rem',
        }}
      >
        {card.address}
      </p>
      <a
        href={card.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get directions to ${card.name} on Google Maps`}
        style={{
          color: '#1a73e8',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
        tabIndex={0}
      >
        Get Directions →
      </a>
    </div>
  );
}

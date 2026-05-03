/**
 * Polling Location Card - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 */
import { PollingLocationCard as PollingLocationCardType } from '@shared/types';

export default function PollingLocationCard({ card }: { card: PollingLocationCardType }) {
  return (
    <div className="polling-location-card" role="region" aria-label={`Polling station: ${card.name}`}
      style={{ backgroundColor: 'var(--accent-light)', borderRadius: '10px', padding: '14px 16px', margin: '8px 0', border: '1px solid var(--outline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>📍</span>
        <strong style={{ color: 'var(--on-surface)', fontSize: '0.9rem' }}>{card.name}</strong>
      </div>
      <p style={{ color: 'var(--on-surface-secondary)', margin: '4px 0 10px 0', fontSize: '0.85rem', paddingLeft: '28px' }}>{card.address}</p>
      <a href={card.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${card.name} on Google Maps`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, paddingLeft: '28px' }} tabIndex={0}>
        Get Directions <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

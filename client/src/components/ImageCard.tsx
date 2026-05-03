/**
 * Image Card - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 *
 * Renders images with robust fallback chain:
 * 1. Try original URL (no crossOrigin to avoid CORS)
 * 2. On failure, try Pollinations with simplified prompt
 * 3. Final fallback: themed SVG placeholder with alt text
 */
import { useState, useEffect } from 'react';
import { ImageCard as ImageCardType } from '@shared/types';

interface ImageCardProps {
  card: ImageCardType;
}

/** Extract keywords from a Pollinations URL for retry */
function extractPromptFromUrl(url: string): string {
  try {
    const match = url.match(/pollinations\.ai\/prompt\/([^?]+)/);
    if (match) return decodeURIComponent(match[1]).replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
  } catch { /* ignore */ }
  return 'indian election voting democracy';
}

export default function ImageCard({ card }: ImageCardProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'fallback' | 'placeholder'>('loading');
  const [currentSrc, setCurrentSrc] = useState(card.url);

  useEffect(() => {
    setStatus('loading');
    setCurrentSrc(card.url);
  }, [card.url]);

  const handleLoad = () => setStatus('loaded');

  const handleError = () => {
    if (status === 'loading') {
      // Try Pollinations fallback with clean prompt
      const keywords = extractPromptFromUrl(card.url);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(keywords + ' flat illustration clean')}?width=700&height=400&nologo=true`;
      setCurrentSrc(fallbackUrl);
      setStatus('fallback');
    } else {
      // All image sources failed — show SVG placeholder
      setStatus('placeholder');
    }
  };

  return (
    <div className="image-card" role="figure" aria-label={card.alt}
      style={{
        borderRadius: '12px', overflow: 'hidden', margin: '10px 0',
        border: '1px solid var(--outline)', backgroundColor: 'var(--surface-card)',
        animation: 'fadeIn 0.4s ease-out',
      }}>

      {status === 'placeholder' ? (
        /* SVG Placeholder — always renders, no network dependency */
        <div style={{
          padding: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
          minHeight: '160px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="var(--primary)" strokeWidth="1.5" fill="var(--primary-light)" />
            <circle cx="8" cy="9" r="2" fill="var(--primary)" opacity="0.6" />
            <path d="M2 15l5-4 3 3 4-5 8 6" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
          </svg>
          <p style={{ color: 'var(--on-surface-secondary)', fontSize: '0.85rem', fontWeight: 500, maxWidth: '280px' }}>
            {card.alt}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-tertiary)' }}>
            Image unavailable — {card.caption || 'visual reference'}
          </span>
        </div>
      ) : (
        <div style={{
          position: 'relative', width: '100%',
          minHeight: status === 'loaded' ? 'auto' : '180px',
          backgroundColor: 'var(--surface-dim)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {(status === 'loading' || status === 'fallback') && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: 'var(--on-surface-tertiary)', fontSize: '0.8rem',
            }}>
              <div style={{
                width: '24px', height: '24px',
                border: '3px solid var(--outline)', borderTopColor: 'var(--primary)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              {status === 'fallback' ? 'Trying alternate source...' : 'Loading image...'}
            </div>
          )}
          <img
            src={currentSrc}
            alt={card.alt}
            onLoad={handleLoad}
            onError={handleError}
            referrerPolicy="no-referrer"
            style={{
              width: '100%', maxHeight: '400px', objectFit: 'cover',
              display: status === 'loaded' ? 'block' : 'none',
            }}
          />
        </div>
      )}

      {card.caption && (
        <div style={{
          padding: '10px 14px', fontSize: '0.8rem',
          color: 'var(--on-surface-secondary)', lineHeight: 1.5,
          borderTop: '1px solid var(--outline)',
        }}>
          📸 {card.caption}
        </div>
      )}
    </div>
  );
}

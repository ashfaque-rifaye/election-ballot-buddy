/**
 * Timeline View Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders election milestones in chronological order with
 * "Set Reminder" buttons for Google Calendar integration.
 */
import { useState, useEffect } from 'react';
import { Milestone } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { getTimeline, createReminder } from '../services/apiClient';
import LoadingIndicator from './LoadingIndicator';

const PHASE_COLORS: Record<string, string> = {
  registration: '#4285F4',
  campaigning: '#FBBC04',
  voting: '#34A853',
  counting: '#EA4335',
  certification: '#9C27B0',
};

function getPhaseColor(phaseName: string): string {
  const lower = phaseName.toLowerCase();
  for (const [key, color] of Object.entries(PHASE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#4285F4';
}

export default function TimelineView() {
  const { signOut } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<'local' | 'state' | 'national'>('national');
  const [reminderStatus, setReminderStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTimeline(format);
        setMilestones(data.milestones);
      } catch {
        setError('Failed to load timeline. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [format]);

  const handleSetReminder = async (milestone: Milestone) => {
    try {
      await createReminder(milestone);
      setReminderStatus((prev) => ({ ...prev, [milestone.id]: true }));
    } catch {
      setError('Failed to set reminder. Please try again or note the date manually.');
    }
  };

  return (
    <div
      className="timeline-view"
      role="main"
      aria-label="Election Timeline"
      style={{ minHeight: '100vh', backgroundColor: 'transparent' }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          backgroundColor: 'var(--surface-variant)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--outline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="/chat"
            aria-label="Back to chat"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              color: 'var(--on-surface-secondary)',
              textDecoration: 'none',
              fontSize: '1.1rem',
            }}
            tabIndex={0}
          >
            ←
          </a>
          <div>
            <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>
              Election Timeline
            </h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--on-surface-tertiary)' }}>
              Key milestones and deadlines
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          aria-label="Sign out"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--on-surface-secondary)',
            border: '1px solid var(--outline)',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
          tabIndex={0}
        >
          Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Format selector */}
        <div
          role="radiogroup"
          aria-label="Election format"
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '28px',
            backgroundColor: 'var(--surface-variant)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--outline)',
            width: 'fit-content',
          }}
        >
          {(['local', 'state', 'national'] as const).map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={format === f}
              onClick={() => setFormat(f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFormat(f);
                }
              }}
              style={{
                backgroundColor: format === f ? '#4285F4' : 'transparent',
                color: format === f ? '#ffffff' : 'var(--on-surface-secondary)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'all 200ms ease',
              }}
              tabIndex={0}
            >
              {f}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              color: '#EA4335',
              backgroundColor: '#FCE8E6',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <ol
            aria-label="Timeline milestones"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {milestones.map((milestone, index) => {
              const formattedDate = new Date(milestone.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const color = getPhaseColor(milestone.phaseName);

              return (
                <li
                  key={milestone.id}
                  role="listitem"
                  aria-label={`${milestone.phaseName}: ${formattedDate} - ${milestone.description}`}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {/* Timeline line */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '20px',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: '3px solid #ffffff',
                        boxShadow: `0 0 0 2px ${color}40`,
                        flexShrink: 0,
                        marginTop: '20px',
                      }}
                    />
                    {index < milestones.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          flex: 1,
                          backgroundColor: '#E8EAED',
                          minHeight: '20px',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--surface-variant)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      marginBottom: '12px',
                      border: '1px solid var(--outline)',
                      transition: 'box-shadow 200ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: color,
                        }}
                        aria-hidden="true"
                      />
                      <strong style={{ color: 'var(--on-surface)', fontSize: '0.925rem' }}>
                        {milestone.phaseName}
                      </strong>
                    </div>
                    <p style={{ color: '#4285F4', margin: '2px 0', fontSize: '0.825rem', fontWeight: 500 }}>
                      {formattedDate}
                    </p>
                    <p style={{ color: 'var(--on-surface-secondary)', margin: '6px 0 12px', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      {milestone.description}
                    </p>
                    <button
                      onClick={() => handleSetReminder(milestone)}
                      disabled={reminderStatus[milestone.id]}
                      aria-label={
                        reminderStatus[milestone.id]
                          ? `Reminder set for ${milestone.phaseName}`
                          : `Set reminder for ${milestone.phaseName}`
                      }
                      style={{
                        backgroundColor: reminderStatus[milestone.id] ? '#E8F5E9' : '#34A853',
                        color: reminderStatus[milestone.id] ? '#1B5E20' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 16px',
                        cursor: reminderStatus[milestone.id] ? 'default' : 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'all 200ms ease',
                      }}
                      tabIndex={0}
                    >
                      {reminderStatus[milestone.id] ? '✓ Reminder Set' : '🔔 Set Reminder'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

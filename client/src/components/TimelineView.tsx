/**
 * Timeline View Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders election milestones in chronological order with
 * "Set Reminder" buttons for Google Calendar integration.
 * Property 5: Rendered output contains phase name, date, description.
 */
import React, { useState, useEffect } from 'react';
import { Milestone } from '@shared/types';
import { getTimeline, createReminder } from '../services/apiClient';
import LoadingIndicator from './LoadingIndicator';

export default function TimelineView() {
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
      style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}
    >
      <h2 style={{ color: '#1a73e8', marginBottom: '8px' }}>Election Timeline</h2>
      <p style={{ color: '#5f6368', marginBottom: '16px', fontSize: '0.9rem' }}>
        Key milestones and deadlines — powered by Google Antigravity
      </p>

      {/* Format selector */}
      <div
        role="radiogroup"
        aria-label="Election format"
        style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}
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
              backgroundColor: format === f ? '#1a73e8' : '#f1f3f4',
              color: format === f ? '#ffffff' : '#3c4043',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
            tabIndex={0}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" aria-live="assertive" style={{ color: '#c5221f', marginBottom: '16px' }}>
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
          {milestones.map((milestone) => {
            const formattedDate = new Date(milestone.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <li
                key={milestone.id}
                role="listitem"
                aria-label={`${milestone.phaseName}: ${formattedDate} - ${milestone.description}`}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#1a73e8',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#3c4043', fontSize: '0.95rem' }}>
                    {milestone.phaseName}
                  </strong>
                  <p style={{ color: '#1a73e8', margin: '2px 0', fontSize: '0.85rem' }}>
                    {formattedDate}
                  </p>
                  <p style={{ color: '#5f6368', margin: '4px 0', fontSize: '0.875rem' }}>
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
                      backgroundColor: reminderStatus[milestone.id] ? '#ceead6' : '#1a73e8',
                      color: reminderStatus[milestone.id] ? '#137333' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      cursor: reminderStatus[milestone.id] ? 'default' : 'pointer',
                      fontSize: '0.8rem',
                      marginTop: '4px',
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
  );
}

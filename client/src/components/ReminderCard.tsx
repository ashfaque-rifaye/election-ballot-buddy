/**
 * Reminder Card Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders an election deadline/event with a "Set Reminder" button
 * that creates a Google Calendar event via the API.
 */
import React, { useState } from 'react';
import { ReminderCard as ReminderCardType } from '@shared/types';

interface ReminderCardProps {
  card: ReminderCardType;
  onSetReminder?: (card: ReminderCardType) => Promise<void>;
}

export default function ReminderCard({ card, onSetReminder }: ReminderCardProps) {
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [reminderSet, setReminderSet] = useState(!!card.calendarEventId);

  const handleSetReminder = async () => {
    if (!onSetReminder || reminderSet) return;
    setIsSettingReminder(true);
    try {
      await onSetReminder(card);
      setReminderSet(true);
    } catch {
      // Error handled by parent
    } finally {
      setIsSettingReminder(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSetReminder();
    }
  };

  const formattedDate = new Date(card.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="reminder-card"
      role="region"
      aria-label={`Reminder: ${card.phaseName} on ${formattedDate}`}
      style={{
        backgroundColor: 'var(--surface-variant)',
        backdropFilter: 'blur(8px)',
        borderRadius: '10px',
        padding: '14px 16px',
        margin: '8px 0',
        border: '1px solid var(--accent-light)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>📅</span>
        <strong style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{card.phaseName}</strong>
      </div>
      <p style={{ color: 'var(--primary)', margin: '4px 0', fontSize: '0.825rem', fontWeight: 500, paddingLeft: '28px' }}>
        {formattedDate}
      </p>
      <p style={{ color: 'var(--on-surface-secondary)', margin: '4px 0 10px 0', fontSize: '0.85rem', paddingLeft: '28px' }}>
        {card.description}
      </p>
      <div style={{ paddingLeft: '28px' }}>
        <button
          onClick={handleSetReminder}
          onKeyDown={handleKeyDown}
          disabled={isSettingReminder || reminderSet}
          aria-label={
            reminderSet
              ? `Reminder already set for ${card.phaseName}`
              : `Set reminder for ${card.phaseName} on ${formattedDate}`
          }
          style={{
            backgroundColor: reminderSet ? '#C8E6C9' : '#34A853',
            color: reminderSet ? '#1B5E20' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: reminderSet || isSettingReminder ? 'default' : 'pointer',
            fontSize: '0.825rem',
            fontWeight: 600,
            transition: 'all 200ms ease',
          }}
          tabIndex={0}
        >
          {isSettingReminder ? 'Setting...' : reminderSet ? '✓ Reminder Set' : '🔔 Set Reminder'}
        </button>
      </div>
    </div>
  );
}

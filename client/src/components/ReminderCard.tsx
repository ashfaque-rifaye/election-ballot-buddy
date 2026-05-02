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
        backgroundColor: '#e6f4ea',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '8px 0',
        border: '1px solid #ceead6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>📅</span>
        <strong style={{ color: '#137333', fontSize: '0.95rem' }}>{card.phaseName}</strong>
      </div>
      <p style={{ color: '#3c4043', margin: '4px 0', fontSize: '0.875rem' }}>
        {formattedDate}
      </p>
      <p style={{ color: '#5f6368', margin: '4px 0 8px 0', fontSize: '0.875rem' }}>
        {card.description}
      </p>
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
          backgroundColor: reminderSet ? '#ceead6' : '#1a73e8',
          color: reminderSet ? '#137333' : '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: reminderSet ? 'default' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
        tabIndex={0}
      >
        {isSettingReminder ? 'Setting...' : reminderSet ? '✓ Reminder Set' : '🔔 Set Reminder'}
      </button>
    </div>
  );
}

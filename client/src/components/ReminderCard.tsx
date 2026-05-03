/**
 * Reminder Card - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 */
import { useState } from 'react';
import { ReminderCard as ReminderCardType } from '@shared/types';

export default function ReminderCard({ card, onSetReminder }: { card: ReminderCardType; onSetReminder?: (card: ReminderCardType) => Promise<void> }) {
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [reminderSet, setReminderSet] = useState(!!card.calendarEventId);
  const handleSetReminder = async () => {
    if (!onSetReminder || reminderSet) return;
    setIsSettingReminder(true);
    try { await onSetReminder(card); setReminderSet(true); } catch { /* handled by parent */ } finally { setIsSettingReminder(false); }
  };
  const formattedDate = new Date(card.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="reminder-card" role="region" aria-label={`Reminder: ${card.phaseName} on ${formattedDate}`}
      style={{ backgroundColor: 'var(--accent-light)', borderRadius: '10px', padding: '14px 16px', margin: '8px 0', border: '1px solid var(--outline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>📅</span>
        <strong style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{card.phaseName}</strong>
      </div>
      <p style={{ color: 'var(--primary)', margin: '4px 0', fontSize: '0.825rem', fontWeight: 500, paddingLeft: '28px' }}>{formattedDate}</p>
      <p style={{ color: 'var(--on-surface-secondary)', margin: '4px 0 10px 0', fontSize: '0.85rem', paddingLeft: '28px' }}>{card.description}</p>
      <div style={{ paddingLeft: '28px' }}>
        <button onClick={handleSetReminder} disabled={isSettingReminder || reminderSet}
          aria-label={reminderSet ? `Reminder set for ${card.phaseName}` : `Set reminder for ${card.phaseName}`}
          style={{ backgroundColor: reminderSet ? 'var(--accent-light)' : 'var(--accent)', color: reminderSet ? 'var(--accent)' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: reminderSet || isSettingReminder ? 'default' : 'pointer', fontSize: '0.825rem', fontWeight: 600 }} tabIndex={0}>
          {isSettingReminder ? 'Setting...' : reminderSet ? '✓ Reminder Set' : '🔔 Set Reminder'}
        </button>
      </div>
    </div>
  );
}

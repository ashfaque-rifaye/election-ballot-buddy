/**
 * Message Bubble Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders a single chat message (user or agent) with support
 * for rich content including inline card components.
 */
import React from 'react';
import { Message, Card, ReminderCard as ReminderCardType } from '@shared/types';
import FAQCard from './FAQCard';
import PollingLocationCard from './PollingLocationCard';
import ReminderCard from './ReminderCard';

interface MessageBubbleProps {
  message: Message;
  onSetReminder?: (card: ReminderCardType) => Promise<void>;
}

function renderCard(
  card: Card,
  index: number,
  onSetReminder?: (card: ReminderCardType) => Promise<void>
): React.ReactNode {
  switch (card.type) {
    case 'faq':
      return <FAQCard key={`faq-${index}`} card={card} />;
    case 'polling-location':
      return <PollingLocationCard key={`polling-${index}`} card={card} />;
    case 'reminder':
      return <ReminderCard key={`reminder-${index}`} card={card} onSetReminder={onSetReminder} />;
    default:
      return null;
  }
}

export default function MessageBubble({ message, onSetReminder }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`message-bubble ${isUser ? 'user-message' : 'agent-message'}`}
      role="listitem"
      aria-label={`${isUser ? 'You' : 'Election Assistant'}: ${message.content}`}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: '#fff',
            flexShrink: 0,
            marginRight: '10px',
            marginTop: '2px',
          }}
          aria-hidden="true"
        >
          AI
        </div>
      )}
      <div
        style={{
          maxWidth: '70%',
          backgroundColor: isUser ? 'var(--primary)' : 'var(--surface-variant)',
          backdropFilter: isUser ? 'none' : 'blur(16px)',
          color: isUser ? '#ffffff' : 'var(--on-surface)',
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          padding: '12px 18px',
          fontSize: '0.9rem',
          lineHeight: 1.65,
          boxShadow: isUser ? 'none' : '0 1px 3px rgba(60,64,67,0.08)',
          border: isUser ? 'none' : '1px solid var(--outline)',
        }}
      >
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>

        {message.cards && message.cards.length > 0 && (
          <div className="message-cards" style={{ marginTop: '12px' }}>
            {message.cards.map((card, index) => renderCard(card, index, onSetReminder))}
          </div>
        )}
      </div>
    </div>
  );
}

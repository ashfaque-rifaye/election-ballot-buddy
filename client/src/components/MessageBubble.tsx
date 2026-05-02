/**
 * Message Bubble Component
 * Built with Google Antigravity & Vertex AI
 *
 * Renders a single chat message (user or agent) with support
 * for rich content including inline card components.
 * Property 8: Correct React component rendered for each card type.
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

/**
 * Render the appropriate card component based on card type.
 */
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
        marginBottom: '12px',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          backgroundColor: isUser ? '#1a73e8' : '#f1f3f4',
          color: isUser ? '#ffffff' : '#3c4043',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          fontSize: '0.925rem',
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>

        {message.cards && message.cards.length > 0 && (
          <div className="message-cards" style={{ marginTop: '8px' }}>
            {message.cards.map((card, index) => renderCard(card, index, onSetReminder))}
          </div>
        )}
      </div>
    </div>
  );
}

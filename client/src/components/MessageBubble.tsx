/**
 * Message Bubble - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 */
import React from 'react';
import { Message, Card, ReminderCard as ReminderCardType } from '@shared/types';
import FAQCard from './FAQCard';
import PollingLocationCard from './PollingLocationCard';
import ReminderCard from './ReminderCard';
import ImageCard from './ImageCard';

interface MessageBubbleProps {
  message: Message;
  onSetReminder?: (card: ReminderCardType) => Promise<void>;
}

function renderCard(card: Card, index: number, onSetReminder?: (card: ReminderCardType) => Promise<void>): React.ReactNode {
  switch (card.type) {
    case 'faq': return <FAQCard key={`faq-${index}`} card={card} />;
    case 'polling-location': return <PollingLocationCard key={`polling-${index}`} card={card} />;
    case 'reminder': return <ReminderCard key={`reminder-${index}`} card={card} onSetReminder={onSetReminder} />;
    case 'image': return <ImageCard key={`img-${index}`} card={card} />;
    default: return null;
  }
}

function formatContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    let formatted: React.ReactNode = line;
    const boldParts = line.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
      formatted = (<span key={`l-${i}`}>{boldParts.map((part, j) => j % 2 === 1 ? <strong key={j} style={{ fontWeight: 600 }}>{part}</strong> : <React.Fragment key={j}>{part}</React.Fragment>)}</span>);
    }
    const bulletMatch = line.match(/^[\s]*[-•*]\s+(.*)/);
    if (bulletMatch) {
      elements.push(<div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '4px', marginBottom: '4px' }}><span style={{ color: 'var(--primary)', flexShrink: 0 }} aria-hidden="true">•</span><span>{typeof formatted === 'string' ? formatted : formatted}</span></div>);
      return;
    }
    const numMatch = line.match(/^[\s]*(\d+)[.)]\s+(.*)/);
    if (numMatch) {
      elements.push(<div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '4px', marginBottom: '6px' }}><span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }} aria-hidden="true">{numMatch[1]}</span><span>{numMatch[2]}</span></div>);
      return;
    }
    const headingMatch = line.match(/^#{1,3}\s+(.*)/);
    if (headingMatch) {
      elements.push(<div key={i} style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '8px', marginBottom: '4px', color: 'var(--on-surface)' }}>{headingMatch[1]}</div>);
      return;
    }
    if (line.trim() === '') { elements.push(<div key={i} style={{ height: '8px' }} />); return; }
    elements.push(<div key={i} style={{ marginBottom: '2px' }}>{formatted}</div>);
  });
  return elements;
}

export default function MessageBubble({ message, onSetReminder }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <div role="listitem" aria-label={`${isUser ? 'You' : 'Election Assistant'}: ${message.content.substring(0, 80)}`}
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', animation: 'fadeIn 0.3s ease-out' }}>
      {!isUser && (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9933, #138808)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', flexShrink: 0, marginRight: '10px', marginTop: '2px' }} aria-hidden="true">🇮🇳</div>
      )}
      <div style={{
        maxWidth: isUser ? '70%' : '80%',
        backgroundColor: isUser ? 'var(--msg-user-bg)' : 'var(--msg-agent-bg)',
        color: isUser ? 'var(--msg-user-text)' : 'var(--msg-agent-text)',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        padding: '14px 18px', fontSize: '0.9rem', lineHeight: 1.65,
        boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
        border: isUser ? 'none' : `1px solid var(--msg-agent-border)`,
      }}>
        <div style={{ margin: 0 }}>{isUser ? message.content : formatContent(message.content)}</div>
        {message.cards && message.cards.length > 0 && (
          <div style={{ marginTop: '12px' }}>{message.cards.map((card, index) => renderCard(card, index, onSetReminder))}</div>
        )}
      </div>
    </div>
  );
}

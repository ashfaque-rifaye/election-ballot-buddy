/**
 * Unit Tests: MessageBubble Component
 * Built with Google Antigravity & Vertex AI
 *
 * **Validates: Requirements 6.3, 6.4, 6.5, 6.6**
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageBubble from '../MessageBubble';
import { Message } from '@shared/types';

describe('MessageBubble', () => {
  it('renders user message', () => {
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'How do I register?',
      timestamp: new Date().toISOString(),
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText(message.content)).toBeInTheDocument();
  });

  it('renders agent message', () => {
    const message: Message = {
      id: '2',
      role: 'agent',
      content: 'You can register online at your state website.',
      timestamp: new Date().toISOString(),
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText(message.content)).toBeInTheDocument();
  });

  it('renders FAQ card when present', () => {
    const message: Message = {
      id: '3',
      role: 'agent',
      content: 'Here is an FAQ:',
      cards: [
        {
          type: 'faq',
          question: 'What is voting?',
          answer: 'Voting is the process of choosing a candidate.',
        },
      ],
      timestamp: new Date().toISOString(),
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText('What is voting?')).toBeInTheDocument();
  });

  it('renders polling location card when present', () => {
    const message: Message = {
      id: '4',
      role: 'agent',
      content: 'Here is a polling station:',
      cards: [
        {
          type: 'polling-location',
          name: 'City Hall',
          address: '100 Main St',
          mapsUrl: 'https://maps.google.com',
        },
      ],
      timestamp: new Date().toISOString(),
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText('City Hall')).toBeInTheDocument();
    expect(screen.getByText('100 Main St')).toBeInTheDocument();
  });

  it('renders reminder card when present', () => {
    const message: Message = {
      id: '5',
      role: 'agent',
      content: 'Here is a reminder:',
      cards: [
        {
          type: 'reminder',
          phaseName: 'Election Day',
          date: '2024-11-05T00:00:00.000Z',
          description: 'National election day.',
        },
      ],
      timestamp: new Date().toISOString(),
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText('Election Day')).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    const message: Message = {
      id: '6',
      role: 'user',
      content: 'Test message',
      timestamp: new Date().toISOString(),
    };
    render(<MessageBubble message={message} />);
    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveAttribute('aria-label');
  });
});

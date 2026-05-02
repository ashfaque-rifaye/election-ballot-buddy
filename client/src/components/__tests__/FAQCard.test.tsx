/**
 * Unit Tests: FAQCard Component
 * Built with Google Antigravity & Vertex AI
 *
 * **Validates: Requirements 6.4, 7.1, 7.2**
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQCard from '../FAQCard';

describe('FAQCard', () => {
  const mockCard = {
    type: 'faq' as const,
    question: 'How do I register to vote?',
    answer: 'Visit your state election website to register online.',
  };

  it('renders the question', () => {
    render(<FAQCard card={mockCard} />);
    expect(screen.getByText(mockCard.question)).toBeInTheDocument();
  });

  it('does not show answer by default', () => {
    render(<FAQCard card={mockCard} />);
    expect(screen.queryByText(mockCard.answer)).not.toBeInTheDocument();
  });

  it('shows answer when clicked', () => {
    render(<FAQCard card={mockCard} />);
    fireEvent.click(screen.getByText(mockCard.question));
    expect(screen.getByText(mockCard.answer)).toBeInTheDocument();
  });

  it('toggles answer on keyboard Enter', () => {
    render(<FAQCard card={mockCard} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.getByText(mockCard.answer)).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    render(<FAQCard card={mockCard} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label');
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

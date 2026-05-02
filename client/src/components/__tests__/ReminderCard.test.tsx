/**
 * Unit Tests: ReminderCard Component
 * Built with Google Antigravity & Vertex AI
 *
 * **Validates: Requirements 6.6, 7.1, 7.2**
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReminderCard from '../ReminderCard';

describe('ReminderCard', () => {
  const mockCard = {
    type: 'reminder' as const,
    phaseName: 'Registration Deadline',
    date: '2024-10-07T00:00:00.000Z',
    description: 'Last day to register to vote.',
  };

  it('renders phase name', () => {
    render(<ReminderCard card={mockCard} />);
    expect(screen.getByText(mockCard.phaseName)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<ReminderCard card={mockCard} />);
    expect(screen.getByText(mockCard.description)).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<ReminderCard card={mockCard} />);
    // Should contain some date text
    const dateElement = screen.getByText(/October/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('renders Set Reminder button', () => {
    render(<ReminderCard card={mockCard} />);
    expect(screen.getByText(/Set Reminder/i)).toBeInTheDocument();
  });

  it('calls onSetReminder when button clicked', async () => {
    const onSetReminder = jest.fn().mockResolvedValue(undefined);
    render(<ReminderCard card={mockCard} onSetReminder={onSetReminder} />);

    fireEvent.click(screen.getByText(/Set Reminder/i));
    await waitFor(() => {
      expect(onSetReminder).toHaveBeenCalledWith(mockCard);
    });
  });

  it('shows Reminder Set after successful reminder', async () => {
    const onSetReminder = jest.fn().mockResolvedValue(undefined);
    render(<ReminderCard card={mockCard} onSetReminder={onSetReminder} />);

    fireEvent.click(screen.getByText(/Set Reminder/i));
    await waitFor(() => {
      expect(screen.getByText(/Reminder Set/i)).toBeInTheDocument();
    });
  });

  it('has ARIA attributes', () => {
    render(<ReminderCard card={mockCard} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label');
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});

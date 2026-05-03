/**
 * ImageCard Component Tests
 * Built with Google Antigravity & Vertex AI
 */
import { render, screen } from '@testing-library/react';
import ImageCard from '../ImageCard';

describe('ImageCard', () => {
  const mockCard = {
    type: 'image' as const,
    url: 'https://example.com/test.jpg',
    alt: 'Test election image',
    caption: 'A test caption for the image',
  };

  it('renders with alt text', () => {
    render(<ImageCard card={mockCard} />);
    const img = screen.getByRole('figure');
    expect(img).toHaveAttribute('aria-label', 'Test election image');
  });

  it('renders caption when provided', () => {
    render(<ImageCard card={mockCard} />);
    expect(screen.getByText(/A test caption/)).toBeTruthy();
  });

  it('renders loading state initially', () => {
    render(<ImageCard card={mockCard} />);
    expect(screen.getByText(/Loading image/)).toBeTruthy();
  });

  it('renders without caption when not provided', () => {
    const cardNoCaption = { ...mockCard, caption: undefined };
    render(<ImageCard card={cardNoCaption} />);
    expect(screen.queryByText(/caption/)).toBeNull();
  });

  it('has accessible figure role', () => {
    render(<ImageCard card={mockCard} />);
    expect(screen.getByRole('figure')).toBeTruthy();
  });
});

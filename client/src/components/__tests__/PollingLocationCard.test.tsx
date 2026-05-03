/**
 * Unit Tests: PollingLocationCard Component
 * Built with Google Antigravity & Vertex AI
 *
 * **Validates: Requirements 4.3, 6.5, 7.2**
 */
import { render, screen } from '@testing-library/react';
import PollingLocationCard from '../PollingLocationCard';

describe('PollingLocationCard', () => {
  const mockCard = {
    type: 'polling-location' as const,
    name: 'City Hall Community Center',
    address: '100 Main Street, Springfield, IL 62701',
    mapsUrl: 'https://maps.google.com/?q=100+Main+Street+Springfield+IL',
  };

  it('renders station name', () => {
    render(<PollingLocationCard card={mockCard} />);
    expect(screen.getByText(mockCard.name)).toBeInTheDocument();
  });

  it('renders station address', () => {
    render(<PollingLocationCard card={mockCard} />);
    expect(screen.getByText(mockCard.address)).toBeInTheDocument();
  });

  it('renders Google Maps link with correct URL', () => {
    render(<PollingLocationCard card={mockCard} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', mockCard.mapsUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has ARIA attributes', () => {
    render(<PollingLocationCard card={mockCard} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label');
  });
});

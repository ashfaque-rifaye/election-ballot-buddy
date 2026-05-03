/**
 * Unit Tests: LoadingIndicator Component
 * Built with Google Antigravity & Vertex AI
 *
 * **Validates: Requirements 6.2, 7.2**
 */
import { render, screen } from '@testing-library/react';
import LoadingIndicator from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders with status role', () => {
    render(<LoadingIndicator />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<LoadingIndicator />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label');
  });

  it('has screen reader text', () => {
    render(<LoadingIndicator />);
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
  });
});

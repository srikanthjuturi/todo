import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TagChip } from '@/components/TagChip';

describe('TagChip', () => {
  it('renders tag name with # prefix', () => {
    render(<TagChip name="urgent" />);

    expect(screen.getByText('#urgent')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<TagChip name="urgent" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: '#urgent' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when no onClick is provided', () => {
    render(<TagChip name="urgent" />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies selected styles when selected prop is true', () => {
    const { container } = render(
      <TagChip name="urgent" onClick={() => {}} selected={true} />
    );

    expect(container.firstChild).toHaveClass('bg-blue-100');
  });

  it('does not apply selected styles when selected is false', () => {
    const { container } = render(
      <TagChip name="urgent" onClick={() => {}} selected={false} />
    );

    expect(container.firstChild).not.toHaveClass('bg-blue-100');
  });
});

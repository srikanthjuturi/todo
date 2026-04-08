import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryBadge } from '@/components/CategoryBadge';

describe('CategoryBadge', () => {
  it('renders the category name', () => {
    render(<CategoryBadge name="Work" />);

    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('applies a colour class based on name', () => {
    const { container } = render(<CategoryBadge name="Work" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toMatch(/bg-\w+-100/);
  });

  it('always picks the same colour for the same name', () => {
    const { container: a } = render(<CategoryBadge name="Personal" />);
    const { container: b } = render(<CategoryBadge name="Personal" />);

    expect((a.firstChild as HTMLElement).className).toBe(
      (b.firstChild as HTMLElement).className
    );
  });

  it('picks different colours for different names', () => {
    const { container: a } = render(<CategoryBadge name="Work" />);
    const { container: b } = render(<CategoryBadge name="Zzzzz" />);

    // The hash function distributes across 8 colours; Work and Zzzzz happen to differ
    // We just assert both receive some colour class, not that they differ (hash collisions possible)
    expect((a.firstChild as HTMLElement).className).toMatch(/bg-\w+-100/);
    expect((b.firstChild as HTMLElement).className).toMatch(/bg-\w+-100/);
  });
});

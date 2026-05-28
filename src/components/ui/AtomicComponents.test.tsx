import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { Card } from './Card';
import { Chip } from './Chip';
import { Divider } from './Divider';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { Skeleton } from './Skeleton';
import { Textarea } from './Textarea';

describe('atomic UI components', () => {
  it('renders button variants with icons and loading state', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon" />} loading>
        Save
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-text-primary');
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
  });

  it('renders icon buttons as labeled 44px touch targets', () => {
    render(
      <IconButton aria-label="Close">
        <span aria-hidden="true">x</span>
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('min-h-[44px]', 'min-w-[44px]');
  });

  it('renders chips with active state and type typography', () => {
    render(
      <Chip variant="type" active>
        memo
      </Chip>,
    );

    expect(screen.getByText('memo')).toHaveClass('font-mono', 'text-[12px]', 'rounded-xs');
    expect(screen.getByText('memo')).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders cards with semantic element, href, and hover styles', () => {
    render(
      <Card as="a" href="/items/1" hoverable>
        Item
      </Card>,
    );

    expect(screen.getByRole('link', { name: 'Item' })).toHaveClass('rounded-md', 'hover:shadow-card');
    expect(screen.getByRole('link', { name: 'Item' })).toHaveAttribute('href', '/items/1');
  });

  it('makes clickable non-link cards keyboard operable', () => {
    const onClick = vi.fn();

    render(
      <Card as="article" hoverable onClick={onClick}>
        Item
      </Card>,
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'Item' }), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Item' }), { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders field errors for input and textarea', () => {
    render(
      <>
        <Input aria-label="Title" error="Title is required" />
        <Textarea aria-label="Memo" error="Memo is required" autoFocus />
      </>,
    );

    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Memo')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Memo is required')).toBeInTheDocument();
  });

  it('renders divider and skeleton primitives', () => {
    render(
      <>
        <Divider />
        <Skeleton width={120} height="2rem" />
      </>,
    );

    expect(screen.getByRole('separator')).toHaveClass('border-border');
    expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '120px', height: '2rem' });
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true');
  });
});

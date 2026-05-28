import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomNav } from './BottomNav';
import { BottomSheet } from './BottomSheet';
import { EmptyState } from './EmptyState';
import { ToastProvider, useToast } from './Toast';
import { TopAppBar } from './TopAppBar';

afterEach(() => {
  vi.useRealTimers();
});

describe('layout UI components', () => {
  it('renders an empty state with optional action', () => {
    const onClick = vi.fn();

    render(<EmptyState title="No saved items" description="Add something first." action={{ label: 'Add', onClick }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('No saved items')).toBeInTheDocument();
    expect(screen.getByText('Add something first.')).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows toast messages, runs undo, and auto closes', () => {
    vi.useFakeTimers();
    const undo = vi.fn();

    function Trigger() {
      const { showToast } = useToast();
      return (
        <button type="button" onClick={() => showToast({ message: 'Saved', undo: { label: 'Undo', onClick: undo } })}>
          Show
        </button>
      );
    }

    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('keeps bottom sheet mounted, slides by open state, and closes from overlay', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <BottomSheet open={false} onClose={onClose} dragHandle>
        Sheet content
      </BottomSheet>,
    );

    expect(screen.getByText('Sheet content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('translate-y-full');

    rerender(
      <BottomSheet open onClose={onClose} dragHandle>
        Sheet content
      </BottomSheet>,
    );

    expect(screen.getByRole('dialog')).toHaveClass('translate-y-0', 'rounded-t-lg');
    expect(screen.getByTestId('bottom-sheet-drag-handle')).toHaveClass('h-1', 'w-3');

    fireEvent.click(screen.getByTestId('bottom-sheet-overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders top app bar slots and centered title', () => {
    render(<TopAppBar title="Check Later" leftAction={<button>Menu</button>} rightAction={<button>Account</button>} />);

    expect(screen.getByRole('banner')).toHaveClass('h-16', 'border-b', 'bg-surface');
    expect(screen.getByText('Check Later')).toHaveClass('text-[24px]', 'font-semibold');
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
  });

  it('renders four bottom nav tabs and marks current route active', () => {
    render(
      <MemoryRouter initialEntries={['/new']}>
        <BottomNav />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /New/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Folders/ })).toHaveAttribute('href', '/folders');
    expect(screen.queryByRole('link', { name: /Search/ })).not.toBeInTheDocument();
  });
});

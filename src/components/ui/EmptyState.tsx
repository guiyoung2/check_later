import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="mx-auto flex max-w-[520px] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sub text-text-muted" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-text-muted" />
      </div>
      <div className="space-y-2">
        <h2 className="font-body text-[24px] leading-[1.4] font-medium text-text-primary">{title}</h2>
        {description ? <p className="font-body text-[14px] leading-[1.5] text-text-secondary">{description}</p> : null}
      </div>
      {action ? (
        <Button type="button" variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </section>
  );
}

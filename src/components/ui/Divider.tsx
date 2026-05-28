export interface DividerProps {
  className?: string;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Divider({ className }: DividerProps) {
  return <hr className={joinClasses('border-0 border-t border-border', className)} />;
}

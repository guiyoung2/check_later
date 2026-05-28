import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20H6v-7h12v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h6l2 2h8v9H4V7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5" strokeLinecap="round" />
    </svg>
  );
}

const items: NavItem[] = [
  { label: 'Home', to: '/', icon: <HomeIcon /> },
  { label: 'New', to: '/new', icon: <AddIcon /> },
  { label: 'Folders', to: '/folders', icon: <FolderIcon /> },
  { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
];

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to);
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 h-16 border-t border-border bg-surface md:hidden" aria-label="Primary">
      <div className="grid h-full grid-cols-4">
        {items.map((item) => {
          const active = isActive(pathname, item.to);
          const isNew = item.to === '/new';

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={joinClasses(
                'flex min-h-[44px] flex-col items-center justify-center gap-1 px-1 font-body text-[12px] leading-[1.2] transition-[background-color,color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none',
                active ? 'text-text-primary' : 'text-text-muted hover:text-text-primary',
              )}
            >
              <span
                className={joinClasses(
                  'flex h-7 w-7 items-center justify-center rounded-sm',
                  isNew ? 'bg-text-primary text-bg' : false,
                  isNew && active ? 'opacity-100' : false,
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

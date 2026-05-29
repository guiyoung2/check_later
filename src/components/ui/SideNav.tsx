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
  { label: '홈', to: '/', icon: <HomeIcon /> },
  { label: '새 항목', to: '/new', icon: <AddIcon /> },
  { label: '폴더', to: '/folders', icon: <FolderIcon /> },
  { label: '설정', to: '/settings', icon: <SettingsIcon /> },
];

function isActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/' || pathname.startsWith('/items');
  return pathname.startsWith(to);
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SideNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 bottom-0 left-0 z-30 hidden w-60 border-r border-border bg-surface px-4 py-6 md:flex md:flex-col" aria-label="Desktop primary">
      <Link to="/" className="mb-8 px-3 font-body text-[20px] leading-[1.4] font-semibold text-text-primary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none">
        Check Later
      </Link>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.to);
          const className = joinClasses(
            'flex min-h-[44px] items-center gap-3 rounded-sm px-3 font-body text-[14px] leading-[1.5] transition-[background-color,color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none',
            active ? 'bg-surface-sub font-medium text-text-primary' : 'text-text-muted hover:bg-surface-sub hover:text-text-primary',
          );

          return active ? (
            <Link key={item.to} to={item.to} aria-current="page" className={className}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <Link key={item.to} to={item.to} className={className}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

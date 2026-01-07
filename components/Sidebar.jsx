'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen = true, onToggle }) {
  const pathname = usePathname();
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/', icon: '🏠' },
    { name: 'API Playground', href: '/playground', icon: '🧪' },
    { name: 'Use Cases', href: '/use-cases', icon: '💡' },
    { name: 'Billing', href: '/billing', icon: '💳' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const resourceItems = [
    { name: 'Certification', href: '/certification', icon: '🎓' },
    { name: 'Documentation', href: 'https://docs.tavily.com', icon: '📜', external: true },
    { name: 'Tavily MCP', href: 'https://mcp.tavily.com', icon: '🔌', external: true },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname && pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed lg:fixed top-0 left-0 h-screen w-64 xl:w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      {/* Logo Section */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Tavily Logo Icon - Three arrows (red, blue, yellow) from center */}
            <div className="relative h-8 w-8 flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Red arrow pointing up-right */}
                <path
                  d="M12 6L18 4L16 10"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Blue arrow pointing right */}
                <path
                  d="M18 12L20 6L14 8"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Yellow arrow pointing down-right */}
                <path
                  d="M12 18L18 20L16 14"
                  stroke="#FBBF24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Cozy AI
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Personal/Account Section */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setIsPersonalOpen(!isPersonalOpen)}
          className="flex items-center justify-between w-full text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg px-3 py-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-sky-500 via-violet-500 to-rose-500 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Personal</span>
          </div>
          <svg
            className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform ${
              isPersonalOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                // Close sidebar on mobile when clicking a link
                if (window.innerWidth < 1024 && onToggle) {
                  onToggle();
                }
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Resources Section */}
        <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
          {resourceItems.map((item) => {
            const active = isActive(item.href);
            const content = (
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {item.external && (
                  <svg
                    className="w-4 h-4 text-zinc-400 dark:text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
              </div>
            );

            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={() => {
                    // Close sidebar on mobile when clicking a link
                    if (window.innerWidth < 1024 && onToggle) {
                      onToggle();
                    }
                  }}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024 && onToggle) {
                    onToggle();
                  }
                }}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
    </>
  );
}


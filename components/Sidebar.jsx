'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen = true, onToggle }) {
  const pathname = usePathname();
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: '🏠' },
    { name: 'API Authenticator', href: '/dashboard', icon: '🔑' },
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
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname && pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed lg:fixed top-0 left-0 h-screen w-64 xl:w-72 bg-black border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      {/* Logo Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link href="/landing" className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Cozy AI Logo Icon */}
            <div className="relative h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-white"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6L18 4L16 10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M18 12L20 6L14 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M12 18L18 20L16 14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold tracking-tight text-white truncate">
                Cozy AI
              </p>
            </div>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <button
          onClick={() => setIsPersonalOpen(!isPersonalOpen)}
          className="flex items-center justify-between w-full text-left hover:bg-white/5 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold shrink-0">
              A
            </div>
            <span className="text-xs sm:text-sm font-medium text-white">Personal</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
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
      <nav className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4 space-y-1">
        {/* Home/Landing Page Link */}
        <Link
          href="/landing"
          onClick={() => {
            if (window.innerWidth < 1024 && onToggle) {
              onToggle();
            }
          }}
          className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
            pathname === '/landing'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white font-medium border border-cyan-500/30'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="text-base sm:text-lg">🏠</span>
          <span>Home</span>
        </Link>

        {/* API Playground - Always Visible */}
        <Link
          href="/playground"
          onClick={() => {
            if (window.innerWidth < 1024 && onToggle) {
              onToggle();
            }
          }}
          className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
            pathname === '/playground'
              ? 'bg-gray-700 text-white font-medium'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="text-base sm:text-lg">🧪</span>
          <span>API Playground</span>
        </Link>

        {isPersonalOpen && navItems.filter(item => item.name !== 'API Playground').map((item) => {
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
              className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ml-4 sm:ml-6 ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white font-medium border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Resources Section */}
        <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-white/10">
          {resourceItems.map((item) => {
            const active = isActive(item.href);
            const content = (
              <div
                className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white font-medium border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-base sm:text-lg">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {item.external && (
                  <svg
                    className="w-4 h-4 text-gray-500"
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


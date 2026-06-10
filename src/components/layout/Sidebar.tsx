'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { LayoutDashboard, CalendarClock, Library, LogOut, FileText } from 'lucide-react';
import { useState } from 'react';
import { TermsModal } from './TermsModal';

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/schedule', label: 'Timeline', icon: CalendarClock },
    { href: '/dashboard/library', label: 'Library', icon: Library },
  ];

  return (
    <div className="w-64 bg-[#2f3136] h-full flex flex-col pt-6 border-r border-[#202225] shadow-sm z-20">
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-sans text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-discord-blurple/10 text-discord-blurple' 
                  : 'text-discord-muted hover:bg-[#36393f] hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-discord-blurple' : 'text-discord-muted'}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#202225] bg-[#202225]/30 mt-auto space-y-2">
        <button
          onClick={() => setIsTermsOpen(true)}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md font-sans text-sm font-medium text-discord-muted hover:bg-[#36393f] hover:text-white transition-colors"
        >
          <FileText className="w-5 h-5" />
          Licencias y Uso
        </button>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md font-sans text-sm font-medium text-discord-danger hover:bg-discord-danger/10 hover:text-discord-danger transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}

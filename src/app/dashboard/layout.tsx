'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#202225]">
        <div className="flex flex-col items-center gap-4 text-discord-muted font-sans">
          <div className="w-8 h-8 border-4 border-[#2f3136] border-t-discord-blurple rounded-full animate-spin" />
          <span className="font-medium text-sm tracking-wide uppercase">Initializing Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#202225] overflow-hidden">
      <div className="flex-none">
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden flex flex-col p-4 bg-[#202225] shadow-sm border border-[#1e1f22] rounded-tl-xl mt-4 ml-4 mb-4 mr-4 min-h-0">
          <div className="flex-1 h-full animate-fade-in w-full max-w-[1400px] mx-auto overflow-hidden min-h-0 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

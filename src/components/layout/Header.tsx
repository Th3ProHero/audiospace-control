'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { RadioReceiver, ChevronDown } from 'lucide-react';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { profiles, activeProfileId, setProfiles, setActiveProfile } = useAudioStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/profiles')
      .then((res) => res.json())
      .then((data) => {
        if (data.profiles && data.profiles.length > 0) {
          setProfiles(data.profiles);
          if (!activeProfileId) {
            setActiveProfile(data.profiles[0].id);
          }
        }
      });
  }, [user, activeProfileId, setProfiles, setActiveProfile]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <header className="h-14 bg-[#36393f] border-b border-[#202225] flex items-center justify-between px-6 z-30 relative shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-discord-blurple flex items-center justify-center shadow-sm">
          <RadioReceiver className="w-4 h-4 text-white" />
        </div>
        <span className="font-sans font-bold text-white tracking-tight hidden sm:inline-block text-lg">
          AudioSpace
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-[#202225] hover:bg-[#2f3136] border border-[#1e1f22] transition-colors rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-discord-blurple"
          >
            <span className="text-xs text-discord-muted font-semibold uppercase tracking-wider mr-1">Location:</span>
            <span className="text-sm font-medium text-white">{activeProfile ? activeProfile.name : 'Loading...'}</span>
            <ChevronDown className="w-4 h-4 text-discord-muted ml-1" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full mt-1 right-0 w-56 bg-[#2f3136] border border-[#202225] rounded-md shadow-lg overflow-hidden z-50 py-1">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                     setActiveProfile(p.id);
                     setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    p.id === activeProfileId
                      ? 'bg-discord-blurple/10 text-discord-blurple'
                      : 'text-discord-text hover:bg-[#36393f] hover:text-white'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  {p.id === activeProfileId && <div className="w-1.5 h-1.5 rounded-full bg-discord-blurple" />}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-3 border-l border-[#202225] pl-6">
          <div className="w-2.5 h-2.5 rounded-full bg-discord-success" />
          <span className="text-sm font-medium text-discord-text truncate max-w-[150px]">
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useAudioStore } from '@/stores/useAudioStore';
import { StorageWidget } from '@/components/dashboard/StorageWidget';
import { Activity, Radio, MonitorPlay, Music, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { currentSource, isPlaying, scheduleBlocks, profiles, activeProfileId } = useAudioStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'YOUTUBE': return <MonitorPlay className="w-5 h-5" />;
      case 'RADIO': return <Radio className="w-5 h-5" />;
      case 'LOCAL': return <Music className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e1f22] pb-4">
        <div>
          <h1 className="text-2xl font-sans font-bold text-white uppercase tracking-tight">System Overview</h1>
          <p className="text-discord-muted font-sans text-sm mt-1">
            Environment: {activeProfile?.name || 'Loading...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Playback Status */}
        <div className="bg-[#2f3136] rounded-xl border border-[#1e1f22] p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded border ${isPlaying ? 'border-discord-blurple bg-discord-blurple/10 text-discord-blurple' : 'border-[#1e1f22] bg-[#202225] text-discord-muted'}`}>
              <Activity className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="font-sans font-semibold text-discord-muted text-sm uppercase tracking-wider">Current Broadcast</h3>
          </div>

          {currentSource ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-md border border-discord-blurple/30 bg-discord-blurple/5">
                <div className="mt-1 text-discord-blurple">
                  {getSourceIcon(currentSource.type)}
                </div>
                <div>
                  <div className="font-sans font-medium text-lg text-white mb-1">{currentSource.name}</div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${
                      currentSource.type === 'YOUTUBE' ? 'bg-discord-danger/10 text-discord-danger border-discord-danger/20' :
                      currentSource.type === 'RADIO' ? 'bg-discord-blurple/10 text-discord-blurple border-discord-blurple/20' :
                      'bg-discord-success/10 text-discord-success border-discord-success/20'
                    }`}>
                      {currentSource.type}
                    </span>
                    <span className="text-xs text-discord-muted font-sans">
                      {isPlaying ? '● TRANSMITTING' : '○ STANDBY'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-discord-muted font-sans px-1">
                Audio processing handled by global timeline automation.
              </p>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-[#1e1f22] rounded-md">
              <span className="text-discord-muted font-sans text-sm mb-2">NO ACTIVE SIGNAL</span>
              <span className="text-xs text-discord-muted/50 font-sans">Check timeline configuration</span>
            </div>
          )}
        </div>

        {/* Storage Stats */}
        <StorageWidget />
      </div>

      {/* Mini Timeline Preview */}
      <div className="bg-[#2f3136] rounded-xl border border-[#1e1f22] p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans font-semibold text-discord-muted text-sm uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Sequence
          </h3>
          <Link href="/dashboard/schedule" className="discord-button discord-button-primary text-xs py-1.5 px-3">
            Open Calendar
          </Link>
        </div>
        
        {scheduleBlocks.length > 0 ? (
          <div className="space-y-2">
            {scheduleBlocks.slice(0, 5).map((block) => {
              const isAnn = block.blockType === 'ANNOUNCEMENT';
              return (
                <div
                  key={block.id}
                  className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                    isAnn
                      ? 'border-discord-warning/40 bg-discord-warning/5 shadow-[0_0_6px_rgba(250,166,26,0.1)]'
                      : 'border-[#1e1f22] bg-[#202225]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isAnn ? 'text-discord-warning' : 'text-discord-blurple'}>
                      {getSourceIcon(block.audioSource.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm font-medium text-white">{block.audioSource.name}</span>
                        {isAnn && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-discord-warning/20 text-discord-warning border border-discord-warning/40 uppercase">
                            Overlay
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-sans text-discord-muted">
                        {new Date(block.startTime).toLocaleString()} - {new Date(block.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[#1e1f22] rounded-md">
            <p className="text-discord-muted font-sans text-sm mb-4">Sequence calendar is empty</p>
            <Link href="/dashboard/schedule" className="discord-button discord-button-primary text-sm">
              Configure Sequence
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

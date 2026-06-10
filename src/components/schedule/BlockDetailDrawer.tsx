'use client';

import { useEffect, useRef } from 'react';
import { X, Edit2, Trash2, RefreshCw, Radio, MonitorPlay, Music, Megaphone, Clock, Volume2 } from 'lucide-react';

interface BlockDetailDrawerProps {
  block: {
    id: string;
    audioSourceName: string;
    audioSourceType: 'YOUTUBE' | 'RADIO' | 'LOCAL';
    blockType: 'MUSIC' | 'ANNOUNCEMENT';
    startTime: string;
    endTime: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onRepeatDaily: () => void;
  onClose: () => void;
}

export function BlockDetailDrawer({ block, onEdit, onDelete, onRepeatDaily, onClose }: BlockDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isAnn = block.blockType === 'ANNOUNCEMENT';
  const accentBorder = isAnn ? 'border-discord-warning' : 'border-[#1e1f22]';
  const accentText = isAnn ? 'text-discord-warning' : 'text-white';
  const accentBg = isAnn ? 'bg-[#faa61a]/10' : 'bg-[#202225]';
  const accentGlow = isAnn ? 'shadow-[0_0_20px_rgba(250,166,26,0.15)]' : 'shadow-elevated';

  const getTypeIcon = () => {
    switch (block.audioSourceType) {
      case 'YOUTUBE': return <MonitorPlay className="w-5 h-5 text-discord-danger" />;
      case 'RADIO': return <Radio className="w-5 h-5 text-discord-blurple" />;
      case 'LOCAL': return <Music className="w-5 h-5 text-discord-success" />;
    }
  };

  const getTypeBadge = () => {
    const classes: Record<string, string> = {
      YOUTUBE: 'bg-[#ed4245]/10 text-discord-danger border-[#ed4245]/20',
      RADIO: 'bg-[#5865F2]/10 text-discord-blurple border-[#5865F2]/20',
      LOCAL: 'bg-[#3ba55d]/10 text-discord-success border-[#3ba55d]/20',
    };
    return classes[block.audioSourceType] || '';
  };

  const startDate = new Date(block.startTime);
  const endDate = new Date(block.endTime);
  const durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer - slides in from right */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 bottom-0 z-[9999] w-full max-w-sm bg-[#2f3136] border-l ${accentBorder} ${accentGlow} flex flex-col overflow-hidden animate-slide-in-right`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b border-[#1e1f22] ${accentBg}`}>
          <div className="flex items-center gap-2.5">
            {isAnn ? (
              <Megaphone className={`w-5 h-5 ${accentText}`} />
            ) : (
              getTypeIcon()
            )}
            <span className={`font-sans text-sm uppercase tracking-wider font-bold ${accentText}`}>
              {isAnn ? 'Announcement' : 'Music Block'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-discord-muted hover:text-white hover:bg-[#36393f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-1">Audio Source</label>
            <h3 className="font-sans font-bold text-lg text-white leading-tight">{block.audioSourceName}</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-semibold border ${getTypeBadge()}`}>
                {block.audioSourceType}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-semibold border ${
                isAnn ? 'bg-[#faa61a]/10 text-discord-warning border-discord-warning/20' : 'bg-[#202225] text-discord-muted border-[#1e1f22]'
              }`}>
                {isAnn ? 'OVERLAY' : 'BACKGROUND'}
              </span>
            </div>
          </div>

          {/* Time Info */}
          <div className={`p-4 rounded-lg bg-[#202225] border border-[#1e1f22]`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className={`w-4 h-4 text-discord-muted`} />
              <span className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide">Schedule</span>
            </div>
            <div className="space-y-2.5 font-sans text-sm">
              <div className="flex justify-between items-center">
                <span className="text-discord-muted">Start</span>
                <span className="text-white font-medium">{startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-discord-muted">End</span>
                <span className="text-white font-medium">
                  {isAnn ? 'Auto (MP3 duration)' : endDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#1e1f22] pt-2.5 mt-1">
                <span className="text-discord-muted">Duration</span>
                <span className="text-white font-semibold">
                  {isAnn ? '~MP3 length' : durationMin < 60 ? `${durationMin}m` : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`}
                </span>
              </div>
            </div>
          </div>

          {/* Ducking Info (announcements only) */}
          {isAnn && (
            <div className="p-4 rounded-lg border border-discord-warning/20 bg-[#faa61a]/10">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-discord-warning" />
                <span className="text-xs font-sans font-bold text-discord-warning uppercase tracking-wide">Ducking Active</span>
              </div>
              <p className="text-[13px] font-sans text-discord-warning/80 leading-relaxed">
                When this announcement plays, background audio volume will automatically drop to <span className="text-discord-warning font-bold">20%</span> and restore to <span className="text-discord-warning font-bold">100%</span> when finished.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-[#202225] border-t border-[#1e1f22] space-y-2.5">
          <button
            onClick={onEdit}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-discord-blurple text-white font-sans font-medium text-sm transition-colors hover:bg-[#4752c4]`}
          >
            <Edit2 className="w-4 h-4" />
            Edit Block
          </button>

          <button
            onClick={onRepeatDaily}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#4f545c] text-white font-sans font-medium text-sm transition-colors hover:bg-[#5d6269]"
          >
            <RefreshCw className="w-4 h-4" />
            Repeat Daily (365d)
          </button>

          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-transparent border border-discord-danger/50 text-discord-danger hover:bg-discord-danger/10 font-sans font-medium text-sm transition-colors mt-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Block
          </button>
        </div>
      </div>
    </>
  );
}

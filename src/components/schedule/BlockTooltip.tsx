'use client';

import { Radio, MonitorPlay, Music, Megaphone, Volume2 } from 'lucide-react';

interface BlockTooltipProps {
  name: string;
  sourceType: 'YOUTUBE' | 'RADIO' | 'LOCAL';
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  startTime: string;
  endTime: string;
  position: { x: number; y: number };
}

export function BlockTooltip({ name, sourceType, blockType, startTime, endTime, position }: BlockTooltipProps) {
  const isAnn = blockType === 'ANNOUNCEMENT';
  const accentBorder = isAnn ? 'border-discord-warning' : 'border-[#1e1f22]';
  const accentGlow = 'shadow-elevated';

  const getIcon = () => {
    switch (sourceType) {
      case 'YOUTUBE': return <MonitorPlay className="w-3.5 h-3.5 text-discord-danger" />;
      case 'RADIO': return <Radio className="w-3.5 h-3.5 text-discord-blurple" />;
      case 'LOCAL': return <Music className="w-3.5 h-3.5 text-discord-success" />;
    }
  };

  const start = new Date(startTime);
  const end = new Date(endTime);
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // Clamp to viewport
  const tooltipW = 240;
  const tooltipH = 120;
  const x = Math.min(position.x, window.innerWidth - tooltipW - 12);
  const y = Math.max(8, Math.min(position.y, window.innerHeight - tooltipH - 12));

  return (
    <div
      className={`fixed z-[10000] pointer-events-none animate-fade-in`}
      style={{ left: x, top: y }}
    >
      <div className={`w-[240px] bg-[#2f3136] border ${accentBorder} rounded-lg ${accentGlow} p-3`}>
        {/* Name */}
        <div className="flex items-center gap-2 mb-2.5">
          {isAnn ? <Megaphone className="w-3.5 h-3.5 text-discord-warning flex-shrink-0" /> : getIcon()}
          <span className="font-sans text-[13px] text-white truncate font-semibold">{name}</span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${
            sourceType === 'YOUTUBE' ? 'bg-[#ed4245]/10 text-discord-danger border-[#ed4245]/20' :
            sourceType === 'RADIO' ? 'bg-[#5865F2]/10 text-discord-blurple border-[#5865F2]/20' :
            'bg-[#3ba55d]/10 text-discord-success border-[#3ba55d]/20'
          }`}>{sourceType}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${
            isAnn ? 'bg-[#faa61a]/10 text-discord-warning border-discord-warning/20' : 'bg-[#202225] text-discord-muted border-[#1e1f22]'
          }`}>{isAnn ? 'OVERLAY' : 'MUSIC'}</span>
        </div>

        {/* Time */}
        <div className="flex items-center justify-between text-[11px] font-sans font-medium text-discord-muted border-t border-[#1e1f22] pt-2.5">
          <span>{fmtTime(start)} → {isAnn ? 'Auto' : fmtTime(end)}</span>
          <span>{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Ducking */}
        {isAnn && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-sans font-medium text-discord-warning bg-[#faa61a]/10 px-2 py-1 rounded border border-discord-warning/20">
            <Volume2 className="w-3 h-3" />
            <span>Ducks background to 20%</span>
          </div>
        )}
      </div>
    </div>
  );
}

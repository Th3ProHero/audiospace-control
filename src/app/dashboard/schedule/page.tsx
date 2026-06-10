'use client';

import { useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/useAudioStore';
import { InteractiveCalendar } from '@/components/schedule/InteractiveCalendar';
import { Music, Megaphone, Radio, MonitorPlay, Info } from 'lucide-react';

export default function SchedulePage() {
  const { activeProfileId, scheduleBlocks, setScheduleBlocks } = useAudioStore();

  const fetchBlocks = useCallback(async () => {
    if (!activeProfileId) return;
    const res = await fetch(`/api/schedule-blocks?profileId=${activeProfileId}`);
    const data = await res.json();
    if (data.blocks) setScheduleBlocks(data.blocks);
  }, [activeProfileId, setScheduleBlocks]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return (
    <div className="space-y-4 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-[#1e1f22] pb-4 flex-none">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-sans font-bold text-white uppercase tracking-tight">Sequence Calendar</h1>
            <p className="text-discord-muted font-sans text-sm mt-1">
              Drag to create blocks · Click a block to Edit / Delete / Repeat Daily
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-sans font-bold tracking-wide">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-discord-success/40 bg-discord-success/10">
              <Music className="w-3 h-3 text-discord-success" />
              <span className="text-discord-success">LOCAL MP3</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-discord-blurple/40 bg-discord-blurple/10">
              <Radio className="w-3 h-3 text-discord-blurple" />
              <span className="text-discord-blurple">RADIO</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-discord-danger/40 bg-discord-danger/10">
              <MonitorPlay className="w-3 h-3 text-discord-danger" />
              <span className="text-discord-danger">YOUTUBE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-discord-warning/60 bg-discord-warning/15 shadow-[0_0_6px_rgba(250,166,26,0.2)]">
              <Megaphone className="w-3 h-3 text-discord-warning" />
              <span className="text-discord-warning">ANNOUNCEMENT</span>
            </div>
          </div>
        </div>

        {/* Ducking hint */}
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded border border-discord-warning/20 bg-discord-warning/5 text-[11px] font-sans text-discord-muted">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-discord-warning" />
          <span className="leading-relaxed">
            <span className="text-discord-warning font-semibold">AUDIO DUCKING:</span> When an Announcement overlaps a Music block,
            background volume automatically fades to 20%. It fades back to 100% when the announcement ends.
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-grow h-0 bg-[#2f3136] rounded-xl shadow-sm border border-[#1e1f22] p-4 overflow-hidden flex flex-col">
        <InteractiveCalendar blocks={scheduleBlocks} onBlocksUpdated={fetchBlocks} />
      </div>
    </div>
  );
}

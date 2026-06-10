'use client';

import { useEffect, useRef } from 'react';
import { Edit2, Trash2, RefreshCw, X } from 'lucide-react';

interface BlockPopoverProps {
  blockId: string;
  blockTitle: string;
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  position: { x: number; y: number };
  onEdit: () => void;
  onDelete: () => void;
  onRepeatDaily: () => void;
  onClose: () => void;
}

export function BlockPopover({
  blockId,
  blockTitle,
  blockType,
  position,
  onEdit,
  onDelete,
  onRepeatDaily,
  onClose,
}: BlockPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Clamp popover to viewport
  const popoverWidth = 220;
  const popoverHeight = 200;
  const x = Math.min(position.x, window.innerWidth - popoverWidth - 8);
  const y = Math.min(position.y, window.innerHeight - popoverHeight - 8);

  const isAnnouncement = blockType === 'ANNOUNCEMENT';
  const accentColor = isAnnouncement ? 'border-discord-warning' : 'border-discord-blurple';
  const accentText = isAnnouncement ? 'text-discord-warning' : 'text-discord-blurple';
  const accentBg = isAnnouncement ? 'bg-discord-warning/10' : 'bg-discord-blurple/10';

  return (
    <div
      ref={ref}
      className={`fixed z-[9999] animate-fade-in`}
      style={{ left: x, top: y }}
    >
      <div className={`w-[220px] bg-[#2f3136] border ${accentColor}/60 rounded-lg shadow-elevated overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-3 py-2 border-b ${accentColor}/30 ${accentBg}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${accentText}`}>
              {isAnnouncement ? '⬡ OVERLAY' : '♪ MUSIC'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-discord-muted hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Block name */}
        <div className="px-3 py-2 border-b border-[#1e1f22]">
          <p className="text-xs font-sans text-discord-text truncate" title={blockTitle}>
            {blockTitle}
          </p>
        </div>

        {/* Actions */}
        <div className="p-1.5 space-y-0.5">
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-sans text-discord-text hover:bg-discord-blurple/10 hover:text-discord-blurple transition-all group"
          >
            <Edit2 className="w-3.5 h-3.5 text-discord-muted group-hover:text-discord-blurple transition-colors" />
            <span>Edit Block</span>
          </button>

          <button
            onClick={onRepeatDaily}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-sans text-discord-text hover:bg-discord-blurple/10 hover:text-discord-blurple transition-all group"
          >
            <RefreshCw className="w-3.5 h-3.5 text-discord-muted group-hover:text-discord-blurple transition-colors" />
            <span>Repeat Daily (365d)</span>
          </button>

          <div className="h-px bg-[#1e1f22] mx-1 my-1" />

          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-sans text-discord-text hover:bg-discord-danger/10 hover:text-discord-danger transition-all group"
          >
            <Trash2 className="w-3.5 h-3.5 text-discord-muted group-hover:text-discord-danger transition-colors" />
            <span>Delete Block</span>
          </button>
        </div>
      </div>
    </div>
  );
}

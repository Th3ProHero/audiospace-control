'use client';

import { useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventContentArg, EventMountArg, EventHoveringArg } from '@fullcalendar/core';
import { useAudioStore, ScheduleBlock } from '@/stores/useAudioStore';
import { AudioSourceModal, SavePayload } from './AudioSourceModal';
import { BlockTooltip } from './BlockTooltip';
import { BlockDetailDrawer } from './BlockDetailDrawer';

interface InteractiveCalendarProps {
  blocks: ScheduleBlock[];
  onBlocksUpdated: () => void;
}

interface EditData {
  blockId: string;
  audioSourceId: string;
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  startTime: string;
  endTime: string;
}

interface TooltipState {
  name: string;
  sourceType: 'YOUTUBE' | 'RADIO' | 'LOCAL';
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  startTime: string;
  endTime: string;
  position: { x: number; y: number };
}

interface DrawerBlock {
  id: string;
  audioSourceName: string;
  audioSourceType: 'YOUTUBE' | 'RADIO' | 'LOCAL';
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  startTime: string;
  endTime: string;
}

export function InteractiveCalendar({ blocks, onBlocksUpdated }: InteractiveCalendarProps) {
  const { activeProfileId } = useAudioStore();
  const calendarRef = useRef<FullCalendar>(null);

  // Create mode
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<DateSelectArg | null>(null);

  // Edit mode
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<EditData | null>(null);

  // Hover tooltip
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Detail drawer
  const [drawerBlock, setDrawerBlock] = useState<DrawerBlock | null>(null);

  // Map ScheduleBlocks → FullCalendar Events
  const events = blocks.map(block => {
    const isAnn = block.blockType === 'ANNOUNCEMENT';
    const srcType = block.audioSource.type;

    // Compute duration in minutes for display strategy
    const durMs = new Date(block.endTime).getTime() - new Date(block.startTime).getTime();
    const durMin = durMs / 60000;

    return {
      id: block.id,
      title: block.audioSource.name,
      start: block.startTime,
      end: block.endTime,
      extendedProps: {
        sourceId: block.audioSourceId,
        sourceType: srcType,
        blockType: block.blockType,
        startTime: block.startTime,
        endTime: block.endTime,
        sourceName: block.audioSource.name,
        durationMin: durMin,
      },
    };
  });

  // ── CUSTOM EVENT RENDERING ─────────────────────────────────────────────────
  const renderEventContent = useCallback((arg: EventContentArg) => {
    const { sourceType, blockType, durationMin } = arg.event.extendedProps;
    const isAnn = blockType === 'ANNOUNCEMENT';
    const isVeryShort = durationMin < 60;

    // Dot color per source type
    const dotColor = isAnn 
      ? 'bg-[#faa61a] ring-[#faa61a]/30'
      : sourceType === 'YOUTUBE' 
        ? 'bg-[#ed4245] ring-[#ed4245]/30' 
        : sourceType === 'RADIO'
          ? 'bg-[#5865F2] ring-[#5865F2]/30'
          : 'bg-[#3ba55d] ring-[#3ba55d]/30';

    return (
      <div className="w-full h-full flex flex-row items-start gap-2 overflow-hidden px-2.5 py-1.5">
        <span className={`flex-shrink-0 w-[7px] h-[7px] rounded-full mt-[4px] ring-2 ${dotColor}`} />
        {!isVeryShort && (
          <span className="font-sans font-medium text-[11px] leading-tight truncate text-white/90 tracking-[-0.01em]">
            {arg.event.title}
          </span>
        )}
      </div>
    );
  }, []);

  // ── EVENT STYLES (via classNames) ──────────────────────────────────────────
  const getEventClassNames = useCallback((block: ScheduleBlock) => {
    const isAnn = block.blockType === 'ANNOUNCEMENT';
    const srcType = block.audioSource.type;

    const base = [
      'font-sans',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      '!border-y-0 !border-r-0',
      '!mr-1',
      '!rounded-lg',
      '!border-l-[3px]',
    ];

    if (isAnn) {
      return [...base, 'ev-announcement', '!border-l-[#faa61a]'];
    }

    switch (srcType) {
      case 'YOUTUBE':
        return [...base, 'ev-youtube', '!border-l-[#ed4245]'];
      case 'RADIO':
        return [...base, 'ev-radio', '!border-l-[#5865F2]'];
      case 'LOCAL':
      default:
        return [...base, 'ev-local', '!border-l-[#3ba55d]'];
    }
  }, []);

  // Build classNames map for each event
  const eventsWithClasses = events.map(ev => {
    const block = blocks.find(b => b.id === ev.id);
    return {
      ...ev,
      classNames: block ? getEventClassNames(block) : [],
    };
  });

  // ── HOVER TOOLTIP ──────────────────────────────────────────────────────────
  const handleEventMouseEnter = useCallback((arg: EventHoveringArg) => {
    const el = arg.el;
    const rect = el.getBoundingClientRect();
    const ep = arg.event.extendedProps;

    setTooltip({
      name: ep.sourceName as string,
      sourceType: ep.sourceType as 'YOUTUBE' | 'RADIO' | 'LOCAL',
      blockType: ep.blockType as 'MUSIC' | 'ANNOUNCEMENT',
      startTime: ep.startTime as string,
      endTime: ep.endTime as string,
      position: {
        x: rect.right + 8,
        y: rect.top,
      },
    });
  }, []);

  const handleEventMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // ── CREATE ──────────────────────────────────────────────────────────────────
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setPendingSelection(selectInfo);
    setCreateModalOpen(true);
  };

  const handleCreateSave = async (payload: SavePayload) => {
    if (!activeProfileId) return;
    const startTime = payload.startTime || pendingSelection?.startStr;
    const endTime = payload.endTime || pendingSelection?.endStr;
    if (!startTime || !endTime) return;

    try {
      const res = await fetch('/api/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfileId,
          audioSourceId: payload.sourceId,
          startTime,
          endTime,
          blockType: payload.blockType,
          repeatDaily: payload.repeatDaily,
        }),
      });

      if (res.ok) {
        onBlocksUpdated();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create block.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      if (pendingSelection) pendingSelection.view.calendar.unselect();
      setCreateModalOpen(false);
      setPendingSelection(null);
    }
  };

  // ── CLICK → DETAIL DRAWER ──────────────────────────────────────────────────
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();
    clickInfo.jsEvent.stopPropagation();
    setTooltip(null); // Hide tooltip

    const ep = clickInfo.event.extendedProps;
    setDrawerBlock({
      id: clickInfo.event.id,
      audioSourceName: ep.sourceName as string,
      audioSourceType: ep.sourceType as 'YOUTUBE' | 'RADIO' | 'LOCAL',
      blockType: ep.blockType as 'MUSIC' | 'ANNOUNCEMENT',
      startTime: ep.startTime as string,
      endTime: ep.endTime as string,
    });
  }, []);

  // ── DRAWER ACTIONS ─────────────────────────────────────────────────────────
  const handleEditOpen = () => {
    if (!drawerBlock) return;
    const block = blocks.find(b => b.id === drawerBlock.id);
    if (!block) return;

    setDrawerBlock(null);
    setEditData({
      blockId: block.id,
      audioSourceId: block.audioSourceId,
      blockType: block.blockType,
      startTime: block.startTime,
      endTime: block.endTime,
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async (payload: SavePayload) => {
    if (!editData) return;
    try {
      const res = await fetch(`/api/schedule-blocks/${editData.blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioSourceId: payload.sourceId,
          startTime: payload.startTime || editData.startTime,
          endTime: payload.endTime || editData.endTime,
          blockType: payload.blockType,
          repeatDaily: payload.repeatDaily,
        }),
      });
      if (res.ok) onBlocksUpdated();
      else {
        const data = await res.json();
        alert(data.error || 'Failed to update block.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setEditModalOpen(false);
      setEditData(null);
    }
  };

  const handleDelete = async () => {
    if (!drawerBlock) return;
    const id = drawerBlock.id;
    setDrawerBlock(null);
    const res = await fetch(`/api/schedule-blocks/${id}`, { method: 'DELETE' });
    if (res.ok) onBlocksUpdated();
    else alert('Failed to delete block.');
  };

  const handleRepeatDaily = async () => {
    if (!drawerBlock) return;
    const block = blocks.find(b => b.id === drawerBlock.id);
    if (!block) return;
    setDrawerBlock(null);

    if (!confirm(`Repeat "${block.audioSource.name}" daily for 365 days?`)) return;

    try {
      const res = await fetch(`/api/schedule-blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioSourceId: block.audioSourceId,
          startTime: block.startTime,
          endTime: block.endTime,
          blockType: block.blockType,
          repeatDaily: true,
        }),
      });
      if (res.ok) onBlocksUpdated();
      else {
        const data = await res.json();
        alert(data.error || 'Failed to repeat block.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="calendar-container flex flex-col h-full w-full relative overflow-hidden min-h-0">
      {/* Create Modal */}
      <AudioSourceModal
        isOpen={createModalOpen}
        selectionStart={pendingSelection?.startStr}
        selectionEnd={pendingSelection?.endStr}
        onClose={() => {
          setCreateModalOpen(false);
          pendingSelection?.view.calendar.unselect();
        }}
        onSave={handleCreateSave}
      />

      {/* Edit Modal */}
      <AudioSourceModal
        isOpen={editModalOpen}
        editData={editData}
        onClose={() => {
          setEditModalOpen(false);
          setEditData(null);
        }}
        onSave={handleEditSave}
      />

      {/* Hover Tooltip */}
      {tooltip && <BlockTooltip {...tooltip} />}

      {/* Detail Drawer (click) */}
      {drawerBlock && (
        <BlockDetailDrawer
          block={drawerBlock}
          onEdit={handleEditOpen}
          onDelete={handleDelete}
          onRepeatDaily={handleRepeatDaily}
          onClose={() => setDrawerBlock(null)}
        />
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="timeGridWeek"
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={eventsWithClasses}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        height="100%"
        expandRows={true}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        validRange={{ start: '2026-01-01', end: '2030-12-31' }}
        allDaySlot={false}
        slotDuration="01:00:00"
        slotLabelInterval="01:00:00"
        nowIndicator={true}
        eventDisplay="block"
        eventMinHeight={20}
        slotEventOverlap={false}
        eventMaxStack={3}
      />
    </div>
  );
}

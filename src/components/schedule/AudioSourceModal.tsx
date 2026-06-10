'use client';

import { useState, useEffect } from 'react';
import { Clock, Megaphone } from 'lucide-react';

interface AudioSource {
  id: string;
  type: string;
  name: string;
}

interface EditData {
  blockId: string;
  audioSourceId: string;
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  startTime: string;
  endTime: string;
}

export interface SavePayload {
  sourceId: string;
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
  repeatDaily: boolean;
  startTime?: string;
  endTime?: string;
}

interface AudioSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SavePayload) => void;
  /** When provided, the modal is in "edit" mode */
  editData?: EditData | null;
  /** Selection times from the calendar drag (ISO strings) */
  selectionStart?: string;
  selectionEnd?: string;
}

/** Format an ISO string to local "YYYY-MM-DDTHH:mm" for datetime-local input */
function toLocalDatetimeString(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AudioSourceModal({ isOpen, onClose, onSave, editData, selectionStart, selectionEnd }: AudioSourceModalProps) {
  const [sources, setSources] = useState<AudioSource[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [blockType, setBlockType] = useState<'MUSIC' | 'ANNOUNCEMENT'>('MUSIC');
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const isEditMode = !!editData;
  const isAnnouncement = blockType === 'ANNOUNCEMENT';

  useEffect(() => {
    if (isOpen) {
      fetch('/api/audio-sources')
        .then(res => res.json())
        .then(data => {
          if (data.sources) setSources(data.sources);
        });

      if (editData) {
        setSelectedId(editData.audioSourceId);
        setBlockType(editData.blockType);
        setRepeatDaily(false);
        setStartTime(toLocalDatetimeString(editData.startTime));
        setEndTime(toLocalDatetimeString(editData.endTime));
      } else {
        setBlockType('MUSIC');
        setRepeatDaily(false);
        setSelectedId('');
        setStartTime(selectionStart ? toLocalDatetimeString(selectionStart) : '');
        setEndTime(selectionEnd ? toLocalDatetimeString(selectionEnd) : '');
      }
    }
  }, [isOpen, editData, selectionStart, selectionEnd]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalEndTime: string | undefined;

    if (isAnnouncement) {
      // For announcements: auto-calculate end = start + 5 minutes (placeholder).
      // Actual playback duration comes from the MP3 onEnded event.
      if (startTime) {
        const end = new Date(startTime);
        end.setMinutes(end.getMinutes() + 5);
        finalEndTime = end.toISOString();
      }
    } else {
      finalEndTime = endTime ? new Date(endTime).toISOString() : undefined;
    }

    onSave({
      sourceId: selectedId,
      blockType,
      repeatDaily,
      startTime: startTime ? new Date(startTime).toISOString() : undefined,
      endTime: finalEndTime,
    });
  };

  const hasValidTimes = isAnnouncement
    ? !!startTime
    : (!!startTime && !!endTime && new Date(startTime) < new Date(endTime));
  const isFormValid = !!selectedId && hasValidTimes;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in">
      <div className={`w-full max-w-md bg-[#36393f] rounded-xl shadow-elevated border border-[#202225] p-6`}>
        <h2 className={`text-xl font-sans font-bold mb-1 ${isAnnouncement ? 'text-discord-warning' : 'text-white'}`}>
          {isEditMode ? 'Edit Block' : 'Configure Block'}
        </h2>
        <div className="mb-5" />

        <div className="space-y-5">

          {/* Block Type */}
          <div>
            <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-2">Block Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBlockType('MUSIC')}
                className={`flex-1 py-2 font-sans font-medium text-sm rounded-md transition-colors ${blockType === 'MUSIC' ? 'bg-discord-blurple/10 text-discord-blurple border border-discord-blurple/30' : 'bg-[#2f3136] text-discord-muted border border-[#202225] hover:bg-[#4f545c] hover:text-white'}`}
              >
                Background (Music)
              </button>
              <button
                onClick={() => setBlockType('ANNOUNCEMENT')}
                className={`flex-1 py-2 font-sans font-medium text-sm rounded-md transition-colors ${blockType === 'ANNOUNCEMENT' ? 'bg-[#faa61a]/10 text-discord-warning border border-discord-warning/30' : 'bg-[#2f3136] text-discord-muted border border-[#202225] hover:bg-[#4f545c] hover:text-white'}`}
              >
                Overlay (Announcement)
              </button>
            </div>
            {isAnnouncement && (
              <div className="flex items-start gap-2 mt-2.5 px-3 py-2 rounded-md bg-[#faa61a]/10 border border-discord-warning/20">
                <Megaphone className="w-4 h-4 mt-0.5 text-discord-warning flex-shrink-0" />
                <p className="text-xs text-discord-warning/90 font-sans leading-relaxed">
                  Overlay ducks background to 20%. Duration is determined by the MP3 file length — no end time needed.
                </p>
              </div>
            )}
          </div>

          {/* Time Picker */}
          <div>
            <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {isAnnouncement ? 'Trigger Time' : 'Time Window'}
            </label>

            {isAnnouncement ? (
              /* ANNOUNCEMENT: Only start time */
              <div>
                <label className="text-[11px] font-sans font-medium text-discord-muted block mb-1">START (Exact minute)</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`discord-input text-sm ${isAnnouncement ? 'focus:border-discord-warning focus:ring-discord-warning' : ''}`}
                  step="60"
                />
                <p className="text-[11px] text-discord-warning font-sans mt-1.5">
                  End time auto-calculated from MP3 duration
                </p>
              </div>
            ) : (
              /* MUSIC: Start + End */
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-sans font-medium text-discord-muted block mb-1">START</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="discord-input text-sm"
                    step="60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-sans font-medium text-discord-muted block mb-1">END</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="discord-input text-sm"
                    step="60"
                  />
                </div>
              </div>
            )}
            {!isAnnouncement && startTime && endTime && new Date(startTime) >= new Date(endTime) && (
              <p className="text-[11px] text-discord-danger font-sans mt-1.5 font-medium">⚠ End time must be after start time</p>
            )}
          </div>

          {/* Source Selector */}
          <div>
            <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-2">
              {isAnnouncement ? 'Select Local MP3' : 'Select Source'}
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={`discord-input text-sm appearance-none min-h-[120px] ${isAnnouncement ? 'focus:border-discord-warning focus:ring-discord-warning' : ''}`}
              size={4}
            >
              {sources
                .filter(s => !isAnnouncement || s.type === 'LOCAL')
                .map(s => (
                  <option
                    key={s.id}
                    value={s.id}
                    className={`py-2.5 px-3 rounded-sm mb-0.5 cursor-pointer text-discord-text ${isAnnouncement ? 'checked:bg-discord-warning checked:text-white hover:bg-[#4f545c]' : 'checked:bg-discord-blurple checked:text-white hover:bg-[#4f545c]'}`}
                  >
                    [{s.type}] {s.name}
                  </option>
                ))}
            </select>
            {sources.filter(s => !isAnnouncement || s.type === 'LOCAL').length === 0 && (
              <div className="text-xs text-discord-muted font-sans italic mt-1.5">
                {isAnnouncement
                  ? 'No local MP3 sources found. Upload one in the Library first.'
                  : 'No sources found. Add some in the Library first.'}
              </div>
            )}
          </div>

          {/* Repeat Daily */}
          <label className="flex items-center gap-3 cursor-pointer group mt-5">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={repeatDaily}
                onChange={(e) => setRepeatDaily(e.target.checked)}
                className={`peer discord-checkbox ${isAnnouncement ? 'discord-checkbox-warning' : 'discord-checkbox-blurple'}`}
              />
              {repeatDaily && (
                <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-sans font-medium text-discord-muted group-hover:text-white transition-colors">
              {isEditMode ? 'Convert to repeating (365 days)' : 'Repeat daily (365 days)'}
            </span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 text-discord-muted hover:text-white font-sans text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`discord-button text-sm ${
                !isFormValid
                  ? 'opacity-50 cursor-not-allowed bg-[#2f3136] text-discord-muted border border-[#202225]'
                  : isAnnouncement
                    ? 'bg-discord-warning text-white hover:bg-[#c88514] focus:ring-discord-warning'
                    : 'discord-button-primary'
              }`}
            >
              {isEditMode ? 'Save Changes' : 'Confirm Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

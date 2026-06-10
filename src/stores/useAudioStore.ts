'use client';

import { create } from 'zustand';

export interface AudioSource {
  id: string;
  type: 'YOUTUBE' | 'RADIO' | 'LOCAL';
  name: string;
  urlOrPath: string;
}

export interface ScheduleBlock {
  id: string;
  profileId: string;
  audioSourceId: string;
  audioSource: AudioSource;
  startTime: string;
  endTime: string;
  blockType: 'MUSIC' | 'ANNOUNCEMENT';
}

export interface Profile {
  id: string;
  name: string;
}

interface AudioState {
  // Active profile
  activeProfileId: string | null;
  profiles: Profile[];

  // Current playback
  currentSource: AudioSource | null;
  isPlaying: boolean;
  announcementSource: AudioSource | null;
  isAnnouncementPlaying: boolean;
  isDucking: boolean;
  volume: number;
  manualOverride: boolean;

  // Schedule
  scheduleBlocks: ScheduleBlock[];

  // Track which announcement IDs have already been fired (to avoid re-triggering)
  firedAnnouncementIds: Set<string>;

  // Autoplay unlock
  audioUnlocked: boolean;
  
  // Microphone PA System
  isMicActive: boolean;

  // Actions
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (id: string) => void;
  setScheduleBlocks: (blocks: ScheduleBlock[]) => void;
  setCurrentSource: (source: AudioSource | null) => void;
  play: () => void;
  pause: () => void;
  setVolume: (v: number) => void;
  setManualOverride: (override: boolean) => void;
  setAudioUnlocked: (unlocked: boolean) => void;
  setMicActive: (active: boolean) => void;
  checkSchedule: () => void;
  endAnnouncement: () => void;
}


export const useAudioStore = create<AudioState>((set, get) => ({
  activeProfileId: null,
  profiles: [],
  currentSource: null,
  isPlaying: false,
  announcementSource: null,
  isAnnouncementPlaying: false,
  isDucking: false,
  volume: 0.7,
  manualOverride: false,
  scheduleBlocks: [],
  firedAnnouncementIds: new Set(),
  audioUnlocked: false,
  isMicActive: false,

  setProfiles: (profiles) => set({ profiles }),

  setActiveProfile: (id) => {
    set({ 
      activeProfileId: id, 
      manualOverride: false, 
      firedAnnouncementIds: new Set(),
      currentSource: null,
      isPlaying: false,
      announcementSource: null,
      isAnnouncementPlaying: false,
      isDucking: false,
      isMicActive: false,
      scheduleBlocks: []
    });
  },

  setScheduleBlocks: (blocks) => set({ scheduleBlocks: blocks }),

  setCurrentSource: (source) => set({ currentSource: source, isPlaying: !!source }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false, isAnnouncementPlaying: false, isDucking: false, isMicActive: false }),

  setVolume: (v) => set({ volume: v }),

  setManualOverride: (override) => set({ manualOverride: override }),

  setAudioUnlocked: (unlocked) => set({ audioUnlocked: unlocked }),

  setMicActive: (active) => set((state) => ({ 
    isMicActive: active,
    // Turn ducking on if mic is active, or keep it on if an announcement is playing
    isDucking: active || state.isAnnouncementPlaying 
  })),

  /**
   * Called when the overlay <audio> element fires `onEnded`.
   * Clears announcement state and restores background volume unless mic is active.
   */
  endAnnouncement: () => {
    set((state) => ({
      isAnnouncementPlaying: false,
      announcementSource: null,
      isDucking: state.isMicActive,
    }));
  },

  checkSchedule: () => {
    const state = get();
    if (state.manualOverride) return;

    const now = new Date();

    // ── MUSIC blocks: standard window-based matching ──
    const activeMusicBlock = state.scheduleBlocks.find((block) => {
      if (block.blockType !== 'MUSIC') return false;
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      return now >= start && now < end;
    });

    if (activeMusicBlock) {
      if (!state.currentSource || state.currentSource.id !== activeMusicBlock.audioSource.id) {
        set({
          currentSource: activeMusicBlock.audioSource,
          isPlaying: state.audioUnlocked,
        });
      } else if (state.audioUnlocked && !state.isPlaying) {
        set({ isPlaying: true });
      }
    } else {
      if (state.currentSource) {
        set({ isPlaying: false, currentSource: null });
      }
    }

    // ── ANNOUNCEMENT blocks: fire-once trigger ──
    // We trigger when `now >= startTime`. The actual duration is controlled
    // by the MP3 file's `onEnded` event, not by endTime.
    // We use `firedAnnouncementIds` to ensure each announcement fires only once.
    if (!state.isAnnouncementPlaying) {
      const pendingAnnouncement = state.scheduleBlocks.find((block) => {
        if (block.blockType !== 'ANNOUNCEMENT') return false;
        if (state.firedAnnouncementIds.has(block.id)) return false;
        const start = new Date(block.startTime);
        const end = new Date(block.endTime);
        // Trigger if we're within the scheduled window
        return now >= start && now < end;
      });

      if (pendingAnnouncement && state.audioUnlocked) {
        const newFired = new Set(state.firedAnnouncementIds);
        newFired.add(pendingAnnouncement.id);
        set({
          announcementSource: pendingAnnouncement.audioSource,
          isAnnouncementPlaying: true,
          isDucking: true,
          firedAnnouncementIds: newFired,
        });
      }
    }
  },
}));

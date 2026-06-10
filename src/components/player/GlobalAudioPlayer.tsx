'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { YouTubeEmbed } from './YouTubeEmbed';
import { Volume2, VolumeX, Play, Pause, Radio, Music, MonitorPlay, Clock, Megaphone, Mic } from 'lucide-react';

export function GlobalAudioPlayer() {
  const {
    currentSource,
    isPlaying,
    announcementSource,
    isAnnouncementPlaying,
    isDucking,
    volume,
    activeProfileId,
    scheduleBlocks,
    audioUnlocked,
    isMicActive,
    play,
    pause,
    setVolume,
    checkSchedule,
    setScheduleBlocks,
    setAudioUnlocked,
    setMicActive,
    endAnnouncement,
  } = useAudioStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mainAudioRef = useRef<HTMLAudioElement>(null);
  const overlayAudioRef = useRef<HTMLAudioElement>(null);
  const micAudioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [announcementDuration, setAnnouncementDuration] = useState<number | null>(null);

  const toggleMic = async () => {
    if (isMicActive) {
      // Turn off
      if (micAudioRef.current && micAudioRef.current.srcObject) {
        const stream = micAudioRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        micAudioRef.current.srcObject = null;
      }
      setMicActive(false);
    } else {
      // Turn on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (micAudioRef.current) {
          micAudioRef.current.srcObject = stream;
          // Set volume so they can hear themselves, but it might cause echo. 
          // Users will need headphones or keep mic away from speakers.
          micAudioRef.current.volume = volume;
        }
        setMicActive(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
      }
    }
  };
  const [ytReady, setYtReady] = useState(false);
  const ytPlayerRef = useRef<any>(null);

  // Update clock display
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global auto-play unlocker
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!audioUnlocked) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') audioContext.resume();
          setAudioUnlocked(true);
        } catch (e) {}
      }
    };
    
    // Any click or key press on the entire app unlocks audio policies
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioUnlocked, setAudioUnlocked]);

  // Fetch schedule blocks when profile changes
  useEffect(() => {
    if (!activeProfileId || !isAuthenticated) return;
    fetch(`/api/schedule-blocks?profileId=${activeProfileId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.blocks) setScheduleBlocks(data.blocks);
      })
      .catch(console.error);
  }, [activeProfileId, isAuthenticated, setScheduleBlocks]);

  // Schedule polling — check every 10 seconds for quick announcements
  useEffect(() => {
    if (!isAuthenticated) return;
    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, audioUnlocked, scheduleBlocks, checkSchedule]);

  // ── DUCKING: Direct volume control ────────────────────────────────────────
  // When isDucking is true, background goes to 20%. When false, back to 100%.
  useEffect(() => {
    const bgVolume = isDucking ? volume * 0.2 : volume;
    const clampedBg = Math.min(1, Math.max(0, bgVolume));

    if (mainAudioRef.current) {
      mainAudioRef.current.volume = clampedBg;
    }
    if (ytPlayerRef.current && ytReady) {
      try { ytPlayerRef.current.setVolume(clampedBg * 100); } catch {}
    }
  }, [isDucking, volume, ytReady]);

  // ── OVERLAY ANNOUNCEMENT: load() → play() with onEnded ────────────────────
  useEffect(() => {
    const overlay = overlayAudioRef.current;
    if (!overlay) return;

    if (announcementSource && isAnnouncementPlaying) {
      const url = `/api/audio/stream?file=${encodeURIComponent(announcementSource.urlOrPath)}`;

      // Reset duration display
      setAnnouncementDuration(null);

      // Force pre-load the buffer before playing
      overlay.src = url;
      overlay.volume = Math.min(1, Math.max(0, volume));
      overlay.load();

      // Play once loaded — wrapped in try/catch for autoplay policy
      const handleCanPlay = () => {
        try {
          overlay.play().catch((err) => {
            console.error('Overlay play failed:', err);
          });
        } catch (err) {
          console.error('Overlay play exception:', err);
        }
      };

      // Get actual duration from the file metadata
      const handleMetadata = () => {
        if (overlay.duration && isFinite(overlay.duration)) {
          setAnnouncementDuration(Math.ceil(overlay.duration));
        }
      };

      // When the announcement finishes, restore background volume
      const handleEnded = () => {
        setAnnouncementDuration(null);
        endAnnouncement();
      };

      // Handle errors
      const handleError = () => {
        console.error('Overlay audio error:', overlay.error);
        setAnnouncementDuration(null);
        endAnnouncement();
      };

      overlay.addEventListener('canplaythrough', handleCanPlay, { once: true });
      overlay.addEventListener('loadedmetadata', handleMetadata, { once: true });
      overlay.addEventListener('ended', handleEnded, { once: true });
      overlay.addEventListener('error', handleError, { once: true });

      return () => {
        overlay.removeEventListener('canplaythrough', handleCanPlay);
        overlay.removeEventListener('loadedmetadata', handleMetadata);
        overlay.removeEventListener('ended', handleEnded);
        overlay.removeEventListener('error', handleError);
      };
    } else if (!isAnnouncementPlaying) {
      overlay.pause();
      overlay.removeAttribute('src');
      overlay.load(); // Reset the element
    }
  }, [announcementSource, isAnnouncementPlaying, endAnnouncement, volume]);

  // Keep overlay volume in sync if user changes master volume mid-announcement
  useEffect(() => {
    if (overlayAudioRef.current && isAnnouncementPlaying) {
      overlayAudioRef.current.volume = Math.min(1, Math.max(0, volume));
    }
  }, [volume, isAnnouncementPlaying]);

  // ── BACKGROUND AUDIO (RADIO / LOCAL) ──────────────────────────────────────
  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) return;

    if (currentSource && (currentSource.type === 'RADIO' || currentSource.type === 'LOCAL')) {
      const url = currentSource.type === 'RADIO'
        ? currentSource.urlOrPath
        : `/api/audio/stream?file=${encodeURIComponent(currentSource.urlOrPath)}`;

      if (audio.src !== url) {
        audio.src = url;
      }

      if (isPlaying) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentSource, isPlaying]);

  // ── YOUTUBE PLAYER CONTROL ─────────────────────────────────────────────────
  useEffect(() => {
    if (!ytPlayerRef.current || !ytReady) return;

    if (currentSource?.type === 'YOUTUBE') {
      if (isPlaying) {
        try { ytPlayerRef.current.playVideo(); } catch {}
      } else {
        try { ytPlayerRef.current.pauseVideo(); } catch {}
      }
    } else {
      try { ytPlayerRef.current.pauseVideo(); } catch {}
    }
  }, [currentSource, isPlaying, ytReady]);

  const handleYtReady = useCallback((player: any) => {
    ytPlayerRef.current = player;
    setYtReady(true);
  }, []);

  const togglePlay = () => {
    if (!audioUnlocked) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();
        setAudioUnlocked(true);
      } catch (e) {}
    }
    if (isPlaying) pause();
    else play();
  };

  const getSourceIcon = () => {
    if (!currentSource) return <Music className="w-4 h-4" />;
    switch (currentSource.type) {
      case 'YOUTUBE': return <MonitorPlay className="w-4 h-4" />;
      case 'RADIO': return <Radio className="w-4 h-4" />;
      case 'LOCAL': return <Music className="w-4 h-4" />;
    }
  };

  const getTypeBadgeClass = () => {
    if (!currentSource) return 'hidden';
    switch (currentSource.type) {
      case 'YOUTUBE': return 'bg-[#ed4245]/10 text-discord-danger border-discord-danger/20';
      case 'RADIO': return 'bg-[#5865F2]/10 text-discord-blurple border-discord-blurple/20';
      case 'LOCAL': return 'bg-[#3ba55d]/10 text-discord-success border-discord-success/20';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Hidden HTML5 audio: Background (Radio/Local) */}
      <audio ref={mainAudioRef} loop preload="none" crossOrigin="anonymous" />
      {/* Hidden HTML5 audio: Overlay (Announcement) — preload auto for quick start */}
      <audio ref={overlayAudioRef} preload="auto" crossOrigin="anonymous" />
      {/* Hidden HTML5 audio: Live Microphone PA System */}
      <audio ref={micAudioRef} autoPlay muted={false} />

      {/* YouTube Embed */}
      <div className={`fixed bottom-24 right-4 z-40 transition-all duration-300 ${
        currentSource?.type === 'YOUTUBE' ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
      }`}>
        <div className="border border-[#1e1f22] rounded-lg overflow-hidden shadow-elevated bg-[#2f3136]">
          {currentSource?.type === 'YOUTUBE' && (
            <YouTubeEmbed
              key={currentSource.id}
              videoId={currentSource.urlOrPath}
              onReady={handleYtReady}
            />
          )}
        </div>
      </div>

      {/* Static Control Dock */}
      <div className="w-full h-16 bg-[#2f3136] border-t border-[#1e1f22] flex items-center justify-between px-6 gap-6" id="global-player">
        {/* Left: Play/Pause & Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={togglePlay}
              disabled={!currentSource && !announcementSource}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-discord-blurple text-white hover:bg-[#4752C4] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
              id="player-toggle-btn"
            >
              {isPlaying || isAnnouncementPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>

            <div className="min-w-0 flex flex-col justify-center">
              {/* Background Track Info */}
              <div className="flex items-center gap-2">
                <span className={`text-discord-muted`}>{getSourceIcon()}</span>
                <span className={`text-[15px] font-sans font-medium truncate transition-all duration-300 ${isDucking ? 'text-discord-muted' : 'text-white'}`}>
                  {currentSource ? currentSource.name : 'No background active'}
                </span>
                {currentSource && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-opacity duration-300 ${getTypeBadgeClass()} ${isDucking ? 'opacity-40' : 'opacity-100'}`}>
                    {currentSource.type}
                  </span>
                )}
                {isDucking && (
                  <span className="text-[11px] font-medium text-discord-warning hidden md:inline bg-[#faa61a]/10 border border-discord-warning/20 px-1.5 py-0.5 rounded">
                    Duck 20%
                  </span>
                )}
              </div>

              {/* Overlay Announcement Info */}
              {isAnnouncementPlaying && announcementSource && (
                <div className="flex items-center gap-2 mt-1 animate-fade-in">
                  <Megaphone className="w-3.5 h-3.5 text-discord-warning animate-pulse" />
                  <span className="text-[13px] font-sans text-discord-warning truncate font-semibold">
                    ON AIR: {announcementSource.name}
                  </span>
                  {announcementDuration && (
                    <span className="text-[11px] font-medium text-discord-warning/80 hidden sm:inline">
                      [{announcementDuration}s]
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center: Status Icons */}
          <div className="hidden md:flex items-center gap-4 text-discord-muted">
            {isDucking && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#faa61a]/10 border border-discord-warning/20 rounded-full text-discord-warning">
                <span className="w-2 h-2 rounded-full bg-discord-warning animate-pulse" />
                <span className="font-sans font-medium text-[11px] uppercase tracking-wider">Ducking</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-discord-muted" />
              <span className="font-sans font-medium text-sm text-discord-muted">{currentTime}</span>
            </div>
            {audioUnlocked && (
              <span className="w-2 h-2 bg-discord-success rounded-full" title="Audio unlocked" />
            )}
          </div>

          {/* Right: Controls & Volume */}
          <div className="flex items-center gap-3 flex-shrink-0 pl-4 border-l border-[#1e1f22]">
            <button
              onClick={toggleMic}
              title={isMicActive ? "Desactivar Megáfono" : "Activar Megáfono (PA)"}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                isMicActive 
                  ? 'bg-discord-danger text-white animate-pulse shadow-[0_0_10px_rgba(237,66,69,0.5)]' 
                  : 'text-discord-muted hover:bg-[#36393f] hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="text-discord-muted hover:text-white transition-colors ml-2"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="discord-range-slider"
              id="volume-slider"
            />
          </div>
      </div>
    </>
  );
}

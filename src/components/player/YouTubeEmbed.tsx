'use client';

import { useEffect, useState, memo } from 'react';
import YouTube from 'react-youtube';

interface YouTubeEmbedProps {
  videoId: string;
  onReady: (player: any) => void;
}

export const YouTubeEmbed = memo(function YouTubeEmbed({ videoId, onReady }: YouTubeEmbedProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-[160px] h-[90px] bg-[#202225] flex items-center justify-center">
        <span className="text-discord-muted text-xs font-sans">Loading...</span>
      </div>
    );
  }

  // Extract YouTube ID if a full URL was provided
  const extractYoutubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  const parsedVideoId = extractYoutubeId(videoId);

  return (
    <YouTube
      videoId={parsedVideoId || undefined}
      opts={{
        width: '160',
        height: '90',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1,
        },
      }}
      onReady={(event: { target: any }) => {
        onReady(event.target);
      }}
      onEnd={(event: { target: any }) => {
        // Auto-loop: restart the video when it finishes
        event.target.seekTo(0);
        event.target.playVideo();
      }}
      className="youtube-embed"
    />
  );
});

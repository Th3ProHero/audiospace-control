import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { GlobalAudioPlayer } from '@/components/player/GlobalAudioPlayer';
export const metadata: Metadata = {
  title: 'AudioSpace Control | Ambient Audio Automation',
  description: 'Automate and schedule commercial ambient audio for physical environments. Control YouTube, Radio, and local MP3 sources on a timeline.',
  keywords: ['audio', 'automation', 'ambient', 'schedule', 'commercial', 'SaaS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-screen w-screen overflow-hidden bg-[#202225] text-white antialiased">
        <ClientProviders>
          <div className="flex flex-col h-screen w-screen overflow-hidden">
            <div className="flex-grow overflow-hidden relative min-h-0">
              {children}
            </div>
            {/* The Global Audio Player rendered here so it sits at the bottom statically */}
            <div id="player-dock-container" className="flex-shrink-0 z-50 bg-[#202225]">
              <GlobalAudioPlayer />
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

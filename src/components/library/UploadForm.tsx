'use client';

import { useState } from 'react';
import { UploadCloud, Youtube, Radio, FileAudio, CheckCircle2, MessageSquare } from 'lucide-react';

export function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState<'LOCAL' | 'YOUTUBE' | 'RADIO' | 'TTS'>('LOCAL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [ttsText, setTtsText] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      if (activeTab === 'LOCAL') {
        if (!file) throw new Error('Select an MP3 file');
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/audio/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
      } else if (activeTab === 'TTS') {
        if (!name || !ttsText) throw new Error('Name and Text required');
        const res = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, text: ttsText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
      } else {
        if (!name || !url) throw new Error('Name and URL required');
        // Extract YouTube ID if it's a full URL
        let finalUrl = url;
        if (activeTab === 'YOUTUBE') {
          const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
          if (match) finalUrl = match[1];
        }

        const res = await fetch('/api/audio-sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: activeTab, name, urlOrPath: finalUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setSuccess(true);
      setFile(null);
      setName('');
      setUrl('');
      setTtsText('');
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#2f3136] rounded-xl border border-[#1e1f22] p-5">
      <div className="flex border-b border-[#1e1f22] mb-4">
        <button
          onClick={() => setActiveTab('LOCAL')}
          className={`flex-1 py-2.5 font-sans text-sm font-medium transition-colors ${activeTab === 'LOCAL' ? 'text-discord-success border-b-2 border-discord-success bg-discord-success/5' : 'text-discord-muted hover:text-white'}`}
        >
          <FileAudio className="w-4 h-4 mx-auto mb-1" /> MP3
        </button>
        <button
          onClick={() => setActiveTab('YOUTUBE')}
          className={`flex-1 py-2.5 font-sans text-sm font-medium transition-colors ${activeTab === 'YOUTUBE' ? 'text-discord-danger border-b-2 border-discord-danger bg-discord-danger/5' : 'text-discord-muted hover:text-white'}`}
        >
          <Youtube className="w-4 h-4 mx-auto mb-1" /> YouTube
        </button>
        <button
          onClick={() => setActiveTab('RADIO')}
          className={`flex-1 py-2.5 font-sans text-sm font-medium transition-colors ${activeTab === 'RADIO' ? 'text-discord-blurple border-b-2 border-discord-blurple bg-discord-blurple/5' : 'text-discord-muted hover:text-white'}`}
        >
          <Radio className="w-4 h-4 mx-auto mb-1" /> Stream
        </button>
        <button
          onClick={() => setActiveTab('TTS')}
          className={`flex-1 py-2.5 font-sans text-sm font-medium transition-colors ${activeTab === 'TTS' ? 'text-discord-warning border-b-2 border-discord-warning bg-discord-warning/5' : 'text-discord-muted hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4 mx-auto mb-1" /> TTS
        </button>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {activeTab === 'LOCAL' && (
          <div className="border-2 border-dashed border-[#1e1f22] p-6 text-center rounded-lg hover:border-discord-blurple/50 transition-colors relative bg-[#202225]/50">
            <input
              type="file"
              accept=".mp3,.wav,.ogg,.m4a"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-8 h-8 text-discord-blurple mx-auto mb-2" />
            <p className="font-sans text-sm text-discord-muted">
              {file ? file.name : 'Select or drop MP3 file here'}
            </p>
            <p className="font-sans text-[10px] text-discord-muted/50 mt-1">MAX 50MB</p>
          </div>
        )}

        {activeTab === 'TTS' && (
          <>
            <div>
              <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-1.5">Nombre del Anuncio</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="discord-input text-sm"
                placeholder="Ej., Cierre de Puertas"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide">Texto a leer</label>
                <span className={`text-xs font-mono ${ttsText.length > 150 ? 'text-discord-danger' : 'text-discord-muted'}`}>
                  {ttsText.length}/150
                </span>
              </div>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                maxLength={150}
                className="discord-input text-sm resize-none h-24"
                placeholder="Escribe el mensaje aquí..."
                required
              />
            </div>
          </>
        )}

        {(activeTab === 'YOUTUBE' || activeTab === 'RADIO') && (
          <>
            <div>
              <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-1.5">Source Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="discord-input text-sm"
                placeholder={activeTab === 'YOUTUBE' ? 'e.g., Lofi Playlist' : 'e.g., Jazz Radio'}
                required
              />
            </div>
            <div>
              <label className="text-xs font-sans font-semibold text-discord-muted uppercase tracking-wide block mb-1.5">
                {activeTab === 'YOUTUBE' ? 'YouTube URL or Video ID' : 'Stream URL (Icecast/Shoutcast)'}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="discord-input text-sm"
                placeholder={activeTab === 'YOUTUBE' ? 'https://youtube.com/watch?v=...' : 'https://stream.url/...'}
                required
              />
            </div>
          </>
        )}

        {error && (
          <div className="text-discord-danger text-xs font-sans font-medium bg-discord-danger/10 border border-discord-danger/20 p-2.5 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-discord-success text-xs font-sans font-medium bg-discord-success/10 border border-discord-success/20 p-2.5 rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Source added successfully
          </div>
        )}

        <button 
          type="submit" 
          disabled={
            isLoading || 
            (activeTab === 'LOCAL' && !file) || 
            (activeTab === 'TTS' && ttsText.length > 150)
          } 
          className="discord-button discord-button-primary w-full text-sm"
        >
          {isLoading ? 'Processing...' : activeTab === 'TTS' ? 'Generar Audio' : 'Add to Library'}
        </button>
      </form>
    </div>
  );
}

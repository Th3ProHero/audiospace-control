'use client';

import { useState, useEffect } from 'react';
import { UploadForm } from '@/components/library/UploadForm';
import { MonitorPlay, Radio, Music, Trash2 } from 'lucide-react';

export default function LibraryPage() {
  const [sources, setSources] = useState<any[]>([]);

  const fetchSources = () => {
    fetch('/api/audio-sources')
      .then(res => res.json())
      .then(data => {
        if (data.sources) setSources(data.sources);
      });
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? If this is a local file, it will be removed from storage.`)) return;
    const res = await fetch(`/api/audio-sources/${id}`, { method: 'DELETE' });
    if (res.ok) fetchSources();
  };

  const getIcon = (type: string) => {
    if (type === 'YOUTUBE') return <MonitorPlay className="w-4 h-4" />;
    if (type === 'RADIO') return <Radio className="w-4 h-4" />;
    return <Music className="w-4 h-4" />;
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'YOUTUBE': return 'bg-discord-danger/10 text-discord-danger border-discord-danger/20';
      case 'RADIO': return 'bg-discord-blurple/10 text-discord-blurple border-discord-blurple/20';
      default: return 'bg-discord-success/10 text-discord-success border-discord-success/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1e1f22] pb-4">
        <h1 className="text-2xl font-sans font-bold text-white uppercase tracking-tight">Source Library</h1>
        <p className="text-discord-muted font-sans text-sm mt-1">
          Manage local files, external streams, and video links
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UploadForm onSuccess={fetchSources} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#2f3136] rounded-xl border border-[#1e1f22] p-5">
            <h3 className="font-sans font-semibold text-discord-muted text-sm uppercase tracking-wider mb-4 border-b border-[#1e1f22] pb-2">
              Available Sources ({sources.length})
            </h3>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {sources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-3 border border-[#1e1f22] rounded-md bg-[#202225] hover:border-discord-blurple/30 transition-colors group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="text-discord-muted">
                      {getIcon(source.type)}
                    </div>
                    <div className="truncate">
                      <div className="font-sans text-sm font-medium text-white truncate">{source.name}</div>
                      <div className="flex gap-2 items-center mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${getTypeBadgeClass(source.type)}`}>
                          {source.type}
                        </span>
                        <span className="font-sans text-[10px] text-discord-muted truncate">
                          {source.urlOrPath}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(source.id, source.name)}
                    className="p-2 text-discord-muted hover:text-discord-danger hover:bg-discord-danger/10 rounded transition-colors"
                    title="Delete source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {sources.length === 0 && (
                <div className="text-center py-8 text-discord-muted font-sans text-sm">
                  Library is empty.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

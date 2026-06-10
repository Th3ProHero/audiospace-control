'use client';

import { useEffect, useState } from 'react';
import { Database, HardDrive } from 'lucide-react';

export function StorageWidget() {
  const [stats, setStats] = useState({ used: 0, total: 1073741824, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/storage')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isNearCapacity = stats.percentage > 90;

  if (isLoading) return <div className="bg-[#2f3136] rounded-xl border border-[#1e1f22] p-5 animate-pulse h-32" />;

  return (
    <div className={`bg-[#2f3136] rounded-xl border border-[#1e1f22] p-5 relative overflow-hidden ${isNearCapacity ? 'border-discord-danger/50' : ''}`}>
      {isNearCapacity && (
        <div className="absolute inset-0 bg-discord-danger/5 animate-pulse" />
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded bg-[#202225] border ${isNearCapacity ? 'border-discord-danger/30 text-discord-danger' : 'border-[#1e1f22] text-discord-blurple'}`}>
          <HardDrive className="w-5 h-5" />
        </div>
        <h3 className="font-sans font-semibold text-discord-muted text-sm uppercase tracking-wider">Local Storage Allocation</h3>
      </div>
      
      <div className="flex justify-between items-end mb-2 font-sans">
        <div className="text-2xl font-bold text-white">
          {formatBytes(stats.used)}
        </div>
        <div className="text-discord-muted text-sm">
          / {formatBytes(stats.total)}
        </div>
      </div>
      
      <div className="mt-4 h-2.5 bg-[#202225] border border-[#1e1f22] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isNearCapacity ? 'bg-discord-danger shadow-[0_0_8px_rgba(237,66,69,0.5)]' : 'bg-discord-blurple'}`}
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
      
      <div className="mt-2 text-right">
        <span className={`text-xs font-sans font-medium ${isNearCapacity ? 'text-discord-danger animate-pulse' : 'text-discord-blurple'}`}>
          {stats.percentage}% UTILIZED
        </span>
      </div>
    </div>
  );
}

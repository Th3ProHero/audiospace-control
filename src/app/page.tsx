'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { Terminal, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@audiospace.local');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((s) => s.login);
  const setAudioUnlocked = useAudioStore((s) => s.setAudioUnlocked);
  const router = useRouter();

  const handleUnlockAudio = () => {
    // Attempt to unlock audio context on first interaction
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Also interact with the hidden global audio element if possible
      const globalAudio = document.querySelector('audio');
      if (globalAudio) {
        globalAudio.play().then(() => {
          globalAudio.pause();
          setAudioUnlocked(true);
        }).catch(() => {
          // It's okay if it fails, we just want to attempt unlocking
          setAudioUnlocked(true);
        });
      } else {
        setAudioUnlocked(true);
      }
    } catch (e) {
      console.error('Audio unlock failed:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Unlock audio on login click
    handleUnlockAudio();

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Try admin@audiospace.local / password123');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#202225] px-4">
      <div className="w-full max-w-md bg-[#2f3136] rounded-xl shadow-elevated border border-[#1e1f22] p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#202225] text-discord-blurple rounded-xl flex items-center justify-center mb-4 border border-[#1e1f22]">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-sans font-bold text-white tracking-tight">AudioSpace</h1>
          <p className="text-discord-muted text-sm mt-1 font-medium">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-discord-muted block uppercase tracking-wide text-[11px]">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="discord-input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-discord-muted block uppercase tracking-wide text-[11px]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="discord-input"
              required
            />
          </div>

          {error && (
            <div className="text-discord-danger text-sm bg-discord-danger/10 border border-discord-danger/20 p-3 rounded-md font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="discord-button discord-button-primary w-full py-2.5 flex justify-center mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-discord-muted font-medium">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}

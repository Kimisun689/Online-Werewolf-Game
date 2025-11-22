'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function JoinRoom() {
  const [playerName, setPlayerName] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://192.168.1.8:8080');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectToServer, isConnected } = useGame();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsConnecting(true);
    try {
      await connectToServer(serverUrl, playerName.trim());
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('连接服务器失败，请检查服务器地址');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return null; // 连接成功后由其他组件处理
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/5 to-transparent rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      
      <div className="relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-10 max-w-md w-full border border-yellow-500/20 shadow-2xl">
        <div className="text-center mb-10">
          <div className="text-8xl mb-6 animate-bounce-slow">🐺</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            Werewolf
          </h1>
          <p className="text-xl text-yellow-300/80 font-medium">Join room to start game</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-bold text-yellow-300/90 mb-3">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={12}
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-yellow-500/20 rounded-2xl text-yellow-100 placeholder-yellow-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-lg text-base transition-all duration-300"
              required
            />
          </div>

          <div>
            <label htmlFor="serverUrl" className="block text-sm font-bold text-yellow-300/90 mb-3">
              Server Address
            </label>
            <input
              type="text"
              id="serverUrl"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="ws://serverIP:port"
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-yellow-500/20 rounded-2xl text-yellow-100 placeholder-yellow-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-lg text-base transition-all duration-300"
              required
            />
            <p className="text-sm text-yellow-300/60 mt-2">
              Example: ws://192.168.1.8:8080
            </p>
          </div>

          <button
            type="submit"
            disabled={isConnecting || !playerName.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-bold text-lg rounded-2xl hover:from-yellow-300 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-yellow-400/25 transform hover:scale-105"
          >
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Join Room'
            )}
          </button>
        </form>

        <div className="mt-12 p-6 bg-gradient-to-br from-yellow-900/20 to-amber-900/10 rounded-2xl border border-yellow-500/30 backdrop-blur-lg">
          <h3 className="text-lg font-bold text-yellow-300/90 mb-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            Instructions
          </h3>
          <ul className="text-sm text-yellow-300/70 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Make sure you're on the same WiFi as the game host</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Get the server address from the game host</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Enter your nickname to join the game</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Supports mobile and computer access</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

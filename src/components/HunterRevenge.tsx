'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function HunterRevenge() {
  const { gameState, sendMessage, currentPlayer } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [canShoot, setCanShoot] = useState(false);

  const { players } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);

  useEffect(() => {
    // Listen for hunter revenge trigger
    const handleMessage = (event: any) => {
      if (event.type === 'hunterRevenge') {
        setCanShoot(event.data.canShoot);
      }
    };

    // This would be handled through WebSocket in real implementation
    // For now, we'll check if current player is dead hunter
    if (currentPlayer?.role === 'hunter' && !currentPlayer.isAlive) {
      // Hunter is dead, check if revenge is available
      setCanShoot(true);
    }
  }, [currentPlayer]);

  const handleRevenge = () => {
    if (!selectedTarget || !currentPlayer?.role) return;

    sendMessage('hunterRevenge', { targetId: selectedTarget });
    setCanShoot(false);
  };

  if (!canShoot || currentPlayer?.role !== 'hunter') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 rounded-3xl p-8 max-w-md w-full border-2 border-red-500/50 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏹</div>
          <h2 className="text-3xl font-bold text-red-400 mb-2">Hunter's Revenge!</h2>
          <p className="text-yellow-300/80">You have died! Take your revenge by shooting one player.</p>
        </div>

        <div className="space-y-3 mb-6">
          {alivePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTarget(player.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                selectedTarget === player.id
                  ? 'bg-gradient-to-r from-red-600/30 to-red-800/30 border-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-gradient-to-r from-gray-800/60 to-gray-900/60 border-yellow-500/20 hover:border-red-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-yellow-100">{player.name}</h3>
                  <p className="text-sm text-yellow-300/60">Unknown Role</p>
                </div>
                <div className="text-2xl opacity-50">👤</div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRevenge}
            disabled={!selectedTarget}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl hover:from-red-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          >
            🏹 Take Revenge
          </button>
          <button
            onClick={() => setCanShoot(false)}
            className="px-6 py-3 bg-gray-700/60 text-gray-300 rounded-2xl hover:bg-gray-600/60 transition-colors duration-300"
          >
            Skip
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
          <p className="text-xs text-yellow-300/70">
            💡 <strong>Strategy:</strong> If you shoot a werewolf, it's justice served! 
            If you shoot an innocent, it's a tragic mistake!
          </p>
        </div>
      </div>
    </div>
  );
}

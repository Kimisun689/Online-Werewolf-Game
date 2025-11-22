'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function NightAction() {
  const { gameState, sendMessage, currentPlayer } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasActed, setHasActed] = useState(false);
  const [witchPotionUsed, setWitchPotionUsed] = useState({ heal: false, poison: false });
  const [nightPhase, setNightPhase] = useState<'werewolf' | 'witch' | 'seer'>('werewolf');
  const [werewolfTarget, setWerewolfTarget] = useState<string | null>(null);

  const { players } = gameState;
  const alivePlayers = players.filter(p => p.isAlive && p.id !== currentPlayer?.id);

  useEffect(() => {
    // Listen for night phase changes
    const handleMessage = (event: any) => {
      if (event.type === 'nightPhase') {
        setNightPhase(event.data.phase);
        if (event.data.werewolfTarget) {
          setWerewolfTarget(event.data.werewolfTarget);
        }
        setHasActed(false);
        setSelectedTarget(null);
      }
    };

    // This would be handled through the WebSocket in a real implementation
    // For now, we'll use the gameState to determine the current phase
    if (gameState.phase === 'night') {
      // The current player's role determines which phase they're in
      if (currentPlayer?.role === 'werewolf') {
        setNightPhase('werewolf');
      } else if (currentPlayer?.role === 'witch') {
        setNightPhase('witch');
      } else if (currentPlayer?.role === 'seer') {
        setNightPhase('seer');
      }
      
      // IMPORTANT: Player can act even if they were targeted by werewolf!
      // The death only happens at dawn
    }
  }, [gameState.phase, currentPlayer?.role]);

  const handleAction = () => {
    if (!selectedTarget || !currentPlayer?.role) return;

    switch (currentPlayer.role) {
      case 'werewolf':
        sendMessage('werewolfKill', { targetId: selectedTarget });
        break;
      case 'seer':
        sendMessage('seerCheck', { targetId: selectedTarget });
        break;
      case 'witch':
        // 女巫特殊处理在下面
        break;
      case 'hunter':
        // 猎人只在死亡时触发
        break;
    }
    setHasActed(true);
  };

  const handleWitchAction = (action: 'heal' | 'poison' | 'skip', targetId?: string) => {
    if (action === 'heal') {
      sendMessage('witchHeal', {});
      setWitchPotionUsed(prev => ({ ...prev, heal: true }));
    } else if (action === 'poison' && targetId) {
      sendMessage('witchPoison', { targetId });
      setWitchPotionUsed(prev => ({ ...prev, poison: true }));
    } else {
      sendMessage('witchSkip', {});
    }
    setHasActed(true);
  };

  const getActionText = () => {
    if (!currentPlayer?.role) return '';
    switch (currentPlayer.role) {
      case 'werewolf': return 'Select kill target';
      case 'seer': return 'Select check target';
      case 'witch': return 'Use potion';
      default: return 'Waiting for dawn...';
    }
  };

  const getButtonText = () => {
    if (!currentPlayer?.role) return '';
    switch (currentPlayer.role) {
      case 'werewolf': return 'Confirm Kill';
      case 'seer': return 'Confirm Check';
      case 'witch': return 'Confirm Use';
      default: return '';
    }
  };

  // Check if it's current player's turn in the night sequence
  const isPlayerTurn = currentPlayer?.role === nightPhase;

  // IMPORTANT: All players can act during their turn even if targeted by werewolf!
  // Death only happens at dawn, not immediately
  const canAct = currentPlayer?.isAlive && gameState.phase === 'night' && isPlayerTurn;

  if (!currentPlayer?.isAlive || gameState.phase !== 'night') {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl text-center">
        <div className="text-6xl mb-4">🌙</div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Night Phase</h2>
        <p className="text-yellow-300/80">The village sleeps... Special roles are acting.</p>
      </div>
    );
  }

  if (!canAct) {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl text-center">
        <div className="text-6xl mb-4">🌙</div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Night Phase</h2>
        <p className="text-yellow-300/80 mb-4">
          {nightPhase === 'werewolf' && 'The werewolves are hunting...'}
          {nightPhase === 'witch' && 'The witch is deciding...'}
          {nightPhase === 'seer' && 'The seer is investigating...'}
        </p>
        <p className="text-yellow-300/60 text-sm">Please wait for your turn.</p>
        {currentPlayer?.role && nightPhase !== currentPlayer?.role && (
          <p className="text-yellow-300/50 text-xs mt-2">
            Your turn ({currentPlayer.role}) is coming up...
          </p>
        )}
      </div>
    );
  }

  if (hasActed) {
    return (
      <div className="text-center">
        <div className="text-green-400 font-semibold mb-2">✓ Action Complete</div>
        <p className="text-yellow-300/80 text-sm">Waiting for other players...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-yellow-400 mb-4">Night Action</h3>
      <p className="text-yellow-300/80 text-sm mb-4">{getActionText()}</p>
      
      {currentPlayer.role === 'witch' ? (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
            <p className="text-yellow-300 text-sm mb-3">Witch Potions</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleWitchAction('heal')}
                disabled={witchPotionUsed.heal || hasActed}
                className="w-full p-3 bg-green-900/40 border border-green-600/30 rounded-lg text-green-300 hover:bg-green-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                💊 Antidote {witchPotionUsed.heal && '(Used)'}
              </button>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedTarget('poison')}
                  disabled={witchPotionUsed.poison || hasActed}
                  className="w-full p-3 bg-red-900/40 border border-red-600/30 rounded-lg text-red-300 hover:bg-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ☠️ Poison {witchPotionUsed.poison && '(Used)'}
                </button>
                
                {selectedTarget === 'poison' && (
                  <div className="space-y-1 ml-2">
                    <p className="text-xs text-red-300">Select poison target:</p>
                    {alivePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleWitchAction('poison', player.id)}
                        className="w-full p-2 bg-red-900/20 border border-red-600/20 rounded text-red-200 hover:bg-red-900/40 text-sm"
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleWitchAction('skip')}
                disabled={hasActed}
                className="w-full p-3 bg-gray-800/60 border border-yellow-600/20 rounded-lg text-yellow-300 hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ❌ Don't use potion
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {alivePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTarget(player.id)}
              className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedTarget === player.id
                  ? 'bg-yellow-900/40 border-yellow-500'
                  : 'bg-gray-800/60 border-yellow-600/20 hover:bg-gray-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-yellow-100 font-medium">{player.name}</span>
                {selectedTarget === player.id && (
                  <span className="text-yellow-400">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {currentPlayer.role !== 'witch' && (
        <button
          onClick={handleAction}
          disabled={!selectedTarget}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {getButtonText()}
        </button>
      )}
    </div>
  );
}

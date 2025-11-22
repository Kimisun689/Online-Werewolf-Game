'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function VotingPanel() {
  const { gameState, sendMessage, currentPlayer } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { players, votingResults } = gameState;
  const alivePlayers = players.filter(p => p.isAlive && p.id !== currentPlayer?.id);

  const handleVote = () => {
    if (selectedPlayer) {
      sendMessage('vote', { targetId: selectedPlayer });
      setHasVoted(true);
    }
  };

  // 显示投票结果
  const getVoteCounts = () => {
    if (!votingResults?.votes) return {};
    
    const counts: { [key: string]: number } = {};
    Object.values(votingResults.votes).forEach(targetId => {
      counts[targetId] = (counts[targetId] || 0) + 1;
    });
    return counts;
  };

  const voteCounts = getVoteCounts();

  if (hasVoted || votingResults) {
    return (
      <div className="text-center">
        <div className="text-green-400 font-semibold mb-4">
          {votingResults ? 'Voting Ended' : '✓ You have voted'}
        </div>
        
        {votingResults && (
          <div className="space-y-3">
            <h4 className="text-yellow-400 font-semibold">Voting Results</h4>
            {Object.entries(voteCounts).map(([playerId, count]) => {
              const player = players.find(p => p.id === playerId);
              if (!player) return null;
              
              return (
                <div key={playerId} className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3">
                  <span className="text-yellow-100">{player.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-300/80">{count} votes</span>
                    {votingResults.targetId === playerId && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Exiled</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {votingResults.targetId && (
              <div className="mt-4 p-3 bg-red-900/40 rounded-lg border border-red-600/30">
                <p className="text-red-300">
                  {players.find(p => p.id === votingResults.targetId)?.name} was exiled!
                </p>
              </div>
            )}
          </div>
        )}
        
        {!votingResults && (
          <p className="text-yellow-300/80 text-sm">Waiting for other players to vote...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-yellow-400 mb-4">Vote to Exile</h3>
      <p className="text-yellow-300/80 text-sm mb-4">Choose the player you think is the werewolf</p>
      
      <div className="space-y-2 mb-6">
        {alivePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelectedPlayer(player.id)}
            className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
              selectedPlayer === player.id
                ? 'bg-black/40 border-yellow-500'
                : 'bg-black/60 border-yellow-600/20 hover:bg-black/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-yellow-100 font-medium">{player.name}</span>
              {selectedPlayer === player.id && (
                <span className="text-yellow-400">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={!selectedPlayer}
        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
      >
        Confirm Vote
      </button>
    </div>
  );
}

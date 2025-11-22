'use client';

import { useGame } from '@/contexts/GameContext';
import { useState } from 'react';
import PlayerCard from './PlayerCard';
import VotingPanel from './VotingPanel';
import ChatPanel from './ChatPanel';
import NightAction from './NightAction';
import HunterRevenge from './HunterRevenge';

export default function GameBoard() {
  const { gameState, currentPlayer, sendMessage } = useGame();
  const { phase, currentDay, players } = gameState;
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const getPhaseTitle = () => {
    switch (phase) {
      case 'night': return `🌙 Night ${currentDay}`;
      case 'day': return `☀️ Day ${currentDay} - Discussion`;
      case 'voting': return `🗳️ Day ${currentDay} - Voting`;
      case 'ended': return '🏁 Game Over';
      default: return 'Game in Progress';
    }
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'night':
        return 'The night is dark, special characters perform actions...';
      case 'day':
        return 'The sun has risen, discuss who is the werewolf...';
      case 'voting':
        return 'Voting time, choose the player to expel...';
      case 'ended':
        return 'The game is over, check the results...';
      default:
        return '';
    }
  };

  const isCurrentPlayerAlive = currentPlayer?.isAlive;
  const canAct = isCurrentPlayerAlive && phase !== 'ended';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/5 to-transparent rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl border-b border-yellow-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
                {getPhaseTitle()}
              </h1>
              <p className="text-gray-400 text-sm font-medium">{getPhaseDescription()}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-6 py-3 rounded-2xl border border-yellow-500/20 shadow-xl">
              <div className="text-yellow-400 text-sm font-medium mb-1">Survivors</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-yellow-300 drop-shadow-lg">
                  {players.filter(p => p.isAlive).length}
                </span>
                <span className="text-xl text-gray-500">/</span>
                <span className="text-2xl text-gray-400">{players.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Players Grid */}
            <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none"></div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-6 relative z-10 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-amber-400 rounded-full"></div>
                Players
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCurrentPlayer={player.id === currentPlayer?.id}
                    showRole={phase === 'ended' || (player.id === currentPlayer?.id && player.isAlive)}
                    isSelectable={canAct && phase === 'voting' && player.isAlive && player.id !== currentPlayer?.id}
                    isSelected={selectedPlayer === player.id}
                    onClick={() => {
                      if (phase === 'voting' && canAct) {
                        setSelectedPlayer(player.id === selectedPlayer ? null : player.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action Area */}
            {canAct && (
              <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  {phase === 'night' && <NightAction />}
                  {phase === 'voting' && <VotingPanel />}
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {phase === 'ended' && (
              <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-12 border border-yellow-500/20 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-400/5 pointer-events-none"></div>
                <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">
                      {(() => {
                        const werewolves = players.filter(p => p.role === 'werewolf' && p.isAlive);
                        const goodPeople = players.filter(p => p.role !== 'werewolf' && p.isAlive);
                        
                        if (werewolves.length >= goodPeople.length) {
                          return '🐺';
                        } else {
                          return '👥';
                        }
                      })()}
                    </div>
                    <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl">
                      Game Over
                    </h2>
                    <div className="text-2xl text-yellow-300 font-medium">
                      {(() => {
                        const werewolves = players.filter(p => p.role === 'werewolf' && p.isAlive);
                        const goodPeople = players.filter(p => p.role !== 'werewolf' && p.isAlive);
                        
                        if (werewolves.length >= goodPeople.length) {
                          return 'Werewolves Win!';
                        } else {
                          return 'Good People Win!';
                        }
                      })()}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-yellow-400">Final Roles</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {players.map((player) => (
                        <div key={player.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-yellow-500/10 backdrop-blur-lg">
                          <div className="text-yellow-200 font-semibold text-lg mb-2">{player.name}</div>
                          <div className="text-3xl mb-2">
                            {player.role === 'werewolf' && '🐺'}
                            {player.role === 'seer' && '🔮'}
                            {player.role === 'witch' && '🧪'}
                            {player.role === 'hunter' && '🏹'}
                            {player.role === 'villager' && '👤'}
                          </div>
                          <div className="text-yellow-300/80 text-sm font-medium">
                            {player.role === 'werewolf' && 'Werewolf'}
                            {player.role === 'seer' && 'Seer'}
                            {player.role === 'witch' && 'Witch'}
                            {player.role === 'hunter' && 'Hunter'}
                            {player.role === 'villager' && 'Villager'}
                          </div>
                          <div className="mt-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                              player.isAlive 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${player.isAlive ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                              {player.isAlive ? 'Alive' : 'Dead'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => sendMessage('returnToLobby', {})}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-bold text-lg rounded-2xl hover:from-yellow-300 hover:to-amber-300 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/25 transform hover:scale-105"
                  >
                    Return to Lobby
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            {/* Role Info */}
            {currentPlayer?.role && isCurrentPlayerAlive && (
              <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10 text-center space-y-6">
                  <h3 className="text-xl font-bold text-yellow-400">Your Role</h3>
                  <div className="space-y-4">
                    <div className="text-6xl animate-bounce-slow">
                      {currentPlayer.role === 'werewolf' && '🐺'}
                      {currentPlayer.role === 'seer' && '🔮'}
                      {currentPlayer.role === 'witch' && '🧪'}
                      {currentPlayer.role === 'hunter' && '🏹'}
                      {currentPlayer.role === 'villager' && '👤'}
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent text-2xl font-bold">
                      {currentPlayer.role === 'werewolf' && 'Werewolf'}
                      {currentPlayer.role === 'seer' && 'Seer'}
                      {currentPlayer.role === 'witch' && 'Witch'}
                      {currentPlayer.role === 'hunter' && 'Hunter'}
                      {currentPlayer.role === 'villager' && 'Villager'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Panel */}
            <ChatPanel />
          </div>
        </div>
      </div>

      {/* Hunter Revenge Modal */}
      <HunterRevenge />
    </div>
  );
}

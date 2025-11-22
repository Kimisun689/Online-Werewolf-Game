'use client';

import { useGame } from '@/contexts/GameContext';
import PlayerCard from './PlayerCard';

export default function WaitingLobby() {
  const { gameState, sendMessage, currentPlayer } = useGame();
  const { players } = gameState;

  console.log('WaitingLobby - Players:', players);
  console.log('WaitingLobby - Current player:', currentPlayer);
  console.log('WaitingLobby - Player count:', players.length);

  const isHost = currentPlayer?.isHost;
  const canStart = players.length >= 1; // Temporary: allow 1 player for testing

  const handleStartGame = () => {
    console.log('Start game button clicked');
    console.log('Players:', players);
    console.log('Current player:', currentPlayer);
    console.log('Is host:', isHost);
    console.log('Can start:', canStart);
    sendMessage('startGame', {});
  };

  const handleLeaveGame = () => {
    sendMessage('leaveGame', {});
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2">🐺 Werewolf</h1>
          <p className="text-xl text-yellow-300/80">Waiting for players to join...</p>
        </div>

        {/* Game Info */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-yellow-600/20 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="text-yellow-100">
              <span className="text-lg font-semibold">Player Count: </span>
              <span className="text-2xl font-bold text-yellow-300">{players.length}/12</span>
            </div>
            <div className="text-yellow-100">
              <span className="text-sm text-yellow-300/80">Room Status: </span>
              <span className="text-lg font-semibold text-green-400">Waiting</span>
            </div>
          </div>
          
          {players.length < 1 && (
            <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
              <p className="text-yellow-300 text-sm">
                ⚠️ No players in room yet
              </p>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 mb-8 border border-yellow-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none"></div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 relative z-10 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-amber-400 rounded-full"></div>
            Players in Room
          </h2>
          
          {players.length === 0 ? (
            <div className="text-center py-8 relative z-10">
              <div className="text-6xl mb-4 opacity-50">👥</div>
              <p className="text-yellow-300/60">No players yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {players.map((player, index) => (
                <div key={player.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-2xl border border-yellow-500/10 backdrop-blur-lg group hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg group-hover:shadow-yellow-400/30 transition-all duration-300">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-yellow-100">
                        {player.name}
                      </h3>
                      {player.isHost && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs rounded-full font-bold">
                          👑 Host
                        </span>
                      )}
                      {player.id === currentPlayer?.id && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium border border-green-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-yellow-300/60">
                      {player.isHost ? 'Room Host' : 'Player'} • Joined #{index + 1}
                    </p>
                  </div>
                  <div className="text-2xl opacity-50">
                    {player.isHost ? '👑' : '👤'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {canStart ? 'Start Game' : 'Waiting for players...'}
            </button>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-lg">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-yellow-300/80 font-medium mb-2">Waiting for host to start game...</p>
                <p className="text-yellow-300/60 text-sm">
                  Only the host (👑 {players.find(p => p.isHost)?.name || 'Host'}) can start the game
                </p>
              </div>
              <button
                onClick={handleLeaveGame}
                className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-all duration-200 font-medium"
              >
                Leave Room
              </button>
            </div>
          )}
        </div>

        {/* Game Rules */}
        <div className="mt-12 bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-yellow-600/10">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">🎮 Game Rules</h3>
          <div className="grid md:grid-cols-2 gap-6 text-yellow-300/80 text-sm">
            <div>
              <h4 className="font-semibold text-yellow-200 mb-2">Role Configuration</h4>
              <ul className="space-y-1">
                <li>• 2-4 players: 1 Werewolf + Seer + Witch + Hunter/Villager</li>
                <li>• 5-8 players: 2 Werewolves + Seer + Witch + Hunter + Villagers</li>
                <li>• 9-11 players: 3 Werewolves + Seer + Witch + Hunter + Villagers</li>
                <li>• 12 players: 4 Werewolves + Seer + Witch + Hunter + Villagers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-200 mb-2">Win Conditions</h4>
              <ul className="space-y-1">
                <li>• Werewolves: Werewolves ≥ Good people</li>
                <li>• Good people: Eliminate all werewolves</li>
                <li>• Vote to exile one player each day</li>
                <li>• Werewolves kill one player each night</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

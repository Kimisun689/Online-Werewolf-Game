'use client';

import { Player } from '@/lib/websocket';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  showRole?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  isCurrentPlayer = false,
  showRole = false,
  isSelectable = false,
  isSelected = false,
  onClick,
}: PlayerCardProps) {
  const getRoleEmoji = (role?: string) => {
    switch (role) {
      case 'werewolf': return '🐺';
      case 'seer': return '🔮';
      case 'witch': return '🧪';
      case 'hunter': return '🏹';
      case 'villager': return '👤';
      default: return '❓';
    }
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'werewolf': return 'Werewolf';
      case 'seer': return 'Seer';
      case 'witch': return 'Witch';
      case 'hunter': return 'Hunter';
      case 'villager': return 'Villager';
      default: return 'Unknown';
    }
  };

  return (
    <div
      onClick={isSelectable ? onClick : undefined}
      className={`
        relative group bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-2xl p-6 border transition-all duration-300 shadow-xl
        ${isCurrentPlayer ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-yellow-400/20' : 'border-yellow-500/20'}
        ${!player.isAlive ? 'opacity-50' : ''}
        ${isSelectable ? 'cursor-pointer hover:bg-gradient-to-br hover:from-gray-800/90 hover:via-black/90 hover:to-gray-800/90 hover:border-yellow-500/40 hover:shadow-2xl hover:shadow-yellow-400/10 transform hover:-translate-y-1' : ''}
        ${isSelected ? 'ring-2 ring-yellow-500 border-yellow-500 bg-gradient-to-br from-yellow-900/20 via-black/90 to-yellow-900/20 shadow-2xl shadow-yellow-400/20' : ''}
      `}
    >
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        {isCurrentPlayer && (
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-400 text-black text-xs rounded-full font-bold shadow-lg">
            You
          </span>
        )}
        {player.isHost && (
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs rounded-full ml-2 font-bold shadow-lg">
            Host
          </span>
        )}
      </div>

      {/* Player info */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-2xl group-hover:shadow-yellow-400/30 transition-all duration-300">
          {player.name.charAt(0).toUpperCase()}
        </div>
        
        <h3 className="font-bold text-yellow-100 mb-2 truncate text-lg">
          {player.name}
        </h3>
        
        <div className="text-xs text-yellow-300/60 mb-3">
          {player.isHost ? '👑 Host' : 'Player'}
        </div>
        
        {/* Role display */}
        {showRole && player.role ? (
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl">{getRoleEmoji(player.role)}</span>
            <span className="text-sm text-yellow-300/90 font-medium">{getRoleName(player.role)}</span>
          </div>
        ) : (
          <div className="h-10 mb-3 flex items-center justify-center">
            <span className="text-xs text-yellow-300/50 italic">Role Hidden</span>
          </div>
        )}
        
        {/* Alive status */}
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            player.isAlive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${player.isAlive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            {player.isAlive ? 'Alive' : 'Dead'}
          </span>
        </div>
      </div>

      {/* Death overlay */}
      {!player.isAlive && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <span className="text-2xl">💀</span>
        </div>
      )}
    </div>
  );
}

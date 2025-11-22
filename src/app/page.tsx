'use client';

import { GameProvider } from '@/contexts/GameContext';
import { useGame } from '@/contexts/GameContext';
import JoinRoom from '@/components/JoinRoom';
import WaitingLobby from '@/components/WaitingLobby';
import GameBoard from '@/components/GameBoard';

function GameContent() {
  const { isConnected, gameState } = useGame();

  if (!isConnected) {
    return <JoinRoom />;
  }

  if (gameState.phase === 'waiting') {
    return <WaitingLobby />;
  }

  return <GameBoard />;
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

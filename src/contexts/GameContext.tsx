'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import WebSocketManager, { Player, GameState, ChatMessage } from '@/lib/websocket';

interface GameContextType {
  gameState: GameState;
  ws: WebSocketManager | null;
  playerName: string;
  setPlayerName: (name: string) => void;
  connectToServer: (url: string, name: string) => Promise<void>;
  sendMessage: (type: string, data: any) => void;
  isConnected: boolean;
  currentPlayer: Player | undefined;
}

type GameAction =
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'SET_PHASE'; payload: GameState['phase'] }
  | { type: 'SET_CURRENT_DAY'; payload: number }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CURRENT_PLAYER'; payload: Player }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'SET_VOTING_RESULTS'; payload: any }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  phase: 'waiting',
  currentDay: 0,
  players: [],
  messages: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_CURRENT_DAY':
      return { ...state, currentDay: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.id ? action.payload : player
        ),
      };
    case 'SET_VOTING_RESULTS':
      return { ...state, votingResults: action.payload };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [ws, setWs] = useState<WebSocketManager | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectToServer = async (url: string, name: string) => {
    try {
      const websocketManager = new WebSocketManager(url);
      await websocketManager.connect();
      
      setWs(websocketManager);
      setIsConnected(true);

      // 设置消息处理器
      websocketManager.on('players', (players: Player[]) => {
        dispatch({ type: 'SET_PLAYERS', payload: players });
      });

      websocketManager.on('phase', (phase: GameState['phase']) => {
        dispatch({ type: 'SET_PHASE', payload: phase });
      });

      websocketManager.on('currentDay', (day: number) => {
        dispatch({ type: 'SET_CURRENT_DAY', payload: day });
      });

      websocketManager.on('message', (message: ChatMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      });

      websocketManager.on('currentPlayer', (player: Player) => {
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: player });
      });

      websocketManager.on('nightPhase', (data: any) => {
        // This will be used to notify about night phase changes
        console.log('Night phase changed:', data);
      });

      websocketManager.on('votingResults', (results: any) => {
        dispatch({ type: 'SET_VOTING_RESULTS', payload: results });
      });

      websocketManager.on('gameReset', () => {
        dispatch({ type: 'RESET_GAME' });
      });

      // 发送玩家加入消息
      websocketManager.send('join', { name });

    } catch (error) {
      console.error('Failed to connect to server:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = (type: string, data: any) => {
    console.log('Sending message:', type, data);
    console.log('WebSocket connected:', ws?.isConnected());
    if (ws && ws.isConnected()) {
      ws.send(type, data);
      console.log('Message sent successfully');
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [ws]);

  const value: GameContextType = {
    gameState,
    ws,
    playerName,
    setPlayerName,
    connectToServer,
    sendMessage,
    isConnected,
    currentPlayer: gameState.currentPlayer,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function ChatPanel() {
  const { gameState, sendMessage, currentPlayer } = useGame();
  const { messages, phase } = gameState;
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canChat = phase === 'day' && currentPlayer?.isAlive;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && canChat) {
      sendMessage('chat', { message: inputMessage.trim() });
      setInputMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-yellow-500/20 shadow-2xl h-[500px] flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-yellow-500/20 backdrop-blur-lg">
        <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-3">
          <div className="w-2 h-6 bg-gradient-to-b from-yellow-400 to-amber-400 rounded-full"></div>
          Discussion
        </h3>
        {!canChat && (
          <p className="text-xs text-yellow-300/70 mt-2 pl-5">
            {phase === 'night' ? '🌙 Cannot speak during night' : !currentPlayer?.isAlive ? '💀 Dead players cannot speak' : '⏳ Waiting for discussion time'}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-yellow-300/60 text-sm mt-12 animate-pulse">
            {canChat ? '💬 Start discussing...' : '⏳ Waiting for discussion time...'}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-1">
              {message.type === 'system' ? (
                <div className="text-center">
                  <span className="text-xs text-yellow-300/90 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 px-3 py-2 rounded-full border border-yellow-500/20 font-medium">
                    {message.message}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-yellow-300/80 font-semibold">{message.playerName}</span>
                        <span className="text-xs text-yellow-400/60">{formatTime(message.timestamp)}</span>
                      </div>
                      <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-2xl p-3 border border-yellow-500/10 backdrop-blur-lg">
                        <p className="text-yellow-100 text-sm leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {canChat && (
        <form onSubmit={handleSendMessage} className="relative p-6 border-t border-yellow-500/20 backdrop-blur-lg">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={100}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-yellow-500/20 rounded-2xl text-yellow-100 placeholder-yellow-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-lg text-sm transition-all duration-300"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-black rounded-2xl hover:from-yellow-300 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-yellow-400/25 transform hover:scale-105"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

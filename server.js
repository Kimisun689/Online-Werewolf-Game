const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

console.log('🐺 Werewolf server started on ws://localhost:8080');

// Game state
let gameState = {
  phase: 'waiting',
  currentDay: 0,
  players: [],
  messages: [],
  votingResults: null
};

let playerIdCounter = 1;
let messageIdCounter = 1;

wss.on('connection', (ws) => {
  const playerId = `player_${playerIdCounter++}`;
  clients.set(playerId, { ws, player: null });
  
  console.log(`Player connected: ${playerId}`);

  ws.on('message', (data) => {
    console.log(`Raw message received from ${playerId}:`, data.toString());
    try {
      const message = JSON.parse(data.toString());
      console.log(`Parsed message:`, message);
      handleMessage(playerId, message);
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Player disconnected: ${playerId}`);
    handleDisconnect(playerId);
  });

  ws.send(JSON.stringify({
    type: 'connected',
    data: { playerId }
  }));
});

function handleMessage(playerId, message) {
  console.log(`Received message from ${playerId}:`, message);
  const client = clients.get(playerId);
  if (!client) {
    console.log(`No client found for player ${playerId}`);
    return;
  }

  switch (message.type) {
    case 'join':
      console.log('Handling join message');
      handleJoin(playerId, message.data);
      break;
    case 'startGame':
      console.log('Handling startGame message');
      handleStartGame(playerId);
      break;
    case 'chat':
      handleChat(playerId, message.data);
      break;
    case 'vote':
      handleVote(playerId, message.data);
      break;
    case 'werewolfKill':
      handleWerewolfKill(playerId, message.data);
      break;
    case 'seerCheck':
      handleSeerCheck(playerId, message.data);
      break;
    case 'witchHeal':
      handleWitchHeal(playerId);
      break;
    case 'witchPoison':
      handleWitchPoison(playerId, message.data);
      break;
    case 'witchSkip':
      handleWitchSkip(playerId);
      break;
    case 'hunterRevenge':
      handleHunterRevenge(playerId, message.data);
      break;
    case 'leaveGame':
      handleLeaveGame(playerId);
      break;
    case 'returnToLobby':
      handleReturnToLobby();
      break;
  }
}

function handleJoin(playerId, data) {
  console.log(`Player joining: ${playerId} with name: ${data.name}`);
  const client = clients.get(playerId);
  const isHost = gameState.players.length === 0;
  console.log(`Is host: ${isHost}, current players: ${gameState.players.length}`);
  
  const player = {
    id: playerId,
    name: data.name,
    isAlive: true,
    isHost,
    role: null
  };
  
  console.log('Created player:', player);
  client.player = player;
  gameState.players.push(player);
  
  console.log('Players after join:', gameState.players);
  
  broadcast('players', gameState.players);
  
  addSystemMessage(`${player.name} joined the game`);
  
  if (gameState.players.length === 1) {
    sendToPlayer(playerId, 'currentPlayer', player);
  }
}

function handleStartGame(playerId) {
  console.log(`Start game requested by player: ${playerId}`);
  const client = clients.get(playerId);
  console.log(`Client found:`, !!client);
  console.log(`Player is host:`, !!client?.player?.isHost);
  console.log(`Player count: ${gameState.players.length}`);
  
  if (!client.player?.isHost) {
    console.log('Not host, rejecting start game');
    return;
  }
  
  if (gameState.players.length < 1) {
    console.log('Not enough players, rejecting start game');
    addSystemMessage('Need at least 1 player to start');
    return;
  }
  
  console.log('Starting game...');
  assignRoles();
  gameState.phase = 'night';
  gameState.currentDay = 1;
  
  broadcast('phase', gameState.phase);
  broadcast('currentDay', gameState.currentDay);
  broadcast('players', gameState.players);
  
  // Send each player their role
  gameState.players.forEach(player => {
    sendToPlayer(player.id, 'currentPlayer', player);
  });
  
  addSystemMessage('Game started! Night falls...');
  console.log('Game started successfully');
}

function assignRoles() {
  const players = [...gameState.players];
  const playerCount = players.length;
  
  let werewolfCount = 1;
  if (playerCount >= 5) werewolfCount = 2;
  if (playerCount >= 9) werewolfCount = 3;
  if (playerCount >= 12) werewolfCount = 4;
  
  const roles = [];
  
  // Add werewolves
  for (let i = 0; i < werewolfCount; i++) {
    roles.push('werewolf');
  }
  
  // Add special roles based on player count
  if (playerCount >= 2) roles.push('seer');
  if (playerCount >= 3) roles.push('witch');
  if (playerCount >= 4) roles.push('hunter');
  
  // Fill rest with villagers
  while (roles.length < playerCount) {
    roles.push('villager');
  }
  
  // Shuffle and assign
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  players.forEach((player, index) => {
    player.role = roles[index];
  });
  
  addSystemMessage(`Game started with ${playerCount} players: ${werewolfCount} werewolf(s), ${roles.includes('seer') ? '1 seer' : 'no seer'}, ${roles.includes('witch') ? '1 witch' : 'no witch'}, ${roles.includes('hunter') ? '1 hunter' : 'no hunter'}, ${roles.filter(r => r === 'villager').length} villager(s)`);
}

function handleChat(playerId, data) {
  const client = clients.get(playerId);
  if (!client.player || !client.player.isAlive || gameState.phase !== 'day') return;
  
  addMessage(client.player.name, data.message, 'chat');
}

function handleVote(playerId, data) {
  if (gameState.phase !== 'voting') return;
  
  // Simple voting logic
  addMessage('System', 'Vote received', 'system');
  
  // For demo: end voting after first vote
  setTimeout(() => {
    const targetPlayer = gameState.players.find(p => p.id === data.targetId);
    if (targetPlayer) {
      targetPlayer.isAlive = false;
      addSystemMessage(`${targetPlayer.name} was exiled by vote!`);
      
      // Check if exiled player was hunter and trigger revenge
      if (targetPlayer.role === 'hunter' && hunterRevengeAvailable) {
        triggerHunterRevenge(targetPlayer.id);
      }
      
      gameState.votingResults = {
        targetId: data.targetId,
        votes: { [playerId]: data.targetId }
      };
      broadcast('votingResults', gameState.votingResults);
      broadcast('players', gameState.players);
      
      checkGameEnd();
    }
  }, 2000);
}

// Night phase management
let nightPhase = 'werewolf'; // 'werewolf' -> 'witch' -> 'seer' -> 'day'
let nightActions = {
  werewolfTarget: null,
  witchHealTarget: null,
  witchPoisonTarget: null,
  witchHealed: false,
  witchPoisoned: false,
  seerChecked: false
};

// Hunter management
let hunterRevengeAvailable = false; // Only available after night 2
let pendingHunterRevenge = null; // { hunterId, canShoot: true }

function handleWerewolfKill(playerId, data) {
  const client = clients.get(playerId);
  if (!client.player || client.player.role !== 'werewolf' || gameState.phase !== 'night' || nightPhase !== 'werewolf') return;
  
  const targetPlayer = gameState.players.find(p => p.id === data.targetId);
  if (targetPlayer) {
    nightActions.werewolfTarget = data.targetId;
    console.log(`Werewolf targeted: ${targetPlayer.name} (role: ${targetPlayer.role})`);
    
    // IMPORTANT: Don't kill the player immediately! Just mark for death
    // The player can still act in their turn (seer can check, witch can heal, etc.)
    // Death will be applied at end of night phase
    
    // Move to witch phase
    nightPhase = 'witch';
    broadcast('nightPhase', { phase: 'witch', werewolfTarget: data.targetId });
    
    // Check if there's a witch
    const witch = gameState.players.find(p => p.role === 'witch' && p.isAlive);
    if (witch) {
      sendToPlayer(witch.id, 'system', `Werewolf targeted someone. Use your healing potion?`);
    } else {
      // No witch, skip to seer
      proceedToSeerPhase();
    }
  }
}

function handleWitchHeal(playerId) {
  const client = clients.get(playerId);
  if (!client.player || client.player.role !== 'witch' || gameState.phase !== 'night' || nightPhase !== 'witch') return;
  
  if (nightActions.werewolfTarget && !nightActions.witchHealed) {
    nightActions.witchHealTarget = nightActions.werewolfTarget;
    nightActions.witchHealed = true;
    console.log(`Witch healed: ${nightActions.werewolfTarget}`);
    
    // IMPORTANT: Witch can act even if they were targeted by werewolf!
    // The witch will only die at dawn if not saved
    
    sendToPlayer(playerId, 'system', 'You used your healing potion!');
    proceedToSeerPhase();
  }
}

function handleWitchPoison(playerId, data) {
  const client = clients.get(playerId);
  if (!client.player || client.player.role !== 'witch' || gameState.phase !== 'night' || nightPhase !== 'witch') return;
  
  const targetPlayer = gameState.players.find(p => p.id === data.targetId);
  if (targetPlayer && !nightActions.witchPoisoned) {
    nightActions.witchPoisonTarget = data.targetId;
    nightActions.witchPoisoned = true;
    console.log(`Witch poisoned: ${targetPlayer.name}`);
    
    // IMPORTANT: Witch can act even if they were targeted by werewolf!
    // The witch will only die at dawn if not saved
    
    sendToPlayer(playerId, 'system', 'You used your poison potion!');
    proceedToSeerPhase();
  }
}

function handleWitchSkip(playerId) {
  const client = clients.get(playerId);
  if (!client.player || client.player.role !== 'witch' || gameState.phase !== 'night' || nightPhase !== 'witch') return;
  
  // IMPORTANT: Witch can skip even if they were targeted by werewolf!
  // The witch will only die at dawn if not saved
  
  console.log('Witch skipped action');
  proceedToSeerPhase();
}

function proceedToSeerPhase() {
  nightPhase = 'seer';
  broadcast('nightPhase', { phase: 'seer' });
  
  // Check if there's a seer
  const seer = gameState.players.find(p => p.role === 'seer' && p.isAlive);
  if (seer) {
    sendToPlayer(seer.id, 'system', 'Your turn to check someone\'s identity!');
  } else {
    // No seer, end night phase
    endNightPhase();
  }
}

function handleSeerCheck(playerId, data) {
  const client = clients.get(playerId);
  if (!client.player || client.player.role !== 'seer' || gameState.phase !== 'night' || nightPhase !== 'seer') return;
  
  const targetPlayer = gameState.players.find(p => p.id === data.targetId);
  if (targetPlayer) {
    const isWerewolf = targetPlayer.role === 'werewolf';
    nightActions.seerChecked = true;
    console.log(`Seer checked: ${targetPlayer.name} - ${isWerewolf ? 'werewolf' : 'not werewolf'}`);
    
    // IMPORTANT: Seer can act even if they were targeted by werewolf!
    // The seer will only die at dawn if not healed by witch
    
    sendToPlayer(playerId, 'system', `${targetPlayer.name} is ${isWerewolf ? 'a werewolf' : 'not a werewolf'}`);
    endNightPhase();
  }
}

function endNightPhase() {
  console.log('Night phase ended, processing actions...');
  
  // Apply werewolf kill if not healed
  if (nightActions.werewolfTarget && nightActions.werewolfTarget !== nightActions.witchHealTarget) {
    const target = gameState.players.find(p => p.id === nightActions.werewolfTarget);
    if (target) {
      target.isAlive = false;
      addSystemMessage(`${target.name} was killed during the night!`);
      
      // Check if killed player was hunter and trigger revenge
      if (target.role === 'hunter' && hunterRevengeAvailable) {
        triggerHunterRevenge(target.id);
      }
    }
  }
  
  // Apply witch poison
  if (nightActions.witchPoisonTarget) {
    const target = gameState.players.find(p => p.id === nightActions.witchPoisonTarget);
    if (target) {
      target.isAlive = false;
      addSystemMessage(`${target.name} was poisoned during the night!`);
      
      // Check if killed player was hunter and trigger revenge
      if (target.role === 'hunter' && hunterRevengeAvailable) {
        triggerHunterRevenge(target.id);
      }
    }
  }
  
  // Enable hunter revenge after night 2
  if (gameState.currentDay >= 2 && !hunterRevengeAvailable) {
    hunterRevengeAvailable = true;
    console.log('Hunter revenge is now available!');
  }
  
  // Reset night actions
  nightActions = {
    werewolfTarget: null,
    witchHealTarget: null,
    witchPoisonTarget: null,
    witchHealed: false,
    witchPoisoned: false,
    seerChecked: false
  };
  
  // Move to day phase
  nightPhase = 'werewolf';
  gameState.phase = 'day';
  broadcast('phase', gameState.phase);
  broadcast('players', gameState.players);
  
  checkGameEnd();
}

function triggerHunterRevenge(hunterId) {
  console.log(`Hunter ${hunterId} died, triggering revenge!`);
  pendingHunterRevenge = { hunterId, canShoot: true };
  
  // Notify the hunter (even though they're dead, they can still shoot)
  sendToPlayer(hunterId, 'hunterRevenge', { canShoot: true });
  addSystemMessage('The hunter has died and can take revenge!');
}

function handleHunterRevenge(playerId, data) {
  if (!pendingHunterRevenge || pendingHunterRevenge.hunterId !== playerId) {
    console.log('Invalid hunter revenge attempt');
    return;
  }
  
  const targetPlayer = gameState.players.find(p => p.id === data.targetId);
  if (!targetPlayer) return;
  
  const hunter = gameState.players.find(p => p.id === playerId);
  if (!hunter) return;
  
  console.log(`Hunter ${hunter.name} is taking revenge on ${targetPlayer.name}`);
  
  // Determine if target is good or bad
  const isBad = targetPlayer.role === 'werewolf';
  
  if (isBad) {
    // Hunter shoots bad guy - hunter survives (but is already dead, so this is just successful revenge)
    addSystemMessage(`The hunter successfully shot ${targetPlayer.name} (${targetPlayer.role})! Justice served!`);
  } else {
    // Hunter shoots good guy - hunter dies with target (but hunter is already dead, so just kill target)
    addSystemMessage(`The hunter mistakenly shot ${targetPlayer.name} (${targetPlayer.role})! A tragic mistake!`);
  }
  
  // Kill the target regardless
  targetPlayer.isAlive = false;
  
  // Clear pending revenge
  pendingHunterRevenge = null;
  
  // Update players and check game end
  broadcast('players', gameState.players);
  checkGameEnd();
}

function handleLeaveGame(playerId) {
  handleDisconnect(playerId);
}

function handleReturnToLobby() {
  gameState = {
    phase: 'waiting',
    currentDay: 0,
    players: gameState.players.map(p => ({ ...p, isAlive: true, role: null })),
    messages: [],
    votingResults: null
  };
  
  broadcast('phase', gameState.phase);
  broadcast('players', gameState.players);
  broadcast('gameReset');
  addSystemMessage('Returned to lobby');
}

function handleDisconnect(playerId) {
  const client = clients.get(playerId);
  if (client.player) {
    gameState.players = gameState.players.filter(p => p.id !== playerId);
    broadcast('players', gameState.players);
    addSystemMessage(`${client.player.name} left the game`);
  }
  clients.delete(playerId);
}

function checkGameEnd() {
  const werewolves = gameState.players.filter(p => p.isAlive && p.role === 'werewolf');
  const goodPeople = gameState.players.filter(p => p.isAlive && p.role !== 'werewolf');
  
  if (werewolves.length === 0 || werewolves.length >= goodPeople.length) {
    gameState.phase = 'ended';
    broadcast('phase', gameState.phase);
    addSystemMessage('Game Over!');
  } else {
    // Continue game - move to next phase
    setTimeout(() => {
      if (gameState.phase === 'day') {
        gameState.phase = 'voting';
        broadcast('phase', gameState.phase);
        addSystemMessage('Voting time begins...');
      } else if (gameState.phase === 'voting') {
        gameState.phase = 'night';
        gameState.currentDay++;
        broadcast('phase', gameState.phase);
        broadcast('currentDay', gameState.currentDay);
        addSystemMessage(`Night ${gameState.currentDay} falls...`);
      }
    }, 3000);
  }
}

function addMessage(playerName, message, type = 'chat') {
  const chatMessage = {
    id: `msg_${messageIdCounter++}`,
    playerId: playerName,
    playerName,
    message,
    timestamp: Date.now(),
    type
  };
  
  gameState.messages.push(chatMessage);
  broadcast('message', chatMessage);
}

function addSystemMessage(message) {
  addMessage('System', message, 'system');
}

function broadcast(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

function sendToPlayer(playerId, type, data) {
  const client = clients.get(playerId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
  }
}

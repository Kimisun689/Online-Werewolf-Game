# 🐺 Werewolf Game - Multiplayer Web Game

A modern, real-time multiplayer werewolf game built with Next.js, TypeScript, and WebSockets.

## 🎮 Game Features

- **Real-time multiplayer** with WebSocket connections
- **Sequential night phases** (Werewolf → Witch → Seer)
- **Smart character abilities** - everyone acts even if targeted
- **Hunter revenge system** (activates after night 2)
- **Modern UI** with black/yellow theme and animations
- **Role-based gameplay** with 5 different characters
- **Minimum 1 player** for testing, **2+ players** for real games

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js with WebSocket (ws library)
- **Real-time**: WebSocket connections for live gameplay
- **Styling**: Tailwind CSS with custom animations

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Terminal/Command Line

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Navigate to project directory
cd "/Users/kimisun/Documents/Kimi's PVT/WOMH/werewolf-game"

# Install frontend dependencies
npm install

# Install backend dependencies (ws library)
npm install ws
```

### 2. Start the Servers

You need to run **both** the frontend and backend servers:

#### **Option A: Two Terminal Windows (Recommended)**

**Terminal 1 - Start Backend Server:**
```bash
cd "/Users/kimisun/Documents/Kimi's PVT/WOMH/werewolf-game"
node server.js
```
You should see: `🐺 Werewolf server started on ws://localhost:8080`

**Terminal 2 - Start Frontend:**
```bash
cd "/Users/kimisun/Documents/Kimi's PVT/WOMH/werewolf-game"
npm run dev
```
Frontend will be available at: `http://localhost:3001`

#### **Option B: Single Terminal (Background)**

```bash
# Start backend in background
cd "/Users/kimisun/Documents/Kimi's PVT/WOMH/werewolf-game"
node server.js &

# Start frontend
npm run dev

# To stop background server later:
pkill -f "node server.js"
```

### 3. Access the Game

Open your browser and go to:
- **Local**: `http://localhost:3001`
- **Network**: `http://192.168.1.8:3001` (for other devices on same WiFi)

## 🎯 How to Play

### 1. Join Game
- Enter your nickname
- Server URL: `ws://192.168.1.8:8080` (pre-filled)
- Click "Join Room"

### 2. Wait for Players
- First player becomes **Host** (👑)
- Host can start game with 1+ players (for testing)
- Real games need 2+ players

### 3. Night Phase (Sequential)
1. **🐺 Werewolf**: Choose victim
2. **🧙‍♀️ Witch**: Heal victim or poison someone  
3. **🔮 Seer**: Check someone's identity
4. **☀️ Dawn**: Deaths revealed

### 4. Day Phase
- Discuss who might be werewolf
- Vote to exile suspected werewolf
- Hunter gets revenge if killed (after night 2)

## 🎭 Character Roles

| Role | Team | Ability | When Active |
|------|------|----------|-------------|
| 🐺 **Werewolf** | Evil | Kill one player each night | Night 1+ |
| 🔮 **Seer** | Good | Check if someone is werewolf | Night 1+ |
| 🧙‍♀️ **Witch** | Good | Heal (1x) or poison (1x) | Night 1+ |
| 🏹 **Hunter** | Good | Revenge shot when dies | After Night 2 |
| 👤 **Villager** | Good | Vote during day | Day |

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start frontend only
npm run dev

# Start backend only  
node server.js

# Stop backend server
pkill -f "node server.js"

# Check if backend is running
ps aux | grep "node server.js" | grep -v grep
```

## 🌐 Network Play

### **IMPORTANT: Use Your Device IP!**

The game needs your actual device IP address, not `192.168.1.8`. Here's how to find and use your IP:

### **Finding Your Device IP:**

#### **macOS:**
```bash
# Method 1: Quick way
ifconfig | grep "inet " | grep -v 127.0.0.1

# Method 2: Specific interface
ipconfig getifaddr en0
# or for WiFi
ipconfig getifaddr en1
```

#### **Windows:**
```bash
# Command Prompt
ipconfig
# Look for "IPv4 Address" under your active connection (usually 192.168.x.x)
```

#### **Linux:**
```bash
# Method 1
hostname -I

# Method 2  
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### **Setup Steps:**

#### **1. Host Setup:**
```bash
# Find your IP (example: 192.168.1.15)
ifconfig | grep "inet "

# Update server URL in JoinRoom component to your IP
# Edit: src/components/JoinRoom.tsx
# Change: const [serverUrl, setServerUrl] = useState('ws://YOUR_IP:8080');
```

#### **2. Player Setup:**
- Open browser on any device on same WiFi
- Go to: `http://YOUR_IP:3001` (e.g., `http://192.168.1.15:3001`)
- Server URL: `ws://YOUR_IP:8080` (e.g., `ws://192.168.1.15:8080`)

### **Example with Real IP:**
If your IP is `192.168.1.15`:
- **Frontend**: `http://192.168.1.15:3001`
- **Backend**: `ws://192.168.1.15:8080`
- **Players join**: `http://192.168.1.15:3001`

### **For Other Players to Join:**

1. **Same WiFi Network**: All players must be on the same WiFi
2. **Use Host IP**: Replace `localhost` with host's actual IP address
3. **Update Default**: Change the default server URL in the code

### **Quick IP Check Commands:**

| System | Command | Example Output |
|--------|---------|----------------|
| macOS | `ifconfig | grep "inet "` | `inet 192.168.1.15` |
| Windows | `ipconfig` | `IPv4 Address: 192.168.1.15` |
| Linux | `hostname -I` | `192.168.1.15` |

### **Network Requirements:**
- ✅ Same WiFi network for all players
- ✅ Firewall allows ports 3001 and 8080
- ✅ No VPN or proxy blocking local connections

### **Troubleshooting Network Issues:**

#### **"Can't connect" problems:**
```bash
# Check if server is running
ps aux | grep "node server.js"

# Check if ports are open
lsof -i :3001
lsof -i :8080

# Test connection
telnet YOUR_IP 8080
```

#### **"Wrong IP" problems:**
- Don't use `127.0.0.1` (localhost)
- Don't use `192.168.1.8` (example IP)
- Use your actual device IP from commands above

#### **Firewall Issues:**
```bash
# macOS: Allow Node.js connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node

# Windows: Allow Node.js through Windows Firewall
# Search "Windows Firewall" → "Allow an app" → Find Node.js
```

## 🐛 Troubleshooting

### **Common Issues:**

#### "WebSocket not connected"
- **Solution**: Make sure backend server is running
- **Check**: `ps aux | grep "node server.js"`

#### "Can't click Start Game"
- **Solution**: You must be the host (first player)
- **Check**: Look for 👑 Host badge

#### "Player names not showing"
- **Solution**: Refresh browser and rejoin
- **Check**: Enter a valid nickname

#### "Other players can't connect"
- **Solution**: Check WiFi connection and IP address
- **Check**: Firewalls blocking port 8080

### **Port Conflicts:**
If port 3001 or 8080 are in use:
```bash
# Kill processes using ports
sudo lsof -ti:3001 | xargs kill -9
sudo lsof -ti:8080 | xargs kill -9
```

## 📱 Mobile Access

Players can join from mobile devices:
1. Connect to same WiFi
2. Open browser
3. Go to: `http://192.168.1.8:3001`
4. Enter nickname and join

## 🎮 Game Rules Summary

### **Win Conditions:**
- **Werewolves Win**: Equal or more werewolves than good players
- **Villagers Win**: All werewolves eliminated

### **Special Rules:**
- Everyone acts during their turn even if targeted by werewolf
- Deaths only revealed at dawn
- Hunter revenge only available after night 2
- Witch can only use each potion once per game

### **Testing Mode:**
- Game configured to start with 1 player for easy testing
- Change minimum players in code for real games (2+ players)

## 🔄 Reset Game

To start fresh:
```bash
# Stop all servers
pkill -f "node server.js"
pkill -f "npm run dev"

# Restart servers
node server.js &
npm run dev
```

## 📞 Support

If you encounter issues:
1. Check both servers are running
2. Verify network connection
3. Refresh browser
4. Check console for error messages

---

**Enjoy the game! 🐺🌙**

# SyyyyncPlayer

SyyyyncPlayer is a custom player that extends videojs by rewriting Html5Tech. It is used to sync video playback across multiple clients using WebSocket.

## Usage

### 1. Clone the repo

```bash
git clone https://github.com/zhangziqing/SyyyyncPlayer.git
cd SyyyyncPlayer
```

### 2. Install dependencies with npm

Make sure you have Node.js and npm installed. Install dependencies with the following command:

```bash
npm install
```

### 3. Start the server with Node.js

Start the server with the following command. The default port is 8080, but you can change it if needed.
```bash
node server.js
```

### 4. Run the client

Open `index.html` in your browser and click the "Connect to Server" button. Select a video to play, and you are all set!

If you need to use a separate WebSocket server, you can enter its address in the input box before clicking the button:
```bash
localhost:8080
# The address will automatically be
```



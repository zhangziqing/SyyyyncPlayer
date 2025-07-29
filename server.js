// npm install ws
const WebSocket = require('ws');

const REPL = require('repl');

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

let currentTime = 0;

let effective_latency = 500;


let server_meta = {
  currentTime: 0,
  correspondingTime: 0,
  play_rate: 1.0,
}

const server_collection = {
  connection(ws, req) {
    ws.id = Date.now() + '_' + Math.random();
    ws._ip = req.socket.remoteAddress;
    clients.push(ws);
    console.log('New client connected:', ws.id);
    ws.on('message', (msg) => this.message_handler(ws, msg));
    ws.on('close', () => {
      clients = clients.filter(c => c !== ws);
    });
    this.connection_init_boardcast();

  },

  cal_play_lap() {
    const now = Date.now();
    laps = server_meta.play_rate * (now - server_meta.correspondingTime) / 1000;
    return server_meta.currentTime + laps;
  },

  connection_init_boardcast() {
    const init_msg = {
      action: 'sync_command',
      command: 'pause',
      effective_time: Date.now() + effective_latency,
      currentTime: currentTime + this.cal_play_lap(),
      needSync: false,
      rate: server_meta.play_rate,
      appendix: 'sync for new user'
    };
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(init_msg));
      }
    }
  },

  create_message_template(msg) {
    const effectiveTime = Date.now() + effective_latency;
    return {
      action: 'sync_command',
      command: msg.command , // 'play' or 'pause' or 'seek ' or 'rate'
      effective_time: effectiveTime,
      currentTime: msg.currentTime || 0,
      needSync: false,
      rate: server_meta.play_rate,
    };
  },

  message_handler(ws, message) {
    const msg = JSON.parse(message);
    console.log('Received:', msg);
    if (msg.action === 'sync_request') {
      let broadcast_msg = this.create_message_template(msg);
      switch(msg.command) {
        case 'play':
          broadcast_msg.needSync = false; // 播放时不需要同步
          server_meta.correspondingTime = broadcast_msg.effective_time;
          break;
        case 'pause':
          broadcast_msg.needSync = true; 
          broadcast_msg.currentTime = (broadcast_msg.effective_time - Date.now()) / 1000 + broadcast_msg.currentTime;
          break;
        case 'seek':
          broadcast_msg.needSync = true;
          broadcast_msg.currentTime = msg.currentTime; 
          server_meta.correspondingTime = broadcast_msg.effective_time;
          break;
        case 'rate':
          server_meta.play_rate = msg.rate;
          broadcast_msg.rate = server_meta.play_rate;
          server_meta.correspondingTime = broadcast_msg.effective_time;
          break;
      }
      console.log('Broadcasting message:', broadcast_msg);
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(broadcast_msg));
        }
      }
      return;
    }
    if ( msg.action === 'timer_sync' ) {
      // Handle timer sync action
      response_msg = {
        action: 'timer_sync',
        realtime: Date.now(),
      }
      ws.send(JSON.stringify(response_msg));
      console.log('Timer sync response sent:', response_msg);
      return;
    }
  }
}

wss.on('connection', server_collection.connection.bind(server_collection));


const shell = REPL.start('> ');
shell.context.info = function () {
  console.log('- Current Time:\t', currentTime);
  console.log('- Effective Latency:\t', effective_latency);
  console.log('- Play Rate:\t', play_rate);
  console.log('- Clients Count:\t', clients.length);

  for (const client of clients) {
    console.log('- Client ID:\t', client.id, 'IP:\t', client._ip);
  }
}

console.log('WebSocket server running on ws://localhost:8080');


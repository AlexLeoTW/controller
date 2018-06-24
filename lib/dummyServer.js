const minecraftProtocol = require('minecraft-protocol');
const Chunk = require('prismarine-chunk');
const Vec3 = require("vec3");

class DummyServer {
  constructor(options) {
    this.options = options
    ? options
    : {
        'port':         25566,
        'host':         'localhost',
        'online-mode':  true,
        'motd':         'please login to wake server up',
        'maxPlayers':    20,
        'version':      '1.8'
    }

    this.onLogin = onLogin({
      version: this.options.version,
      maxPlayers: this.options.maxPlayers,
      message: '§l§cServer starting, please wait a while...'
    });
  }

  start() {
    const self = this;

    self.server = minecraftProtocol.createServer(self.options);
    self.server.on('login', this.onLogin);

    return self.options;
  }

  stop() {
    const self = this;
    self.server.close();
  }

  on(event, callback) {
    return this.server.on(event, callback);
  }

  broadcast(msg) {
    const self = this;

    console.log(`send: [${msg}]`);
    for (var seq in self.server.clients) {
      self.server.clients[seq].write('chat', { message: JSON.stringify({
          translate: 'chat.type.announcement',
          "with": [ 'Server', msg ]
      }), position: 0});
    }
  }
}

function flatChunk (depth, version) {
  var chunk = new (Chunk(version));

  for (var x = 0; x < 16; x++) {
    for (var z = 0; z < 16; z++) {

      // gress on top
      chunk.setBlockType(new Vec3(x, 100, z), 2)

      // stone
      for (var y = 100 - depth > 0 ? 100 - depth : 0 ; y < 100; y++) {
        chunk.setBlockType(new Vec3(x, y, z), 1)
      }

      // light
      for (var y = 0; y < 256; y++) {
        chunk.setSkyLight(new Vec3(x, y, z), 15)
      }
    }
  }

  return chunk;
}

function onLogin (options) {
  var mapChunk = flatChunk(5, options.version);

  return function (client) {
    client.write('login', {
      entityId: client.id,
      levelType: 'default',
      gameMode: 0,
      dimension: 0,
      difficulty: 2,
      maxPlayers: options.maxPlayers,
      reducedDebugInfo: false
    });
    client.write('map_chunk', {
      x: 0,
      z: 0,
      groundUp: true,
      bitMap: 0xffff,
      chunkData: mapChunk.dump(),
      blockEntities: []
    });
    client.write('position', {
      x: 8,
      y: 101,
      z: 8,
      yaw: 0,
      pitch: 0,
      flags: 0x00
    });

    client.write('chat', { message: JSON.stringify({
        translate: 'chat.type.announcement',
        "with": [ 'Server', options.message ]
    }), position: 0});
  };
}

exports.DummyServer = DummyServer;

// var server = new DummyServer();
// server.start();
//
// const readline      = require('readline');
// const stdin = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   prompt: ''
// });
// stdin.on('line', (line) => {
//   server.broadcast(`§l§c${line}...`);
// });

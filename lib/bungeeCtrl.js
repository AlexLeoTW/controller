const path          = require('path');
const child_process = require('child_process');
const EventEmitter  = require('events');
const fs            = require('fs');
const yaml          = require('js-yaml');

// avaliable Events:
//      ready: BungeeCord console shows 'Listening on'
//      error: when stderr
//      close: when process close

class BungeeCtrl {
  constructor(filename, config) {
    // config = {
    //   'host':         `0.0.0.0:${this.serverPort}`,
    //   'motd':         this.motd.bungee,
    //   'max_players':  this.maxPlayers
    // }
    this.eventEmitter = new EventEmitter();
    this.cwd          = path.dirname(filename);
    this.filename     = path.basename(filename);
    this.process      = null;
    this.running      = false;
    this.userConfig   = config;
  }

  // cycle BungeeCord to generate config files needed
  init(running) {
    const self = this;

    return self.start('startAnyway')
    .then(() => { return self.stop() })
    .then(() => {
      self.applyConfig(self.userConfig);
    })
    .then(() => {
      if (running) {
        return self.start();
      } else {
        return Promise.resolve();
      }
    })
  }

  start(startAnyway) {
    const self = this;

    if (self.running) {
      throw new Error('please stop the server before start it again!');
    }

    if (!startAnyway && self.isFresh()) {
      return self.init('running');
    } else if (!startAnyway) {
      self.applyConfig(self.userConfig);
    }

    self.process = child_process.spawn(
      'java', ['-jar', self.filename], {
        cwd: self.cwd
      }
    )
    self.running = true;
    self.attach(self.process);

    return new Promise((resolve, reject) => {
      self.eventEmitter.once('ready', (line) => resolve(line));
    });
  }

  stop() {
    const self = this;
    self.command('end');

    return new Promise((resolve, reject) => {
      self.eventEmitter.once('close', (code) => {
        self.running = false;
        resolve(code);
      });
    })
  }

  restart(callback) {
    const self = this;

    if (!self.running) {
      throw Error('bungeeCtrl is not started yet, please start before restart');
    }

    return self.stop()
    .then(() => {
      if (callback) {
        console.log('callback');
        callback()
      }
      return null;
    })
    .then(() => { return self.start() })
  }

  attach(process) {
    const self = this;

    // re-emit 'ready' event
    process.stdout.on('data', (data) => {
      // remove > sign on the next line
      var line = data.toString().replace(/[>|\n|\s]*$/, '').replace(/^[^0-9]*/, '');
      console.log(line);      // TODO: make this a debug output

      if (line.match(/.+ \[.+\] Listening on.+/)) {
        self.eventEmitter.emit('ready', line);
      }
    })

    process.stderr.on('data', (data) => {
      // remove > sign on the next line
      var line = data.toString().replace(/[>|\n|\s]*$/, '').replace(/^[^0-9]*/, '')
      console.error(line);    // TODO: make this a debug output
      self.eventEmitter.emit('error', line);
    })

    process.on('close', (code) => {
      self.running = false;
      self.eventEmitter.emit('close', code);
    })
  }

  command(line) {
    const self = this;
    self.process.stdin.write(`${line}\n`);
  }

  isFresh() {
    const self = this;    // could be helpful?

    try {
      var stat = fs.statSync(path.join(self.cwd, 'config.yml'));   // any file will work (though config.yml will must be there)
      return false;
    } catch (err) {
      if (err.code === 'ENOENT'){   // ENOENT Error NO ENTity
        // file (./bungee/config.yml) not found
        return true;
      } else {
        // re-throw unexpeted error
        throw err;
      }
    }
  }

  applyConfig(newConfig) {
    const self = this;

    var config = self.readConfig();

    if (config.listeners.length > 1) { throw new Error('multuple listeners is not supported yet.') } // TODO: make it work

    for (var key in newConfig.listener) {  // forin seens to handle undefined just fine
      if (newConfig.listener.hasOwnProperty(key)) {
        config.listeners[0][key] = newConfig.listener[key];
      }
    }

    for (var key in newConfig.global) {  // forin seens to handle undefined just fine
      if (newConfig.global.hasOwnProperty(key)) {
        config[key] = newConfig.global[key];
      }
    }

    self.writeConfig(config);
  }

  readConfig() {
    const self = this;
    const config = yaml.safeLoad(fs.readFileSync(path.join(self.cwd, 'config.yml'), 'utf8'));
    return config;
  }

  writeConfig(config) {
    const self = this;

    if (self.running) {
      throw Error('bungeeCtrl is still running please stop it before writing config');
    }

    fs.writeFileSync(path.join(self.cwd, 'config.yml'), yaml.safeDump(config), 'utf8');
    return config;
  }

  setDummy(dummy) {
    const self = this;
    const config = self.readConfig();

    if (!isDummyMode(config)) { makeDummyMode(config) }
    config = setServerEntry('dummy', dummy, config);

    self.writeConfig(config);
  }

  setServer(server) {
    const self = this;
    const config = self.readConfig();

    if (!isDummyMode(config)) { makeDummyMode(config) }
    config = setServerEntry('server', server, config);

    self.writeConfig(config);
  }
}

function isDummyMode(config) {
  if (!config.servers.server) { return false }
  if (!config.servers.dummy) { return false }
  if (Object.keys(config.servers).length != 2) {
    return false;
  }
  config.listeners.forEach((listener) => {
    if (listener.priorities.length != 2) { return false }
    if (listener.priorities[0] != 'server') { return false }
    if (listener.priorities[1] != 'dummy') { return false }
  })
  return true;
}

function makeDummyMode(config) {
  config.servers = {
    server: {
      motd: 'this is server',
      address: 'localhost:25567',
      restricted: false
    },
    dummy: {
      motd: 'this is dummy',
      address: 'localhost:25566',
      restricted: false
    }
  }

  config.listeners = config.listeners.slice(0, 1);
  config.listeners[0].priorities = [
    'server', 'dummy'
  ]
}

function setServerEntry(type, server, config) {
  if (!server.address) { throw new Error(`address for server [${type}] not specified`) }
  config.servers[type].motd       = server.motd ? server.motd : 'please login to wake server up';
  config.servers[type].address    = server.address
  config.servers[type].restricted = server.restricted ? server.restricted : false;
}

exports.BungeeCtrl = BungeeCtrl;
exports.isDummyMode = isDummyMode;
exports.makeDummyMode = makeDummyMode;

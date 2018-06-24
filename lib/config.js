const yaml = require('js-yaml');
const fs = require('fs');
const defaults = {
  'server-jar': 'server.jar',
  'javaArgs': ['-Xmx2G'],
  'version':    '1.12.2',
  'callback-port': 8443,
  'motd': {
    bungee: 'A Minecraft Server',
    dummy: 'please login to wake server up'
  },
  'gameServer': {
    region: 'ap-northeast',
    type: 'g6-standard-2'
  }
}

// var neededConfig = {
//   dummyServer: [
//     'port',         // 25566
//     'host',         // localhost
//     'online-mode',  // true
//     'motd',         // please login to wake server up
//     'maxPlayers',   // 20
//     'version'       // 1.8
//   ],
//   server: [
//     'server-port',  // 25566
//     'server-ip',    // [blank]
//     'online-mode',  // true
//     'max-players',  // 20
//     'motd'          // A Minecraft Server
//   ], bungee: [
//     'host',         // 0.0.0.0:25565
//     'motd',         // A Minecraft Server
//     'max_players',  // 20
//     'serverList'    // ...
//   ]
// }

class Config {
  constructor(userFile = 'config.yaml', serverFile = 'server/server.properties') {
    let userConfig    = yaml.safeLoad(fs.readFileSync(userFile, 'utf8'));
    let serverConfig  = parseProperties(fs.readFileSync(serverFile, 'utf8'));

    checkMustField(userConfig, ['linodeToken', 'gameServer.rootPass'])

    this.serverJar =    userConfig['server-jar'] ? userConfig['server-jar'] : defaults['server-jar'];
    this.javaArgs =     userConfig.javaArgs ?  userConfig.javaArgs : defaults.javaArgs;
    this.version =      userConfig.version ? userConfig.version : defaults.version;
    this.serverPort =   Number.parseInt(serverConfig['server-port']);
    this.callbackPort = userConfig['callback-port'] ? userConfig['callback-port'] : defaults['callback-port'];
    this.motd = {
      server:           serverConfig.motd,
      bungee:           userConfig.motd && userConfig.motd.bungee ? userConfig.motd.bungee : serverConfig.motd,
      dummy:            userConfig.motd && userConfig.motd.dummy ? userConfig.motd.dummy : defaults.motd.dummy
    };
    this.onlineMode =   serverConfig['online-mode'];
    this.maxPlayers =   Number.parseInt(serverConfig['max-players']);
    this.linodeToken =  userConfig.linodeToken;
    this.gameServer = {
      rootPass:         userConfig.gameServer.rootPass,
      region:           userConfig.gameServer.region ? userConfig.gameServer.region : defaults.gameServer.region,
      type:             userConfig.gameServer.type ? userConfig.gameServer.type : defaults.gameServer.type
    }
  }

  get dummyServer() {
    return {
      'port':         25566,
      'host':         'localhost',
      'online-mode':  false,
      'motd':         this.motd.dummy,
      'maxPlayers':   this.maxPlayers,
      'version':      this.version
    };
  }

  get bungeeServer() {
    return {
      'listener': {
        'query_port':   this.serverPort,
        'host':         `0.0.0.0:${this.serverPort}`,
        'motd':         this.motd.bungee,
        'forced_hosts': null
      },
      'global': {
        'max_players':  this.maxPlayers
      }
    }
  }

  get serverOps() {
    return {
      serverJar: this.serverJar,
      javaArgs: this.javaArgs
    }
  }

  get linodeCreate(){
    return this.gameServer;
  }
}

function checkMustField(config, mustField) {
  for (let index = 0; index < mustField.length; index++) {
    let must = mustField[index].split('.');
    let checkPoint = config;
    for (let layer = 0; layer < must.length; layer++){
      if (checkPoint[must[layer]]) {
        checkPoint = checkPoint[must[layer]]
      } else {
        throw new Error(`${mustField[index]} is not specified, please check your config.yaml`);
      }
    }
  }
}

function parseProperties(properties) {
  var propertiesObj = {}

  if (properties instanceof Buffer) { properties = properties.toString() }

  properties = properties.split('\n').map((line) => { return line.match(/.+=.+/) ? line : null })
  properties.forEach((property) => {
    if (property) {
      property = property.match(/(.+)=(.*)/);
      propertiesObj[property[1]] = property[2];
    }
  })

  return propertiesObj;
}

exports.Config = Config;
exports.checkMustField = checkMustField;
exports.parseProperties = parseProperties;

const fs      = require('fs');
const path    = require('path');
const request = require('request');

const environment = require('./lib/environment');
const config      = new (require('./lib/config').Config)();
const download    = require('./lib/download');
const restServer    = new (require('./lib/restServer').RESTServer)(config);
const DummyServer = require('./lib/dummyServer').DummyServer;
const BungeeCtrl  = require('./lib/bungeeCtrl').BungeeCtrl;
const linodeCtrl  = new (require('./lib/linodeCtrl').LinodeCtrl)(config.linodeToken);

var dummyServer;
var bungeeCord;

// test environment
new Promise((resolve, reject) => {
  var envtest = environment.test();
  console.log('environment test:');
  console.log(envtest);

  if (envtest.pass) {
    resolve(envtest);
  } else {
    reject(envtest)
  }
})

// download
.then(() => {
  if (! fs.existsSync('bungee/BungeeCord.jar')) {
    console.log('downloading latest BungeeCord.jar');
    return download('https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar', 'bungee/BungeeCord.jar');
  } else {
    console.log('BungeeCord.jar already exist, skip downloading');
    return;
  }
})

// start dummyServer
.then(() => {
  dummyServer = new DummyServer(config.dummyServer);
  return dummyServer.start();
})
.then((options) => {
  console.log(`dummyServer started at: ${options.host}:${options.port}`);
  dummyServer.on('login', (client) => {
    console.log(`[${(new Date()).toLocaleTimeString()}] ${client.username} login!`);
    // trigger remote server creation
    linodeCtrl.createGameServer(config.linodeCreate, config.myip);
  })
})

// start BungeeCord
.then(() => {
  console.log('starting bungeeCord');
  bungeeCord = new BungeeCtrl('./bungee/BungeeCord.jar', config.bungeeServer);
  return bungeeCord.start();
})

// start restServer
.then(() => {
  restServer.start();
  restServer.on('serverReady', (ip) => {
    dummyServer.broadcast('game server is ready!!, ');
    dummyServer.broadcast('please try re-login');

    bungeeCord.stop()
    .then(() => {
      bungeeCord.setServer({
        motd:       config.motd.server,
        address:    `${ip}:${config.serverPort}`,
        restricted: false
      })
    })
    .then(() => { return bungeeCord.start() });
  })
  .on('serverStop', (ip) => {
    console.log('remote server auto-stop');
  })
})

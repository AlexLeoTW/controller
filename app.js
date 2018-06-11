const fs      = require('fs');
const path    = require('path');
const request = require('request');

const environment = require('./lib/environment');
const config      = new (require('./lib/config').Config)();
const download    = require('./lib/download');
const restCtrl    = require('./lib/restCtrl');
const DummyServer = require('./lib/dummyServer').DummyServer;
const BungeeCtrl  = require('./lib/bungeeCtrl').BungeeCtrl;

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
  })
})

// start BungeeCord
.then(() => {
  console.log('starting bungeeCord');
  bungeeCord = new BungeeCtrl('./bungee/BungeeCord.jar', config.bungeeServer);
  bungeeCord.start();
})

// start restCtrl
then(() => {
  restCtrl.listen(config.callbackPort)
  .on('serverReady', (ip) => {
    dummyServer.broadcast('game server is ready!!, ');
    dummyServer.broadcast('please try re-login');

    var serverList = bungeeCord.getServers();
    serverList.server = {
      motd: 'primary server',   // TODO: make this a variable
      address: `${ip}:25566`,
      restricted: false
    };
    bungeeCord.setServers(serverList);
  })
  .on('serverStop', (ip) => {
    console.log('remote server auto-stop');
  })
})


function launchLinode() {
  return new Promise((resolve, reject) => {
    request({
        url: 'https://api.linode.com/v4/linode/instances',
        method: "POST",
        headers: {
          Authorization: 'Bearer 61246f3cc4445a8cf1089ab6818169daab8b37b3e2d02bb706b192e8c23ee3b4'    // TODO: bake this into config
        },
        json: {
          image: "linode/ubuntu16.04lts",
          stackscript_id: 316534,    // TODO: upload this yourself
          root_pass: 'root_pass',    // TODO: bake this into config
          stackscript_data: {
            hostname: 'Minecraft',
            callback: '172.105.197.147:8443'    // TODO: bake this into config
          },
          booted: true,
          label: 'gameServer',
          region: "ap-northeast",
          type: "g6-standard-2"
        }
    }, (error, response, body) => {
      if (error || response.statusCode !== 200 ) {
        console.log(`error when creating remote server: ${error}`);
      }
      console.log(body);
      resolve(body.ipv4[0]);
    })
  })
}

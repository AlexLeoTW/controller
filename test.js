const DummyServer = require('./lib/dummyServer').DummyServer;
const BungeeCtrl = require('./lib/bungeeCtrl').BungeeCtrl;
const fs = require('fs');
const yaml = require('js-yaml');
const os = require('os');
const request = require('request');
const tar = require('./lib/tar');
const config      = new (require('./lib/config').Config)();

var result = config.parseProperties(fs.readFileSync('server/server.properties', 'utf8'));
console.log(result);

// var bungee = new BungeeCtrl('./bungee/BungeeCord.jar', {
//   online_mode: false
// });
//
// bungee.start()
// // .then(() => { return bungee.restart(() => {
// //   bungee.applyConfig({ forge_support: true })
// // }) })
// .then(() => { return bungee.stop() })
// .then((line) => {
//   console.log(`[[[${line}]]]`);
// })
// .catch((line) => {
//   console.log(`[[[${line}]]]`);
// })


// bungee.start().then(() => {
//   console.log(bungee.getServers());
//   return bungee.setServers({
//     dummy: {
//       motd: 'this is dummy',
//       address: 'localhost:25566',
//       restricted: false
//     },
//     server: {
//       motd: 'this actual server',
//       address: '192.168.1.30:25566',
//       restricted: false
//     }
//   })
// }).then(() => {
//   console.log(bungee.getServers());
// })

// var dummyServer = new DummyServer();
// console.log(dummyServer.start());
// dummyServer.on('login', (client) => {
//   console.log(`[${(new Date()).toLocaleTimeString()}] ${client.username} login!`);
// })

// console.log(os.networkInterfaces());

// request.post('http://localhost:3000/serverPack', {
//   formData: {
//     server: fs.createReadStream('server.tar.bz2'),
//     hello: 'hello world'
//   }
// }, (err, httpResponse, body) => {
//   if (err) { console.error(err) }
//   console.log(`${httpResponse.statusCode} ${httpResponse.statusMessage}`);
//   console.log(body);
// });


// new Promise((resolve , reject) => {
//   request.get('http://localhost:3000/serverPack')
//   .on('response', (res) => {
//     var tarFile = fs.createWriteStream('test.tar.bz2');
//     res.pipe(tarFile);
//
//     res.on('end', () => {
//       resolve();
//     })
//   })
// })
// .then(() => {
//   return tar.decompress('test.tar.bz2');
// })
// .then(() => {
//   console.log(`done!!!`);
// })

// request.delete('http://localhost:3000/server', {
//   form: {
//     hello: 'hello world'
//   }
// }, (err, httpResponse, body) => {
//   if (err) { console.error(err); return; }
//   console.log(`${httpResponse.statusCode} ${httpResponse.statusMessage}`);
//   console.log(body);
// });

// request.get(`http://localhost:3000/config`, (error, response, body) => {
//   if (error) { throw error }
//   console.log(body);
// })


// function getIp() {
//   var interfaces = os.networkInterfaces();
//
//   for (var iface in interfaces) {
//     for (var index = 0; index < interfaces[iface].length; index++) {
//       if (!interfaces[iface][index].internal && interfaces[iface][index].family == 'IPv4') {
//         return interfaces[iface][index].address;
//       }
//     }
//   }
// }
//
// console.log(getIp());

// function launchLinode() {
//   request({
//       url: 'https://api.linode.com/v4/linode/instances',
//       method: "POST",
//       headers: {
//         Authorization: 'Bearer 61246f3cc4445a8cf1089ab6818169daab8b37b3e2d02bb706b192e8c23ee3b4'    // TODO: bake this into config
//       },
//       json: {
//         image: "linode/ubuntu16.04lts",
//         stackscript_id: 316534,    // TODO: upload this yourself
//         root_pass: 'root_pass',    // TODO: bake this into config
//         stackscript_data: {
//           hostname: 'Minecraft',
//           callback: '172.105.197.147:8443'    // TODO: bake this into config
//         },
//         booted: true,
//         label: 'gameServer',
//         region: "ap-northeast",
//         type: "g6-standard-2"
//       }
//   }, (error, response, body) => {
//     if (error || response.statusCode !== 200 ) {
//       console.log(`error when creating remote server: ${error}`);
//     }
//     console.log(body);
//   })
// }
//
// launchLinode()

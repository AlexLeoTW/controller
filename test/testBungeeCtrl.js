const should = require('should');

const bungeeCtrl = require('../lib/bungeeCtrl2');

describe('#isDummyMode', () => {
  // 測試 BungeeCord 預設 config.yml 內容
  it('test with default config.yml', done => {
    should.equal(bungeeCtrl.isDummyMode({
      servers: {
        lobby: {
          motd: '&1Just another BungeeCord - Forced Host',
          address: 'localhost:25565',
          restricted: false
        }
      },
      listeners: [{
        query_port: 25577,
        motd: '&1Another Bungee server',
        query_enabled: false,
        proxy_protocol: false,
        ping_passthrough: false,
        priorities: [
          'lobby'
        ],
        bind_local_address: true,
        host: '0.0.0.0:25577',
        max_players: 1,
        tab_size: 60,
        force_default_server: false
      }]
    }), false)

    done()
  })

  // 測試 dummy mode 標準情形
  it('test with classical dummy mode', done => {
    should.equal(bungeeCtrl.isDummyMode({
      servers: {
        dummy: {
          motd: 'please login to wake server up',
          address: 'localhost:25566',
          restricted: false
        },
        server: {
          motd: 'A Minecraft Server',
          address: '127.0.0.1:25567',
          restricted: false
        }
      },
      listeners: [{
        query_port: 25577,
        motd: '&1Another Bungee server',
        query_enabled: false,
        proxy_protocol: false,
        ping_passthrough: false,
        priorities: [
          'server',
          'dummy'
        ],
        bind_local_address: true,
        host: '0.0.0.0:25565',
        max_players: 20,
        tab_size: 60,
        force_default_server: false
      }]
    }), true)

    done()
  })
})

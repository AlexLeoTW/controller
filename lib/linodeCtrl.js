const request = require('request');

const imageDistro = 'linode/ubuntu16.04lts'
const stackscript_id = '316534'

class LinodeCtrl {
  constructor(token) {
    this.token = token;
    this.runningNodes = {};
  }

  createGameServer(options, callbackIp) {
    const self = this;
    const nowTime = Date.now();

    return new Promise((resolve, reject) => {
      request({
        url: 'https://api.linode.com/v4/linode/instances',
        method: "POST",
        headers: {
          Authorization: `Bearer ${self.token}`
        },
        json: {
          image: imageDistro,
          stackscript_id: stackscript_id,
          root_pass: options.rootPass,
          stackscript_data: {
            hostname: `Minecraft_${nowTime.valueOf()}`,
            callback: callbackIp
          },
          booted: true,
          label: `gameServer_${nowTime.getUTCHours()}_${nowTime.getUTCMinutes()}`,
          region: options.linodeRegion,
          type: options.linodeType
        }
      }, (error, response, body) => {
        if (error || response.statusCode !== 200 ) {
          console.log(`error when creating remote server: ${error}`);
          reject(error);      // TODO: maybe a batter error handling?
        }

        if (self.runningNodes[body.id]) { throw new Error(`Linode id:[${body.id}] duplicated with runningNodes records`) }
        self.runningNodes[body.id] = body;

        resolve(body.ipv4[0]);
      })
    });
  }

  deleteGameServer(id) {
    const self = this;

    return new Promise((resolve, reject) => {
      request({
        url: `ttps://api.linode.com/v4/linode/instances/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${self.token}`
        }
      }, (error, response, body) => {
        if (error || response.statusCode !== 200 ) {
          console.log(`error when creating remote server: ${error}`);
          reject(error);      // TODO: maybe a batter error handling?
        }

        if (self.runningNodes[id]) { throw new Error(`Linode id:[${id}] not exist in runningNodes records`) }
        delete self.runningNodes[id];

        resolve();
      })
    });
  }
}

exports.LinodeCtrl = LinodeCtrl;

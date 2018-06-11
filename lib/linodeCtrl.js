const request = require('request');

const imageDistro = 'linode/ubuntu16.04lts'
const stackscript_id = '316534'

class LinodeCtrl {
  constructor(token) {
    this.token = token;
  }



  createGameServer(options, callback) {
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
            callback: callback
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
        resolve(body.ipv4[0]);
      })
    });
  }
}

exports.LinodeCtrl = LinodeCtrl;

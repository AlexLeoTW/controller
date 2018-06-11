const https = require('https');
const fs = require('fs');
const ProgressBar = require('progress');
const regexp = /https:\/\/(.+?)\/(.+)/;

module.exports = function (url, dest) {
  var match = url.match(regexp);
  var request = https.request({
    host: match[1],
    port: 443,
    path: `/${match[2]}`
  });
  var file = fs.createWriteStream(dest);

  request.end();    // fire request!
  return new Promise((resolve, reject) => {

    request.on('response', (response) => {
      var len = parseInt(response.headers['content-length'], 10);
      var bar = new ProgressBar(`  downloading ${dest} [:bar] :rate/bps :percent :etas`, {
        complete: '=',
        incomplete: ' ',
        width: 25,
        total: len
      });

      response.pipe(file);
      response.on('data', function (chunk) {
        bar.tick(chunk.length);
      });
      response.on('end', function () {

        resolve(dest);
      });
    })
  })
};

// https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar
// https://example.com/example.txt

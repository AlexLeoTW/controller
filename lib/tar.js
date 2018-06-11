const child_process = require('child_process');

function compress(path, dest) {
  const tar = child_process.spawn('tar', ['-I', 'pbzip2', '-cvf', dest, path]);
  return stdout(tar);
}

function decompress(path, dest) {
  // if is set and not set to enpty string
  var tar
  if (dest) {
    tar = child_process.spawn('tar', ['-I', 'pbzip2', '-xvf', path, '-C', dest]);
  } else {
    tar = child_process.spawn('tar', ['-I', 'pbzip2', '-xvf', path]);
  }
  return stdout(tar);
}

function stdout(tar) {
  tar.stdout.on('data', (data) => {
    console.log(data.toString().trim());
  });
  tar.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  return new Promise((resolve, reject) => {
    tar.on('close', (code) => {
      code == 0 ? resolve(code) : reject(code);
    });
  })
}


module.exports = {
  compress,
  decompress
};

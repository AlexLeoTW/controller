const express = require('express')
const path = require('path');
const events = require('events').EventEmitter();
const config = new (require('./lib/config').Config)();
const app = express();

// multipart/form-data middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({
  storage: storage,
  // fileFilter: tarFilter,
  limits: {
    fieldSize: 1024 * 1024
  }});

app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} from ${req.ip}`);
  next();
})

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.get('/config', (req, res) => {
  res.json({
    serverJar: 'spigot-1.8.jar',
    ops: ['-Xmx2G']
  })
})

app.get('/serverPack', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'server.tar.bz2'));
})

// TODO: authentication
app.post('/serverPack', upload.single('server'), (req, res) => {
  res.send('OK');
})

// TODO: authentication
app.post('/server', (req, res) => {
  events.emit('serverReady', req.body.ip);
  res.send('OK');
})

// TODO: authentication
app.delete('/server', (req, res) => {
  events.emit('serverStop', req.body.ip);
  res.send('OK');
})

function listen(port) {
  app.listen(port, () => console.log(`RESTCtrl listening on port ${port}!`));
  return events;
}

function tarFilter (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.tar\.(bz2|tgz|tbz|txz)$/)) {
        return cb(new Error('Only tar files are allowed!'), false);
    }
    cb(null, true);
};

exports.listen = listen;

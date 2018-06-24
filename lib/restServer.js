const express       = require('express')
const multer        = require('multer')
const path          = require('path')
const EventEmitter  = require('events').EventEmitter
const Config        = require('./config').Config

class RESTServer {
  constructor(config) {
    if (!config instanceof Config) { throw new TypeError(); }

    this.config = config;
    this.events = new EventEmitter();
    this.app = express();
    // multipart/form-data middleware
    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..'))
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname)
      }
    })
    this.upload = multer({
      storage: this.storage,
      fileFilter: tarFilter,
      limits: {
        fieldSize: 1024 * 1024
    }});
  }

  start() {
    const self = this;
    self.attachRoutes(self.app);
    self.app.listen(self.config.callbackPort, () => console.log(`RESTCtrl listening on port ${self.config.callbackPort}!`));
  }

  attachRoutes(app) {
    const self = this;

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
    app.post('/serverPack', self.upload.single('server'), (req, res) => {
      res.send('OK');
    })

    // TODO: authentication
    app.post('/server', (req, res) => {
      self.events.emit('serverReady', req.body.ip);
      res.send('OK');
    })

    // TODO: authentication
    app.delete('/server', (req, res) => {
      self.events.emit('serverStop', req.body.ip);
      res.send('OK');
    })
  }

  on(eventName, callback) {
    const self = this;
    return self.events.on(eventName, callback);
  }
}

function tarFilter (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.tar\.(bz2|tgz|tbz|txz)$/)) {
        return cb(new Error('Only tar files are allowed!'), false);
    }
    cb(null, true);
};

exports.RESTServer = RESTServer;

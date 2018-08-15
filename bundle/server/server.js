'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = start;

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

require('express-csv');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

var _ExpressHelper = require('server/helper/ExpressHelper');

var _ExpressHelper2 = _interopRequireDefault(_ExpressHelper);

var _FBGraphHelper = require('server/helper/FBGraphHelper');

var _FBGraphHelper2 = _interopRequireDefault(_FBGraphHelper);

var _index = require('server/authEndpoint/index');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('server/noAuthEndpoint/index');

var _index4 = _interopRequireDefault(_index3);

var _AccessTokenHelper = require('server/helper/AccessTokenHelper');

var _AccessTokenHelper2 = _interopRequireDefault(_AccessTokenHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_logger2.default.info('app will run with constant like: ' + JSON.stringify(_constant2.default, null, 2));

function start(port) {
  var app = (0, _ExpressHelper2.default)((0, _express2.default)(), process.cwd(), _logger2.default);
  app.use(_bodyParser2.default.json());

  return _DataHandler2.default.get().then(function (dh) {
    _logger2.default.info('data handler init as ' + dh.datastoreType + ' ' + JSON.stringify(dh.datastore.paths, null, 2));

    _index4.default.forEach(function (initFunc) {
      initFunc(app, dh);
    });

    app.enableSecureCheckForFollowingRoutes((0, _AccessTokenHelper2.default)(dh));
    _index2.default.forEach(function (initFunc) {
      initFunc(app, dh);
    });
    app.disableSecureCheckForFollowingRoutes();

    if (process.env.NODE_ENV == 'dev') {
      var devEndpoints = require('server/devEndpoint/index').default;
      devEndpoints.forEach(function (initFunc) {
        initFunc(app, dh);
      });
    }

    return dh;
  }).then(function () {
    return new Promise(function (resolve, reject) {
      // liyuhk: for heroku, according to:
      // https://stackoverflow.com/questions/25148507/https-ssl-on-heroku-node-express
      // we do not need to deal with https, as heroku has us covered with their https router,
      // so only for local dev  we start an https server
      var server = process.env.NODE_ENV === 'dev' ? _https2.default.createServer({
        key: _fs2.default.readFileSync('./var/server/server.key'),
        cert: _fs2.default.readFileSync('./var/server/server.crt')
      }, app) : _http2.default.createServer(app);
      var listener = server.listen(port || process.env.PORT || 5000, function (err) {
        if (err) {
          reject(err);
        } else {
          _logger2.default.info('Your app is listening on port ' + listener.address().port);
          resolve(listener);
        }
      });
    });
  });
}

if (require.main === module) {
  start().then(function (_listener) {
    _FBGraphHelper2.default.setWebsiteURL();
  });
}
//# sourceMappingURL=server.js.map
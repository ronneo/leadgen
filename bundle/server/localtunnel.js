'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _ExpressHelper = require('server/helper/ExpressHelper');

var _ExpressHelper2 = _interopRequireDefault(_ExpressHelper);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _localtunnel = require('localtunnel');

var _localtunnel2 = _interopRequireDefault(_localtunnel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = parseInt(process.env.PORT || 5000, 10);
var localtunnel_service_port = port + 1;

(0, _localtunnel2.default)(port, function (_err, tunnel) {
  _logger2.default.info('Will tunneling local server on port ' + port + ' through: ' + tunnel.url);

  var app = (0, _ExpressHelper2.default)((0, _express2.default)(), process.cwd(), _logger2.default);
  var server = _http2.default.createServer(app);
  server.listen(localtunnel_service_port, function (_err) {
    app.get('/localtunnel', function (_req, res) {
      res.status(200).send(tunnel.url);
    });
    _logger2.default.info('Localtunnel service started at port ' + localtunnel_service_port);
  });
});
//# sourceMappingURL=localtunnel.js.map
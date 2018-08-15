'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(app, dh) {
  app.get('/dev/server_config', function (req, res) {
    res.status(200).send({
      constant: _constant2.default,
      datastore_paths: dh.datastore.paths
    });
  });
}
//# sourceMappingURL=serverConfig.js.map
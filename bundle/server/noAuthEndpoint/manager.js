'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(app) {
  app.use(_express2.default.static('bundle'));
  app.get('/', function (_req, res) {
    res.status(200).send('\n  <div id="fb-root"></div>\n  <div id="app"></div>\n  <script>\n  (function() {\n    window.leadgenbotconst = window.leadgenbotconst || {};\n    window.leadgenbotconst.HEROKU_APP_URL = \'' + _constant2.default.HEROKU_APP_URL + '\';\n    window.leadgenbotconst.FB_APP_ID = \'' + _constant2.default.FB_APP_ID + '\';\n    window.leadgenbotconst.NODE_ENV = \'' + process.env.NODE_ENV + '\';\n    window.leadgenbotconst.FBSDK_VERSION = \'' + _constant2.default.FBSDK_VERSION + '\';\n  })();\n  </script>\n  <script src="./manager.js"></script>\n    ');
    (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_LAUNCH_APP);
  });
}
//# sourceMappingURL=manager.js.map
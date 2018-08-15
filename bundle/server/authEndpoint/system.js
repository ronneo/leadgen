'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _FBGraphHelper = require('server/helper/FBGraphHelper');

var _FBGraphHelper2 = _interopRequireDefault(_FBGraphHelper);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _fbrequest = require('common/fbrequest');

var _fbrequest2 = _interopRequireDefault(_fbrequest);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function init(app, dh) {
  app.post('/access_token', function (req, res) {
    var pageID = req.body.page_id;

    // We need to get a long-lived user access token before getting a long-lived
    // page access token.
    _fbrequest2.default.get({
      uri: _constant2.default.GRAPH_BASE_URL + '/oauth/access_token',
      qs: {
        grant_type: 'fb_exchange_token',
        client_id: _constant2.default.FB_APP_ID,
        client_secret: _constant2.default.FB_APP_SECRET,
        fb_exchange_token: req.body.access_token
      }
    }).then(function (bodyobj) {
      var user_access_token = bodyobj.access_token;
      return _fbrequest2.default.get({
        uri: _constant2.default.GRAPH_BASE_URL + '/' + pageID,
        qs: {
          fields: 'access_token',
          access_token: user_access_token
        }
      });
    }).then(function (bodyobj) {
      var page_access_token = bodyobj.access_token;
      dh.getAccessToken().then(function (access_token_mgr) {
        access_token_mgr.update(_defineProperty({}, _constant2.default.PAGE_ACCESS_TOKEN_KEY, page_access_token)).then(function () {
          res.sendStatus(200);
        }).catch(function () {
          res.sendStatus(500);
        });
      });
    }).catch(function (err) {
      _logger2.default.error('Error while requesting to Facebook API, ' + JSON.stringify(err));
      res.sendStatus(500);
    });
  });

  app.post('/subscribe_page', function (req, res) {
    _FBGraphHelper2.default.subscribeWebhooks(req.body.page).then(function () {
      res.sendStatus(200);
    }, function () {
      res.status(404);
    });
    (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_CONNECT_PAGE);
  });
}
//# sourceMappingURL=system.js.map
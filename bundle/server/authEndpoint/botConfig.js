'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _fbrequest = require('common/fbrequest');

var _fbrequest2 = _interopRequireDefault(_fbrequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(app, dh) {

  app.get('/welcome_screen', function (req, res) {
    dh.getAccessToken().then(function (access_token_mgr) {
      var page_access_token = access_token_mgr.get(_constant2.default.PAGE_ACCESS_TOKEN_KEY);
      return _fbrequest2.default.get({
        uri: _constant2.default.GRAPH_BASE_URL + '/me/messenger_profile',
        qs: {
          'access_token': page_access_token,
          'fields': 'greeting'
        }
      });
    }).then(function (bodyobj) {
      _logger2.default.info('Got Welcome Screen Text as: ' + JSON.stringify(bodyobj));
      var data_array = bodyobj['data'];

      var default_greeting = data_array[0].greeting.find(function (g) {
        return g.locale === 'default';
      });
      res.status(200).send(default_greeting.text);
    }).catch(function (err) {
      _logger2.default.error('Oops, Facebook API request failed with ' + JSON.stringify(err));
      res.status(500);
    });
  });

  app.post('/welcome_screen', function (req, res) {
    dh.getAccessToken().then(function (access_token_mgr) {
      var page_access_token = access_token_mgr.get(_constant2.default.PAGE_ACCESS_TOKEN_KEY);
      _fbrequest2.default.post({
        uri: _constant2.default.GRAPH_BASE_URL + '/me/messenger_profile',
        json: {
          'access_token': page_access_token,
          'greeting': [{
            'locale': 'default',
            'text': req.body.text
          }],
          'get_started': {
            'payload': 'GET_STARTED'
          }
        }
      }).then(function () {
        _logger2.default.info('Set Welcome Screen Text');
        res.sendStatus(200);
      }).catch(function (err) {
        _logger2.default.error('Oops, Facebook API request failed with ' + JSON.stringify(err));
        res.status(500);
      });
    });
  });
}
//# sourceMappingURL=botConfig.js.map
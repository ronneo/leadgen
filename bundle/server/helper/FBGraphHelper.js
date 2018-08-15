'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _fbrequest = require('common/fbrequest');

var _fbrequest2 = _interopRequireDefault(_fbrequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FBGraphHelper = function () {
  function FBGraphHelper() {
    _classCallCheck(this, FBGraphHelper);
  }

  _createClass(FBGraphHelper, null, [{
    key: 'setWebsiteURL',
    value: function setWebsiteURL() {
      var params = {
        access_token: _constant2.default.FB_APP_ACCESS_TOKEN,
        website_url: _constant2.default.HEROKU_APP_URL
      };
      _logger2.default.info('Setting Website URL to ' + _constant2.default.HEROKU_APP_URL + ' with param: ' + JSON.stringify(params));
      return _fbrequest2.default.post({
        uri: _constant2.default.GRAPH_BASE_URL + '/' + _constant2.default.FB_APP_ID,
        json: params
      }).then(function (_body) {
        _logger2.default.info('Website URL set');
      }).catch(function (err) {
        _logger2.default.error('Website URL setting failed: ' + err);
        if (err.stack) {
          _logger2.default.error(err.stack);
        }
        return err;
      });
    }
  }, {
    key: 'subscribeWebhooks',
    value: function subscribeWebhooks(page) {
      var options = {
        uri: _constant2.default.GRAPH_BASE_URL + '/' + _constant2.default.FB_APP_ID + '/subscriptions',
        json: {
          access_token: _constant2.default.FB_APP_ACCESS_TOKEN,
          object: 'page',
          callback_url: _constant2.default.CALLBACK_URL,
          fields: ['messages', 'messaging_postbacks'],
          verify_token: _constant2.default.WEBHOOK_VERIFY_TOKEN
        }
      };
      _logger2.default.info('Subscribing webhook events with params: ' + JSON.stringify(options.json));

      return _fbrequest2.default.post(options).then(function (_body) {
        _logger2.default.info('Subscribed webhook events successfully');
        var params = {
          access_token: page.access_token
        };
        _logger2.default.info('Subscribing page to app with params: ' + JSON.stringify(params));
        return _fbrequest2.default.post({
          uri: _constant2.default.GRAPH_BASE_URL + '/' + page.id + '/subscribed_apps',
          json: params
        });
      }).then(function (_body) {
        _logger2.default.info('Subscribed page to app successfully');
      }).catch(function (err) {
        _logger2.default.error('Failed to subscribed page to app: ' + JSON.stringify(err));
        return err;
      });
    }
  }]);

  return FBGraphHelper;
}();

exports.default = FBGraphHelper;
//# sourceMappingURL=FBGraphHelper.js.map
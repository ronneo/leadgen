'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KEY = 'default';

var AccessToken = function () {
  function AccessToken(datahandler) {
    _classCallCheck(this, AccessToken);

    this.datastore = datahandler.datastore;
    this.allAccessTokens = {};
  }

  _createClass(AccessToken, [{
    key: 'load',
    value: function load() {
      var _this = this;

      return new Promise(function (resolve, _reject) {
        _this.datastore._read(_this.datastore.paths.access_token, KEY).then(function (data) {
          _this.allAccessTokens = JSON.parse(data);
          resolve(_this);
        }).catch(function (err) {
          // any error in reading access token, fallback to no accesstoken
          _logger2.default.error('load access_token failed with: ' + JSON.stringify(err));
          _logger2.default.info('create new access_token store.');
          _this.allAccessTokens = {};
          resolve(_this);
        });
      });
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      return this.datastore._write(this.datastore.paths.access_token, KEY, JSON.stringify(this.allAccessTokens)).then(function () {
        _logger2.default.info('access_token saved.');
        return _this2;
      }).catch(function (err) {
        _logger2.default.error('save access_token failed with ' + JSON.stringify(err));
        return err;
      });
    }
  }, {
    key: 'update',
    value: function update(options) {
      this.allAccessTokens = Object.assign({}, this.allAccessTokens, options);
      return this.save();
    }
  }, {
    key: 'get',
    value: function get(key) {
      return key in this.allAccessTokens ? this.allAccessTokens[key] : null;
    }
  }]);

  return AccessToken;
}();

exports.default = AccessToken;
//# sourceMappingURL=accessToken.js.map
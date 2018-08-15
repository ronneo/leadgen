'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KEY = 'default';

/* reaper assumes dict to be in the form of
     {
       'group_name': {
         'key': { 'hash': '<value>', ttl: '<ttl>' }
       },
       ...
     }

   reaper will remove the key-hash pair when the ttl is down to zero,
   reaper will also remove the group_name when all key-hash pairs are 
   removed.
 */
function startReaper(dict) {
  var _reap = function _reap() {
    Object.keys(dict).forEach(function (group_name) {
      var group = dict[group_name];
      var new_group_dict = {};
      Object.keys(group).forEach(function (key) {
        var ttl = group[key].ttl;

        var new_ttl = ttl - _constant2.default.ACCESS_TOKEN_REAP_INTERVAL / 1000; // in seconds
        if (new_ttl > 0) {
          new_group_dict[key] = {
            hash: group[key].hash,
            ttl: new_ttl
          };
        }
      });
      if (new_group_dict !== {}) {
        dict[group_name] = new_group_dict;
      } else {
        delete dict[group_name];
      }
    });
  };
  return setInterval(_reap, _constant2.default.ACCESS_TOKEN_REAP_INTERVAL);
}

var BotConfig = function () {
  function BotConfig(datahandler) {
    _classCallCheck(this, BotConfig);

    this.datastore = datahandler.datastore;
    this.config = {};
    this.initInMemConfig();
  }

  _createClass(BotConfig, [{
    key: 'load',
    value: function load() {
      var _this = this;

      return new Promise(function (resolve, _reject) {
        _this.datastore._read(_this.datastore.paths.bot_config, KEY).then(function (data) {
          _this.config = JSON.parse(data);
          resolve(_this);
        }).catch(function (err) {
          _logger2.default.error('load bot config failed with: ' + JSON.stringify(err));
          _logger2.default.info('create new bot config.');
          _this.config = {};
          resolve(_this);
        });
      });
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      return this.datastore._write(this.datastore.paths.bot_config, KEY, JSON.stringify(this.config)).then(function () {
        _logger2.default.info('bot config saved.');
        return _this2;
      }).catch(function (err) {
        _logger2.default.error('saving bot config failed with: ' + JSON.stringify(err));
        return err;
      });
    }
  }, {
    key: 'initInMemConfig',
    value: function initInMemConfig() {
      this.inMemConfig = {};
      this.inMemConfigReaper = startReaper(this.inMemConfig);
    }
  }, {
    key: 'getInMemConfigAccessToken',
    value: function getInMemConfigAccessToken(email) {
      if (!this.inMemConfig.accessTokens) {
        this.inMemConfig.accessTokens = {};
      }
      if (this.inMemConfig.accessTokens.hasOwnProperty(email)) {
        this.inMemConfig.accessTokens[email].ttl = _constant2.default.ACCESS_TOKEN_TTL;
      } else {
        var hash = _crypto2.default.createHash('sha256').update(email + '+' + new Date().getTime()).digest('hex');
        this.inMemConfig.accessTokens[email] = {
          hash: hash,
          ttl: _constant2.default.ACCESS_TOKEN_TTL
        };
      }
      return this.inMemConfig.accessTokens[email].hash;
    }
  }, {
    key: 'checkEmailForAuthorized',
    value: function checkEmailForAuthorized(email) {
      var permissions = this.config.permissions || {};
      if (email in permissions) {
        return this.getInMemConfigAccessToken(email);
      } else {
        return null;
      }
    }
  }, {
    key: 'checkAccessToken',
    value: function checkAccessToken(access_token) {
      var _this3 = this;

      if (this.inMemConfig.accessTokens) {
        var found = Object.keys(this.inMemConfig.accessTokens).find(function (key) {
          var hash = _this3.inMemConfig.accessTokens[key].hash;

          return hash == access_token;
        });
        return found;
      }
      return false;
    }
  }]);

  return BotConfig;
}();

exports.default = BotConfig;
//# sourceMappingURL=config.js.map
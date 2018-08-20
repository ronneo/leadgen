'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _accessToken = require('server/store/accesstoken/accessToken');

var _accessToken2 = _interopRequireDefault(_accessToken);

var _config = require('server/store/bot/config');

var _config2 = _interopRequireDefault(_config);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _LocalFileDatastore = require('server/store/datastore/LocalFileDatastore');

var _LocalFileDatastore2 = _interopRequireDefault(_LocalFileDatastore);

var _questionFlow = require('server/store/question/questionFlow');

var _questionFlow2 = _interopRequireDefault(_questionFlow);

var _RedisDatastore = require('server/store/datastore/RedisDatastore');

var _RedisDatastore2 = _interopRequireDefault(_RedisDatastore);

var _userProgress = require('server/store/user/userProgress');

var _userProgress2 = _interopRequireDefault(_userProgress);

var _userResponse = require('server/store/user/userResponse');

var _userResponse2 = _interopRequireDefault(_userResponse);

var _userProfile = require('server/store/user/userProfile');

var _userProfile2 = _interopRequireDefault(_userProfile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var datahandler_singleton_promise = null;
var datahandler_singleton = null;

var DataHandler = function () {
  _createClass(DataHandler, null, [{
    key: 'get',
    value: function get() {
      if (datahandler_singleton_promise) {
        return datahandler_singleton_promise;
      }
      if (!datahandler_singleton) {
        datahandler_singleton_promise = DataHandler._get().then(function (dh) {
          datahandler_singleton = dh;
          datahandler_singleton_promise = null;
          return dh;
        });
        return datahandler_singleton_promise;
      }
      return Promise.resolve(datahandler_singleton);
    }
  }, {
    key: '_get',
    value: function _get() {
      if (_constant2.default.REDISCLOUD_URL == '') {
        return new DataHandler('local').init();
      } else {
        return new DataHandler('redis').init();
      }
    }
  }]);

  function DataHandler(storeType) {
    _classCallCheck(this, DataHandler);

    this.datastoreType = storeType;
    this.datastore = null;
    this.botConfig = null;
    this.botAllDataUserResponse = null;
  }

  _createClass(DataHandler, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var paths = {
        access_token: 'access_token',
        bot_config: 'bot_config',
        question_flow: 'question_flow',
        user_progress: 'user_progres',
        user_response: 'user_response',
        user_profile: 'user_profile'
      };

      switch (this.datastoreType) {
        case 'local':
          this.datastore = new _LocalFileDatastore2.default();
          this.datastore.paths = Object.keys(paths).reduce(function (acc, key) {
            acc[key] = _constant2.default.LOCAL_FILE_STORE_PATH + '/' + paths[key];
            return acc;
          }, {});
          break;
        case 'redis':
          this.datastore = new _RedisDatastore2.default();
          this.datastore.paths = paths;
          break;
      }

      this.botConfig = new _config2.default(this);

      return Promise.all([this.botConfig.load()]).then(function () {
        return _this;
      });
    }
  }, {
    key: 'getQuestionFlow',
    value: function getQuestionFlow(key) {
      return new _questionFlow2.default(this).load(key);
    }
  }, {
    key: 'getUserResponse',
    value: function getUserResponse(userID) {
      return new _userResponse2.default(this).load(userID);
    }
  }, {
    key: 'scanUserResponses',
    value: function scanUserResponses() {
      return this.datastore._scan(this.datastore.paths.user_response);
    }
  }, {
    key: 'getUserProgress',
    value: function getUserProgress(userID) {
      return new _userProgress2.default(this).load(userID);
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      return new _accessToken2.default(this).load();
    }
  }, {
    key: 'getUserProfile',
    value: function getUserProfile(userID) {
      return new _userProfile2.default(this).load(userID);
    }
  }]);

  return DataHandler;
}();

exports.default = DataHandler;
//# sourceMappingURL=DataHandler.js.map
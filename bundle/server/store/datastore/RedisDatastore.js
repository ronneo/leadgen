'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _DataStore2 = require('./DataStore');

var _DataStore3 = _interopRequireDefault(_DataStore2);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RedisDataStore = function (_DataStore) {
  _inherits(RedisDataStore, _DataStore);

  function RedisDataStore() {
    _classCallCheck(this, RedisDataStore);

    var _this = _possibleConstructorReturn(this, (RedisDataStore.__proto__ || Object.getPrototypeOf(RedisDataStore)).call(this));

    _this._client = _redis2.default.createClient(_constant2.default.REDISCLOUD_URL, { no_ready_check: true });
    _this._client.on('error', function (err) {
      _logger2.default.error('Redis error: ' + JSON.stringify(err));
    });
    return _this;
  }

  _createClass(RedisDataStore, [{
    key: 'formatRedisKey',
    value: function formatRedisKey(path, key) {
      return path + '_' + key;
    }
  }, {
    key: '_read',
    value: function _read(path, key) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var rediskey = _this2.formatRedisKey(path, key);
        _this2._client.get(rediskey, function (err, data) {
          if (err) {
            _logger2.default.error('Redis read error: ' + JSON.stringify(err));
            reject(err);
          } else if (!data) {
            _logger2.default.error('Redis found empty data for key ' + rediskey + '.');
            reject(new Error('Redis found empty data.'));
          } else {
            try {
              var d = JSON.parse(data);
              //console.log(typeof d, Object.prototype.toString.call(d));
              // TOFIX: validate this in real redis
              if (Object.prototype.toString.call(d) == '[object String]') {
                data = d;
              }
            } catch (e) {
              // go on
            }
            resolve(data);
          }
        });
      });
    }
  }, {
    key: '_write',
    value: function _write(path, key, data) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3._client.set(_this3.formatRedisKey(path, key), JSON.stringify(data), function (err, obj) {
          if (err) {
            _logger2.default.error('Redis write error: ' + JSON.stringify(err));
            reject(err);
          } else {
            resolve(obj);
          }
        });
      });
    }
  }, {
    key: '_scan',
    value: function _scan(path) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var cursor = 0;
        var pattern = path + '_*';
        var batch = '1000';
        var redisclient = _this4._client;

        function _scan(client, cursor, pattern, batch, callback) {
          client.scan(cursor, 'MATCH', pattern, 'COUNT', batch, function (err, res) {
            if (err) {
              _logger2.default.error('Redis scan error: ' + JSON.stringify(err));
              callback(err);
            } else {
              var _res = _slicedToArray(res, 2),
                  next_cursor = _res[0],
                  keys = _res[1];

              if (keys.length > 0) {
                callback(null, keys);
              }
              if (next_cursor != 0) {
                _scan(client, next_cursor, pattern, batch, callback);
              } else {
                callback(null, null, true);
              }
            }
          });
        }

        var allkeys = [];
        _scan(redisclient, cursor, pattern, batch, function (err, keys, finished) {
          if (err) {
            reject(err);
          } else if (!finished) {
            allkeys = allkeys.concat(keys.map(function (key) {
              // remove prefix `${path}_`
              return key.substring(path.length + 1);
            }));
          } else if (finished) {
            resolve(allkeys);
          }
        });
      });
    }
  }, {
    key: '_del',
    value: function _del(path, key) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        var rediskey = _this5.formatRedisKey(path, key);
        _this5._client.del(rediskey, function (err, _resp) {
          if (err) {
            _logger2.default.error('Redis del error: ' + JSON.stringify(err));
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }]);

  return RedisDataStore;
}(_DataStore3.default);

exports.default = RedisDataStore;
//# sourceMappingURL=RedisDatastore.js.map
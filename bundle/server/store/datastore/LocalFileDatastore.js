'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _DataStore2 = require('./DataStore');

var _DataStore3 = _interopRequireDefault(_DataStore2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LocalFileDataStore = function (_DataStore) {
  _inherits(LocalFileDataStore, _DataStore);

  function LocalFileDataStore() {
    _classCallCheck(this, LocalFileDataStore);

    return _possibleConstructorReturn(this, (LocalFileDataStore.__proto__ || Object.getPrototypeOf(LocalFileDataStore)).call(this));
  }

  _createClass(LocalFileDataStore, [{
    key: 'formatFilePath',
    value: function formatFilePath(path, key) {
      return path + '_' + key + '.json';
    }

    // Override

  }, {
    key: '_read',
    value: function _read(path, key) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _fs2.default.readFile(_this2.formatFilePath(path, key), function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

    // Override

  }, {
    key: '_write',
    value: function _write(path, key, data) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _fs2.default.writeFile(_this3.formatFilePath(path, key), data, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }, {
    key: '_scan',
    value: function _scan(the_path) {
      var dir = _path2.default.dirname(the_path);
      var prefix = _path2.default.basename(the_path);
      return new Promise(function (resolve, reject) {
        _fs2.default.readdir(dir, function (err, files) {
          if (err) {
            reject(err);
          } else {
            var keys = [];
            files.map(function (file) {
              var re = new RegExp(prefix + '_([^_]+).json', 'g');
              var m = re.exec(file);
              if (m) {
                keys.push(m[1]);
              }
            });
            resolve(keys);
          }
        });
      });
    }
  }, {
    key: '_del',
    value: function _del(path, key) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _fs2.default.unlink(_this4.formatFilePath(path, key), function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }]);

  return LocalFileDataStore;
}(_DataStore3.default);

exports.default = LocalFileDataStore;
//# sourceMappingURL=LocalFileDatastore.js.map
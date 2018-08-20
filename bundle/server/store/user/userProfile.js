'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserProfile = function () {
  function UserProfile(datahandler) {
    _classCallCheck(this, UserProfile);

    this.datastore = datahandler.datastore;
    this.userID = null;
    this.userProfile = null;
    this.profileFetched = false;
  }

  _createClass(UserProfile, [{
    key: 'load',
    value: function load(userID) {
      var _this = this;

      this.userID = userID;
      return new Promise(function (resolve, _reject) {
        _this.datastore._read(_this.datastore.paths.user_profile, _this.userID).then(function (data) {
          _this.userProfile = JSON.parse(data);
          _this.profileFetched = true;
          resolve(_this);
        }).catch(function (err) {
          _logger2.default.error('load user ' + _this.userID + ' profile failed with ' + JSON.stringify(err));
          _logger2.default.info('marking UserID: ' + _this.userID + ' as not fetched');
          _this.userProfile = null;
          _this.profileFetched = false;
          resolve(_this);
        });
      });
    }
  }, {
    key: 'isProfileFetched',
    value: function isProfileFetched() {
      return this.profileFetched;
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      return this.datastore._write(this.datastore.paths.user_profile, this.userID, JSON.stringify(this.userProfile)).then(function () {
        _logger2.default.info('user ' + _this2.userID + ' profile saved.');
        return _this2;
      }).catch(function (err) {
        _logger2.default.error('save user ' + _this2.userID + ' profile failed with ' + JSON.stringify(err));
        return err;
      });
    }
  }, {
    key: 'update',
    value: function update(profile) {
      this.userProfile = Object.assign({}, this.userProfile, profile);
      return this.save();
    }
  }, {
    key: 'del',
    value: function del() {
      return this.datastore._del(this.datastore.paths.user_profile, this.userID);
    }
  }]);

  return UserProfile;
}();

exports.default = UserProfile;
//# sourceMappingURL=userProfile.js.map
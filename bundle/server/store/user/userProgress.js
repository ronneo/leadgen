'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserProgress = function () {
  function UserProgress(datahandler) {
    _classCallCheck(this, UserProgress);

    this.datastore = datahandler.datastore;
    this.userID = null;
    this.userProgress = null;
  }

  _createClass(UserProgress, [{
    key: 'load',
    value: function load(userID) {
      var _this = this;

      this.userID = userID;
      return new Promise(function (resolve, _reject) {
        _this.datastore._read(_this.datastore.paths.user_progress, _this.userID).then(function (data) {
          _this.userProgress = JSON.parse(data);
          resolve(_this);
        }).catch(function (err) {
          _logger2.default.error('load user ' + _this.userID + ' progress failed with: ' + JSON.stringify(err));
          _logger2.default.info('create new progress for user ' + _this.userID);
          _this.userProgress = [];
          resolve(_this);
        });
      });
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      return this.datastore._write(this.datastore.paths.user_progress, this.userID, JSON.stringify(this.userProgress)).then(function () {
        _logger2.default.info('user ' + _this2.userID + ' progess saved.');
        return _this2;
      }).catch(function (err) {
        _logger2.default.error('save user ' + _this2.userID + ' progress failed with ' + JSON.stringify(err));
        return err;
      });
    }
  }, {
    key: 'update',
    value: function update(options) {
      this.userProgress = Object.assign({}, this.userProgress, options);
      return this.save();
    }
  }, {
    key: 'findNextQid',
    value: function findNextQid(questionFlow, payload) {
      var stopAtQid = this.userProgress.stopAtQid;

      var question = questionFlow.findQuestionWithQid(stopAtQid);
      if (question.options) {
        return questionFlow.findNextQidOfQuestionInOptions(question, stopAtQid, payload);
      } else if (question.elements) {
        return questionFlow.findNextQidOfQuestionInElements(question, stopAtQid, payload);
      } else {
        return questionFlow.findNextQidOfQuestion(question, stopAtQid);
      }
    }
  }, {
    key: 'del',
    value: function del() {
      return this.datastore._del(this.datastore.paths.user_progress, this.userID);
    }
  }]);

  return UserProgress;
}();

exports.default = UserProgress;
//# sourceMappingURL=userProgress.js.map
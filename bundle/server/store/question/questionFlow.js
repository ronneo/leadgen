'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_QUESTION_FLOW_KEY = 'default';

var QuestionFlow = function () {
  function QuestionFlow(datahandler) {
    _classCallCheck(this, QuestionFlow);

    this.datastore = datahandler.datastore;
    this.key = null;
    this.questions = [];
  }

  _createClass(QuestionFlow, [{
    key: 'load',
    value: function load() {
      var _this = this;

      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_QUESTION_FLOW_KEY;

      this.key = key;
      return new Promise(function (resolve, _reject) {
        _this.datastore._read(_this.datastore.paths.question_flow, key).then(function (data) {
          _this.questions = JSON.parse(data);
          resolve(_this);
        }).catch(function (err) {
          _logger2.default.error('load question flow ' + key + ' failed with ' + JSON.stringify(err));
          _logger2.default.info('create new question flow ' + key);
          _this.questions = [];
          resolve(_this);
        });
      });
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_QUESTION_FLOW_KEY;

      this.key = key;
      return this.datastore._write(this.datastore.paths.question_flow, key, JSON.stringify(this.questions)).then(function () {
        _logger2.default.info('question flow ' + key + ' saved.');
        return _this2;
      }).catch(function (err) {
        _logger2.default.error('save question flow ' + key + ' failed with ' + JSON.stringify(err));
        return err;
      });
    }
  }, {
    key: 'findQidWithAnchor',
    value: function findQidWithAnchor(anchor) {
      if (anchor == '#end') {
        return this.questions.length;
      } else {
        return this.questions.findIndex(function (question) {
          return question.anchor && question.anchor == anchor;
        });
      }
    }
  }, {
    key: 'findQuestionWithQid',
    value: function findQuestionWithQid(qid) {
      if (qid >= 0 && qid < this.questions.length) {
        return this.questions[qid];
      } else {
        return null;
      }
    }
  }, {
    key: 'findNextQidOfQuestion',
    value: function findNextQidOfQuestion(question, questionID) {
      if (question.next) {
        return this.findQidWithAnchor(question.next);
      } else {
        return questionID + 1;
      }
    }
  }, {
    key: 'findNextQidOfQuestionInOptions',
    value: function findNextQidOfQuestionInOptions(question, questionID, payload) {
      var option = question.options.find(function (option) {
        return option.resp_payload == payload;
      });
      if (option && option.next) {
        return this.findQidWithAnchor(option.next);
      } else {
        return questionID + 1;
      }
    }
  }, {
    key: 'findNextQidOfQuestionInElements',
    value: function findNextQidOfQuestionInElements(question, questionID, payload) {
      var _this3 = this;

      var nextQid = null;

      question.elements.forEach(function (element) {
        if (nextQid) {
          return;
        }

        if (element.buttons) {
          var button = element.buttons.find(function (button) {
            return button.url == payload;
          });

          if (button && button.next) {
            nextQid = _this3.findQidWithAnchor(button.next);
          }
        }
      });

      if (nextQid) {
        return nextQid;
      } else {
        return questionID + 1;
      }
    }
  }]);

  return QuestionFlow;
}();

exports.default = QuestionFlow;
//# sourceMappingURL=questionFlow.js.map
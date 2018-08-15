'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(app, dh) {
  app.get('/questions', function (req, res) {
    dh.getQuestionFlow().then(function (questionFlow) {
      res.json(questionFlow.questions);
    }).catch(function (err) {
      _logger2.default.info('Get all questions failed: ' + JSON.stringify(err));
      res.sendStatus(500);
    });
  });

  app.post('/questions', function (req, res) {
    (0, _invariant2.default)(Array.isArray(req.body), '/questions only accepts POST with JSON array. Current is not!');
    dh.getQuestionFlow().then(function (questionFlow) {
      questionFlow.questions = req.body;
      return questionFlow.save();
    }).then(function () {
      res.sendStatus(200);
    }).catch(function () {
      res.sendStatus(500);
    });
    (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_QUESTIONAIRE_UPDATE);
  });
}
//# sourceMappingURL=question.js.map
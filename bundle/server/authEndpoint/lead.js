'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.init = init;

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _questionHandlers = require('server/handler/questionHandlers');

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function genCSVBuilder(dh, flatattr) {
  return dh.getQuestionFlow().then(function (question_flow) {
    var header = ['uid'];
    question_flow.questions.forEach(function (question, index) {
      var needNoAnswer = _questionHandlers.questionHandlerMap[question.type](0, question, {})[1];
      if (!needNoAnswer) {
        header.push('q' + index);
        header.push('payload' + index);
        header.push('timeofmessage' + index);
      }
    });
    flatattr.push(header);
    return header;
  }).then(function (header) {
    return function (key, user_resps) {
      var row = new Array(header.length).map(function () {
        return '';
      });
      row[0] = key;
      user_resps.forEach(function (resp) {
        var index = header.indexOf('q' + resp.qid);
        row[index] = resp.qid;
        row[index + 1] = resp.payload;
        row[index + 2] = resp.timeOfMessage;
      });
      flatattr.push(row);
    };
  });
}

function loadOneUserResponse(dh, key, csv_builder) {
  return dh.getUserResponse(key).then(function (user_resp_mgr) {
    csv_builder(key, user_resp_mgr.userResponses);
    return key;
  });
}

function loadAllResponsesForExport(dh, csv_builder) {
  return dh.scanUserResponses().then(function (keys) {
    return new Promise(function (resolve, _reject) {
      function _load(keys, callback) {
        if (keys.length <= 0) {
          callback();
        } else {
          var key = keys[0];
          var rest_keys = keys.splice(1);
          loadOneUserResponse(dh, key, csv_builder).then(function () {
            _load(rest_keys, callback);
          });
        }
      }
      _load(keys, resolve);
    });
  });
}

function init(app, dh) {
  app.get('/download_leads', function (req, res) {
    var flatattr = [];
    genCSVBuilder(dh, flatattr).then(function (csv_builder) {
      return loadAllResponsesForExport(dh, csv_builder);
    }).then(function () {
      res.csv(flatattr);
    }).catch(function (err) {
      _logger2.default.error('error while generating flat responses for export: ' + JSON.stringify(err));
      res.sendStatus(500);
    });
    (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_EXPORT_LEAD);
  });

  app.get('/lead_scan_keys', function (req, res) {
    dh.scanUserResponses().then(function (keys) {
      res.status(200).send(keys);
    });
  });

  app.get('/lead_with_key', function (req, res) {
    Promise.all([dh.getUserResponse(req.query.key), dh.getUserProgress(req.query.key)]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          user_resp_mgr = _ref2[0],
          user_prog_mgr = _ref2[1];

      res.status(200).send({
        progress: user_prog_mgr.userProgress,
        response: user_resp_mgr.userResponses
      });
    });
  });

  app.delete('/lead_with_key', function (req, res) {
    dh.getUserResponse(req.query.key).then(function (user_resp_mgr) {
      return user_resp_mgr.del();
    }).then(function () {
      return dh.getUserProgress(req.query.key);
    }).then(function (user_progress_mgr) {
      return user_progress_mgr.del();
    }).then(function () {
      res.sendStatus(200);
    });
  });
}
//# sourceMappingURL=lead.js.map
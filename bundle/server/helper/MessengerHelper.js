'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.sendQuestion = sendQuestion;

var _timers = require('timers');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _questionHandlers = require('server/handler/questionHandlers');

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*  liyuhk: messageQueue and reaper
    To ensure the message is sent as user designed, we need a messageQueue and a reaper.
    For example, consider following example, user want to send msg in following order
      1. greeting msg 1
      2. greeting msg 2
      3. question msg
    if we simplely use javascript code to do it, like below
      request(endpoint, {greeting_msg_1});
      request(endpoint, {greeting_msg_2});
      request(endpoint, {question_msg});
    it may not send in the order we programmed (the reason is request is async). What's correct
    to do is
      request(endpoint, {greeting_msg_1}, () => {
        request(endpoint, {greeting_msg_2}, () => {
          request(endpoint, {question_msg}, ()=> {
            ...next msg
          });
        }); 
      });
    but that is a callback hell, so we design a queue for storing all msgs we want to send, and reaper 
    is an infinite recursive function help us to avoid callback hell.
*/
var Reaper = function () {
  function Reaper(datahandler) {
    _classCallCheck(this, Reaper);

    this.messageQueue = [];
    this.status = 'idle';
    this.stopFlag = false;
    this.datahandler = datahandler;
  }

  _createClass(Reaper, [{
    key: 'sendMessage',
    value: function sendMessage(psid, messageObj) {
      this.messageQueue.push([psid, messageObj]);
    }
  }, {
    key: 'fbSendMessageObj',
    value: function fbSendMessageObj(psid, messageObj) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.datahandler.getAccessToken().then(function (access_token_mgr) {
          var page_access_token = access_token_mgr.get(_constant2.default.PAGE_ACCESS_TOKEN_KEY);
          _logger2.default.info('will send message ' + JSON.stringify(messageObj) + '.');
          (0, _request2.default)({
            method: 'POST',
            uri: _constant2.default.GRAPH_BASE_URL + '/me/messages',
            qs: { access_token: page_access_token },
            json: messageObj
          }, function (err, _res, body) {
            if (err) {
              _logger2.default.info('Message sending failed with body ' + JSON.stringify(body) + '}');
              reject(err);
            } else {
              _logger2.default.info('Message sent with body ' + JSON.stringify(body));
              resolve(messageObj);
            }
          });
          (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_MSG_SENT, psid);
        });
      });
    }
  }, {
    key: 'reap',
    value: function reap(timeout) {
      var _timeout = timeout || 500;
      var reaper = this;
      var fbSendMessageObj = this.fbSendMessageObj.bind(this);
      function _reap() {
        if (reaper.stopFlag) {
          reaper.status = 'idle';
          reaper.stopFlag = false;
          return;
        }
        if (reaper.messageQueue && reaper.messageQueue.length > 0) {
          var _reaper$messageQueue$ = reaper.messageQueue.shift(),
              _reaper$messageQueue$2 = _slicedToArray(_reaper$messageQueue$, 2),
              psid = _reaper$messageQueue$2[0],
              messageObj = _reaper$messageQueue$2[1];

          fbSendMessageObj(psid, messageObj).then(function (_lastMessageObj) {
            _reap();
          });
        } else {
          (0, _timers.setTimeout)(_reap, _timeout);
        }
      }
      this.status = 'reaping';
      _reap();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.stopFlag = true;
      return new Promise(function (resolve, _reject) {
        var timeout = 100;
        function _check(callback) {
          if (this.status !== 'idle') {
            (0, _timers.setTimeout)(function () {
              _check(callback);
            }, timeout);
          } else {
            callback();
          }
        }
        _check(function () {
          resolve();
        });
      });
    }
  }]);

  return Reaper;
}();

var _reaper = new Reaper();
_DataHandler2.default.get().then(function (dh) {
  _reaper.datahandler = dh;
  _reaper.reap();
});

function sendQuestion(recipientID, nextQid, questionFlow) {
  function _sendQuestion(q) {
    var question = questionFlow.findQuestionWithQid(q);
    if (question) {
      var _questionHandlerMap$q = _questionHandlers.questionHandlerMap[question.type](recipientID, question),
          _questionHandlerMap$q2 = _slicedToArray(_questionHandlerMap$q, 2),
          messageObj = _questionHandlerMap$q2[0],
          needNoAnwser = _questionHandlerMap$q2[1];

      _reaper.sendMessage(recipientID, messageObj);
      if (needNoAnwser) {
        var nq = questionFlow.findNextQidOfQuestion(question, q);
        return _sendQuestion(nq);
      } else {
        return q;
      }
    } else {
      _reaper.sendMessage(recipientID, {
        recipient: { id: recipientID },
        message: { text: 'That is it! Thanks for your time!' }
      });
      return q;
    }
  }

  return new Promise(function (resolve, _reject) {
    var stopAtQid = _sendQuestion(nextQid);
    var question = questionFlow.findQuestionWithQid(stopAtQid);
    var nextExpectRespType = question && question.type ? _questionHandlers.questionExpectMap[question.type] : 'finished';
    resolve([stopAtQid, nextExpectRespType]);
  });
}
//# sourceMappingURL=MessengerHelper.js.map
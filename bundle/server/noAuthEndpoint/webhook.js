'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.init = init;

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

var _MessengerHelper = require('server/helper/MessengerHelper');

var _responseHandlers = require('server/handler/responseHandlers');

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function receivedMessage(event, dh) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  _logger2.default.info('Received message for user ' + senderID + ' and page ' + recipientID + ' at ' + timeOfMessage + ' ' + ('with message: ' + JSON.stringify(message)));

  Promise.all([dh.getQuestionFlow(), dh.getUserProgress(senderID), dh.getUserResponse(senderID)]).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 3),
        questionFlow = _ref2[0],
        userProgress = _ref2[1],
        userResponse = _ref2[2];

    _logger2.default.info('user ' + userProgress.userID + ' at progress ' + JSON.stringify(userProgress.userProgress));
    if (event.postback && event.postback.referral) {
      // TODO: handle user info and referral info here
    }
    var _userProgress$userPro = userProgress.userProgress,
        expectRespType = _userProgress$userPro.expectRespType,
        nextQid = _userProgress$userPro.nextQid;

    expectRespType = expectRespType || 'genesis';
    nextQid = nextQid || 0;
    _responseHandlers.responseHandlerMap[expectRespType](message, event, questionFlow, userProgress, userResponse).then(function (nextQid) {
      // we can hanlde this response, go to next question
      return (0, _MessengerHelper.sendQuestion)(senderID, nextQid, questionFlow).then(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            stopAtQid = _ref4[0],
            nextExpectRespType = _ref4[1];

        userProgress.update({
          expectRespType: nextExpectRespType,
          nextQid: nextQid,
          stopAtQid: stopAtQid
        });
      });
    }).catch(function (err) {
      _logger2.default.error('Oops, can not handle user response because ' + JSON.stringify(err));
      _logger2.default.info('fall back to re-send last question.');
      // can not handle this response, repeat last question
      (0, _MessengerHelper.sendQuestion)(senderID, nextQid, questionFlow).then(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            stopAtQid = _ref6[0],
            nextExpectRespType = _ref6[1];

        userProgress.update({
          expectRespType: nextExpectRespType,
          nextQid: nextQid,
          stopAtQid: stopAtQid
        });
      });
    });
  });
}

function init(app, dh) {
  app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'TEMPLATE_BOT') {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
  });

  app.post('/webhook', function (req, res) {
    var data = req.body;
    if (data.object == 'page') {
      data.entry.forEach(function (pageEntry) {
        pageEntry.messaging.forEach(function (messagingEvent) {
          if (messagingEvent.message) {
            receivedMessage(messagingEvent, dh);
          } else if (messagingEvent.postback) {
            receivedMessage(Object.assign(messagingEvent, {
              message: messagingEvent.postback.payload
            }), dh);
          } else {
            _logger2.default.info('Webhook received unsupported messageEvent: ' + JSON.stringify(messagingEvent));
          }
          (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_MSG_RECEIVED, messagingEvent.sender.id);
        });
      });
      res.sendStatus(200);
    }
  });
}
//# sourceMappingURL=webhook.js.map
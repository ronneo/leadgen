'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var responseHandlerMap = exports.responseHandlerMap = {
  'genesis': function genesis(_message, _event, _questionFlow, _userProgress, _userResponse) {
    return new Promise(function (_resolve, reject) {
      reject();
    });
  },

  'quick_reply': function quick_reply(message, event, questionFlow, userProgress, userResponse) {
    return new Promise(function (resolve, reject) {
      var quick_reply = message.quick_reply;
      var timeOfMessage = event.timestamp;
      if (quick_reply) {
        var payload = quick_reply.payload;
        var stopAtQid = userProgress.userProgress.stopAtQid;

        var nextQid = userProgress.findNextQid(questionFlow, payload);
        userResponse.push({ qid: stopAtQid, timeOfMessage: timeOfMessage, payload: payload }).then(function () {
          resolve(nextQid);
        }).catch(function (err) {
          reject(err);
        });
      } else {
        reject(new Error('reply is not quick_reply.'));
      }
    });
  },

  'text_input': function text_input(message, event, questionFlow, userProgress, userResponse) {
    return new Promise(function (resolve, reject) {
      var messageText = message.text;
      var timeOfMessage = event.timestamp;
      if (messageText) {
        var payload = messageText;
        var stopAtQid = userProgress.userProgress.stopAtQid;

        var nextQid = userProgress.findNextQid(questionFlow, payload);
        userResponse.push({ qid: stopAtQid, timeOfMessage: timeOfMessage, payload: payload }).then(function () {
          resolve(nextQid);
        }).catch(function (err) {
          reject(err);
        });
      } else {
        reject(new Error('reply is not text_input.'));
      }
    });
  },

  'finished': function finished(_message, _event, _questionFlow, _userProgress, _userResponse) {
    return new Promise(function (_resolve, reject) {
      reject();
    });
  }
};
//# sourceMappingURL=responseHandlers.js.map
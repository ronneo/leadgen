'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var NEED_NO_ANSWER = true;
var NEED_ANSWER = false;

var questionHandlerMap = {
  'greeting': function greeting(psid, question) {
    return [{
      recipient: { id: psid },
      message: { text: question.text }
    }, NEED_NO_ANSWER];
  },

  'question': function question(psid, _question) {
    return [{
      recipient: { id: psid },
      message: {
        text: _question.text,
        quick_replies: _question.options.map(function (option) {
          return {
            'content_type': 'text',
            'title': option.text,
            'payload': option.resp_payload
          };
        })
      }
    }, NEED_ANSWER];
  },

  'input': function input(psid, question) {
    return [{
      recipient: { id: psid },
      message: { text: question.text }
    }, NEED_ANSWER];
  },

  't&c': function tC(psid, question) {
    return [{
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: question.text,
            buttons: [{
              type: 'web_url',
              url: question.url,
              title: question.urlText,
              'webview_height_ratio': 'compact'
            }]
          }
        }
      }
    }, NEED_NO_ANSWER];
  }
};

exports.questionHandlerMap = questionHandlerMap;
var questionExpectMap = exports.questionExpectMap = {
  'question': 'quick_reply',
  'input': 'text_input'
};
//# sourceMappingURL=questionHandlers.js.map
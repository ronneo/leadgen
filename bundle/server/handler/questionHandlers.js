'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.questionExpectMap = exports.questionHandlerMap = undefined;

var _TemplateHelper = require('server/helper/TemplateHelper');

var _TemplateHelper2 = _interopRequireDefault(_TemplateHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NEED_NO_ANSWER = true;
var NEED_ANSWER = false;

var questionHandlerMap = {
  'greeting': function greeting(psid, question, userProfile) {
    return [{
      recipient: { id: psid },
      message: { text: (0, _TemplateHelper2.default)(question.text, userProfile) }
    }, NEED_NO_ANSWER];
  },

  'question': function question(psid, _question, userProfile) {
    return [{
      recipient: { id: psid },
      message: {
        text: (0, _TemplateHelper2.default)(_question.text, userProfile),
        quick_replies: _question.options.map(function (option) {
          return {
            'content_type': 'text',
            'title': (0, _TemplateHelper2.default)(option.text, userProfile),
            'payload': option.resp_payload
          };
        })
      }
    }, NEED_ANSWER];
  },

  'input': function input(psid, question, userProfile) {
    return [{
      recipient: { id: psid },
      message: { text: (0, _TemplateHelper2.default)(question.text, userProfile) }
    }, NEED_ANSWER];
  },

  't&c': function tC(psid, question, userProfile) {
    return [{
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: (0, _TemplateHelper2.default)(question.text, userProfile),
            buttons: [{
              type: 'web_url',
              url: question.url,
              title: (0, _TemplateHelper2.default)(question.urlText, userProfile),
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
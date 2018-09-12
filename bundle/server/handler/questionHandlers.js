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

var URL_REGEXP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

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
    var quick_replies = question.quick_replies || [];
    if (quick_replies.length === 0) {
      return [{
        recipient: { id: psid },
        message: { text: (0, _TemplateHelper2.default)(question.text, userProfile) }
      }, NEED_ANSWER];
    }
    return [{
      recipient: { id: psid },
      message: {
        text: (0, _TemplateHelper2.default)(question.text, userProfile),
        quick_replies: quick_replies.map(function (quick_reply) {
          return {
            content_type: quick_reply.content_type
          };
        })
      }
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
  },

  'carousel': function carousel(psid, question, userProfile) {
    return [{
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: question.elements.map(function (question) {
              var obj = {
                title: (0, _TemplateHelper2.default)(question.title, userProfile),
                subtitle: (0, _TemplateHelper2.default)(question.subtitle, userProfile),
                image_url: question.image_url
              };

              if (question.buttons && question.buttons.length > 0) {
                obj.buttons = question.buttons.map(function (button) {
                  if (button.next || !button.url.match(URL_REGEXP)) {
                    return {
                      type: 'postback',
                      title: (0, _TemplateHelper2.default)(button.title, userProfile),
                      payload: button.url
                    };
                  } else {
                    return {
                      type: 'web_url',
                      title: (0, _TemplateHelper2.default)(button.title, userProfile),
                      url: button.url
                    };
                  }
                });
              }

              return obj;
            })
          }
        }
      }
    }, question.next ? NEED_NO_ANSWER : NEED_ANSWER];
  },
  'image': function image(psid, question, userProfile) {
    return [{
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: question.url,
            is_reusable: true
          }
        }
      }
    }, NEED_NO_ANSWER];
  }
};

exports.questionHandlerMap = questionHandlerMap;
var questionExpectMap = exports.questionExpectMap = {
  'question': 'quick_reply',
  'input': 'text_input',
  'carousel': 'postback'
};
//# sourceMappingURL=questionHandlers.js.map
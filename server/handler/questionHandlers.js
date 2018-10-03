import render_template from 'server/helper/TemplateHelper';

const NEED_NO_ANSWER = true;
const NEED_ANSWER = false;

const URL_REGEXP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

export let questionHandlerMap = {
  'greeting': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: { text: render_template(question.text, userProfile) },
      },
      NEED_NO_ANSWER,
    ];
  },

  'question': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          text: render_template(question.text, userProfile),
          quick_replies: question.options.map((option) => {
            return {
              'content_type': 'text',
              'title': render_template(option.text, userProfile),
              'payload': option.resp_payload,
            };
          }),
        },
      },
      NEED_ANSWER,
    ];
  },

  'input': (psid, question, userProfile) => {
    let quick_replies = question.quick_replies || [];
    if (quick_replies.length === 0) {
      return [
        {
          recipient: { id: psid },
          message: { text: render_template(question.text, userProfile) },
        },
        NEED_ANSWER,
      ];
    }
    return [
      {
        recipient: { id: psid },
        message: {
          text: render_template(question.text, userProfile),
          quick_replies: quick_replies.map((quick_reply) => {
            return ({
              content_type: quick_reply.content_type,
            });
          })
        },
      },
      NEED_ANSWER,
    ];
  },

  't&c': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: render_template(question.text, userProfile),
              buttons:[{
                type: 'web_url',
                url: question.url,
                title: render_template(question.urlText, userProfile),
                'webview_height_ratio': 'compact'
              }]
            }
          }
        },
      },
      NEED_NO_ANSWER
    ];
  },

  'carousel': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: question.elements.map((question) => {
                var obj = {
                  title: render_template(question.title, userProfile),
                  subtitle: render_template(question.subtitle, userProfile),
                  image_url: question.image_url,
                };

                if (question.buttons && question.buttons.length > 0) {
                  obj.buttons = question.buttons.map((button) => {
                    if (button.next || !(button.url.match(URL_REGEXP))) {
                      return {
                        type: 'postback',
                        title: render_template(button.title, userProfile),
                        payload: button.url,
                      };
                    } else {
                      return {
                        type: 'web_url',
                        title: render_template(button.title, userProfile),
                        url: button.url,
                      };
                    }
                  });
                }

                return obj;
              }),
            }
          }
        },
      },
      (question.next?NEED_NO_ANSWER:NEED_ANSWER)
    ];
  },
  'image': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          attachment: {
            type:'image',
            payload:{
              url: question.url,
              is_reusable: true
            }
          }
        },
      },
      NEED_NO_ANSWER,
    ];
  },
};

export let questionExpectMap = {
  'question': 'quick_reply',
  'input': 'text_input',
  'carousel': 'postback',
};

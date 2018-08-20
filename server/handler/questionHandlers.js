import render_template from 'server/helper/TemplateHelper';

const NEED_NO_ANSWER = true;
const NEED_ANSWER = false;

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
    return [
      {
        recipient: { id: psid },
        message: { text: render_template(question.text, userProfile) },
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
};

export let questionExpectMap = {
  'question': 'quick_reply',
  'input': 'text_input',
};

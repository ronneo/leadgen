'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var questionSamples = exports.questionSamples = {
  'greeting': function greeting() {
    return {
      'type': 'greeting',
      'text': 'May the Force be with you!'
    };
  },
  'question': function question() {
    return {
      'type': 'question',
      'text': 'Which side are you with?',
      'options': [{
        'text': 'The Force will be with you. Always.',
        'resp_payload': 'jedi'
      }, {
        'text': 'I find you lack of faith disturbing.',
        'resp_payload': 'seth'
      }]
    };
  },
  'input': function input() {
    return {
      'type': 'input',
      'text': 'Do. Or do not. There is no try. Your anwser?'
    };
  },
  't&c': function tC() {
    return {
      'type': 't&c',
      'text': 'Never tell me the odds!',
      'url': 'http://www.starwars.com/news/40-memorable-star-wars-quotes',
      'urlText': 'No, never click it'
    };
  }
};
//# sourceMappingURL=question.js.map
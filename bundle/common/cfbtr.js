'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cfbtr = cfbtr;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
custom event firing
*/

function cfbtr(customEvent, question, recipientId, opts) {
  var params = {
    event: 'CUSTOM_APP_EVENTS',
    custom_events: JSON.stringify([{
      _eventName: customEvent,
      _valueToSum: 1,
      _trigger: opts.trigger, //start or end of message
      _payload: opts.payload, //payload of reply (if not empty)
      _question: question.text,
      fb_currency: 'USD',
      utm_source: JSON.stringify([_constant2.default.HEROKU_APP_URL])
    }]),
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    page_id: _constant2.default.FB_APP_ID
  };
  if (recipientId) {
    params.page_scoped_user_id = recipientId;
  } else {
    params.anon_id = 0;
  }

  return _requestPromise2.default.post({
    url: 'https://graph.facebook.com/' + _constant2.default.FB_APP_ID + '/activities',
    form: params
  }).then(function () {
    // simple ignore
    console.log('Done sent measurement ' + customEvent);
  }).catch(function (_err) {
    // simply ignore any errs
    console.log(_err.message);
  });
}
//# sourceMappingURL=cfbtr.js.map
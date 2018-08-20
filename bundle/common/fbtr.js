'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fbtrEvents = undefined;
exports.fbtr = fbtr;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var APP_ID = 132502590902997;
var PAGE_ID = 357549008061567;

var fbtrEvents = exports.fbtrEvents = {
  LEADGENBOT_LAUNCH_APP: 'LEADGENBOT_LAUNCH_APP',
  LEADGENBOT_USER_LOGIN: 'LEADGENBOT_USER_LOGIN',
  LEADGENBOT_CONNECT_PAGE: 'LEADGENBOT_CONNECT_PAGE',
  LEADGENBOT_LEAD: 'LEADGENBOT_LEAD',
  LEADGENBOT_EXPORT_LEAD: 'LEADGENBOT_EXPORT_LEAD',
  LEADGENBOT_QUESTIONAIRE_UPDATE: 'LEADGENBOT_QUESTIONAIRE_UPDATE',
  LEADGENBOT_MSG_RECEIVED: 'LEADGENBOT_MSG_RECEIVED',
  LEADGENBOT_MSG_SENT: 'LEADGENBOT_MSG_SENT'
};

function fbtr(customEvent, recipientId) {
  var params = {
    event: 'CUSTOM_APP_EVENTS',
    custom_events: JSON.stringify([{
      _eventName: customEvent,
      _valueToSum: 1,
      fb_currency: 'USD',
      utm_source: JSON.stringify([_constant2.default.HEROKU_APP_URL])
    }]),
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    page_id: PAGE_ID
  };
  if (recipientId) {
    params.page_scoped_user_id = recipientId;
  } else {
    params.anon_id = 0;
  }
  return _requestPromise2.default.post({
    url: 'https://graph.facebook.com/' + APP_ID + '/activities',
    form: params
  }).then(function () {
    // simple ignore
    // console.log(`Done sent measurement ${customEvent}`);
  }).catch(function (_err) {
    // simply ignore any errs
    // console.log(_err.message);
  });
}
//# sourceMappingURL=fbtr.js.map
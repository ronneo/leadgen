import request from 'request-promise';
import constant from 'common/constant';

/*
custom event firing
*/

export function cfbtr(customEvent, question, recipientId, opts) {
  const params = {
    event: 'CUSTOM_APP_EVENTS',
    custom_events: JSON.stringify([{
      _eventName: customEvent,
      _valueToSum: 1,
      _trigger: opts.trigger, //start or end of message
      _payload: opts.payload, //payload of reply (if not empty)
      _question: question.text,
      fb_currency: 'USD',
      utm_source: JSON.stringify([constant.HEROKU_APP_URL]),
    }]),
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    page_id: constant.FB_APP_ID,
  };
  if (recipientId) {
    params.page_scoped_user_id = recipientId;
  } else {
    params.anon_id = 0;
  }

  return request.post({
    url : `https://graph.facebook.com/${constant.FB_APP_ID}/activities`,
    form: params,
  })
  .then(() => {
    // simple ignore
    console.log(`Done sent measurement ${customEvent}`);
  })
  .catch((_err) => {
    // simply ignore any errs
    console.log(_err.message);
  });
}

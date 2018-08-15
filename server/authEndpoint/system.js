import FBGraphHelper from 'server/helper/FBGraphHelper';
import constant from 'common/constant';
import fbrequest from 'common/fbrequest';
import logger from 'common/logger';
import { fbtrEvents, fbtr } from 'common/fbtr';

export function init(app, dh) {
  app.post('/access_token', (req, res) => {
    let pageID = req.body.page_id;
  
    // We need to get a long-lived user access token before getting a long-lived
    // page access token.
    fbrequest.get({
      uri: `${constant.GRAPH_BASE_URL}/oauth/access_token`,
      qs: {
        grant_type: 'fb_exchange_token',
        client_id: constant.FB_APP_ID,
        client_secret: constant.FB_APP_SECRET,
        fb_exchange_token: req.body.access_token,
      }
    })
    .then((bodyobj) => {
      let user_access_token = bodyobj.access_token;
      return fbrequest.get({
        uri: `${constant.GRAPH_BASE_URL}/${pageID}`,
        qs: {
          fields: 'access_token',
          access_token: user_access_token,
        }
      });
    })
    .then((bodyobj) => {
      let page_access_token = bodyobj.access_token;
      dh.getAccessToken()
        .then((access_token_mgr) => {
          access_token_mgr.update({ [constant.PAGE_ACCESS_TOKEN_KEY]: page_access_token })
            .then(() => {
              res.sendStatus(200);
            })
            .catch(() => {
              res.sendStatus(500);
            });
        });
    })
    .catch((err) => {
      logger.error(`Error while requesting to Facebook API, ${JSON.stringify(err)}`);
      res.sendStatus(500);
    });
  });

  app.post('/subscribe_page', (req, res) => {
    FBGraphHelper.subscribeWebhooks(req.body.page)
      .then(() => {
        res.sendStatus(200);
      }, () => {
        res.status(404);
      });
    fbtr(fbtrEvents.LEADGENBOT_CONNECT_PAGE);
  });
}

import constant from 'common/constant';
import logger from 'common/logger';
import fbrequest from 'common/fbrequest';

export function init(app, dh) {

  app.get('/welcome_screen', (req, res) => {
    dh.getAccessToken()
      .then((access_token_mgr) => {
        let page_access_token = access_token_mgr.get(constant.PAGE_ACCESS_TOKEN_KEY);
        return fbrequest.get({
          uri: `${constant.GRAPH_BASE_URL}/me/messenger_profile`,
          qs: {
            'access_token': page_access_token,
            'fields': 'greeting',
          },
        });
      })
      .then((bodyobj) => {
        logger.info(`Got Welcome Screen Text as: ${JSON.stringify(bodyobj)}`);
        let { 'data': data_array } = bodyobj;
        let default_greeting = (data_array[0].greeting).find((g) => { return g.locale === 'default'; });
        res.status(200).send(default_greeting.text);
      })
      .catch((err) => {
        logger.error(`Oops, Facebook API request failed with ${JSON.stringify(err)}`);
        res.status(500);
      });
  });

  app.post('/welcome_screen', (req, res) => {
    dh.getAccessToken().then(
      (access_token_mgr) => {
        let page_access_token = access_token_mgr.get(constant.PAGE_ACCESS_TOKEN_KEY);
        fbrequest.post({
          uri: `${constant.GRAPH_BASE_URL}/me/messenger_profile`,
          json: {
            'access_token': page_access_token,
            'greeting': [
              {
                'locale': 'default',
                'text': req.body.text,
              },
            ],
            'get_started': {
              'payload':'GET_STARTED'
            },
          },
        })
        .then(() => {
          logger.info('Set Welcome Screen Text');
          res.sendStatus(200);
        })
        .catch((err) => {
          logger.error(`Oops, Facebook API request failed with ${JSON.stringify(err)}`);
          res.status(500);
        });
      });
  });

}

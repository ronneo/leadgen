import fbrequest from 'common/fbrequest';
import constant from 'common/constant';

import {fbtrEvents, fbtr} from 'common/fbtr';

function tryFirstUserIsAdminPolicy(botConfig, email) {
  return new Promise((resolve, reject) => {
    if (!botConfig.config.permissions ||
        (botConfig.config.permissions && Object.keys(botConfig.config.permissions).length == 0)) {
      botConfig.config.permissions = {
        [email]: true,
      };
      botConfig.save()
        .then(() => {
          let token = botConfig.checkEmailForAuthorized(email);
          if (token) {
            resolve(token);
          } else {
            reject('token is invalid');
          }
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      reject('Not the first user');
    }
  });
}

export function init(app, dh) {
  app.get('/auth/fbuser', (req, res) => {
    let {userid, accesstoken} = req.query || {};
    if (userid && accesstoken) {
      fbrequest.get({
        uri: `${constant.GRAPH_BASE_URL}/${userid}`,
        qs: {
          'fields': 'id,name,email',
          'access_token': accesstoken,
        }
      })
      .then((dataobj) => {
        let {email} = dataobj;
        let token = dh.botConfig.checkEmailForAuthorized(email);
        if (token) {
          res.status(200).send(JSON.stringify({
            access_token: token,
          }));
          fbtr(fbtrEvents.LEADGENBOT_USER_LOGIN, userid);
        } else {
          tryFirstUserIsAdminPolicy(dh.botConfig, email)
            .then((token2) => {
              res.status(200).send(JSON.stringify({
                access_token: token2,
              }));
            })
            .catch(() => {
              res.status(401).send(`Auth failed with user ${userid} and email ${email}.`);
            });
        }
      });
    } else {
      res.status(401).send('Auth failed with incomplete params.');
    }
  });
}

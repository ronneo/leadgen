import bodyParser from 'body-parser';
import express from 'express';
import 'express-csv';
import fs from 'fs';
import https from 'https';
import http from 'http';

import constant from 'common/constant';
import logger from 'common/logger';
import DataHandler from 'server/store/DataHandler';
import ExpressHelper from 'server/helper/ExpressHelper';
import FBGraphHelper from 'server/helper/FBGraphHelper';

import authEndpoints from 'server/authEndpoint/index';
import noAuthEndpoints from 'server/noAuthEndpoint/index';
import checkForAccessTokenMiddleware from 'server/helper/AccessTokenHelper';

logger.info(`app will run with constant like: ${JSON.stringify(constant, null, 2)}`);

export function start(port) {
  let app = ExpressHelper(express(), process.cwd(), logger);
  app.use(bodyParser.json());

  return DataHandler.get()
    .then((dh) => {
      logger.info(
        `data handler init as ${dh.datastoreType} ${JSON.stringify(dh.datastore.paths, null, 2)}`,
      );

      noAuthEndpoints.forEach((initFunc) => {
        initFunc(app, dh);
      });

      app.enableSecureCheckForFollowingRoutes(checkForAccessTokenMiddleware(dh));
      authEndpoints.forEach((initFunc) => {
        initFunc(app, dh);
      });
      app.disableSecureCheckForFollowingRoutes();

      if (process.env.NODE_ENV == 'dev') {
        const devEndpoints = require('server/devEndpoint/index').default;
        devEndpoints.forEach((initFunc) => {
          initFunc(app, dh);
        });
      }

      return dh;
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        // liyuhk: for heroku, according to:
        // https://stackoverflow.com/questions/25148507/https-ssl-on-heroku-node-express
        // we do not need to deal with https, as heroku has us covered with their https router,
        // so only for local dev  we start an https server
        const server = process.env.NODE_ENV === 'dev'
          ? https.createServer({
            key: fs.readFileSync('./var/server/server.key'),
            cert: fs.readFileSync('./var/server/server.crt')
          }, app)
          : http.createServer(app);
        let listener = server.listen(port || process.env.PORT || 5000, (err) => {
          if (err) {
            reject(err);
          } else {
            logger.info(`Your app is listening on port ${listener.address().port}`);
            resolve(listener);
          }
        });
      });
    });
}

if (require.main === module) {
  start()
    .then((_listener) => {
      FBGraphHelper.setWebsiteURL();
    });
}

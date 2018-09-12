import fs from 'fs-extra';
import request from 'request-promise';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';
import {start as startServer} from 'server/server';
import FBGraphHelper from '../../helper/FBGraphHelper';

const port = constant.port;
const sample_page_id = 4000;
const sample_page = {
  access_token: '12345',
  name: 'sample page',
  id: sample_page_id,
};
let express_server = null;

jest.mock('common/fbrequest', () => {
  return {
    get: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri == 'https://graph.facebook.com/v2.11/oauth/access_token') {
          resolve({
            access_token: '9999',
          });
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4000') {
          resolve({
            access_token: '9999',
          });
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4') {
          resolve({
            id: 4,
            name: 'zack',
            email: 'zack@fb.com',
          });
        } else {
          console.error('get', params);
          reject('err');
        }
      });
    }),
    post: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri == 'https://graph.facebook.com/v2.11/1234/subscriptions') {
          resolve();
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4000/subscribed_apps') {
          resolve();
        } else if (params.uri == 'https://graph.facebook.com/v2.11/1234') {
          resolve();
        } else {
          console.error('post', params);
          reject('err');
        }
      });
    }),
  };
});

jest.mock('common/constant', () => {
  const port = Math.floor(Math.random() * 10000 + 1024);
  return {
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    REDISCLOUD_URL: '',
    FB_APP_ID: 1234,
    FB_APP_ACCESS_TOKEN: '1234|5678',
    FB_APP_SECRET: 'helloworld',
    WEBHOOK_VERIFY_TOKEN: 'jedi',
    HEROKU_APP_URL: `http://localhost:${port}`,
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_system',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    PAGE_ACCESS_TOKEN_KEY: 'page_access_token',
    port: port,
  };
});

jest.useFakeTimers();

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('all', () => {
  let thedh = null;
  let theat = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      thedh.botConfig.config.permissions = {
        'zack@fb.com': true,
      };
      return thedh.botConfig.save();
    })
    .then(() => {
      return startServer(port);
    })
    .then(() => {
      // try get without access_token
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          userid: 4,
          accesstoken: 'hello',
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      theat = JSON.parse(resp.body).access_token;
    })
    .then((listener) => {
      express_server = listener;
      return request.post({
        uri: `http://localhost:${port}/subscribe_page`,
        json: {
          page: sample_page,
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      return request.post({
        uri: `http://localhost:${port}/access_token`,
        json: {
          page_id: sample_page_id,
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      let data = fs.readJsonSync(
        `${constant.LOCAL_FILE_STORE_PATH}/access_token_default.json`,
      );
      expect(data).toEqual({
        page_access_token: '9999',
      });
      return expect(FBGraphHelper.setWebsiteURL()).resolves.toBe(undefined);
    });
});

afterAll((done) => {
  express_server.close(() => {
    fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
    done();
  });
});

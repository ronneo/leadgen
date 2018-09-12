'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

var _server = require('server/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = _constant2.default.port;

var express_server = null;

jest.mock('common/constant', function () {
  var port = Math.floor(Math.random() * 10000 + 1024);
  return {
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_botconfig',
    FB_APP_ID: 1234,
    FB_APP_ACCESS_TOKEN: '1234|5678',
    FB_APP_SECRET: 'helloworld',
    WEBHOOK_VERIFY_TOKEN: 'jedi',
    HEROKU_APP_URL: 'http://localhost:' + port + '/',
    port: port
  };
});

jest.mock('common/fbrequest', function () {
  var greeting_msg = 'Default is jedi!';
  return {
    get: jest.fn().mockImplementation(function (params) {
      return new Promise(function (resolve, reject) {
        if (params.uri == 'https://graph.facebook.com/v2.11/me/messenger_profile') {
          resolve({
            data: [{
              greeting: [{ locale: 'default', text: greeting_msg }]
            }]
          });
          return;
        }
        if (params.uri == 'https://graph.facebook.com/v2.11/4') {
          resolve({
            id: 4,
            name: 'zack',
            email: 'zack@fb.com'
          });
          return;
        }
        console.error('get', params);
        reject('err');
      });
    }),
    post: jest.fn().mockImplementation(function (params) {
      return new Promise(function (resolve, reject) {
        if (params.uri == 'https://graph.facebook.com/v2.11/me/messenger_profile') {
          greeting_msg = params.json.greeting[0].text;
          resolve();
          return;
        }
        console.error('post', params);
        reject('err');
      });
    })
  };
});

jest.useFakeTimers();

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
  _fsExtra2.default.writeJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/access_token_default.json', {
    page_access_token: '9999'
  });
});

test('all', function () {
  var theat = null;
  return _DataHandler2.default.get().then(function (dh) {
    dh.botConfig.config.permissions = {
      'zack@fb.com': true
    };
    return dh.botConfig.save();
  }).then(function () {
    return (0, _server.start)(port);
  }).then(function (listener) {
    express_server = listener;
    // try get without access_token
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/auth/fbuser',
      qs: {
        userid: 4,
        accesstoken: 'hello'
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    theat = JSON.parse(resp.body).access_token;
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/welcome_screen',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual('Default is jedi!');
    return _requestPromise2.default.post({
      uri: 'http://localhost:' + port + '/welcome_screen',
      qs: {
        access_token: theat
      },
      json: {
        text: 'Now seth takes over!'
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/welcome_screen',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual('Now seth takes over!');
  });
});

afterAll(function (done) {
  express_server.close(function () {
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
    done();
  });
});
//# sourceMappingURL=botConfig.js.map
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

var _FBGraphHelper = require('../../helper/FBGraphHelper');

var _FBGraphHelper2 = _interopRequireDefault(_FBGraphHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = _constant2.default.port;
var sample_page_id = 4000;
var sample_page = {
  access_token: '12345',
  name: 'sample page',
  id: sample_page_id
};
var express_server = null;

jest.mock('common/fbrequest', function () {
  return {
    get: jest.fn().mockImplementation(function (params) {
      return new Promise(function (resolve, reject) {
        if (params.uri == 'https://graph.facebook.com/v2.11/oauth/access_token') {
          resolve({
            access_token: '9999'
          });
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4000') {
          resolve({
            access_token: '9999'
          });
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4') {
          resolve({
            id: 4,
            name: 'zack',
            email: 'zack@fb.com'
          });
        } else {
          console.error('get', params);
          reject('err');
        }
      });
    }),
    post: jest.fn().mockImplementation(function (params) {
      return new Promise(function (resolve, reject) {
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
    })
  };
});

jest.mock('common/constant', function () {
  var port = Math.floor(Math.random() * 10000 + 1024);
  return {
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    REDISCLOUD_URL: '',
    FB_APP_ID: 1234,
    FB_APP_ACCESS_TOKEN: '1234|5678',
    FB_APP_SECRET: 'helloworld',
    WEBHOOK_VERIFY_TOKEN: 'jedi',
    HEROKU_APP_URL: 'http://localhost:' + port,
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_system',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    PAGE_ACCESS_TOKEN_KEY: 'page_access_token',
    port: port
  };
});

jest.useFakeTimers();

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});

test('all', function () {
  var thedh = null;
  var theat = null;
  return _DataHandler2.default.get().then(function (dh) {
    thedh = dh;
    thedh.botConfig.config.permissions = {
      'zack@fb.com': true
    };
    return thedh.botConfig.save();
  }).then(function () {
    return (0, _server.start)(port);
  }).then(function () {
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
  }).then(function (listener) {
    express_server = listener;
    return _requestPromise2.default.post({
      uri: 'http://localhost:' + port + '/subscribe_page',
      json: {
        page: sample_page,
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    return _requestPromise2.default.post({
      uri: 'http://localhost:' + port + '/access_token',
      json: {
        page_id: sample_page_id,
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    var data = _fsExtra2.default.readJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/access_token_default.json');
    expect(data).toEqual({
      page_access_token: '9999'
    });
    return expect(_FBGraphHelper2.default.setWebsiteURL()).resolves.toBe(undefined);
  });
});

afterAll(function (done) {
  express_server.close(function () {
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
    done();
  });
});
//# sourceMappingURL=system.js.map
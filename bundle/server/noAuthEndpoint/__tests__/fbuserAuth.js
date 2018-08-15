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

var port = Math.floor(Math.random() * 10000 + 1024);
var express_server = null;

jest.mock('common/fbrequest', function () {
  return {
    get: jest.fn().mockImplementation(function (params) {
      return new Promise(function (resolve, reject) {
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
    })
  };
});

jest.mock('common/constant', function () {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_fbuserauth',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11'
  };
});

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});

test('odd_cases_of_auth', function () {
  var thedh = null;
  return _DataHandler2.default.get().then(function (dh) {
    thedh = dh;
    thedh.botConfig.config.permissions = {
      'zack-nono@fb.com': true
    };
    return thedh.botConfig.save();
  }).then(function () {
    return (0, _server.start)(port);
  }).then(function (listener) {
    express_server = listener;
    // let us try getting access_token
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/auth/fbuser',
      qs: {
        userid: '4',
        accesstoken: 'helloworld'
      },
      resolveWithFullResponse: true
    });
  }).catch(function (err) {
    // as the email is not authorized, so must be denied
    expect(err.statusCode).toBe(401);
    // now we try getting access_token with incomplete params
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/auth/fbuser',
      qs: {
        userid: '4'
      },
      resolveWithFullResponse: true
    });
  }).catch(function (err) {
    // should be denied too
    expect(err.statusCode).toBe(401);
    // try again
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/auth/fbuser',
      resolveWithFullResponse: true
    });
  }).catch(function (err) {
    // should be denied too
    expect(err.statusCode).toBe(401);
    // final try
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/auth/fbuser',
      qs: {
        accesstoken: 'helloworld'
      },
      resolveWithFullResponse: true
    });
  }).catch(function (err) {
    // should be denied too
    expect(err.statusCode).toBe(401);
  });
});

afterAll(function (done) {
  express_server.close(function () {
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
    done();
  });
});
//# sourceMappingURL=fbuserAuth.js.map
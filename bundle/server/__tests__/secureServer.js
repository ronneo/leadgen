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

jest.mock('common/constant', function () {
  return {
    REDISCLOUD_URL: '',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    LOCAL_FILE_STORE_PATH: './var/data_test_secure_server',
    ACCESS_TOKEN_REAP_INTERVAL: 1 * 1000,
    ACCESS_TOKEN_TTL: 4
  };
});

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

jest.useFakeTimers();

var sample_questions = [{
  'type': 'greeting',
  'text': 'hello'
}, {
  'type': 'question',
  'text': 'world',
  'options': [{
    'text': 'jedi',
    'resp_payload': 'jedi'
  }]
}, {
  'type': 'input',
  'text': 'your name'
}];

var sample_csv = ['\"uid\",\"q1\",\"payload1\",\"timeofmessage1\",\"q2\",\"payload2\",\"timeofmessage2\"', '\"4\",\"1\",\"hello\",\"19700101\",,,', '\"5\",,,,\"2\",\"hello\",\"19700101\"', ''].join('\r\n');

function user_response(qid) {
  return {
    qid: qid,
    timeOfMessage: 19700101,
    payload: 'hello'
  };
}

var port = Math.floor(Math.random() * 10000 + 1024);
var SAMPLE_USERID = 4;
var SAMPLE_USER_ACCESSTOKEN = 'helloworld';
var express_server = null;

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
  _fsExtra2.default.outputJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/question_flow_default.json', sample_questions);
});

test('all', function () {
  var thedh = null;
  var theat = null;
  return _DataHandler2.default.get().then(function (dh) {
    thedh = dh;
    return Promise.all([dh.getUserResponse(4).then(function (user_response_mgr) {
      user_response_mgr.push(user_response(1));
    }), dh.getUserResponse(5).then(function (user_response_mgr) {
      user_response_mgr.push(user_response(2));
    })]);
  }).then(function () {
    thedh.botConfig.config.permissions = {
      'zack@fb.com': true
    };
    return thedh.botConfig.save();
  }).then(function () {
    return (0, _server.start)(port);
  }).then(function (listener) {
    express_server = listener;
    // try get without access_token
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/download_leads',
      resolveWithFullResponse: true
    });
  }).catch(function (resp) {
    // should be denied
    expect(resp.statusCode).toBe(401);
    // now let us try getting access_token
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/auth/fbuser',
      qs: {
        userid: SAMPLE_USERID,
        accesstoken: SAMPLE_USER_ACCESSTOKEN
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    theat = JSON.parse(resp.body).access_token;
    // but let us try to fool the system
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/download_leads',
      qs: {
        access_token: theat + 'hello'
      },
      resolveWithFullResponse: true
    });
  }).catch(function (resp) {
    // must be denied
    expect(resp.statusCode).toBe(401);
    // now with access_token try again
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/download_leads',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    // should work this time
    expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(resp.body).toBe(sample_csv);
    // and now let us wait for half of TTL time
    jest.advanceTimersByTime(_constant2.default.ACCESS_TOKEN_TTL * 1000 / 2);
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/download_leads',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    // we should still be good
    expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(resp.body).toBe(sample_csv);
    // and now let us wait for access_token expired
    jest.advanceTimersByTime(_constant2.default.ACCESS_TOKEN_TTL * 1000 + 10);
    // and with expired access_token try again
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/download_leads',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).catch(function (resp) {
    // must be denied again
    expect(resp.statusCode).toBe(401);
  });
});

afterAll(function (done) {
  express_server.close(function () {
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
    done();
  });
});
//# sourceMappingURL=secureServer.js.map
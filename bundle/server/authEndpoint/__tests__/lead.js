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
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_lead'
  };
});

jest.useFakeTimers();

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
        } else {
          console.error('get', params);
          reject('err');
        }
      });
    })
  };
});

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

function user_response(qid) {
  return {
    qid: qid,
    timeOfMessage: 19700101,
    payload: 'hello'
  };
}

var port = Math.floor(Math.random() * 10000 + 1024);
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
    thedh.botConfig.config.permissions = {
      'zack@fb.com': true
    };
    return Promise.all([thedh.botConfig.save(), thedh.getUserResponse(4).then(function (user_response_mgr) {
      user_response_mgr.push(user_response(1));
    }), thedh.getUserResponse(5).then(function (user_response_mgr) {
      user_response_mgr.push(user_response(2));
    })]);
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
      uri: 'http://localhost:' + port + '/download_leads',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(resp.body).toBe(['\"uid\",\"q1\",\"payload1\",\"timeofmessage1\",\"q2\",\"payload2\",\"timeofmessage2\"', '\"4\",\"1\",\"hello\",\"19700101\",,,', '\"5\",,,,\"2\",\"hello\",\"19700101\"', ''].join('\r\n'));

    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/user_response_4.json');
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/user_response_5.json');
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/download_leads',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    // after delete all user responses, the csv file should be empty
    expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(resp.body).toBe(['\"uid\",\"q1\",\"payload1\",\"timeofmessage1\",\"q2\",\"payload2\",\"timeofmessage2\"', ''].join('\r\n'));
  });
});

afterAll(function (done) {
  express_server.close(function () {
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
    done();
  });
});
//# sourceMappingURL=lead.js.map
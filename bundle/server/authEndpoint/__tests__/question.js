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
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_question'
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

var port = Math.floor(Math.random() * 10000 + 1024);

var sample_questions = _fsExtra2.default.readJsonSync('./sample/data/question_flow_default.json');
var sample_questions_modified = [].concat(sample_questions, [{
  'type': 'greeting',
  'text': 'jedi'
}]);

var express_server = null;

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
  _fsExtra2.default.writeJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/question_flow_default.json', sample_questions);
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
      uri: 'http://localhost:' + port + '/questions',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    expect(JSON.parse(resp.body)).toEqual(sample_questions);
    return _requestPromise2.default.post({
      uri: 'http://localhost:' + port + '/questions',
      qs: {
        access_token: theat
      },
      json: sample_questions_modified,
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    return _requestPromise2.default.get({
      uri: 'http://localhost:' + port + '/questions',
      qs: {
        access_token: theat
      },
      resolveWithFullResponse: true
    });
  }).then(function (resp) {
    expect(resp.statusCode).toBe(200);
    expect(JSON.parse(resp.body)).toEqual(sample_questions_modified);
  });
});

afterAll(function (done) {
  express_server.close(function () {
    _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
    done();
  });
});
//# sourceMappingURL=question.js.map
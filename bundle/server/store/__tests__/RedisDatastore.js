'use strict';

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function user_response(qid) {
  return {
    qid: qid,
    timeOfMessage: 19700101,
    payload: 'hello'
  };
}

jest.mock('redis', function () {
  var redis = require('redis-js');
  return redis;
});

beforeAll(function () {
  _constant2.default.REDISCLOUD_URL = 'http://localhost:12345';
});

test('all', function () {
  var thedh = null;
  return _DataHandler2.default.get().then(function (dh) {
    thedh = dh;
    return Promise.all([dh.getUserResponse(4).then(function (user_response_mgr) {
      return user_response_mgr.push(user_response(1));
    }), dh.getUserResponse(5).then(function (user_response_mgr) {
      return user_response_mgr.push(user_response(1));
    })]);
  }).then(function () {
    return thedh.datastore._scan(thedh.datastore.paths.user_response);
  }).then(function (keys) {
    expect(keys).toMatchObject(['4', '5']);
    return thedh.getUserResponse(5);
  }).then(function (user_response_mgr) {
    expect(user_response_mgr.userResponses).toHaveLength(1);
    expect(user_response_mgr.userResponses[0]).toEqual({
      qid: 1,
      timeOfMessage: 19700101,
      payload: 'hello'
    });
  });
});
//# sourceMappingURL=RedisDatastore.js.map
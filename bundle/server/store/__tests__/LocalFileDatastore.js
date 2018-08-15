'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('common/constant', function () {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_localfiledatastore'
  };
});

function user_response(qid) {
  return {
    qid: qid,
    timeOfMessage: 19700101,
    payload: 'hello'
  };
}

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
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
    return thedh.getUserResponse(4);
  }).then(function (user_resp_mgr) {
    return user_resp_mgr.del();
  }).then(function () {
    expect(_fsExtra2.default.pathExistsSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/user_response_4.json')).toBe(false);
  });
});

afterAll(function () {
  _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});
//# sourceMappingURL=LocalFileDatastore.js.map
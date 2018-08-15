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
    LOCAL_FILE_STORE_PATH: './var/data_test_user_progress'
  };
});

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});

test('all', function () {
  var thedh = null;
  return _DataHandler2.default.get().then(function (dh) {
    thedh = dh;
    return thedh.getUserProgress(4);
  }).then(function (user_progress_mgr) {
    return user_progress_mgr.update({
      expectRespType: 'quick_reply',
      nextQid: 2,
      stopAtQid: 1
    });
  }).then(function () {
    expect(_fsExtra2.default.readJsonSync(thedh.datastore.paths.user_progress + '_4.json')).toMatchObject({
      expectRespType: 'quick_reply',
      nextQid: 2,
      stopAtQid: 1
    });
    return thedh.getUserProgress(4);
  }).then(function (user_progress_mgr) {
    expect(user_progress_mgr.userProgress).toMatchObject({
      expectRespType: 'quick_reply',
      nextQid: 2,
      stopAtQid: 1
    });
  });
});

afterAll(function () {
  _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});
//# sourceMappingURL=userProgress.js.map
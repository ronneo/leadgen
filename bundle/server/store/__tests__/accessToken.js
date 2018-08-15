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
    LOCAL_FILE_STORE_PATH: './var/data_test_accesstoken'
  };
});

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});

test('all', function () {
  var thedh = null;
  var theatmgr = null;
  return _DataHandler2.default.get().then(function (datahandler) {
    thedh = datahandler;
    return thedh.getAccessToken();
  }).then(function (at_mgr) {
    theatmgr = at_mgr;
    expect(theatmgr.get('hello')).toBe(null);
    return theatmgr.update({ page_access_token: '12345' });
  }).then(function () {
    var data = _fsExtra2.default.readJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/access_token_default.json');
    expect(data).toEqual({ page_access_token: '12345' });
    return theatmgr.load();
  }).then(function () {
    expect(theatmgr.get('page_access_token')).toEqual('12345');
  });
});

afterAll(function () {
  _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});
//# sourceMappingURL=accessToken.js.map
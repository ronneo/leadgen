'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.mock('common/constant', function () {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_botconfig',
    ACCESS_TOKEN_REAP_INTERVAL: 1 * 1000,
    ACCESS_TOKEN_TTL: 2
  };
});

jest.useFakeTimers();

var SAMPLE_EMAIL = 'liyu@fb.com';

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});

test('save_load', function () {
  var thedh = null;
  return _DataHandler2.default.get().then(function (datahandler) {
    thedh = datahandler;
    expect(thedh.botConfig.config).toEqual({});
    thedh.botConfig.config.hello = 'world';
    return thedh.botConfig.save();
  }).then(function () {
    var data = _fsExtra2.default.readJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/bot_config_default.json');
    expect(data).toEqual({ hello: 'world' });
    return thedh.botConfig.load();
  }).then(function () {
    expect(thedh.botConfig.config).toEqual({ hello: 'world' });
  });
});

test('access_token_reap', function () {
  var thedh = null;
  return _DataHandler2.default.get().then(function (datahandler) {
    thedh = datahandler;
    expect(thedh.botConfig.checkEmailForAuthorized(SAMPLE_EMAIL)).toBeNull();
    thedh.botConfig.config.permissions = _defineProperty({}, SAMPLE_EMAIL, true);
    return thedh.botConfig.save();
  }).then(function () {
    expect(thedh.botConfig.config.permissions.hasOwnProperty(SAMPLE_EMAIL)).toBeTruthy();
    expect(thedh.botConfig.checkEmailForAuthorized(SAMPLE_EMAIL)).not.toBeNull();
    // advance half of TTL
    jest.advanceTimersByTime(_constant2.default.ACCESS_TOKEN_TTL * 1000 / 2);
    // the access_token should still there
    expect(thedh.botConfig.inMemConfig.hasOwnProperty('accessTokens')).toBeTruthy();
    expect(thedh.botConfig.inMemConfig.accessTokens[SAMPLE_EMAIL].hasOwnProperty('hash')).toBeTruthy();
    // now use the access_token again, it should be reseted for TTL
    expect(thedh.botConfig.checkEmailForAuthorized(SAMPLE_EMAIL)).not.toBeNull();
    expect(thedh.botConfig.inMemConfig.accessTokens[SAMPLE_EMAIL].hasOwnProperty('ttl')).toBeTruthy();
    expect(thedh.botConfig.inMemConfig.accessTokens[SAMPLE_EMAIL].ttl).toBe(_constant2.default.ACCESS_TOKEN_TTL);
    // finally advance the time to make our access_token expire
    jest.advanceTimersByTime(_constant2.default.ACCESS_TOKEN_TTL * 1000 + 10);
    expect(thedh.botConfig.initInMemConfig).not.toContain('accessTokens');
  });
});

afterAll(function () {
  _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});
//# sourceMappingURL=botConfig.js.map
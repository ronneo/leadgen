'use strict';

var _fbrequest = require('common/fbrequest');

var _fbrequest2 = _interopRequireDefault(_fbrequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fb_graph_api = 'https://graph.facebook.com/v2.12/me';
var sample_resp = {
  'id': '10207432638402470',
  'name': 'YU LI'
};

jest.mock('request-promise', function () {
  var sample_resp = {
    'id': '10207432638402470',
    'name': 'YU LI'
  };
  var sample_error_resp = {
    error: 'oops'
  };
  var first_resp = function first_resp(_params) {
    return Promise.resolve(JSON.stringify(sample_resp));
  };
  var second_resp = function second_resp(_params) {
    return Promise.resolve(JSON.stringify(sample_error_resp));
  };
  var third_resp = function third_resp(_params) {
    return Promise.reject('what?');
  };

  return jest.fn().mockImplementationOnce(first_resp).mockImplementationOnce(second_resp).mockImplementationOnce(third_resp).mockImplementationOnce(first_resp).mockImplementationOnce(second_resp).mockImplementationOnce(third_resp).mockImplementationOnce(function (_params) {
    return Promise.resolve(['this will not pass JSON.parse']);
  }).mockImplementation(function (params) {
    return new Promise(function (resolve, reject) {
      console.error(params);
      reject('err');
    });
  });
});

test('get', function () {
  var params = {
    uri: fb_graph_api,
    qs: {
      fields: 'id,name'
    }
  };
  return _fbrequest2.default.get(params).then(function (bodyobj) {
    expect(bodyobj).toEqual(sample_resp);
    return _fbrequest2.default.get(params);
  }).catch(function (err) {
    expect(err).toEqual('oops');
    return _fbrequest2.default.get(params);
  }).catch(function (err) {
    expect(err).toEqual('what?');
  });
});

test('post', function () {
  var params = {
    uri: fb_graph_api,
    qs: {
      fields: 'id,name'
    }
  };
  return _fbrequest2.default.post(params).then(function (bodyobj) {
    expect(bodyobj).toEqual(sample_resp);
    return _fbrequest2.default.post(params);
  }).catch(function (err) {
    expect(err).toEqual('oops');
    return _fbrequest2.default.post(params);
  }).catch(function (err) {
    expect(err).toEqual('what?');
    return _fbrequest2.default.post(params);
  }).catch(function (err) {
    expect(err).toBeInstanceOf(SyntaxError);
  });
});
//# sourceMappingURL=fbrequest.js.map
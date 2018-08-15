'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* liyuhk: for any request to Facebook Graph API endpoint, failures can be complex
   case 1: can be normal HTTP err, like no connection, or can not resolve domain
   case 2: can be error of incomplete HTTP body
   case 3: can be error of Facebook platform, usually in HTTP we will get 200 OK, but the data is 
           like `{ error: {} }`
   The wrapper in this file helps us to address these with 2 functions: get and post, they are 
   with the same useage of request-promise.
*/

function isObject(obj) {
  // borrow from https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
  return obj === Object(obj);
}

function fbrequest(resolve, reject) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  _requestPromise2.default.apply(undefined, args).then(function (body) {
    var bodyobj = null;
    if (isObject(body)) {
      bodyobj = body;
    } else {
      bodyobj = JSON.parse(body);
    }
    if (bodyobj.error) {
      reject(bodyobj.error);
    } else {
      resolve(bodyobj);
    }
  }).catch(function (err) {
    reject(err);
  });
}

exports.default = {
  get: function get(options) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return new Promise(function (resolve, reject) {
      fbrequest.apply(undefined, [resolve, reject, _extends({ method: 'GET' }, options)].concat(args));
    });
  },
  post: function post(options) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    return new Promise(function (resolve, reject) {
      fbrequest.apply(undefined, [resolve, reject, _extends({ method: 'POST' }, options)].concat(args));
    });
  }
};
//# sourceMappingURL=fbrequest.js.map
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (expressapp, cwd, logger) {
  var dirname = cwd;

  function get_caller_info() {
    return new Error().stack.split('at ')[3].trim();
  }

  expressapp.secureCheckMiddlewareForFollowingRoutes = null;

  expressapp.enableSecureCheckForFollowingRoutes = function (middleware) {
    expressapp.secureCheckMiddlewareForFollowingRoutes = middleware;
  };

  expressapp.disableSecureCheckForFollowingRoutes = function () {
    expressapp.secureCheckMiddlewareForFollowingRoutes = null;
  };

  [['get', expressapp.get], ['post', expressapp.post], ['put', expressapp.put], ['delete', expressapp.delete]].map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        verb = _ref2[0],
        expressFunc = _ref2[1];

    expressapp[verb] = function (path) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var caller_info = get_caller_info().replace(dirname, '').replace('file://', '');
      if (expressapp.secureCheckMiddlewareForFollowingRoutes) {
        if (!caller_info.includes('node_modules')) {
          logger.info('endpoint {' + verb.toUpperCase() + ', ' + path + '} is defined by ' + caller_info + ' with secure check.');
        }
        expressFunc.apply(expressapp, [path, expressapp.secureCheckMiddlewareForFollowingRoutes].concat(args));
      } else {
        if (!caller_info.includes('node_modules')) {
          logger.info('endpoint {' + verb.toUpperCase() + ', ' + path + '} is defined by ' + caller_info);
        }
        expressFunc.apply(expressapp, [path].concat(args));
      }
    };
  });

  return expressapp;
};
//# sourceMappingURL=ExpressHelper.js.map
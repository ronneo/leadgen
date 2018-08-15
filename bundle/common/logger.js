'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _winston2.default.createLogger({
  level: 'info',
  format: _winston2.default.format.json()
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'production') {
  logger.add(new _winston2.default.transports.Console({
    format: _winston2.default.format.simple()
  }));
} else if (process.env.NODE_ENV == 'test') {
  logger.add(new _winston2.default.transports.File({
    filename: process.cwd() + '/var/log/all.log'
  }));
}

exports.default = logger;
//# sourceMappingURL=logger.js.map
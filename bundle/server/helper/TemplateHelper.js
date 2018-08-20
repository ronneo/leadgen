'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (template, user) {
  var obj = {
    recipient: user.userProfile
  };

  return _mustache2.default.render(template, obj);
};

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=TemplateHelper.js.map
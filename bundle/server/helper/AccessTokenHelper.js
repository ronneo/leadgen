'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (datahandler) {
  return function (req, res, next) {
    var at = req.query.access_token || req.body.access_token || req.params.access_token;
    if (at && datahandler.botConfig.checkAccessToken(at)) {
      next();
    } else {
      res.status(401).send('Permission denied.');
    }
  };
};
//# sourceMappingURL=AccessTokenHelper.js.map
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _fbrequest = require('common/fbrequest');

var _fbrequest2 = _interopRequireDefault(_fbrequest);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _fbtr = require('common/fbtr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function tryFirstUserIsAdminPolicy(botConfig, email) {
  return new Promise(function (resolve, reject) {
    if (!botConfig.config.permissions || botConfig.config.permissions && Object.keys(botConfig.config.permissions).length == 0) {
      botConfig.config.permissions = _defineProperty({}, email, true);
      botConfig.save().then(function () {
        var token = botConfig.checkEmailForAuthorized(email);
        if (token) {
          resolve(token);
        } else {
          reject('token is invalid');
        }
      }).catch(function (err) {
        reject(err);
      });
    } else {
      reject('Not the first user');
    }
  });
}

function init(app, dh) {
  app.get('/auth/fbuser', function (req, res) {
    var _ref = req.query || {},
        userid = _ref.userid,
        accesstoken = _ref.accesstoken;

    if (userid && accesstoken) {
      _fbrequest2.default.get({
        uri: _constant2.default.GRAPH_BASE_URL + '/' + userid,
        qs: {
          'fields': 'id,name,email',
          'access_token': accesstoken
        }
      }).then(function (dataobj) {
        var email = dataobj.email;

        var token = dh.botConfig.checkEmailForAuthorized(email);
        if (token) {
          res.status(200).send(JSON.stringify({
            access_token: token
          }));
          (0, _fbtr.fbtr)(_fbtr.fbtrEvents.LEADGENBOT_USER_LOGIN, userid);
        } else {
          tryFirstUserIsAdminPolicy(dh.botConfig, email).then(function (token2) {
            res.status(200).send(JSON.stringify({
              access_token: token2
            }));
          }).catch(function () {
            res.status(401).send('Auth failed with user ' + userid + ' and email ' + email + '.');
          });
        }
      });
    } else {
      res.status(401).send('Auth failed with incomplete params.');
    }
  });
}
//# sourceMappingURL=fbuserAuth.js.map
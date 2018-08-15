'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.init = init;
function init(app, dh) {
  app.get('/dev/lead_scan_keys', function (req, res) {
    dh.scanUserResponses().then(function (keys) {
      res.status(200).send(keys);
    });
  });

  app.get('/dev/lead_with_key', function (req, res) {
    Promise.all([dh.getUserResponse(req.query.key), dh.getUserProgress(req.query.key)]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          user_resp_mgr = _ref2[0],
          user_prog_mgr = _ref2[1];

      res.status(200).send({
        progress: user_prog_mgr.userProgress,
        response: user_resp_mgr.userResponses
      });
    });
  });

  app.post('/dev/lead_with_key', function (req, res) {
    var _req$body = req.body,
        progress = _req$body.progress,
        response = _req$body.response;

    dh.getUserResponse(req.query.key).then(function (user_resp_mgr) {
      user_resp_mgr.userResponses = response;
      return user_resp_mgr.save();
    }).then(function () {
      return dh.getUserProgress(req.query.key);
    }).then(function (user_progress_mgr) {
      user_progress_mgr.userProgress = progress;
      return user_progress_mgr.save();
    }).then(function () {
      res.sendStatus(200);
    });
  });

  app.delete('/dev/lead_with_key', function (req, res) {
    dh.getUserResponse(req.query.key).then(function (user_resp_mgr) {
      return user_resp_mgr.del();
    }).then(function () {
      return dh.getUserProgress(req.query.key);
    }).then(function (user_progress_mgr) {
      return user_progress_mgr.del();
    }).then(function () {
      res.sendStatus(200);
    });
  });
}
//# sourceMappingURL=lead.js.map
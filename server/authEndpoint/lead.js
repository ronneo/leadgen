import logger from 'common/logger';

import { questionHandlerMap } from 'server/handler/questionHandlers';
import { fbtrEvents, fbtr } from 'common/fbtr';

function genCSVBuilder(dh, flatattr) {
  return dh.getQuestionFlow()
    .then((question_flow) => {
      let header = ['uid'];
      question_flow.questions.forEach((question, index) => {
        let needNoAnswer = questionHandlerMap[question.type](0, question, {})[1];
        if (!needNoAnswer) {
          header.push(`q${index}`);
          header.push(`payload${index}`);
          header.push(`timeofmessage${index}`);
        }
      });
      flatattr.push(header);
      return header;
    })
    .then((header) => {
      return (key, user_resps) => {
        let row = (new Array(header.length)).map(() => { return ''; });
        row[0] = key;
        user_resps.forEach((resp) => {
          let index = header.indexOf(`q${resp.qid}`);
          row[index] = resp.qid;
          row[index+1] = resp.payload;
          row[index+2] = resp.timeOfMessage;
        });
        flatattr.push(row);
      };
    });
}

function loadOneUserResponse(dh, key, csv_builder) {
  return dh.getUserResponse(key)
    .then((user_resp_mgr) => {
      csv_builder(key, user_resp_mgr.userResponses);
      return key;
    });
}

function loadAllResponsesForExport(dh, csv_builder) {
  return dh.scanUserResponses()
    .then((keys) => {
      return new Promise((resolve, _reject) => {
        function _load(keys, callback) {
          if (keys.length <= 0) {
            callback();
          } else {
            let key = keys[0];
            let rest_keys = keys.splice(1);
            loadOneUserResponse(dh, key, csv_builder)
              .then(() => {
                _load(rest_keys, callback);
              });
          }
        }
        _load(keys, resolve);
      });
    });
}

export function init(app, dh) {
  app.get('/download_leads', (req, res) => {
    let flatattr = [];
    genCSVBuilder(dh, flatattr)
      .then((csv_builder) => {
        return loadAllResponsesForExport(dh, csv_builder);
      })
      .then(() => {
        res.csv(flatattr);
      })
      .catch((err) => {
        logger.error(`error while generating flat responses for export: ${JSON.stringify(err)}`);
        res.sendStatus(500);
      });
    fbtr(fbtrEvents.LEADGENBOT_EXPORT_LEAD);
  });

  app.get('/lead_scan_keys', (req, res) => {
    dh.scanUserResponses()
      .then((keys) => {
        res.status(200).send(keys);
      });
  });

  app.get('/lead_with_key', (req, res) => {
    Promise.all([
      dh.getUserResponse(req.query.key),
      dh.getUserProgress(req.query.key),
    ])
    .then(([user_resp_mgr, user_prog_mgr]) => {
      res.status(200).send({
        progress: user_prog_mgr.userProgress,
        response: user_resp_mgr.userResponses
      });
    });
  });

  app.delete('/lead_with_key', (req, res) => {
    dh.getUserResponse(req.query.key)
      .then((user_resp_mgr) => {
        return user_resp_mgr.del();
      })
      .then(() => {
        return dh.getUserProgress(req.query.key);
      })
      .then((user_progress_mgr) => {
        return user_progress_mgr.del();
      })
      .then(() => {
        res.sendStatus(200);
      });
  });
}

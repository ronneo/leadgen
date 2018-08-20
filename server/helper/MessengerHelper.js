import { setTimeout } from 'timers';
import request from 'request';

import constant from 'common/constant';
import logger from 'common/logger';
import { questionHandlerMap, questionExpectMap } from 'server/handler/questionHandlers';
import DataHandler from 'server/store/DataHandler';
import { fbtrEvents, fbtr } from 'common/fbtr';

/*  liyuhk: messageQueue and reaper
    To ensure the message is sent as user designed, we need a messageQueue and a reaper.
    For example, consider following example, user want to send msg in following order
      1. greeting msg 1
      2. greeting msg 2
      3. question msg
    if we simplely use javascript code to do it, like below
      request(endpoint, {greeting_msg_1});
      request(endpoint, {greeting_msg_2});
      request(endpoint, {question_msg});
    it may not send in the order we programmed (the reason is request is async). What's correct
    to do is
      request(endpoint, {greeting_msg_1}, () => {
        request(endpoint, {greeting_msg_2}, () => {
          request(endpoint, {question_msg}, ()=> {
            ...next msg
          });
        });
      });
    but that is a callback hell, so we design a queue for storing all msgs we want to send, and reaper 
    is an infinite recursive function help us to avoid callback hell.
*/
class Reaper {
  constructor(datahandler) {
    this.messageQueue = [];
    this.status = 'idle';
    this.stopFlag = false;
    this.datahandler = datahandler;
  }

  sendMessage(psid, messageObj) {
    this.messageQueue.push([psid, messageObj]);
  }

  fbSendMessageObj(psid, messageObj) {
    return new Promise((resolve, reject) => {
      this.datahandler.getAccessToken()
        .then((access_token_mgr) => {
          let page_access_token = access_token_mgr.get(constant.PAGE_ACCESS_TOKEN_KEY);
          logger.info(`will send message ${JSON.stringify(messageObj)}.`);
          request({
            method: 'POST',
            uri: `${constant.GRAPH_BASE_URL}/me/messages`,
            qs: { access_token: page_access_token },
            json: messageObj,
          },
          (err, _res, body) => {
            if (err) {
              logger.info(`Message sending failed with body ${JSON.stringify(body)}}`);
              reject(err);
            } else {
              logger.info(`Message sent with body ${JSON.stringify(body)}`);
              resolve(messageObj);
            }
          });
          fbtr(fbtrEvents.LEADGENBOT_MSG_SENT, psid);
        });
    });
  }

  reap(timeout) {
    let _timeout = timeout || 500;
    let reaper = this;
    let fbSendMessageObj = this.fbSendMessageObj.bind(this);
    function _reap() {
      if (reaper.stopFlag) {
        reaper.status = 'idle';
        reaper.stopFlag = false;
        return;
      }
      if (reaper.messageQueue && reaper.messageQueue.length > 0) {
        let [psid, messageObj] = reaper.messageQueue.shift();
        fbSendMessageObj(psid, messageObj)
          .then((_lastMessageObj) => {
            _reap();
          });
      } else {
        setTimeout(_reap, _timeout);
      }
    }
    this.status = 'reaping';
    _reap();
  }

  stop() {
    this.stopFlag = true;
    return new Promise((resolve, _reject) => {
      let timeout = 100;
      function _check(callback) {
        if (this.status !== 'idle') {
          setTimeout(() => { _check(callback); }, timeout);
        } else {
          callback();
        }
      }
      _check(() => { resolve(); });
    });
  }
}

let _reaper = new Reaper();
DataHandler.get()
  .then((dh) => {
    _reaper.datahandler = dh;
    _reaper.reap();
  });

export function sendQuestion(userProfile, nextQid, questionFlow) {
  var recipientID = userProfile.userID;
  function _sendQuestion(q) {
    let question = questionFlow.findQuestionWithQid(q);
    if (question) {
      let [messageObj, needNoAnwser] = questionHandlerMap[question.type](recipientID, question, userProfile);
      _reaper.sendMessage(recipientID, messageObj);
      if (needNoAnwser) {
        let nq = questionFlow.findNextQidOfQuestion(question, q);
        return _sendQuestion(nq);
      } else {
        return q;
      }
    } else {
      _reaper.sendMessage(recipientID, {
        recipient: {id: recipientID},
        message: { text: 'That is it! Thanks for your time!' },
      });
      return q;
    }
  }

  return new Promise((resolve, _reject) => {
    let stopAtQid = _sendQuestion(nextQid);
    let question = questionFlow.findQuestionWithQid(stopAtQid);
    let nextExpectRespType = (question && question.type) ? questionExpectMap[question.type] : 'finished';
    resolve([stopAtQid, nextExpectRespType]);
  });
}

import logger from 'common/logger';
import {sendQuestion} from 'server/helper/MessengerHelper';
import {responseHandlerMap} from 'server/handler/responseHandlers';
import {fbtrEvents, fbtr} from 'common/fbtr';

function receivedMessage(event, dh) {
  let senderID = event.sender.id;
  let recipientID = event.recipient.id;
  let timeOfMessage = event.timestamp;
  let message = event.message;

  logger.info(
    `Received message for user ${senderID} and page ${recipientID} at ${timeOfMessage} ` +
    `with message: ${JSON.stringify(message)}`
  );

  Promise.all([
    dh.getQuestionFlow(),
    dh.getUserProgress(senderID),
    dh.getUserResponse(senderID),
  ])
  .then(([questionFlow, userProgress, userResponse]) => {
    logger.info(`user ${userProgress.userID} at progress ${JSON.stringify(userProgress.userProgress)}`);
    if (event.postback && event.postback.referral) {
      // TODO: handle user info and referral info here
    }
    let {expectRespType, nextQid} = userProgress.userProgress;
    expectRespType = expectRespType || 'genesis';
    nextQid = nextQid || 0;
    responseHandlerMap[expectRespType](message, event, questionFlow, userProgress, userResponse)
      .then((nextQid) => {
        // we can hanlde this response, go to next question
        return sendQuestion(senderID, nextQid, questionFlow)
          .then(([stopAtQid, nextExpectRespType]) => {
            userProgress.update({
              expectRespType: nextExpectRespType,
              nextQid: nextQid,
              stopAtQid: stopAtQid,
            });
          });
      })
      .catch((err) => {
        logger.error(`Oops, can not handle user response because ${JSON.stringify(err)}`);
        logger.info('fall back to re-send last question.');
        // can not handle this response, repeat last question
        sendQuestion(senderID, nextQid, questionFlow)
          .then(([stopAtQid, nextExpectRespType]) => {
            userProgress.update({
              expectRespType: nextExpectRespType,
              nextQid: nextQid,
              stopAtQid: stopAtQid,
            });
          });
      });
  });
}

export function init(app, dh) {
  app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'TEMPLATE_BOT') {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
  });
  
  app.post('/webhook', (req, res) => {
    let data = req.body;  
    if (data.object == 'page') {
      data.entry.forEach((pageEntry) => {
        pageEntry.messaging.forEach((messagingEvent) => {
          if (messagingEvent.message) {
            receivedMessage(messagingEvent, dh);
          } else if (messagingEvent.postback) {
            receivedMessage(Object.assign(messagingEvent, {
              message: messagingEvent.postback.payload,
            }), dh);
          } else {
            logger.info(`Webhook received unsupported messageEvent: ${JSON.stringify(messagingEvent)}`);
          }
          fbtr(fbtrEvents.LEADGENBOT_MSG_RECEIVED, messagingEvent.sender.id);
        });
      });
      res.sendStatus(200);
    }
  });
}

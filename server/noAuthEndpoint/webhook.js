import logger from 'common/logger';
import constant from 'common/constant';
import fbrequest from 'common/fbrequest';
import {sendQuestion} from 'server/helper/MessengerHelper';
import {responseHandlerMap} from 'server/handler/responseHandlers';
import {fbtrEvents, fbtr} from 'common/fbtr';
import { cfbtr } from 'common/cfbtr';

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
    dh.getUserProfile(senderID),
    dh.getAccessToken(),
  ])
  .then(([questionFlow, userProgress, userResponse, userProfile, accessToken]) => {
    logger.info(`user ${userProgress.userID} at progress ${JSON.stringify(userProgress.userProgress)}`);
    if (event.postback && event.postback.referral) {
      // TODO: handle user info and referral info here
    }

    if (!userProfile.isProfileFetched()) {
      // user profile not found in data store, fetching from graph api
      var page_access_token = accessToken.get(constant.PAGE_ACCESS_TOKEN_KEY);
      logger.info(`Fetching user profile for ${userProfile.userID}`);
      fbrequest.get({
        uri: `${constant.GRAPH_BASE_URL}/${userProfile.userID}`,
        qs: {
          'access_token': page_access_token,
        },
      })
      .then((profile) => {
        logger.info(`user profile fetched ${JSON.stringify(profile)}`);
        userProfile.update(profile);
      })
      .catch((err) => {
        logger.error(`Profile fetch failed with ${err}`);
      });
    }

    let {expectRespType, stopAtQid, nextQid} = userProgress.userProgress;
    expectRespType = expectRespType || 'genesis';
    nextQid = nextQid || 0;
    responseHandlerMap[expectRespType](message, event, questionFlow, userProgress, userResponse)
      .then((nextQid) => {
        //before going to next question, check if this question requires event to be fired
        let currentQuestion = questionFlow.findQuestionWithQid(stopAtQid);

        if (currentQuestion.event?currentQuestion.event.endFire:false) {
          logger.info(`Trigger reply custom event: ${currentQuestion.event.name}.`);
          cfbtr(currentQuestion.event.name, currentQuestion, senderID, {
            trigger:'END',
            payload:JSON.stringify(message)
          });
        }

        // we can hanlde this response, go to next question
        return sendQuestion(userProfile, nextQid, questionFlow)
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
        sendQuestion(userProfile, nextQid, questionFlow)
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
  app.get(constant.WEBHOOK_PATH, (req, res) => {
    if (req.query['hub.verify_token'] === 'TEMPLATE_BOT') {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
  });

  app.post(constant.WEBHOOK_PATH, (req, res) => {
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

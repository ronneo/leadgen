export let responseHandlerMap = {
  'genesis': (_message, _event, _questionFlow, _userProgress, _userResponse) => {
    return new Promise((_resolve, reject) => {
      reject();
    });
  },

  'quick_reply': (message, event, questionFlow, userProgress, userResponse) => {
    return new Promise((resolve, reject) => {
      let quick_reply = message.quick_reply;
      let timeOfMessage = event.timestamp;
      if (quick_reply) {
        let payload = quick_reply.payload;
        let {stopAtQid} = userProgress.userProgress;
        let nextQid = userProgress.findNextQid(questionFlow, payload);
        userResponse.push({ qid: stopAtQid, timeOfMessage, payload })
          .then(() => {
            resolve(nextQid);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(new Error('reply is not quick_reply.'));
      }
    });
  },

  'text_input': (message, event, questionFlow, userProgress, userResponse) => {
    return new Promise((resolve, reject) => {
      let messageText = message.text;
      let timeOfMessage = event.timestamp;
      if (messageText) {
        let payload = messageText;
        let {stopAtQid} = userProgress.userProgress;
        let nextQid = userProgress.findNextQid(questionFlow, payload);
        userResponse.push({ qid: stopAtQid, timeOfMessage, payload })
          .then(() => {
            resolve(nextQid);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(new Error('reply is not text_input.'));
      }
    });
  },

  'finished': (_message, _event, _questionFlow, _userProgress, _userResponse) => {
    return new Promise((_resolve, reject) => {
      reject();
    });
  },
};

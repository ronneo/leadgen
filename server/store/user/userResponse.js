import logger from 'common/logger';

export default class UserResponse {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.userID = null;
    this.userResponses = null;
  }

  load(userID) {
    this.userID = userID;
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.user_response, this.userID)
        .then((data) => {
          this.userResponses = JSON.parse(data);
          resolve(this);
        })
        .catch((err) => {
          logger.error(`load user ${this.userID} response failed with ${JSON.stringify(err)}`);
          logger.info(`create new response for user ${this.userID}`);
          this.userResponses = [];
          resolve(this);
        });
    });
  }

  save() {
    return this.datastore._write(
      this.datastore.paths.user_response,
      this.userID,
      JSON.stringify(this.userResponses),
    )
    .then(() => {
      logger.info(`user ${this.userID} response saved.`);
      return this;
    })
    .catch((err) => {
      logger.error(`save user ${this.userID} response failed with ${JSON.stringify(err)}`);
      return err;
    });
  }

  push(response) {
    this.userResponses.push(response);
    return this.save();
  }

  del() {
    return this.datastore._del(this.datastore.paths.user_response, this.userID);
  }
}

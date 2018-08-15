import React from 'react';

import WelcomeScreenConfig from './welcomeScreenConfig.jsx';

export default class BotConfigurator extends React.Component {
  constructor() {
    super();
  }

  static getID() {
    return 'bot_configurator';
  }

  static getTitle() {
    return 'Bot Configurator';
  }

  render() {
    return (
      <div>
        <h4>{WelcomeScreenConfig.getTitle()}</h4>
        <WelcomeScreenConfig {...this.props} />
      </div>
    );
  }
}

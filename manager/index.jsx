import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './manager.less';

import React from 'react';
import ReactDOM from 'react-dom';

import ensureLoggedInFacebook from './fblogin.jsx';
import withBurgerMenu from './menu.jsx';

class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      page: null,
    };
  }

  notifySetupComplete(page) {
    this.setState({
      page: page,
    });
  }

  renderMainContent() {
    let WrappedContent = this.props.currentContentClass;
    return (
      <WrappedContent 
        notifySetupComplete={this.notifySetupComplete.bind(this)}
        userAccessToken={this.props.userAccessToken}
        {...this.props}
      />
    );
  }

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col col-md-10">
            {this.renderMainContent()}
          </div>
        </div>
      </div>
    );
  }
}

let App = ensureLoggedInFacebook(withBurgerMenu(Manager));
ReactDOM.render(<App />, document.querySelector('#app'));

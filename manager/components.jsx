import React from 'react';

export class Link extends React.Component {
  preventDefaultIfPossible(eventHandler) {
    return (event) => {
      if (eventHandler) {
        event.preventDefault();
        eventHandler(event);
      }
    };
  }

  render() {
    return (
      <a href="#" {...this.props} onClick={this.preventDefaultIfPossible(this.props.onClick)}>
        {this.props.children}
      </a>
    );
  }
}

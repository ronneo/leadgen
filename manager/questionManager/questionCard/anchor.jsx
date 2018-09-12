import React from 'react';
import Modal from 'react-responsive-modal';

export default class Anchor extends React.Component {
  constructor() {
    super();
    this.state = {
      showAnchorChanger: false,
    };
  }

  genElemID() {
    return `anchor-${this.props.qid}`;
  }

  showAnchorChanger() {
    this.setState({showAnchorChanger: true});
  }

  handleClose() {
    this.setState({showAnchorChanger: false});
  }

  onSaveAnchor() {
    let value = this.refs.anchorInput.value;
    let qid = this.props.qid;
    this.props.onChangeAnchor && this.props.onChangeAnchor(qid, value);
    this.handleClose();
  }

  renderChanger() {
    return (
      <Modal open={this.state.showAnchorChanger}
        onClose={this.handleClose.bind(this)}
        little={true}
        style={{zIndex: '1000'}}>
        <h4>Define Anchor</h4>
        <input className="form-control"
          value={this.props.question.anchor}
          ref="anchorInput"
          placeholder="#myanchor" />
        <br />
        <button type="button" className="btn btn-primary" onClick={this.onSaveAnchor.bind(this)}>Save</button>
      </Modal>
    );
  }

  render() {
    let question = this.props.question;
    let anchorSpan = question.anchor ?
      <span className="badge badge-info" onClick={this.showAnchorChanger.bind(this)}>{question.anchor}</span> :
      <span className="badge badge-secondary" onClick={this.showAnchorChanger.bind(this)}>+anchor</span>;
    return (
      <div id={this.genElemID()} style={{marginRight: '1em', cursor: 'pointer', display:'inline-block'}}>
        {anchorSpan}
        {this.renderChanger()}
      </div>
    );
  }
}

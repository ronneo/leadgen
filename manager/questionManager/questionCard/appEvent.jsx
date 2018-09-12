import React from 'react';
import Modal from 'react-responsive-modal';
import {questionHandlerMap} from '../../../server/handler/questionHandlers.js';

export default class AppEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      edit: false,
      name: '',
      startFire: true,
      endFire: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  showEdit() {
    this.setState({edit: true});
    this.resetValue();
  }

  handleClose() {
    this.setState({edit: false});
  }

  onUpdateEvent() {
    let nobj = { 
      name:this.state.name,
      startFire:this.state.startFire,
      endFire:this.state.endFire
    };
    let qid = this.props.qid;
    this.props.onChangeEvent && this.props.onChangeEvent(qid, nobj);
    this.handleClose();
  }

  componentDidMount() {
    this.resetValue();
  }

  resetValue() {
    let question = this.props.question;
    let eventName = '';
    let eventStartFire = true;
    let eventEndFire = false;

    if (question.event) {
      eventName = question.event.name;
      eventStartFire = question.event.startFire;
      eventEndFire = question.event.endFire;
    }
    this.setState({
      name: eventName,
      startFire: eventStartFire,
      endFire: eventEndFire
    });  
  }

  handleInputChange(event) {
    let name = event.target.name;
    let value = '';
    event.target.type == 'checkbox' ? value = event.target.checked : value = event.target.value;
    this.setState({
      [name]: value
    });
  }

  renderModal() {

    let needNoAnswer = questionHandlerMap[this.props.question.type](0, this.props.question, {})[1];
    let replyFire = '';
    let informationText = 'Additional parameters will be sent with event (e.g. question text)';

    if (!needNoAnswer) {
      replyFire = <div>
              <input type="checkbox" 
              name="endFire" 
              checked={this.state.endFire} 
              onChange={this.handleInputChange}
              style={{margin:'0.2em'}} /> Fire on reply
            </div>;
    }

    return (
      <Modal open={this.state.edit}
        onClose={this.handleClose.bind(this)}
        style={{zIndex: '1000'}}>
        <h4>Custom Event</h4>
        <div style={{marginBottom:'0.5em'}}>{informationText}</div>
        <div className="container" style={{minWidth:'500px'}}>
          <div className="row">
            <input className="form-control"
            type="text"
            name="name"
            value={this.state.name}
            onChange={this.handleInputChange}
            placeholder="Custom Event Name" />
          </div>
          <div className="row">
            <div style={{marginRight:'3em'}}>
              <input type="checkbox" 
              name="startFire" 
              checked={this.state.startFire} 
              onChange={this.handleInputChange}
              style={{margin:'0.2em'}} /> Fire on message
            </div>
            {replyFire}
          </div>
        </div>
        <br />
        <button type="button" className="btn btn-primary" onClick={this.onUpdateEvent.bind(this)}>Save</button>
      </Modal>
    );
  }

  genElemID() {
    return `event-${this.props.qid}`;
  }

  render() {
    let question = this.props.question;
    let eventSpan = question.event ?
      <span className="badge badge-info" onClick={this.showEdit.bind(this)}>{question.event.name}</span> :
      <span className="badge badge-secondary" onClick={this.showEdit.bind(this)}>+event</span>;

    return (
      <div id={this.genElemID()} style={{marginRight: '1em', cursor: 'pointer', display:'inline-block'}}>
        {eventSpan}
        {this.renderModal()}
      </div>
    );
  }
}

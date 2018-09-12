import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-responsive-modal';

import constant from 'manager/constant';
import {questionSamples} from 'common/question';
import {questionCardGeneratorMap} from './questionCard/index';
import Anchor from './questionCard/anchor.jsx';
import AppEvent from './questionCard/appEvent.jsx';
import ConditionalLogicHelper from './questionCard/ConditionalLogicHelper.jsx';
import {Link} from 'manager/components.jsx';

class QuestionFlowUtil {
  constructor(questions, questionConfig) {
    this.questions = questions;
    this.questionConfig = questionConfig;
  }

  getAllAnchors() {
    let allAnchors = this.questions.map((question, index) => {
      if (question.anchor) {
        return [question.anchor, index];
      } else {
        return undefined;
      }
    });
    allAnchors = allAnchors.filter(n => n);
    // #end is a special anchor to the end
    return allAnchors.concat([['#end', this.questions.length]]);
  }

  updateQuestion(qid, newQuestion) {
    this.questionConfig.updateQuestion(qid, newQuestion);
  }

  updateQuestionOption(qid, optionIndex, newOption) {
    let options = this.questions[qid].options;
    let new_options = [].concat(
      options.slice(0, optionIndex),
      [newOption],
      options.slice(optionIndex+1),
    );
    let new_question = Object.assign({}, this.questions[qid], {'options': new_options});
    this.updateQuestion(qid, new_question);
  }
}

export default class QuestionsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      newQuestionType: 'greeting',
      inSaving: false,
      showModalCopyQuestionJSONDialog: false,
      showModalPasteQuestionJSONDialog: false,
    };
  }

  static getID() {
    return 'question_manager';
  }

  static getTitle() {
    return 'Manage Questions';
  }

  componentDidMount() {
    let request = this.props.requestPromise;
    request.get({
      uri: `${constant.HEROKU_APP_URL}/questions`,
    })
    .then((body) => {
      toast.success('Questionaire loaded from server!');
      let question = JSON.parse(body);
      if (question.length === 0) {
        this.addNewQuestion();
      } else {
        this.setState({
          questions: question,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, can not load questions!');
    });
  }

  addNewQuestion() {
    let new_question = questionSamples[this.state.newQuestionType]();
    this.setState({
      questions: this.state.questions.concat([new_question]),
    });
  }

  updateQuestion(qid, new_question) {
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      [new_question],
      this.state.questions.slice(qid+1),
    );
    this.setState({questions: new_questions});
  }

  saveChanges() {
    let request = this.props.requestPromise;
    request.post({
      uri: `${constant.HEROKU_APP_URL}/questions`,
      json: this.state.questions,
    })
    .then((_body) => {
      toast.success('Questionaire has been saved.');
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, saving questionaire has failed.');
    });
  }

  changeNewQuestionType(event) {
    this.setState({ newQuestionType: event.target.value });
  }

  moveQuestionDown(index) {
    return () => {
      if (index + 1 >= this.state.questions.length) {
        return;
      }
      let question = this.state.questions[index];
      let next_question = this.state.questions[index + 1];
      let new_questions = [].concat(
        this.state.questions.slice(0, index),
        next_question,
        question,
        this.state.questions.slice(index + 2),
      );
      this.setState({ questions: new_questions });
    };
  }

  moveQuestionUp(index) {
    return () => {
      if (index <= 0) {
        return;
      }
      let question = this.state.questions[index];
      let pre_question = this.state.questions[index - 1];
      let new_questions = [].concat(
        this.state.questions.slice(0, index - 1),
        question,
        pre_question,
        this.state.questions.slice(index + 1),
      );
      this.setState({ questions: new_questions });
    };
  }

  removeQuestion(index) {
    return () => {
      let new_questions = Array.from(this.state.questions);
      new_questions.splice(index, 1);
      this.setState({questions: new_questions});
    };
  }

  onChangeAnchor(qid, value) {
    let question = this.state.questions[qid];
    question.anchor = value;
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      question,
      this.state.questions.slice(qid + 1),
    );
    this.setState({questions: new_questions});
  }

  onChangeEvent(qid, obj) {
    let question = this.state.questions[qid];
    question.event = obj;
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      question,
      this.state.questions.slice(qid + 1),
    );
    this.setState({questions: new_questions});
  }

  onAddNext(qid) {
    return (_event) => {
      let quesiton = this.state.questions[qid];
      let anchor = (new QuestionFlowUtil(this.state.questions, this)).getAllAnchors()[0];
      let new_question = Object.assign({}, quesiton, {'next': anchor});
      this.updateQuestion(qid, new_question);
    };
  }

  onPaste(event) {
    let clipboardData = event.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('Text');
    try {
      let pastedQuestions = JSON.parse(pastedData);
      if (Object.prototype.toString.call(pastedQuestions) != '[object Array]') {
        throw new Error('Not an array.');
      }
      this.setState({
        showModalPasteQuestionJSONDialog: true,
        pastedQuestions: pastedQuestions,
      });
      event.stopPropagation();
      event.preventDefault();
    } catch (e) {
      // ignore if pasted data isn't JSON
    }
  }

  renderCommonCardTools(index) {
    let question = this.state.questions[index];
    return (
      <div className="card-header">
        <Anchor qid={index} question={question} onChangeAnchor={this.onChangeAnchor.bind(this)} />
        <AppEvent qid={index} question={question} onChangeEvent={this.onChangeEvent.bind(this)} />
        <div />
        <b>{question.type}</b> &nbsp;&nbsp;
        #{index} &nbsp;&nbsp;
        <Link onClick={this.moveQuestionDown(index)} 
          title="Move Question Down">
          <i className="fa fa-level-down" />
        </Link>&nbsp;&nbsp;
        <Link onClick={this.moveQuestionUp(index)}
          title="Move Question Up">
          <i className="fa fa-level-up" />
        </Link>&nbsp;&nbsp;
        <Link onClick={this.removeQuestion(index)}
          title="Remove Question">
          <i className="fa fa-trash" />
        </Link>&nbsp;&nbsp;
        {ConditionalLogicHelper.renderAddNextIfPossible(question, this.onAddNext(index))}
      </div>
    );
  }

  renderQuestionsHeader() {
    return (
      <div className="alert alert-secondary">
        <div className="float-right" style={{marginTop: '6px'}}>
          <Link 
            onClick={() => {this.setState({showModalCopyQuestionJSONDialog: true});}}
            title="Export current questions as JSON">
            Export <i className="fa fa-external-link"></i>
          </Link>
        </div>
        <form className="form form-inline" style={{marginBottom: '0'}}>
          Questionaire KEY: &nbsp;&nbsp; <select className="form-control">
            <option>Default</option>
          </select>
        </form>
      </div>
    );
  }

  renderQuestionCards() {
    return this.state.questions.map((question, index) => {
      let cardjsx = questionCardGeneratorMap[question.type](
        index,
        question,
        this.renderCommonCardTools(index),
        new QuestionFlowUtil(this.state.questions, this),
      );
      return (
        <div key={index} style={{ paddingBottom: '1em' }}>
          {cardjsx}
        </div>
      );
    });
  }

  renderNewQuestionButton() {
    let options = Object.keys(questionCardGeneratorMap).map((key) => {
      return <option value={key} key={key}>{key}</option>;
    });
    return (
      <div className="input-group">
        <select className="custom-select"
          value={this.state.newQuestionType}
          onChange={this.changeNewQuestionType.bind(this)}>
          {options}
        </select>
        <div className="input-group-append">
          <Link className="btn btn-primary"
            onClick={this.addNewQuestion.bind(this)}>
            New Question
          </Link>
        </div>
      </div>
    );
  }

  renderSaveButton() {
    if (this.state.inSaving) {
      return (
        <Link className="btn btn-primary">
          <i className="fa fa-spinner fa-spin" />
        </Link>
      );
    } else {
      return (
        <Link className="btn btn-primary" onClick={this.saveChanges.bind(this)}>
          Save
        </Link>
      );
    }
  }

  renderFooterButtons() {
    return (
      // hack: set zIndex to be 1 so it on top of question cards,
      // but in below of modal dialogs
      <div className="footer fixed-bottom" style={{zIndex: '1'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col col-md-10 bg-light" style={{ paddingTop: '8px' }}>
              <form className="form-inline justify-content-center">
                <div className="form-group">
                  {this.renderNewQuestionButton()}
                  &nbsp;&nbsp;
                </div>
                <div className="form-group">
                  {this.renderSaveButton()}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderModalPasteQuestionJSONDialog() {
    let replaceQuestionsWithPastedQuestions = () => {
      this.setState({
        showModalPasteQuestionJSONDialog: false,
        questions: this.state.pastedQuestions,
        pastedQuestions: [],
      });
    };
    let closeDialog = () => {
      this.setState({showModalPasteQuestionJSONDialog: false});
    };
    return (
      <Modal open={this.state.showModalPasteQuestionJSONDialog}
        onClose={closeDialog}
        style={{zIndex: '1000'}}>
        <h4>Confirm replacing questions?</h4>
        <p>You have just pasted below questions, do you want to replace you current questions with them?</p>
        <textarea className="form-control"
          value={JSON.stringify(this.state.pastedQuestions, null, 2)}
          rows={16}
          readOnly={true} />
        <br />
        <button type="button" className="btn btn-primary" onClick={replaceQuestionsWithPastedQuestions}>Replace</button>
        &nbsp;
        <button type="button" className="btn btn-secondary" onClick={closeDialog}>Cancel</button>
      </Modal>
    );
  }

  renderModalCopyQuestionJSONDialog() {
    return (
      <Modal open={this.state.showModalCopyQuestionJSONDialog}
        onClose={() => {this.setState({showModalCopyQuestionJSONDialog: false});}}
        style={{zIndex: '1000'}}>
        <h4>Export Your Questions</h4>
        <p>They are exported below in JSON. Please click and copy them.</p>
        <textarea className="form-control"
          ref="modalCopyQuestionJSONTextarea"
          value={JSON.stringify(this.state.questions, null, 2)}
          onClick={() => {
            this.refs.modalCopyQuestionJSONTextarea.focus(); 
            this.refs.modalCopyQuestionJSONTextarea.select();
          }}
          rows={10}
          readOnly={true} />
      </Modal>
    );
  }

  render() {
    return (
      <div>
        <div id="question-cards-container" onPaste={this.onPaste.bind(this)}>
          {this.renderQuestionsHeader()}
          {this.renderQuestionCards()}
          <div id="question-cards-svgs"></div>
          {/* hack: insert below empty div with 200px height so the last 
              card will not be covered by footer buttons */}
          <div style={{ height: '200px' }}>
            <h3><span id={`anchor-${this.state.questions.length}`} className="badge badge-info">End</span></h3>
          </div>
          <ToastContainer autoClose={3000} />
        </div>
        {this.renderFooterButtons()}
        {this.renderModalPasteQuestionJSONDialog()}
        {this.renderModalCopyQuestionJSONDialog()}
      </div>
    );
  }
}

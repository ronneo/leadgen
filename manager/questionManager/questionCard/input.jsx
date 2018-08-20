import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';

export default class InputCard extends React.Component {
  constructor() {
    super();
  }

  static getType() {
    return 'input';
  }

  static canHaveNext() {
    return true;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil) => {
      return (
        <InputCard
          key={qid}
          qid={qid} 
          question={question} 
          commonToolbar={commonToolbar}
          questionFlowUtil={questionFlowUtil}
        />
      );
    };
  }

  onChangeText(event) {
    let new_question = Object.assign({}, this.props.question, {text: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);    
  }

  onChangeNext(event) {
    let new_question = Object.assign({}, this.props.question, {next: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);    
  }
  
  onRemoveNext(_event) {
    let new_question = Object.assign({}, this.props.question, {next: undefined});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  render() {
    return (
      <div className="card">
        {this.props.commonToolbar}
        <div className="card-body">
          <div className="form-group">
            <label>Text</label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={this.props.question.text}
              onChange={this.onChangeText.bind(this)}
            />
          </div>
          {ConditionalLogicHelper.renderNextInQuestionIfPossible(
            this.props.qid,
            this.props.question, 
            this.props.questionFlowUtil,
            this.onChangeNext.bind(this),
            this.onRemoveNext.bind(this),
          )}
        </div>
      </div>
    );
  }
}

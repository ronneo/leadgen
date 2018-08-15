'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _constant = require('common/constant');

var _constant2 = _interopRequireDefault(_constant);

var _DataHandler = require('server/store/DataHandler');

var _DataHandler2 = _interopRequireDefault(_DataHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('common/constant', function () {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_question_flow'
  };
});

var sample_questions = _fsExtra2.default.readJsonSync('./sample/data/question_flow_default.json');

var sample_greeting_question = {
  'type': 'greeting',
  'text': '5 4th with u!'
};

beforeAll(function () {
  _fsExtra2.default.ensureDirSync(_constant2.default.LOCAL_FILE_STORE_PATH);
  _fsExtra2.default.outputJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/question_flow_default.json', sample_questions);
});

test('all', function () {
  var thedh = null;
  var theqf = null;
  var theup = null;
  return _DataHandler2.default.get().then(function (dh) {
    thedh = dh;
    return dh.getQuestionFlow();
  }).then(function (question_flow) {
    theqf = question_flow;
    expect(theqf.findQuestionWithQid(-1)).toBe(null);
    expect(theqf.findQuestionWithQid(100000)).toBe(null);
    return thedh.getUserProgress(4);
  }).then(function (user_progress_mgr) {
    theup = user_progress_mgr;

    theup.userProgress.stopAtQid = 3;
    expect(theup.findNextQid(theqf, '1.No')).toBe(19);

    theup.userProgress.stopAtQid = 3;
    expect(theup.findNextQid(theqf, '0.Yes')).toBe(4);

    theup.userProgress.stopAtQid = 2;
    expect(theup.findNextQid(theqf, '1.No')).toBe(3);

    theup.userProgress.stopAtQid = 19;
    expect(theup.findNextQid(theqf, '1.No')).toBe(21);

    theqf.questions.push(sample_greeting_question);
    return theqf.save();
  }).then(function () {
    var data = _fsExtra2.default.readJsonSync(_constant2.default.LOCAL_FILE_STORE_PATH + '/question_flow_default.json');
    expect(data[data.length - 1]).toMatchObject(sample_greeting_question);
  });
});

afterAll(function () {
  _fsExtra2.default.removeSync(_constant2.default.LOCAL_FILE_STORE_PATH);
});
//# sourceMappingURL=questionFlow.js.map
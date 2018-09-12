'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('common/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_QUESTION_FLOW_KEY = 'default';

var QuestionFlow = function () {
  function QuestionFlow(datahandler) {
    _classCallCheck(this, QuestionFlow);

    this.datastore = datahandler.datastore;
    this.key = null;
    this.questions = [];
  }

  _createClass(QuestionFlow, [{
    key: 'load',
    value: function load() {
      var _this = this;

      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_QUESTION_FLOW_KEY;

      this.key = key;
      return new Promise(function (resolve, _reject) {
        _this.datastore._read(_this.datastore.paths.question_flow, key).then(function (data) {
          _this.questions = JSON.parse(data);
          _this.questions = [{
            "type": "greeting",
            "text": " Hi, {{recipient.first_name}}! I’m stoked you’re interested to learn about Seafront Residences in San Juan, Batangas. "
          }, {
            "type": "question",
            "text": "Where do you want to start?",
            "options": [{
              "text": "Beach homes",
              "resp_payload": "beach_home",
              "next": "#beachhomes"
            }, {
              "text": "Location map",
              "resp_payload": "location",
              "next": "#locationmap"
            }, {
              "text": "Seaside amenities",
              "resp_payload": "amenities",
              "next": "#amenities"
            }]
          }, {
            "type": "image",
            "url": "http://www.ronneo.com/store/wp-content/uploads/2018/06/beanie-768x768.jpg",
            "anchor": "#locationmap"
          }, {
            "type": "question",
            "text": "Let me show you around! What do you want to see?",
            "options": [{
              "text": "Beach homes",
              "resp_payload": "beach_home",
              "next": "#beachhomes"
            }, {
              "text": "Seaside amenities",
              "resp_payload": "amenities",
              "next": "#amenities"
            }]
          }, {
            "type": "carousel",
            "elements": [{
              "title": "4 Bedrooms",
              "subtitle": "Two-storey unit, 4 baths",
              "image_url": "http://www.ronneo.com/aboitiz/4bedroom_screen.jpg",
              "url": "",
              "buttons": [{
                "title": "View Details",
                "url": "view4bed",
                "next": "#4bedroom"
              }]
            }, {
              "title": "3 Bedrooms",
              "subtitle": "Two-storey unit, 2 baths and 1 powder room",
              "image_url": "http://www.ronneo.com/aboitiz/3bedroom_screen.jpg",
              "url": "",
              "buttons": [{
                "title": "View Details",
                "url": "view3bed",
                "next": "#3bedroom"
              }]
            }, {
              "title": "Lot",
              "subtitle": "",
              "image_url": "http://www.ronneo.com/aboitiz/lot.jpg",
              "url": "",
              "buttons": [{
                "title": "View Details",
                "url": "viewlot",
                "next": "#lot"
              }]
            }],
            "anchor": "#beachhomes"
          }, {
            "type": "image",
            "url": "http://www.ronneo.com/aboitiz/4bedroom.jpg",
            "anchor": "#4bedroom",
            "next": "#4bedroom_details"
          }, {
            "type": "greeting",
            "text": "•\tLot area: 237 sqm (approx.)\n•\tFloor area: 150 sqm \n•\tTwo-storey unit\n•\tAzotea (accessible roof deck)\n•\t4 baths\n•\tMaid’s room with toilet\n•\tCarpark for 2 vehicles\n\nPrice range: Php 11.5M - 12M (VAT inclusive)",
            "next": "#afterunit",
            "anchor": "#4bedroom_details"
          }, {
            "type": "image",
            "url": "http://www.ronneo.com/aboitiz/3bedroom.jpg",
            "anchor": "#3bedroom",
            "next": "#3bedroom_details"
          }, {
            "type": "greeting",
            "text": "•\tLot area: 200 sqm (approx.)\n•\tFloor area: 100 sqm \n•\tTwo-storey unit\n•\tAzotea (accessible roof deck)\n•\t2 baths and 1 powder room\n•\tMaid’s room with toilet\n•\tCarpark for 2 vehicles\n\nPrice range: Php 8.5M - 9M (VAT inclusive)",
            "next": "#afterunit",
            "anchor": "#3bedroom_details"
          }, {
            "type": "image",
            "url": "http://www.ronneo.com/aboitiz/lot.jpg",
            "anchor": "#lot",
            "next": "#lot_details"
          }, {
            "type": "greeting",
            "text": "•\tLot area: 200 sqm (approx.)\n•\tFloor area: 100 sqm \n•\tCarpark for 2 vehicles\n\nPrice range: Php XM - XM (VAT inclusive)",
            "anchor": "#lot_details",
            "next": "#afterunit"
          }, {
            "type": "question",
            "text": " Owning a beach house is right at your finger tips! Choose one",
            "options": [{
              "text": "Get a sample computation",
              "resp_payload": "paymentterms",
              "next": "#leadstart"
            }, {
              "text": "Schedule a tour",
              "resp_payload": "tour",
              "next": "#leadstart"
            }, {
              "text": "View other units",
              "resp_payload": "homeothers",
              "next": "#beachhomes"
            }, {
              "text": "View seaside amenities",
              "resp_payload": "amenities",
              "next": "#amenities"
            }, {
              "text": "I'm done",
              "resp_payload": "thankyou",
              "next": "#endconfirmation"
            }],
            "anchor": "#afterunit"
          }, {
            "type": "input",
            "text": "Great! Please enter your full name",
            "anchor": "#leadstart",
            "next": "#lead_email"
          }, {
            "type": "input",
            "text": "Let us know your email address",
            "quick_replies": [{
              "content_type": "user_email"
            }],
            "anchor": "#lead_email",
            "next": "#lead_phone"
          }, {
            "type": "input",
            "text": "What's your phone number?",
            "quick_replies": [{
              "content_type": "user_phone_number"
            }],
            "anchor": "#lead_phone",
            "next": "#lead_terms"
          }, {
            "type": "t&c",
            "text": "View our data privacy here",
            "url": "http://www.starwars.com/news/40-memorable-star-wars-quotes",
            "urlText": "View Details",
            "URL": "http://www.starwars.com/news/40-memorable-star-wars-quote",
            "anchor": "#lead_terms",
            "next": "#lead_contact"
          }, {
            "type": "question",
            "text": "Awesome! How do you want us to get in touch with you?",
            "options": [{
              "text": "Phone call",
              "resp_payload": "contactphone",
              "next": "#leadend"
            }, {
              "text": "Email",
              "resp_payload": "contactemail",
              "next": "#leadend"
            }],
            "anchor": "#lead_contact"
          }, {
            "type": "greeting",
            "text": "Thank you, {{recipient.first_name}}! Our sales representative will contact you in 24-48 hours to discuss your Seafront Residences options.\n\nHead to the shore and experience beach living at its finest!",
            "anchor": "#leadend",
            "next": "#endmessage1"
          }, {
            "type": "carousel",
            "elements": [{
              "title": "Parks",
              "subtitle": "Spacious parks to take relaxing strolls in",
              "image_url": "http://www.ronneo.com/aboitiz/park.jpg",
              "url": "",
              "buttons": []
            }, {
              "title": "Multi-purpose Hall",
              "subtitle": "A seaside venue for special events and occasions",
              "image_url": "http://www.ronneo.com/aboitiz/hall.jpg",
              "url": "",
              "buttons": []
            }, {
              "title": "Swimming Pool",
              "subtitle": "Swim and chill in the beachside pool",
              "image_url": "http://www.ronneo.com/aboitiz/pool.jpg",
              "url": "",
              "buttons": []
            }, {
              "title": "Clubhouse",
              "subtitle": "Take lounging to the next level in the comfort of the clubhouse",
              "image_url": "http://www.ronneo.com/aboitiz/clubhouse.jpg",
              "url": "",
              "buttons": []
            }],
            "anchor": "#amenities",
            "next": "#amenities_next"
          }, {
            "type": "question",
            "text": " Do you want to check out our beach homes?",
            "options": [{
              "text": "Yes, let’s go!",
              "resp_payload": "beach_home",
              "next": "#beachhomes"
            }, {
              "text": "Nah! I’m good.",
              "resp_payload": "confirmation",
              "next": "#endconfirmation"
            }],
            "anchor": "#amenities_next"
          }, {
            "type": "carousel",
            "elements": [{
              "title": " Are you sure you want to end our chat?",
              "subtitle": "It’s awesome living by the beach! Wake up to the sun, sea, and sand. Leisure living at its finest!",
              "image_url": "http://www.ronneo.com/aboitiz/clubhouse.jpg",
              "url": "",
              "buttons": [{
                "title": "Yup, I’m done",
                "url": "confirmdone",
                "next": "#endmessage1"
              }, {
                "title": "Ok, show me more",
                "url": "confirmmore",
                "next": "#beachhomes"
              }]
            }],
            "anchor": "#endconfirmation"
          }, {
            "type": "greeting",
            "text": "If you have any queries, send us a message at aboitizland@aboitiz.com or visit www.aboitizland.com.\n\nIn the meantime, you can view our other residential developments.\nhttp://www.foressa.com/\nhttp://ajoyacabanatuan.com.ph/\nhttp://www.amoacebu.com/",
            "anchor": "#endmessage1"
          }];
          resolve(_this);
        }).catch(function (err) {
          _logger2.default.error('load question flow ' + key + ' failed with ' + JSON.stringify(err));
          _logger2.default.info('create new question flow ' + key);
          _this.questions = [];
          resolve(_this);
        });
      });
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_QUESTION_FLOW_KEY;

      this.key = key;
      return this.datastore._write(this.datastore.paths.question_flow, key, JSON.stringify(this.questions)).then(function () {
        _logger2.default.info('question flow ' + key + ' saved.');
        return _this2;
      }).catch(function (err) {
        _logger2.default.error('save question flow ' + key + ' failed with ' + JSON.stringify(err));
        return err;
      });
    }
  }, {
    key: 'findQidWithAnchor',
    value: function findQidWithAnchor(anchor) {
      if (anchor == '#end') {
        return this.questions.length;
      } else {
        return this.questions.findIndex(function (question) {
          return question.anchor && question.anchor == anchor;
        });
      }
    }
  }, {
    key: 'findQuestionWithQid',
    value: function findQuestionWithQid(qid) {
      if (qid >= 0 && qid < this.questions.length) {
        return this.questions[qid];
      } else {
        return null;
      }
    }
  }, {
    key: 'findNextQidOfQuestion',
    value: function findNextQidOfQuestion(question, questionID) {
      if (question.next) {
        return this.findQidWithAnchor(question.next);
      } else {
        return questionID + 1;
      }
    }
  }, {
    key: 'findNextQidOfQuestionInOptions',
    value: function findNextQidOfQuestionInOptions(question, questionID, payload) {
      var option = question.options.find(function (option) {
        return option.resp_payload == payload;
      });
      if (option && option.next) {
        return this.findQidWithAnchor(option.next);
      } else {
        return questionID + 1;
      }
    }
  }, {
    key: 'findNextQidOfQuestionInElements',
    value: function findNextQidOfQuestionInElements(question, questionID, payload) {
      var _this3 = this;

      var nextQid = null;

      question.elements.forEach(function (element) {
        if (nextQid) {
          return;
        }

        if (element.buttons) {
          var button = element.buttons.find(function (button) {
            return button.url == payload;
          });

          if (button && button.next) {
            nextQid = _this3.findQidWithAnchor(button.next);
          }
        }
      });

      if (nextQid) {
        return nextQid;
      } else {
        return questionID + 1;
      }
    }
  }]);

  return QuestionFlow;
}();

exports.default = QuestionFlow;
//# sourceMappingURL=questionFlow.js.map
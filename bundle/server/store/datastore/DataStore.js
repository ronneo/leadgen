'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataStore = function () {
  function DataStore() {
    _classCallCheck(this, DataStore);

    if (this === DataStore) {
      throw new Error('You must instantiate inheritted Datastore class');
    }
  }

  //
  // All methods below needs to be defined in the child class.
  // They are abstractly defined here for signature definition purpose.
  //


  _createClass(DataStore, [{
    key: '_read',
    value: function _read(_path, _key) {
      throw new Error('Undefined');
    }
  }, {
    key: '_write',
    value: function _write(_path, _key, _data) {
      throw new Error('Undefined');
    }
  }, {
    key: '_scan',
    value: function _scan(_path) {
      throw new Error('Undefined');
    }
  }, {
    key: '_del',
    value: function _del(_path, _key) {
      throw new Error('Undefined');
    }
  }]);

  return DataStore;
}();

exports.default = DataStore;
//# sourceMappingURL=DataStore.js.map
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var returnStub = function() {
  return stub;
};

var stub = {
  write: jest.fn(returnStub),
  moveCursor: jest.fn(returnStub),
  setPrompt: jest.fn(returnStub),
  close: jest.fn(returnStub),
  pause: jest.fn(returnStub),
  resume: jest.fn(returnStub),
  output: {
    __raw__: '',
    end: jest.fn(),
    mute: jest.fn(),
    unmute: jest.fn(),
    write: function(str) {
      this.__raw__ += str;
    }
  },
  _getCursorPos: jest.fn(() => ({ cols: 0, rows: 0 }))
};

var ReadlineStub = function() {
  this.line = '';
  this.input = new EventEmitter();
  EventEmitter.apply(this, arguments);
};

util.inherits(ReadlineStub, EventEmitter);
Object.assign(ReadlineStub.prototype, stub);

exports.createInterface = function() {
  return new ReadlineStub();
};

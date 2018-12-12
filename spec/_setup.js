jest.mock('readline');

var Separator = require('../lib/inquirer').Separator;

global.fixtures = {
  input: {
    message: 'message',
    name: 'name'
  },
  number: {
    message: 'message',
    name: 'name'
  },
  confirm: {
    message: 'message',
    name: 'name'
  },
  password: {
    message: 'message',
    name: 'name'
  },
  list: {
    message: 'message',
    name: 'name',
    choices: ['foo', new Separator(), 'bar', 'bum']
  },
  rawlist: {
    message: 'message',
    name: 'name',
    choices: ['foo', 'bar', new Separator(), 'bum']
  },
  expand: {
    message: 'message',
    name: 'name',
    choices: [
      { key: 'a', name: 'acab' },
      new Separator(),
      { key: 'b', name: 'bar' },
      { key: 'c', name: 'chile' },
      { key: 'd', name: 'd', value: false }
    ]
  },
  checkbox: {
    message: 'message',
    name: 'name',
    choices: ['choice 1', new Separator(), 'choice 2', 'choice 3']
  },
  editor: {
    message: 'message',
    name: 'name',
    default: 'Inquirer'
  }
};

/**
 * Automatically trigger a line event on the readline on each prompt
 */
global.autosubmit = function(ui) {
  ui.process.subscribe(() => {
    // Use setTimeout because async properties on the following question object will still
    // be processed when we receive the subscribe event.
    setTimeout(() => {
      ui.rl.emit('line');
    }, 5);
  });
  ui.rl.emit('line');
};

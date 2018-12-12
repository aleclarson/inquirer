var Base = require('../../lib/prompts/base');
var readline = require('readline');

describe('`base` prompt (e.g. prompt helpers)', function() {
  var rl, base;
  beforeEach(function() {
    rl = readline.createInterface();
    base = new Base(
      {
        message: 'foo bar',
        name: 'name'
      },
      rl
    );
  });

  it('should not point by reference to the entry `question` object', function() {
    var question = {
      message: 'foo bar',
      name: 'name'
    };
    var base = new Base(question, rl);
    expect(question).not.toBe(base.opt);
    expect(question.name).toBe(base.opt.name);
    expect(question.message).toBe(base.opt.message);
  });
});

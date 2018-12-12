var _ = require('lodash');
var readline = require('readline');

var Input = require('../../lib/prompts/input');

describe('`input` prompt', function() {
  let rl, fixture;
  beforeEach(function() {
    fixture = _.clone(fixtures.input);
    rl = readline.createInterface();
  });

  it('should use raw value from the user', function(done) {
    var input = new Input(fixture, rl);

    input.run().then(answer => {
      expect(answer).toBe('Inquirer');
      done();
    });

    rl.emit('line', 'Inquirer');
  });

  it('should output filtered value', function() {
    fixture.filter = function() {
      return 'pass';
    };

    var prompt = new Input(fixture, rl);
    var promise = prompt.run();
    rl.emit('line', '');

    return promise.then(() => {
      expect(rl.output.__raw__).toContain('pass');
    });
  });

  it('should apply the provided transform to the value', function(done) {
    fixture.transformer = function(value) {
      return value
        .split('')
        .reverse()
        .join('');
    };

    var prompt = new Input(fixture, rl);
    prompt.run();

    rl.line = 'Inquirer';
    rl.input.emit('keypress');

    setTimeout(() => {
      expect(rl.output.__raw__).toContain('reriuqnI');
      done();
    }, 10);
  });

  it('should use the answers object in the provided transformer', function(done) {
    fixture.transformer = function(value, answers) {
      return answers.capitalize ? value.toUpperCase() : value;
    };

    var answers = {
      capitalize: true
    };

    var prompt = new Input(fixture, rl, answers);
    prompt.run();

    rl.line = 'inquirer';
    rl.input.emit('keypress');

    setTimeout(() => {
      expect(rl.output.__raw__).toContain('INQUIRER');
      done();
    }, 200);
  });

  it('should use the flags object in the provided transformer', function(done) {
    fixture.transformer = function(value, answers, flags) {
      var text = answers.capitalize ? value.toUpperCase() : value;
      if (flags.isFinal) return text + '!';
      return text;
    };

    var answers = {
      capitalize: true
    };

    var prompt = new Input(fixture, rl, answers);
    prompt.run();

    rl.line = 'inquirer';
    rl.input.emit('keypress');
    setTimeout(() => {
      expect(rl.output.__raw__).toContain('INQUIRER');
      done();
    }, 200);
  });
});

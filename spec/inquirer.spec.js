var _ = require('lodash');
var { Observable } = require('rxjs');

var inquirer = require('..');

describe('inquirer.prompt', function() {
  var prompt;
  beforeEach(function() {
    prompt = inquirer.createPromptModule();
    jest.clearAllMocks();
  });

  it("should close and create a new readline instances each time it's called", function() {
    var rl1;

    var promise = prompt({
      type: 'confirm',
      name: 'q1',
      message: 'message'
    });

    rl1 = promise.ui.rl;
    rl1.emit('line');

    return promise.then(() => {
      expect(rl1.close).toBeCalled();
      expect(rl1.output.end).toBeCalled();
      jest.clearAllMocks();

      var rl2;
      var promise2 = prompt({
        type: 'confirm',
        name: 'q1',
        message: 'message'
      });

      rl2 = promise2.ui.rl;
      rl2.emit('line');

      return promise2.then(() => {
        expect(rl1.close).toBeCalled();
        expect(rl1.output.end).toBeCalled();

        expect(rl1).not.toBe(rl2);
      });
    });
  });

  it('should take a prompts array and return answers', function() {
    var prompts = [
      {
        type: 'confirm',
        name: 'q1',
        message: 'message'
      },
      {
        type: 'confirm',
        name: 'q2',
        message: 'message',
        default: false
      }
    ];

    var promise = prompt(prompts);
    autosubmit(promise.ui);

    return promise.then(answers => {
      expect(answers.q1).toBe(true);
      expect(answers.q2).toBe(false);
    });
  });

  it('should take a prompts array with nested names', function() {
    var prompts = [
      {
        type: 'confirm',
        name: 'foo.bar.q1',
        message: 'message'
      },
      {
        type: 'confirm',
        name: 'foo.q2',
        message: 'message',
        default: false
      }
    ];

    var promise = prompt(prompts);
    autosubmit(promise.ui);

    return promise.then(answers => {
      expect(answers).toEqual({
        foo: {
          bar: {
            q1: true
          },
          q2: false
        }
      });
    });
  });

  it('should take a single prompt and return answer', function() {
    var promise = prompt({
      type: 'input',
      name: 'q1',
      message: 'message',
      default: 'bar'
    });

    promise.ui.rl.emit('line');
    return promise.then(answers => {
      expect(answers.q1).toBe('bar');
    });
  });

  it('should parse `message` if passed as a function', function() {
    var stubMessage = 'foo';
    prompt.registerPrompt('stub', function(params) {
      this.opt = {
        when: function() {
          return true;
        }
      };
      this.run = jest.fn(() => Promise.resolve());
      expect(params.message).toBe(stubMessage);
    });

    var msgFunc = function(answers) {
      expect(answers.name1).toBe('bar');
      return stubMessage;
    };

    var prompts = [
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'stub',
        name: 'name',
        message: msgFunc
      }
    ];

    var promise = prompt(prompts);
    promise.ui.rl.emit('line');
    promise.ui.rl.emit('line');
    return promise.then(() => {
      // Ensure we're not overwriting original prompt values.
      expect(prompts[1].message).toBe(msgFunc);
    });
  });

  it('should run asynchronous `message`', function(done) {
    var stubMessage = 'foo';
    prompt.registerPrompt('stub', function(params) {
      this.opt = {
        when: function() {
          return true;
        }
      };
      this.run = jest.fn(() => Promise.resolve());
      expect(params.message).toBe(stubMessage);
      done();
    });

    var prompts = [
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'stub',
        name: 'name',
        message: function(answers) {
          expect(answers.name1).toBe('bar');
          var next = this.async();
          setTimeout(() => {
            next(null, stubMessage);
          }, 0);
        }
      }
    ];

    var promise = prompt(prompts);
    promise.ui.rl.emit('line');
  });

  it('should parse `default` if passed as a function', function(done) {
    var stubDefault = 'foo';
    prompt.registerPrompt('stub', function(params) {
      this.opt = {
        when: function() {
          return true;
        }
      };
      this.run = jest.fn(() => Promise.resolve());
      expect(params.default).toBe(stubDefault);
      done();
    });

    var prompts = [
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'stub',
        name: 'name',
        message: 'message',
        default: function(answers) {
          expect(answers.name1).toBe('bar');
          return stubDefault;
        }
      }
    ];

    var promise = prompt(prompts, function() {});
    promise.ui.rl.emit('line');
  });

  it('should run asynchronous `default`', function(done) {
    var goesInDefault = false;
    var input2Default = 'foo';
    var promise;
    var prompts = [
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'input2',
        name: 'q2',
        message: 'message',
        default: function(answers) {
          goesInDefault = true;
          expect(answers.name1).toBe('bar');
          var next = this.async();
          setTimeout(() => {
            next(null, input2Default);
          }, 0);
          setTimeout(() => {
            promise.ui.rl.emit('line');
          }, 10);
        }
      }
    ];

    promise = prompt(prompts);
    promise.ui.rl.emit('line');

    return promise.then(answers => {
      expect(goesInDefault).toBe(true);
      expect(answers.q2).toBe(input2Default);
    });
  });

  it('should pass previous answers to the prompt constructor', function(done) {
    prompt.registerPrompt('stub', function(params, rl, answers) {
      this.run = jest.fn(() => Promise.resolve());
      expect(answers.name1).toBe('bar');
      done();
    });

    var prompts = [
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'stub',
        name: 'name',
        message: 'message'
      }
    ];

    var promise = prompt(prompts);
    promise.ui.rl.emit('line');
  });

  it('should parse `choices` if passed as a function', function(done) {
    var stubChoices = ['foo', 'bar'];
    prompt.registerPrompt('stub', function(params) {
      this.run = jest.fn(() => Promise.resolve());
      this.opt = {
        when: function() {
          return true;
        }
      };
      expect(params.choices).toBe(stubChoices);
      done();
    });

    var prompts = [
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'stub',
        name: 'name',
        message: 'message',
        choices: function(answers) {
          expect(answers.name1).toBe('bar');
          return stubChoices;
        }
      }
    ];

    var promise = prompt(prompts, function() {});
    promise.ui.rl.emit('line');
  });

  it('should returns a promise', function(done) {
    var promise = prompt({
      type: 'input',
      name: 'q1',
      message: 'message',
      default: 'bar'
    });

    promise.then(answers => {
      expect(answers.q1).toBe('bar');
      done();
    });

    promise.ui.rl.emit('line');
  });

  it('should expose the Reactive interface', function(done) {
    var promise = prompt([
      {
        type: 'input',
        name: 'name1',
        message: 'message',
        default: 'bar'
      },
      {
        type: 'input',
        name: 'name',
        message: 'message',
        default: 'doe'
      }
    ]);

    var spy = jest.fn();
    promise.ui.process.subscribe(spy);
    promise.then(() => {
      expect(spy.mock.calls).toEqual([
        [{ name: 'name1', answer: 'bar' }],
        [{ name: 'name', answer: 'doe' }]
      ]);
      done();
    });

    autosubmit(promise.ui);
  });

  it('should expose the UI', function(done) {
    var promise = prompt([], function() {});
    expect(promise.ui.answers).toEqual({});
    done();
  });

  it('takes an Observable as question', function() {
    var promise;
    var prompts = Observable.create(function(obs) {
      obs.next({
        type: 'confirm',
        name: 'q1',
        message: 'message'
      });
      setTimeout(() => {
        obs.next({
          type: 'confirm',
          name: 'q2',
          message: 'message',
          default: false
        });
        obs.complete();
        promise.ui.rl.emit('line');
      }, 30);
    });

    promise = prompt(prompts);
    promise.ui.rl.emit('line');

    return promise.then(answers => {
      expect(answers.q1).toBe(true);
      expect(answers.q2).toBe(false);
    });
  });

  describe('hierarchical mode (`when`)', function() {
    it('should pass current answers to `when`', function() {
      var prompts = [
        {
          type: 'confirm',
          name: 'q1',
          message: 'message'
        },
        {
          name: 'q2',
          message: 'message',
          when: function(answers) {
            expect(answers).toEqual({ q1: true });
          }
        }
      ];

      var promise = prompt(prompts);

      autosubmit(promise.ui);
      return promise;
    });

    it('should run prompt if `when` returns true', function() {
      var goesInWhen = false;
      var prompts = [
        {
          type: 'confirm',
          name: 'q1',
          message: 'message'
        },
        {
          type: 'input',
          name: 'q2',
          message: 'message',
          default: 'bar-var',
          when: function() {
            goesInWhen = true;
            return true;
          }
        }
      ];

      var promise = prompt(prompts);
      autosubmit(promise.ui);

      return promise.then(answers => {
        expect(goesInWhen).toBe(true);
        expect(answers.q2).toBe('bar-var');
      });
    });

    it('should run prompt if `when` is true', function() {
      var prompts = [
        {
          type: 'confirm',
          name: 'q1',
          message: 'message'
        },
        {
          type: 'input',
          name: 'q2',
          message: 'message',
          default: 'bar-var',
          when: true
        }
      ];

      var promise = prompt(prompts);
      autosubmit(promise.ui);

      return promise.then(answers => {
        expect(answers.q2).toBe('bar-var');
      });
    });

    it('should not run prompt if `when` returns false', function() {
      var goesInWhen = false;
      var prompts = [
        {
          type: 'confirm',
          name: 'q1',
          message: 'message'
        },
        {
          type: 'confirm',
          name: 'q2',
          message: 'message',
          when: function() {
            goesInWhen = true;
            return false;
          }
        },
        {
          type: 'input',
          name: 'q3',
          message: 'message',
          default: 'foo'
        }
      ];

      var promise = prompt(prompts);
      autosubmit(promise.ui);

      return promise.then(answers => {
        expect(goesInWhen).toBe(true);
        expect(answers.q2).toBe(undefined);
        expect(answers.q3).toBe('foo');
        expect(answers.q1).toBe(true);
      });
    });

    it('should not run prompt if `when` is false', function() {
      var prompts = [
        {
          type: 'confirm',
          name: 'q1',
          message: 'message'
        },
        {
          type: 'confirm',
          name: 'q2',
          message: 'message',
          when: false
        },
        {
          type: 'input',
          name: 'q3',
          message: 'message',
          default: 'foo'
        }
      ];

      var promise = prompt(prompts);
      autosubmit(promise.ui);

      return promise.then(answers => {
        expect(answers.q2).toBe(undefined);
        expect(answers.q3).toBe('foo');
        expect(answers.q1).toBe(true);
      });
    });

    it('should run asynchronous `when`', function() {
      var promise;
      var goesInWhen = false;
      var prompts = [
        {
          type: 'confirm',
          name: 'q1',
          message: 'message'
        },
        {
          type: 'input',
          name: 'q2',
          message: 'message',
          default: 'foo-bar',
          when: function() {
            goesInWhen = true;
            var next = this.async();
            setTimeout(() => {
              next(null, true);
            }, 0);
            setTimeout(() => {
              promise.ui.rl.emit('line');
            }, 10);
          }
        }
      ];

      promise = prompt(prompts);
      autosubmit(promise.ui);

      return promise.then(answers => {
        expect(goesInWhen).toBe(true);
        expect(answers.q2).toBe('foo-bar');
      });
    });

    it('should get the value which set in `when` on returns false', function() {
      var prompts = [
        {
          name: 'q',
          message: 'message',
          when: function(answers) {
            answers.q = 'foo';
            return false;
          }
        }
      ];

      var promise = prompt(prompts);
      autosubmit(promise.ui);

      return promise.then(answers => {
        expect(answers.q).toBe('foo');
      });
    });
  });

  describe('#registerPrompt()', function() {
    it('register new prompt types', function(done) {
      var questions = [{ type: 'foo', message: 'something' }];
      inquirer.registerPrompt('foo', function(question, rl, answers) {
        expect(question).toEqual(questions[0]);
        expect(answers).toEqual({});
        this.run = jest.fn(() => Promise.resolve());
        done();
      });

      inquirer.prompt(questions, _.noop);
    });

    it('overwrite default prompt types', function(done) {
      var questions = [{ type: 'confirm', message: 'something' }];
      inquirer.registerPrompt('confirm', function() {
        this.run = jest.fn(() => Promise.resolve());
        done();
      });

      inquirer.prompt(questions, _.noop);
      inquirer.restoreDefaultPrompts();
    });
  });

  describe('#restoreDefaultPrompts()', function() {
    it('restore default prompts', function() {
      var ConfirmPrompt = inquirer.prompt.prompts.confirm;
      inquirer.registerPrompt('confirm', _.noop);
      inquirer.restoreDefaultPrompts();
      expect(ConfirmPrompt).toBe(inquirer.prompt.prompts.confirm);
    });
  });

  // See: https://github.com/SBoudrias/Inquirer.js/pull/326
  it('does not throw exception if cli-width reports width of 0', function() {
    var original = process.stdout.getWindowSize;
    process.stdout.getWindowSize = function() {
      return [0];
    };

    var prompts = [
      {
        type: 'confirm',
        name: 'q1',
        message: 'message'
      }
    ];

    var promise = prompt(prompts);
    promise.ui.rl.emit('line');

    return promise.then(answers => {
      process.stdout.getWindowSize = original;
      expect(answers.q1).toBe(true);
    });
  });
});

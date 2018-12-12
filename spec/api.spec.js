/**
 * Test Prompt public APIs
 */

var _ = require('lodash');
var inquirer = require('..');
var readline = require('readline');

// Define prompts and their public API
var prompts = [
  {
    name: 'input',
    apis: ['filter', 'validate', 'default', 'message', 'requiredValues']
  },
  {
    name: 'confirm',
    apis: ['message', 'requiredValues']
  },
  {
    name: 'rawlist',
    apis: ['filter', 'message', 'choices', 'requiredValues']
  },
  {
    name: 'list',
    apis: ['filter', 'message', 'choices', 'requiredValues']
  },
  {
    name: 'expand',
    apis: ['requiredValues', 'message']
  },
  {
    name: 'checkbox',
    apis: ['requiredValues', 'message', 'choices', 'filter', 'validate']
  },
  {
    name: 'password',
    apis: ['requiredValues', 'message', 'filter', 'validate', 'default']
  }
];

// Define tests
var tests = {
  filter: function() {
    describe('filter API', function() {
      it('should filter the user input', function(done) {
        fixture.filter = function() {
          return 'pass';
        };

        var prompt = new Prompt(fixture, rl);
        prompt.run().then(answer => {
          expect(answer).toBe('pass');
          done();
        });

        rl.emit('line', '');
      });

      it('should allow filter function to be asynchronous', function(done) {
        fixture.filter = function() {
          var done = async();
          setTimeout(() => {
            done(null, 'pass');
          }, 0);
        };

        var prompt = new Prompt(fixture, rl);
        prompt.run().then(answer => {
          expect(answer).toBe('pass');
          done();
        });

        rl.emit('line', '');
      });

      it('should handle errors produced in async filters', function() {
        var called = 0;
        var rl = rl;

        fixture.filter = function() {
          called++;
          var cb = async();

          if (called === 2) {
            return cb(null, 'pass');
          }

          rl.emit('line');
          return cb(new Error('fail'));
        };

        var prompt = new Prompt(fixture, rl);
        var promise = prompt.run();

        rl.emit('line');
        return promise;
      });

      it('should pass previous answers to the prompt filter function', function() {
        var prompt = inquirer.createPromptModule();
        var questions = [
          {
            type: 'confirm',
            name: 'q1',
            message: 'message'
          },
          {
            type: 'confirm',
            name: 'q2',
            message: 'message',
            filter: function(input, answers) {
              expect(answers.q1).toBe(true);
              return input;
            },
            default: false
          }
        ];

        var promise = prompt(questions);
        autosubmit(promise.ui);

        return promise.then(answers => {
          expect(answers.q1).toBe(true);
          expect(answers.q2).toBe(false);
        });
      });
    });
  },

  validate: function() {
    describe('validate API', function() {
      it('should reject input if boolean false is returned', function() {
        var called = 0;

        fixture.validate = () => {
          called++;
          // Make sure returning false won't continue
          if (called === 2) {
            return true;
          }

          rl.emit('line');
          return false;
        };

        var prompt = new Prompt(fixture, rl);
        var promise = prompt.run();

        rl.emit('line');
        return promise;
      });

      it('should reject input if a string is returned', function(done) {
        var self = this;
        var called = 0;
        var errorMessage = 'uh oh, error!';

        fixture.validate = function() {
          called++;
          // Make sure returning false won't continue
          if (called === 2) {
            done();
            return;
          }

          self.rl.emit('line');
          return errorMessage;
        };

        var prompt = new Prompt(fixture, rl);
        prompt.run();

        rl.emit('line');
      });

      it('should reject input if a Promise is returned which rejects', function(done) {
        var self = this;
        var called = 0;
        var errorMessage = 'uh oh, error!';

        fixture.validate = function() {
          called++;
          // Make sure returning false won't continue
          if (called === 2) {
            done();
            return;
          }

          self.rl.emit('line');
          return Promise.reject(errorMessage);
        };

        var prompt = new Prompt(fixture, rl);
        prompt.run();

        rl.emit('line');
      });

      it('should accept input if boolean true is returned', function() {
        var called = 0;

        fixture.validate = function() {
          called++;
          return true;
        };

        var prompt = new Prompt(fixture, rl);
        var promise = prompt.run().then(() => {
          expect(called).toBe(1);
        });

        rl.emit('line');
        return promise;
      });

      it('should allow validate function to be asynchronous', function() {
        var self = this;
        var called = 0;

        fixture.validate = function() {
          var done = async();
          setTimeout(() => {
            called++;
            // Make sure returning false won't continue
            if (called === 2) {
              done(null, true);
            } else {
              self.rl.emit('line');
            }
            done(false);
          }, 0);
        };

        var prompt = new Prompt(fixture, rl);
        var promise = prompt.run();

        rl.emit('line');
        return promise;
      });

      it('should allow validate function to return a Promise', function() {
        fixture.validate = function() {
          return Promise.resolve(true);
        };

        var prompt = new Prompt(fixture, rl);
        var promise = prompt.run();

        rl.emit('line');
        return promise;
      });

      it('should pass previous answers to the prompt validation function', function() {
        var prompt = inquirer.createPromptModule();
        var questions = [
          {
            type: 'confirm',
            name: 'q1',
            message: 'message'
          },
          {
            type: 'confirm',
            name: 'q2',
            message: 'message',
            validate: function(input, answers) {
              expect(answers.q1).toBe(true);
              return true;
            },
            default: false
          }
        ];

        var promise = prompt(questions);
        autosubmit(promise.ui);

        return promise.then(answers => {
          expect(answers.q1).toBe(true);
          expect(answers.q2).toBe(false);
        });
      });
    });
  },

  default: function() {
    describe('default API', function() {
      it('should allow a default value', function(done) {
        fixture.default = 'pass';

        var prompt = new Prompt(fixture, rl);
        prompt.run().then(answer => {
          expect(rl.output.__raw__).toContain('(pass)');
          expect(answer).toBe('pass');
          done();
        });

        rl.emit('line', '');
      });

      it('should allow a falsy default value', function(done) {
        fixture.default = 0;

        var prompt = new Prompt(fixture, rl);
        prompt.run().then(answer => {
          expect(rl.output.__raw__).toContain('(0)');
          expect(answer).toBe(0);
          done();
        });

        rl.emit('line', '');
      });
    });
  },

  message: function() {
    describe('message API', function() {
      it('should print message on screen', function() {
        fixture.message = 'Foo bar bar foo bar';

        var prompt = new Prompt(fixture, rl);
        prompt.run();

        expect(rl.output.__raw__).toContain(fixture.message);
      });
      it('should default to name for message', function() {
        fixture.name = 'testfoobarbarfoobar';
        delete fixture.message;

        var prompt = new Prompt(fixture, rl);
        prompt.run();

        expect(rl.output.__raw__).toContain(fixture.name + ':');
      });
    });
  },

  choices: function() {
    describe('choices API', function() {
      it('should print choices to screen', function() {
        var prompt = new Prompt(fixture, rl);
        var choices = prompt.opt.choices;

        prompt.run();

        _.each(choices.filter(inquirer.Separator.exclude), choice => {
          expect(rl.output.__raw__).toContain(choice.name);
        });
      });
    });
  },

  requiredValues: function() {
    describe('Missing value', function() {
      it('`name` should throw', function() {
        expect(() => {
          delete fixture.name;
          return new Prompt(fixture, rl);
        }).toThrowError(/name/);
      });
    });
  }
};

// Run tests
describe('Prompt public APIs', function() {
  _.each(prompts, function(detail) {
    describe('on ' + detail.name + ' prompt', function() {
      beforeEach(function() {
        fixture = _.clone(fixtures[detail.name]);
        Prompt = inquirer.prompt.prompts[detail.name];
        rl = readline.createInterface();
      });

      _.each(detail.apis, function(apiName) {
        tests[apiName](detail.name);
      });
    });
  });
});

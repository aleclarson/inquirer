var _ = require('lodash');
var readline = require('readline');
var stripAnsi = require('strip-ansi');

var Password = require('../../lib/prompts/password');

function testMasking(rl, mask) {
  return function(answer) {
    expect(answer).toBe('Inquirer');
    var expectOutput = expect(stripAnsi(rl.output.__raw__));
    if (mask) {
      expectOutput.toContain(mask);
    } else {
      expectOutput.not.toContain('********');
    }
  };
}

describe('`password` prompt', function() {
  let rl, fixture;
  beforeEach(function() {
    fixture = _.clone(fixtures.password);
    rl = readline.createInterface();
  });

  it('should use raw value from the user without masking', function() {
    var password = new Password(fixture, rl);
    var promise = password.run().then(testMasking(rl, false));

    rl.emit('line', 'Inquirer');
    return promise;
  });

  it('should mask the input with "*" if the `mask` option was provided by the user was `true`', function() {
    fixture.mask = true;
    var password = new Password(fixture, rl);
    var promise = password.run().then(testMasking(rl, '********'));

    rl.emit('line', 'Inquirer');
    return promise;
  });

  it('should mask the input if a `mask` string was provided by the user', function() {
    fixture.mask = '#';
    var password = new Password(fixture, rl);
    var promise = password.run().then(testMasking(rl, '########'));

    rl.emit('line', 'Inquirer');
    return promise;
  });
});

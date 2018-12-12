var _ = require('lodash');
var readline = require('readline');

var Expand = require('../../lib/prompts/expand');

describe('`expand` prompt', function() {
  let rl, fixture, expand;
  beforeEach(function() {
    fixture = _.clone(fixtures.expand);
    rl = readline.createInterface();
    expand = new Expand(fixture, rl);
  });

  it('should throw if `key` is missing', function() {
    expect(() => {
      fixture.choices = ['a', 'a'];
      return new Expand(fixture, rl);
    }).toThrowError(/Format error/);
  });

  it('should throw if `key` is duplicate', function() {
    expect(() => {
      fixture.choices = [{ key: 'a', name: 'foo' }, { key: 'a', name: 'foo' }];
      return new Expand(fixture, rl);
    }).toThrowError(/Duplicate key error/);
  });

  it('should throw if `key` is `h`', function() {
    expect(() => {
      fixture.choices = [{ key: 'h', name: 'foo' }];
      return new Expand(fixture, rl);
    }).toThrowError(/Reserved key error/);
  });

  it('should allow false as a value', function() {
    var promise = expand.run();

    rl.emit('line', 'd');
    return promise.then(answer => {
      expect(answer).toBe(false);
    });
  });

  it('pass the value as answer, and display short on the prompt', function() {
    fixture.choices = [
      { key: 'a', name: 'A Name', value: 'a value', short: 'ShortA' },
      { key: 'b', name: 'B Name', value: 'b value', short: 'ShortB' }
    ];
    var prompt = new Expand(fixture, rl);
    var promise = prompt.run();
    rl.emit('line', 'b');

    return promise.then(answer => {
      expect(answer).toBe('b value');
      expect(rl.output.__raw__).toMatch(/ShortB/);
    });
  });

  it('should use a string the `default` value', function(done) {
    fixture.default = 'chile';
    expand = new Expand(fixture, rl);

    expand.run().then(answer => {
      expect(answer).toBe('chile');
      done();
    });
    rl.emit('line');
  });

  it('should use the `default` argument value', function(done) {
    fixture.default = 1;
    expand = new Expand(fixture, rl);

    expand.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });
    rl.emit('line');
  });

  it('should return the user input', function(done) {
    expand.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });
    rl.emit('line', 'b');
  });

  it('should strip the user input', function(done) {
    expand.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });
    rl.emit('line', ' b ');
  });

  it('should have help option', function(done) {
    expand.run().then(answer => {
      expect(rl.output.__raw__).toMatch(/a\) acab/);
      expect(rl.output.__raw__).toMatch(/b\) bar/);
      expect(answer).toBe('chile');
      done();
    });
    rl.emit('line', 'h');
    rl.emit('line', 'c');
  });

  it('should not allow invalid command', function() {
    var self = this;
    var promise = expand.run();

    rl.emit('line', 'blah');
    setTimeout(() => {
      self.rl.emit('line', 'a');
    }, 10);
    return promise;
  });

  it('should display and capitalize the default choice `key`', function() {
    fixture.default = 1;
    expand = new Expand(fixture, rl);

    expand.run();
    expect(rl.output.__raw__).toContain('(aBcdh)');
  });

  it('should display and capitalize the default choice by name value', function() {
    fixture.default = 'chile';
    expand = new Expand(fixture, rl);

    expand.run();
    expect(rl.output.__raw__).toContain('(abCdh)');
  });

  it('should display and capitalize the default choice H (Help) `key` if no string default matched', function() {
    fixture.default = 'chile!';
    expand = new Expand(fixture, rl);

    expand.run();
    expect(rl.output.__raw__).toContain('(abcdH)');
  });

  it('should display and capitalize the default choice H (Help) `key` if none provided', function() {
    delete fixture.default;
    expand = new Expand(fixture, rl);
    expand.run();

    expect(rl.output.__raw__).toContain('(abcdH)');
  });

  it("should 'autocomplete' the user input", function(done) {
    expand = new Expand(fixture, rl);
    expand.run();
    rl.line = 'a';
    rl.emit('keypress');
    setTimeout(() => {
      expect(rl.output.__raw__).toContain('acab');
      done();
    }, 10);
  });
});

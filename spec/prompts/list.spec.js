var _ = require('lodash');
var readline = require('readline');

var List = require('../../lib/prompts/list');

describe('`list` prompt', function() {
  let rl, fixture, list;
  beforeEach(function() {
    fixture = _.clone(fixtures.list);
    rl = readline.createInterface();
    list = new List(fixture, rl);
  });

  it('should default to first choice', function(done) {
    list.run().then(answer => {
      expect(answer).toBe('foo');
      done();
    });

    rl.emit('line');
  });

  it('should move selected cursor on keypress', function(done) {
    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.input.emit('keypress', '', { name: 'down' });
    rl.emit('line');
  });

  it('should allow for arrow navigation', function(done) {
    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.input.emit('keypress', '', { name: 'down' });
    rl.input.emit('keypress', '', { name: 'down' });
    rl.input.emit('keypress', '', { name: 'up' });
    rl.emit('line');
  });

  it('should allow for vi-style navigation', function(done) {
    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.input.emit('keypress', 'j', { name: 'j' });
    rl.input.emit('keypress', 'j', { name: 'j' });
    rl.input.emit('keypress', 'k', { name: 'k' });
    rl.emit('line');
  });

  it('should allow for emacs-style navigation', function(done) {
    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.input.emit('keypress', 'n', { name: 'n', ctrl: true });
    rl.input.emit('keypress', 'n', { name: 'n', ctrl: true });
    rl.input.emit('keypress', 'p', { name: 'p', ctrl: true });
    rl.emit('line');
  });

  it('should loop the choices when going out of boundaries', function() {
    var promise1 = list.run().then(answer => {
      expect(answer).toBe('bar');
    });

    rl.input.emit('keypress', '', { name: 'up' });
    rl.input.emit('keypress', '', { name: 'up' });
    rl.emit('line');

    return promise1.then(() => {
      list.selected = 0; // Reset
      var promise2 = list.run().then(answer => {
        expect(answer).toBe('foo');
      });

      rl.input.emit('keypress', '', { name: 'down' });
      rl.input.emit('keypress', '', { name: 'down' });
      rl.input.emit('keypress', '', { name: 'down' });
      rl.emit('line');
      return promise2;
    });
  });

  it('should require a choices array', function() {
    expect(() => {
      return new List({ name: 'foo', message: 'bar' });
    }).toThrowError(/choices/);
  });

  it('should allow a numeric default', function(done) {
    fixture.default = 1;
    var list = new List(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.emit('line');
  });

  it('should work from a numeric default being the index', function(done) {
    fixture.default = 1;
    var list = new List(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('bum');
      done();
    });

    rl.input.emit('keypress', '', { name: 'down' });
    rl.emit('line');
  });

  it('should allow a string default being the value', function(done) {
    fixture.default = 'bar';
    var list = new List(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.emit('line');
  });

  it('should work from a string default', function(done) {
    fixture.default = 'bar';
    var list = new List(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('bum');
      done();
    });

    rl.input.emit('keypress', '', { name: 'down' });
    rl.emit('line');
  });

  it("shouldn't allow an invalid string default to change position", function(done) {
    fixture.default = 'babar';
    var list = new List(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('foo');
      done();
    });

    rl.emit('line');
  });

  it("shouldn't allow an invalid index as default", function(done) {
    fixture.default = 4;
    var list = new List(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('foo');
      done();
    });

    rl.emit('line');
  });

  it('should allow 1-9 shortcut key', function(done) {
    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.input.emit('keypress', '2');
    rl.emit('line');
  });
});

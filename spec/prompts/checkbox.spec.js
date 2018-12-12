var _ = require('lodash');
var readline = require('readline');

var Checkbox = require('../../lib/prompts/checkbox');

describe('`checkbox` prompt', function() {
  var rl, fixture, checkbox;
  beforeEach(function() {
    fixture = _.clone(fixtures.checkbox);
    rl = readline.createInterface();
    checkbox = new Checkbox(fixture, rl);
  });

  it('should return a single selected choice in an array', function(done) {
    checkbox.run().then(answer => {
      expect(Array.isArray(answer)).toBeTruthy();
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('choice 1');
      done();
    });
    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.emit('line');
  });

  it('should return multiples selected choices in an array', function(done) {
    checkbox.run().then(answer => {
      expect(Array.isArray(answer)).toBeTruthy();
      expect(answer.length).toBe(2);
      expect(answer[0]).toBe('choice 1');
      expect(answer[1]).toBe('choice 2');
      done();
    });
    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.input.emit('keypress', null, { name: 'down' });
    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.emit('line');
  });

  it('should check defaults choices', function(done) {
    fixture.choices = [
      { name: '1', checked: true },
      { name: '2', checked: false },
      { name: '3', checked: false }
    ];
    checkbox = new Checkbox(fixture, rl);
    checkbox.run().then(answer => {
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('1');
      done();
    });
    rl.emit('line');
  });

  it('provide an array of checked choice to validate', function() {
    fixture.choices = [
      { name: '1', checked: true },
      { name: '2', checked: 1 },
      { name: '3', checked: false }
    ];
    fixture.validate = function(answer) {
      expect(answer).toEqual(['1', '2']);
      return true;
    };
    checkbox = new Checkbox(fixture, rl);
    var promise = checkbox.run();
    rl.emit('line');
    return promise;
  });

  it('should check defaults choices if given as array of values', function(done) {
    fixture.choices = [{ name: '1' }, { name: '2' }, { name: '3' }];
    fixture.default = ['1', '3'];
    checkbox = new Checkbox(fixture, rl);
    checkbox.run().then(answer => {
      expect(answer.length).toBe(2);
      expect(answer[0]).toBe('1');
      expect(answer[1]).toBe('3');
      done();
    });
    rl.emit('line');
  });

  it('should toggle choice when hitting space', function(done) {
    checkbox.run().then(answer => {
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('choice 1');
      done();
    });
    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.input.emit('keypress', null, { name: 'down' });
    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.emit('line');
  });

  it('should allow for arrow navigation', function(done) {
    checkbox.run().then(answer => {
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('choice 2');
      done();
    });

    rl.input.emit('keypress', null, { name: 'down' });
    rl.input.emit('keypress', null, { name: 'down' });
    rl.input.emit('keypress', null, { name: 'up' });

    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.emit('line');
  });

  it('should allow for vi-style navigation', function(done) {
    checkbox.run().then(answer => {
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('choice 2');
      done();
    });

    rl.input.emit('keypress', 'j', { name: 'j' });
    rl.input.emit('keypress', 'j', { name: 'j' });
    rl.input.emit('keypress', 'k', { name: 'k' });

    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.emit('line');
  });

  it('should allow for emacs-style navigation', function(done) {
    checkbox.run().then(answer => {
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('choice 2');
      done();
    });

    rl.input.emit('keypress', 'n', { name: 'n', ctrl: true });
    rl.input.emit('keypress', 'n', { name: 'n', ctrl: true });
    rl.input.emit('keypress', 'p', { name: 'p', ctrl: true });

    rl.input.emit('keypress', ' ', { name: 'space' });
    rl.emit('line');
  });

  it('should allow 1-9 shortcut key', function(done) {
    checkbox.run().then(answer => {
      expect(answer.length).toBe(1);
      expect(answer[0]).toBe('choice 2');
      done();
    });

    rl.input.emit('keypress', '2');
    rl.emit('line');
  });

  it('should select all answers if <a> is pressed', function() {
    var promise = checkbox.run();

    rl.input.emit('keypress', 'a', { name: 'a' });
    rl.emit('line');

    return promise.then(answer => {
      expect(answer.length).toBe(3);
    });
  });

  it('should select no answers if <a> is pressed a second time', function() {
    var promise = checkbox.run();

    rl.input.emit('keypress', 'a', { name: 'a' });
    rl.input.emit('keypress', 'a', { name: 'a' });
    rl.emit('line');

    return promise.then(answer => {
      expect(answer.length).toBe(0);
    });
  });

  it('should select the inverse of the current selection when <i> is pressed', function() {
    var promise = checkbox.run();

    rl.input.emit('keypress', 'i', { name: 'i' });
    rl.emit('line');

    return promise.then(answer => {
      expect(answer.length).toBe(3);
    });
  });

  describe('with disabled choices', function() {
    var checkbox;
    beforeEach(function() {
      fixture.choices.push({
        name: 'dis1',
        disabled: true
      });
      fixture.choices.push({
        name: 'dis2',
        disabled: 'uh oh'
      });
      checkbox = new Checkbox(fixture, rl);
    });

    it('output disabled choices and custom messages', function() {
      var promise = checkbox.run();
      rl.emit('line');
      return promise.then(() => {
        expect(rl.output.__raw__).toContain('- dis1 (Disabled)');
        expect(rl.output.__raw__).toContain('- dis2 (uh oh)');
      });
    });

    it('skip disabled choices', function(done) {
      checkbox.run().then(answer => {
        expect(answer[0]).toBe('choice 1');
        done();
      });
      rl.input.emit('keypress', null, { name: 'down' });
      rl.input.emit('keypress', null, { name: 'down' });
      rl.input.emit('keypress', null, { name: 'down' });

      rl.input.emit('keypress', ' ', { name: 'space' });
      rl.emit('line');
    });

    it("uncheck defaults choices who're disabled", function(done) {
      fixture.choices = [{ name: '1', checked: true, disabled: true }, { name: '2' }];
      checkbox = new Checkbox(fixture, rl);
      checkbox.run().then(answer => {
        expect(answer.length).toBe(0);
        done();
      });
      rl.emit('line');
    });

    it('disabled can be a function', function() {
      fixture.choices = [
        {
          name: 'dis1',
          disabled: function(answers) {
            expect(answers.foo).toBe('foo');
            return true;
          }
        }
      ];
      checkbox = new Checkbox(fixture, rl, { foo: 'foo' });
      var promise = checkbox.run();
      rl.emit('line');

      promise.then(() => {
        expect(rl.output.__raw__).toContain('- dis1 (Disabled)');
      });
    });
  });
});

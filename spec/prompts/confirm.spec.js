var _ = require('lodash');
var readline = require('readline');

var Confirm = require('../../lib/prompts/confirm');

describe('`confirm` prompt', function() {
  let rl, fixture, confirm;
  beforeEach(function() {
    fixture = _.clone(fixtures.confirm);
    rl = readline.createInterface();
    confirm = new Confirm(fixture, rl);
  });

  it('should default to true', function(done) {
    confirm.run().then(answer => {
      expect(rl.output.__raw__).toContain('Y/n');
      expect(answer).toBe(true);
      done();
    });

    rl.emit('line', '');
  });

  it('should allow a default `false` value', function(done) {
    fixture.default = false;
    var falseConfirm = new Confirm(fixture, rl);

    falseConfirm.run().then(answer => {
      expect(rl.output.__raw__).toContain('y/N');
      expect(answer).toBe(false);
      done();
    });

    rl.emit('line', '');
  });

  it('should allow a default `true` value', function(done) {
    fixture.default = true;
    var falseConfirm = new Confirm(fixture, rl);

    falseConfirm.run().then(answer => {
      expect(rl.output.__raw__).toContain('Y/n');
      expect(answer).toBe(true);
      done();
    });

    rl.emit('line', '');
  });

  it("should parse 'Y' value to boolean true", function(done) {
    confirm.run().then(answer => {
      expect(answer).toBe(true);
      done();
    });

    rl.emit('line', 'Y');
  });

  it("should parse 'Yes' value to boolean true", function(done) {
    confirm.run().then(answer => {
      expect(answer).toBe(true);
      done();
    });

    rl.emit('line', 'Yes');
  });

  it("should parse 'No' value to boolean false", function(done) {
    confirm.run().then(answer => {
      expect(answer).toBe(false);
      done();
    });

    rl.emit('line', 'No');
  });

  it('should parse every other string value to boolean false', function(done) {
    confirm.run().then(answer => {
      expect(answer).toBe(false);
      done();
    });

    rl.emit('line', 'bla bla foo');
  });
});

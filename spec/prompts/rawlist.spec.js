var _ = require('lodash');
var readline = require('readline');

var Rawlist = require('../../lib/prompts/rawlist');

describe('`rawlist` prompt', function() {
  var rl, fixture, rawlist;
  beforeEach(function() {
    rl = readline.createInterface();
    fixture = _.clone(fixtures.rawlist);
    rawlist = new Rawlist(fixture, rl);
  });

  it('should default to first choice', function(done) {
    rawlist.run().then(answer => {
      expect(answer).toBe('foo');
      done();
    });

    rl.emit('line');
  });

  it('should select given index', function(done) {
    rawlist.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.emit('line', '2');
  });

  it('should not allow invalid index', function() {
    var promise = rawlist.run();

    rl.emit('line', 'blah');
    setTimeout(() => {
      rl.emit('line', '1');
    }, 10);

    return promise;
  });

  it('should require a choices array', function() {
    expect(function() {
      return new Rawlist({ name: 'foo', message: 'bar' });
    }).toThrowError(/choices/);
  });

  it('should allow a default index', function(done) {
    fixture.default = 1;
    var list = new Rawlist(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('bar');
      done();
    });

    rl.emit('line');
  });

  it("shouldn't allow an invalid index as default", function(done) {
    fixture.default = 4;
    var list = new Rawlist(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('foo');
      done();
    });

    rl.emit('line');
  });

  it('should allow string default being the value', function(done) {
    fixture.default = 'bum';
    var list = new Rawlist(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('bum');
      done();
    });

    rl.emit('line');
  });

  it("shouldn't allow an invalid string default to change position", function(done) {
    fixture.default = 'bumby';
    var list = new Rawlist(fixture, rl);

    list.run().then(answer => {
      expect(answer).toBe('foo');
      done();
    });

    rl.emit('line');
  });
});

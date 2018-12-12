var _ = require('lodash');
var readline = require('readline');

var NumberPrompt = require('../../lib/prompts/number');

const ACCEPTABLE_ERROR = 0.001;

describe('`number` prompt', function() {
  var rl, fixture, number;
  beforeEach(function() {
    fixture = _.clone(fixtures.number);
    rl = readline.createInterface();
    number = new NumberPrompt(fixture, rl);
  });

  it('should parse the largest number', function(done) {
    number.run().then(answer => {
      expect(answer).toBe(Number.MAX_SAFE_INTEGER);
      done();
    });

    rl.emit('line', String(Number.MAX_SAFE_INTEGER));
  });

  it('should parse the smallest number', function(done) {
    number.run().then(answer => {
      expect(answer).toBe(Number.MIN_SAFE_INTEGER);
      done();
    });

    rl.emit('line', String(Number.MIN_SAFE_INTEGER));
  });

  it('should parse an integer', function(done) {
    number.run().then(answer => {
      expect(answer).toBe(42);
      done();
    });

    rl.emit('line', '42');
  });

  it('should parse negative numbers', function(done) {
    number.run().then(answer => {
      expect(answer).toBe(-363);
      done();
    });

    rl.emit('line', '-363');
  });

  it('should parse a regular float', function(done) {
    number.run().then(answer => {
      expect(answer).toBeCloseTo(4353.43, ACCEPTABLE_ERROR);
      done();
    });

    rl.emit('line', '4353.43');
  });

  it('should parse a float with no digits before the decimal', function(done) {
    number.run().then(answer => {
      expect(answer).toBeCloseTo(0.01264, ACCEPTABLE_ERROR);
      done();
    });

    rl.emit('line', '.01264');
  });

  it('should parse a float with no digits after the decimal', function(done) {
    number.run().then(answer => {
      expect(answer).toBeCloseTo(1234.0, ACCEPTABLE_ERROR);
      done();
    });

    rl.emit('line', '1234.');
  });

  it('should parse a float with exponents', function(done) {
    number.run().then(answer => {
      expect(answer).toBeCloseTo(534e12, ACCEPTABLE_ERROR);
      done();
    });

    rl.emit('line', '534e12');
  });

  it('should parse any other string as NaN', function(done) {
    number.run().then(answer => {
      expect(Number.isNaN(answer)).toBeTruthy();
      done();
    });

    rl.emit('line', 'The cat');
  });

  it('should parse the empty string as NaN', function(done) {
    number.run().then(answer => {
      expect(Number.isNaN(answer)).toBeTruthy();
      done();
    });

    rl.emit('line', '');
  });

  it('should return default value if it is set on a bad input', function(done) {
    number.opt.default = 11;
    number.run().then(answer => {
      expect(answer).toBe(11);
      done();
    });

    rl.emit('line', '');
  });
});

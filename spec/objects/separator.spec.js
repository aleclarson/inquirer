var stripAnsi = require('strip-ansi');

var Separator = require('../../lib/objects/separator');
var Inquirer = require('../..');

describe('Separator constructor', function() {
  it('should set a default', function() {
    var sep = new Separator();
    expect(stripAnsi(sep.toString())).toBe('──────────────');
  });

  it('should set user input as separator', function() {
    var sep = new Separator('foo bar');
    expect(stripAnsi(sep.toString())).toBe('foo bar');
  });

  it('instances should be stringified when appended to a string', function() {
    var sep = new Separator('foo bar');
    expect(stripAnsi(String(sep))).toBe('foo bar');
  });

  it('should be exposed on Inquirer object', function() {
    expect(Inquirer.Separator).toBe(Separator);
  });

  it('should expose a helper function to check for separator', function() {
    expect(Separator.exclude({})).toBe(true);
    expect(Separator.exclude(new Separator())).toBe(false);
  });

  it("give the type 'separator' to its object", function() {
    var sep = new Separator();
    expect(sep.type).toBe('separator');
  });
});

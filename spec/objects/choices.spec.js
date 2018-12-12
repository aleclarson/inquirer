var inquirer = require('../..');
var Choices = require('../../lib/objects/choices');
var Choice = require('../../lib/objects/choice');

describe('Choices collection', function() {
  it('should create Choice object from array member', function() {
    var choices = new Choices(['bar', { name: 'foo' }]);
    expect(choices.getChoice(0) instanceof Choice).toBeTruthy();
    expect(choices.getChoice(1) instanceof Choice).toBeTruthy();
  });

  it('should not process Separator object', function() {
    var sep = new inquirer.Separator();
    var choices = new Choices(['Bar', sep]);
    expect(choices.get(0).name).toBe('Bar');
    expect(choices.get(1)).toBe(sep);
  });

  it('should provide access to length information', function() {
    var choices = new Choices(['Bar', new inquirer.Separator(), 'foo']);
    expect(choices.length).toBe(3);
    expect(choices.realLength).toBe(2);

    choices.length = 1;
    expect(choices.length).toBe(1);
    expect(choices.get(1)).toBe(undefined);
    expect(() => {
      choices.realLength = 0;
    }).toThrowError();
  });

  it('should allow plucking choice content', function() {
    var choices = new Choices([{ name: 'n', key: 'foo' }, { name: 'a', key: 'lab' }]);
    expect(choices.pluck('key')).toEqual(['foo', 'lab']);
  });

  it('should allow filtering value with where', function() {
    var choices = new Choices([{ name: 'n', key: 'foo' }, { name: 'a', key: 'lab' }]);
    expect(choices.where({ key: 'lab' })).toEqual([
      {
        name: 'a',
        value: 'a',
        short: 'a',
        key: 'lab',
        disabled: undefined
      }
    ]);
  });

  it('should façade forEach', function() {
    var raw = ['a', 'b', 'c'];
    var choices = new Choices(raw);
    choices.forEach(function(val, i) {
      expect(val.name).toBe(raw[i]);
    });
  });

  it('should façade filter', function() {
    var choices = new Choices(['a', 'b', 'c']);
    var filtered = choices.filter(function(val) {
      return val.name === 'a';
    });
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('a');
  });

  it('should façade push and update the realChoices internally', function() {
    var choices = new Choices(['a']);
    choices.push('b', new inquirer.Separator());
    expect(choices.length).toBe(3);
    expect(choices.realLength).toBe(2);
    expect(choices.getChoice(1) instanceof Choice).toBeTruthy();
    expect(choices.get(2) instanceof inquirer.Separator).toBeTruthy();
  });
});

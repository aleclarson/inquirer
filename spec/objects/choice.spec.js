var Choice = require('../../lib/objects/choice');
var Separator = require('../../lib/objects/separator');

describe('Choice object', function() {
  it('should normalize accept String as value', function() {
    var choice = new Choice('foo');
    expect(choice.name).toBe('foo');
    expect(choice.value).toBe('foo');
  });

  it('should use value|name as default if default property is missing', function() {
    var onlyName = new Choice({ name: 'foo' });
    var onlyVal = new Choice({ value: 'bar' });

    expect(onlyName.name).toBe('foo');
    expect(onlyName.value).toBe('foo');
    expect(onlyName.short).toBe('foo');
    expect(onlyVal.name).toBe('bar');
    expect(onlyVal.value).toBe('bar');
    expect(onlyVal.short).toBe('bar');
  });

  it('should keep extra keys', function() {
    var choice = new Choice({ name: 'foo', extra: '1' });

    expect(choice.extra).toBe('1');
    expect(choice.name).toBe('foo');
    expect(choice.value).toBe('foo');
  });

  it("shouldn't process Separator object", function() {
    var sep = new Choice(new Separator());
    expect(sep instanceof Separator).toBeTruthy();
  });

  it("shouldn't process object with property type=separator", function() {
    var obj = { type: 'separator' };
    var sep = new Choice(obj);
    expect(sep).toBe(obj);
  });
});

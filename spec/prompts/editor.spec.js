var _ = require('lodash');
var readline = require('readline');

var Editor = require('../../lib/prompts/editor');

describe('`editor` prompt', function() {
  var rl, fixture, previousVisual;
  beforeEach(function() {
    previousVisual = process.env.VISUAL;
    // Writes the word "testing" to the file
    process.env.VISUAL = 'node ./spec/bin/write.js testing';
    fixture = _.clone(fixtures.editor);
    rl = readline.createInterface();
  });

  afterEach(function() {
    process.env.VISUAL = previousVisual;
  });

  it('should retrieve temporary files contents', function() {
    var prompt = new Editor(fixture, rl);

    var promise = prompt.run();
    rl.emit('line', '');

    return promise.then(answer => {
      return expect(answer).toBe('testing');
    });
  });
});

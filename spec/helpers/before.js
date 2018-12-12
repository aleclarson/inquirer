var mockery = require('mockery');
var ReadlineStub = require('./readline');

mockery.enable();
mockery.warnOnUnregistered(false);
mockery.registerMock('readline', {
  createInterface: function() {
    return new ReadlineStub();
  }
});

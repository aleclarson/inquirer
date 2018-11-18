'use strict';
/**
 * `input` type prompt
 */

var chalk = require('chalk');
var { takeUntil } = require('rxjs/operators');
var Base = require('./base');
var observe = require('../utils/events');

class InputPrompt extends Base {
  constructor(question, rl, answers) {
    super(question, rl, answers)

    this.default = this.opt.default;
    // Never render the default in multiline mode.
    if (this.opt.multiline) {
      this.opt.default = undefined;
    }
  }
  /**
   * Start the Inquiry session
   * @return {this}
   */

  _run() {
    // By default, the enter key submits the input.
    // In multiline mode, an empty line submits.
    var events = observe(this.rl);
    var validation = this.submit(events.line);

    events.keypress
      .pipe(takeUntil(validation.success))
      .forEach(this.onKeypress.bind(this));
  }

  /**
   * Render the prompt to screen
   * @return {InputPrompt} self
   */

  render(error) {
    var input;
    var isFinal = this.status === 'answered';
    if (this.opt.multiline) {
      input = '\n' + (this.answer ? this.answer + '\n' : '') + this.rl.line;
    } else {
      input = isFinal ? this.answer : this.rl.line;

      var transformer = this.opt.transformer;
      if (transformer) {
        input = transformer(input, this.answers, { isFinal });
      } else if (isFinal) {
        input = chalk.cyan(input);
      }
    }
    this.screen.render(
      this.getQuestion() + input,
      error ? chalk.red('>> ') + error : '',
    );
  }

  /**
   * When user press `enter` key
   */

  filterInput(input) {
    return input || (this.default == null ? '' : this.default);
  }

  onEnd(state) {
    if (this.opt.multiline && state.value) {
      // Append each line to the previous lines.
      this.answer = (this.answer ? this.answer + '\n' : '') + state.value;
      this.render();

      // Ask for the next line.
      return this._run();
    }

    this.useAnswer((this.answer || '') + state.value);
  }

  onError(state) {
    this.render(state.isValid);
  }

  /**
   * When user press a key
   */

  onKeypress() {
    this.render();
  }

  useAnswer(answer) {
    this.answer = this.filterInput(answer);
    super.onEnd();
    this.screen.done();
    if (this.opt.multiline) {
      this.done(this.answer ? this.answer.split('\n') : []);
      this.abortSubscription.unsubscribe();
    } else {
      this.done(this.answer);
    }
  }
}

module.exports = InputPrompt;

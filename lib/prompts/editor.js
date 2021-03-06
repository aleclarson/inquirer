'use strict';
/**
 * `editor` type prompt
 */

var chalk = require('chalk');
var editAsync = require('external-editor').editAsync;
var Base = require('./base');
var observe = require('../utils/events');
var { Subject } = require('rxjs');

class EditorPrompt extends Base {
  /**
   * Start the Inquiry session
   * @return {this}
   */

  _run() {
    // Open Editor on "line" (Enter Key)
    var events = observe(this.rl);
    this.lineSubscription = events.line.subscribe(this.startExternalEditor.bind(this));
    this.delSubscription = events.delKey.subscribe(this.skipExternalEditor.bind(this));

    // Trigger validation when editor closes
    this.editorResult = new Subject();
    this.submit(this.editorResult);

    // Prevents default from being printed on screen (can look weird with multiple lines)
    this.currentText = this.opt.default;
    this.opt.default = null;

    // The editor is "skipped" when the Delete key is pressed instead of the
    // Return key. For certainty, a unique message appears when an editor is skipped.
    this.skipped = this.opt.skipped;
  }

  /**
   * Render the prompt to screen
   * @return {EditorPrompt} self
   */

  render(error) {
    var bottomContent = '';
    var message = this.getQuestion();

    if (this.status === 'answered') {
      message += chalk.dim(this.skipped ? 'Skipped' : 'Success');
    } else {
      message += chalk.dim('Press <enter> to launch your preferred editor.');
    }

    if (error) {
      bottomContent = chalk.red('>> ') + error;
    }

    this.screen.render(message, bottomContent);
  }

  /**
   * Launch $EDITOR on user press enter
   */

  startExternalEditor() {
    // Pause Readline to prevent stdin and stdout from being modified while the editor is showing
    this.rl.pause();
    editAsync(this.currentText, this.endExternalEditor.bind(this));
  }

  skipExternalEditor() {
    this.skipped = true;
    this.editorResult.next('');
  }

  endExternalEditor(error, result) {
    this.rl.resume();
    if (error) {
      this.editorResult.error(error);
    } else {
      this.editorResult.next(result);
    }
  }

  onEnd(state) {
    this.editorResult.unsubscribe();
    this.delSubscription.unsubscribe();
    this.lineSubscription.unsubscribe();
    this.answer = state.value;
    super.onEnd();

    this.screen.done();
    this.done(this.answer);
  }

  onError(state) {
    this.render(state.isValid);
  }
}

module.exports = EditorPrompt;

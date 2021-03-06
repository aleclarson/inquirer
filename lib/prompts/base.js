'use strict';
/**
 * Base prompt implementation
 * Should be extended by prompt types.
 */

var _ = require('../lodash');
var rx = require('rxjs');
var chalk = require('chalk');
var runAsync = require('run-async');
var { filter, flatMap, map, share, take, takeUntil } = require('rxjs/operators');
var Choices = require('../objects/choices');
var ScreenManager = require('../utils/screen-manager');

class Prompt {
  constructor(question, rl, answers) {
    // Setup instance defaults property
    _.assign(this, {
      answers: answers,
      status: 'pending'
    });

    // Set defaults prompt options
    this.opt = _.defaults(_.clone(question), {
      validate: () => true,
      filter: val => val,
      when: () => true,
      suffix: '',
      prefix: chalk.green('?')
    });

    // Make sure name is present
    if (!this.opt.name) {
      this.throwParamError('name');
    }

    // Set default message if no message defined
    if (!this.opt.message) {
      this.opt.message = this.opt.name + ':';
    }

    // Normalize choices
    if (Array.isArray(this.opt.choices)) {
      this.opt.choices = new Choices(this.opt.choices, answers);
    }

    this.rl = rl;
    this.screen = new ScreenManager(this.rl);
  }

  /**
   * Start the Inquiry session and manage output value filtering
   * @return {Promise}
   */

  run() {
    return new Promise(resolve => {
      this.done = resolve;

      var val = _.get(this.answers, this.opt.name);
      if (val == null) {
        this._run();
        this.render();
        return;
      }

      if (_.isFunction(val)) {
        val = rx.from(Promise.resolve(val(this.answers)));
      } else {
        val = rx.of(val);
      }
      if (this.filterAuto) {
        val = val.pipe(map(this.filterAuto, this));
      }
      val.subscribe(val => {
        if (val == null) {
          this._run();
          this.render();
        } else {
          // Run the prompt if the answer is invalid.
          this.submit(rx.of(val)).error.forEach(() => this._run());
        }
      });
    });
  }

  onEnd() {
    this.status = 'answered';
    this.render();
  }

  onError() {
    this.render();
  }

  _run() {
    throw Error('Prompts must override the `_run` method');
  }

  /**
   * Throw an error telling a required parameter is missing
   * @param  {String} name Name of the missing param
   * @return {Throw Error}
   */

  throwParamError(name) {
    throw new Error('You must provide a `' + name + '` parameter');
  }

  /**
   * Called when the UI closes. Override to do any specific cleanup necessary
   */
  close() {
    this.screen.releaseCursor();
  }

  submit(value) {
    var filter = this.filterInput || this.getCurrentValue;
    if (filter) value = value.pipe(map(filter, this));

    var validation = this._validate(value);
    validation.success.forEach(this.onEnd.bind(this));
    validation.error.forEach(this.onError.bind(this));
    return validation;
  }

  filterAuto(input) {
    return input == null ? null : String(input);
  }

  /**
   * Run the provided validation method each time a submit event occur.
   * @param  {Rx.Observable} submit - submit event flow
   * @return {Object}        Object containing two observables: `success` and `error`
   */
  _validate(submit) {
    var self = this;
    var required = this.opt.required;
    var validate = runAsync(this.opt.validate);
    var asyncFilter = runAsync(this.opt.filter);
    var validation = submit.pipe(
      flatMap(value =>
        asyncFilter(value, self.answers).then(
          filteredValue =>
            required && (filteredValue == null || filteredValue === '')
              ? {
                  isValid: required === true ? 'An answer is required' : required
                }
              : validate(filteredValue, self.answers).then(
                  isValid => ({ isValid: isValid, value: filteredValue }),
                  err => ({ isValid: err })
                ),
          err => ({ isValid: err })
        )
      ),
      share()
    );

    var success = validation.pipe(filter(state => state.isValid === true), take(1));
    var error = validation.pipe(
      filter(state => state.isValid !== true),
      takeUntil(success)
    );

    return {
      success: success,
      error: error
    };
  }

  /**
   * Generate the prompt question string
   * @return {String} prompt question string
   */

  getQuestion() {
    var message =
      this.opt.prefix +
      ' ' +
      chalk.bold(this.opt.message) +
      this.opt.suffix +
      chalk.reset(' ');

    // Append the default if available, and if question isn't answered
    if (this.opt.default != null && this.status !== 'answered') {
      // If default password is supplied, hide it
      if (this.opt.type === 'password') {
        message += chalk.italic.dim('[hidden] ');
      } else {
        message += chalk.dim('(' + this.opt.default + ') ');
      }
    }

    return message;
  }
}

module.exports = Prompt;

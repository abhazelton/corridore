import { EventEmitter } from 'events';
import { AsyncOrFunction, AsyncFunction, AsyncFunctionWithContext, AsyncOrFunctionWithContext } from './types';
import cascade from './utils/cascade';
import { noop } from './utils/noop';

export abstract class TaskBase extends EventEmitter {

  protected _pre: AsyncOrFunction[] = [];
  protected _post: AsyncOrFunction[] = [];
  private _action: AsyncFunction;

  constructor(public name: string) {
    super();
    this._action = noop;
  }
  /**
   * Cancel this task and throw error with possible reason that will be emitted as an event
   * 
   * @param  {string} reason?
   * @param  {any} returnValue?
   */
  cancel(reason?: string) {
    // probably want to be able to do more here
    this.emit('cancel:' + this.name, reason);
    // for now throw an error so that it can bubble up and stop running functions
    throw new Error(`Task '${this.name}' was canceled`);
  }

  /**
   * Set pre function(s) to run before task action
   * 
   * @param  {AsyncOrFunctionWithContext|AsyncOrFunctionWithContext[]} funcs
   * 
   * First pre function will receive initialValue passed to exec function
   * and then results from each function will fall through waterfall.
   */
  pre(funcs: AsyncOrFunctionWithContext | AsyncOrFunctionWithContext[]) {
    this._pre = Array.isArray(funcs) ? [...this._pre, ...funcs.map(f => f(this))] : [...this._pre, funcs(this)];
    return this;
  }

  /**
   * Set post function(s) to run after task action
   * 
   * @param  {AsyncOrFunctionWithContext|AsyncOrFunctionWithContext[]} funcs
   * 
   * First post function will receive result from Action function
   * and then results from each functioin will fall through waterfall.
   */
  post(funcs: AsyncOrFunctionWithContext | AsyncOrFunctionWithContext[]) {
    this._post = Array.isArray(funcs) ? [...this._post, ...funcs.map(f => f(this))] : [...this._post, funcs(this)];
    return this;
  }


  /**
   * Set action function for this task
   * 
   * @param  {AsyncFunctionWithContext} func
   * 
   * Action function will receive result from last pre function and
   * result from action will be passed onto first post function.
   */
  action(func: AsyncFunctionWithContext) {
    this._action = func(this);
    return this;
  }

  /**
   * Execute task
   * 
   * @param  {any} initialValue?
   * @returns Promise
   * 
   * NOTE: initialValue will be passed to first pre function
   * 
   */
  async exec<T extends Record<string, unknown> = any>(initialValue?: any): Promise<T | T[]> {

    // _action is required
    if (!this._action)
      throw new Error(`Task '${this.name}' has no action defined`);

    try {

      // start waterfall of _pre
      this.emit('task:' + this.name + ':pre:start');
      const resultPre = await cascade(this._pre, initialValue);
      this.emit('task:' + this.name + ':pre:end');

      // start action
      this.emit('task:' + this.name + ':action:start');
      const resultAction = await this._action(resultPre);
      this.emit('task:' + this.name + ':action:end');

      // start waterfall of _post
      this.emit('task:' + this.name + ':post:start');
      const resultPost = await cascade(this._post, resultAction);
      this.emit('task:' + this.name + ':post:end');

      return resultPost as T | T[];

    }
    catch (err) {
      throw new Error(err);
    }

  }

}

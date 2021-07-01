import pMap from 'p-map';
import pSettle from 'p-settle';
import { TaskBase } from './base';
import { Task } from './task';
import { AsyncFunction } from './types';
import cascade from './utils/cascade';

export class Corridore extends TaskBase {

  private _tasks: Task[] = [];
  private _concurrent = false;
  private _ignoreErrors = false;

  constructor(name: string) {
    super(name);
  }

  /**
   * Add Task(s) to instance
   * 
   * @param  {Task|Task[]} toAdd
   */
  tasks(toAdd: Task | Task[]) {
    this._tasks = Array.isArray(toAdd) ? [...this._tasks, ...toAdd] : [...this._tasks, toAdd];
    return this;
  }


  /**
   * Run only some tasks in this instance
   * 
   * @param  {string[]} toRun
   */
  only(toRun: string[]) {
    this._tasks.filter(task => toRun.includes(task.name));
    return this;
  }

  /**
   * Change instance to concurrent mode.  Pre and post functions work as
   * usual, but all tasks are then run asynchronously.  Each task will 
   * receive the result of the last pre function and post functions will
   * receive the combined array of responses from the tasks.
   * 
   * Optionally suppress errors from tasks, so that any that are fulfilled
   * get returned and processed through _post functions, ignoring any that fail.
   * 
   * @param {boolean} ignoreErrors?
   * 
   */
  concurrent(ignoreErrors: boolean = false) {
    this._concurrent = true;
    this._ignoreErrors = ignoreErrors;
    return this;
  }

  /**
   * Execute runner's tasks
   * 
   * @param  {any} initialValue?
   * @returns Promise
   * 
   */
  async exec<T extends Record<string, unknown> = any>(initialValue?: any): Promise<T | T[]> {

    // _tasks is required
    if (!this._tasks.length)
      throw new Error(`Runner '${this.name}' has no tasks to run`);

    try {

      // start waterfall of _pre
      this.emit('runner:' + this.name + ':pre:start');
      const resultPre = await cascade(this._pre, initialValue);
      this.emit('runner:' + this.name + ':pre:end');

      // start tasks
      let resultTasks: any;
      this.emit('runner:' + this.name + ':tasks:start');

      const execFuncs = this._tasks.map(t => t.exec.bind(t));

      if (this._concurrent) {

        if (this._ignoreErrors) {
          // fire off tasks concurrently, getting combined results including any with errors
          let combined = await pSettle(execFuncs.map(f => f(resultPre)));

          // we only are concerned with the ones that didn't have errors
          resultTasks = combined.reduce((a: pSettle.PromiseResult<any>[], c: pSettle.PromiseResult<any>) => {
            return c.isFulfilled ? [...a, c.value] : a;
          }, []);

          // if NONE were fulfilled successfully, then we need to throw an error
          if (!resultTasks.length)
            throw new Error('All tasks failed with errors');
        }
        else {
          // fire off tasks concurrently, stopping on any error
          const mapper = async (func: AsyncFunction) => await func(resultPre);
          resultTasks = await pMap(execFuncs, mapper);
        }

      }
      else {
        // start tasks using waterfall
        resultTasks = await cascade(execFuncs, resultPre);
      }

      // tasks done
      this.emit('runner:' + this.name + ':tasks:end');

      // start waterfall of _post
      this.emit('runner:' + this.name + ':post:start');
      const resultPost = await cascade(this._post, resultTasks);
      this.emit('runner:' + this.name + ':post:end');

      return resultPost as T;

    }
    catch (err) {
      throw new Error(err);
    }

  }

}

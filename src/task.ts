import { TaskBase } from './base';

// maybe create different types of tasks from base?
export class Task<In extends Record<string, unknown> = any, Out extends Record<string, unknown> = any> extends TaskBase {

  constructor(name: string) {
    super(name);
  }

}

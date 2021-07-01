import pReduce from 'p-reduce';
import pify from 'pify';
import { AsyncOrFunction } from '../types';
import { promised } from './promised';

const reducer = async (previous: any, func: AsyncOrFunction): Promise<any> => {

  // check for incoming previous value that could be args for cb function
  // only possible if incoming value is array, and a sensible max length of
  // 10, the last one being a function accepting only 2 params.
  if (Array.isArray(previous) && previous.length <= 10) {

    const possibleFn = [...previous].pop();

    if (typeof possibleFn === 'function' && possibleFn.length === 2) {

      // promisify func, which is a cb function
      const promise = pify(func);
      const args = [...previous];
      const cb: (err: any, data: any) => unknown = args.pop();

      const { err, data } = await promised(promise.apply(null, args));

      // once finished, run cb, then return that value for next func in cascade
      return await Promise.resolve(cb(err, data));
    }
  }

  // call function using resolve in case its a promise
  return await Promise.resolve(func(previous));

};

const cascade = async <K extends string>(list: AsyncOrFunction[], initialValue?: any): Promise<Record<K, unknown>> => pReduce(list, reducer, initialValue);

export default cascade;
